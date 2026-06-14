import { useState, useRef, useEffect } from "react";
import { 
  ScanLine, Search, ArrowRight, CheckCircle2, Loader2, 
  AlertCircle, MapPin, Building2, KeyRound, User, Package, QrCode, X, Camera
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

export default function ScanQR() {
  const { profile } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'SCAN' | 'DELIVERIES'>('SCAN');
  
  // Scanner States
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [document, setDocument] = useState<any>(null);
  
  // Routing States
  const [actionRoute, setActionRoute] = useState<'RECEIVE' | 'FORWARD' | 'COMPLETE' | null>(null);
  const [nextOfficeId, setNextOfficeId] = useState("");
  const [selectedCourierId, setSelectedCourierId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [pin, setPin] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Data States
  const [offices, setOffices] = useState<any[]>([]);
  const [couriers, setCouriers] = useState<any[]>([]);
  const [myDeliveries, setMyDeliveries] = useState<any[]>([]);

  // UI State
  const [activeQR, setActiveQR] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'SCAN') inputRef.current?.focus();
    fetchDropdownData();
  }, [activeTab, document]);

  useEffect(() => {
    if (activeTab === 'DELIVERIES') fetchMyDeliveries();
  }, [activeTab]);

  const fetchDropdownData = async () => {
    const [officesRes, usersRes] = await Promise.all([
      supabase.from('offices').select('id, name').order('name'),
      supabase.from('user_profiles').select('id, full_name, role').eq('is_approved', true).order('full_name')
    ]);
    if (officesRes.data) setOffices(officesRes.data);
    if (usersRes.data) setCouriers(usersRes.data);
  };

  const fetchMyDeliveries = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('documents')
      .select('*, destination_office:offices!destination_office_id(name)')
      .eq('courier_id', profile.id)
      .eq('status', 'IN_TRANSIT');
    if (data) setMyDeliveries(data);
  };

  // --- SEARCH FOR DOCUMENT ---
  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    
    setIsSearching(true);
    setError("");
    setDocument(null);
    setActionRoute(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('documents')
        .select(`*, originating_office:offices!originating_office_id(name), current_office:offices!current_office_id(name), courier:user_profiles!courier_id(full_name)`)
        .eq('tracking_number', trackingNumber.trim().toUpperCase())
        .single();

      if (fetchError || !data) throw new Error("Document not found. Please check the tracking number.");
      if (data.status === 'COMPLETED') throw new Error("This document is already completed and archived.");

      setDocument(data);

      if (data.status === 'IN_TRANSIT' && data.courier_id !== profile?.id) {
        setActionRoute('RECEIVE');
      } else if (data.current_office_id === profile?.office_id) {
        setActionRoute('FORWARD');
      } else if (data.courier_id === profile?.id) {
        throw new Error("You are currently holding this document. Go to 'My Deliveries' to hand it off.");
      } else {
        throw new Error(`This document is currently in custody of ${data.current_office?.name || data.courier?.full_name}. You cannot process it.`);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  // --- PROCESS ROUTING ACTION ---
  const handleProcessAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return setError("Authentication error.");
    if (pin !== profile.signature_pin) return setError("Invalid e-Signature PIN.");
    if (actionRoute === 'FORWARD' && (!nextOfficeId || !selectedCourierId)) return setError("Please select both a destination and a courier.");

    setIsProcessing(true);
    setError("");

    try {
      let updatePayload: any = {};
      let actionLog = actionRoute;

      if (actionRoute === 'FORWARD') {
        updatePayload = {
          status: 'IN_TRANSIT',
          current_office_id: null,
          courier_id: selectedCourierId,
          destination_office_id: nextOfficeId
        };
      } else if (actionRoute === 'RECEIVE') {
        updatePayload = {
          status: 'RECEIVED',
          current_office_id: profile.office_id,
          courier_id: null,
          destination_office_id: null,
          current_custodian_id: profile.id
        };
      } else if (actionRoute === 'COMPLETE') {
        updatePayload = { status: 'COMPLETED' };
      }

      const { error: updateError } = await supabase.from('documents').update(updatePayload).eq('id', document.id);
      if (updateError) throw updateError;

      await supabase.from('routing_logs').insert({
        document_id: document.id,
        performed_by_user_id: profile.id,
        from_office_id: profile.office_id,
        action_taken: actionLog,
        remarks: remarks || (actionRoute === 'FORWARD' ? `Handed off to courier.` : `Received via courier.`)
      });

      alert(`Document successfully processed!`);
      setDocument(null);
      setTrackingNumber("");
      setPin("");
      setRemarks("");
      if (activeTab === 'DELIVERIES') fetchMyDeliveries(); // Refresh deliveries if we were looking at them

    } catch (err: any) {
      setError(err.message || "Failed to process document.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-[85vh] flex flex-col relative pb-20 animate-in fade-in duration-500">
      
      {/* APP HEADER */}
      <div className="text-center pt-6 pb-4">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Scanner</h1>
        <p className="text-xs text-gray-500 mt-1 font-medium">ClearTrack Routing Engine</p>
      </div>

      {/* SEGMENTED TAB CONTROL */}
      <div className="px-4 mb-6">
        <div className="bg-gray-100 p-1.5 rounded-2xl flex gap-1 shadow-inner">
          <button 
            onClick={() => { setActiveTab('SCAN'); setError(""); setDocument(null); }} 
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'SCAN' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <ScanLine className="w-4 h-4" /> Operations
          </button>
          <button 
            onClick={() => { setActiveTab('DELIVERIES'); setError(""); setDocument(null); }} 
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'DELIVERIES' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Package className="w-4 h-4" /> My Bag
            {myDeliveries.length > 0 && <span className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full">{myDeliveries.length}</span>}
          </button>
        </div>
      </div>

      {/* --- TAB 1: SCANNER VIEWPORT --- */}
      {activeTab === 'SCAN' && (
        <div className="px-4 flex-1 flex flex-col animate-in slide-in-from-left-4">
          
          {/* CAMERA VIEWFINDER UI */}
          <div className="relative aspect-[4/5] w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl mb-6">
            {/* Viewfinder Corners */}
            <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-white/50 rounded-tl-xl"></div>
            <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-white/50 rounded-tr-xl"></div>
            <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-white/50 rounded-bl-xl"></div>
            <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-white/50 rounded-br-xl"></div>
            
            {/* Scanning Laser Animation */}
            {!document && (
              <div className="absolute top-0 left-0 w-full h-1 bg-green-400/80 shadow-[0_0_15px_rgba(74,222,128,0.8)] animate-[scan_2s_ease-in-out_infinite] z-10"></div>
            )}

            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20">
              <Camera className="w-12 h-12 text-white/20 mb-4" />
              <p className="text-white/60 text-sm font-medium mb-6">Point camera at Document Barcode<br/>or type number below</p>
              
              <form onSubmit={handleScan} className="w-full max-w-xs relative">
                <input 
                  ref={inputRef} 
                  value={trackingNumber} 
                  onChange={(e) => setTrackingNumber(e.target.value)} 
                  placeholder="ABRA-2026-XYZ" 
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 text-center text-xl font-black font-mono tracking-widest py-4 rounded-2xl focus:bg-white/20 outline-none transition-all uppercase backdrop-blur-md" 
                />
                <button type="submit" disabled={isSearching || !trackingNumber} className="absolute right-2 top-2 bottom-2 bg-primary hover:bg-green-500 text-white px-4 rounded-xl font-bold transition-colors disabled:opacity-50">
                  {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                </button>
              </form>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-start gap-3 text-sm border border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="font-medium">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: MY DELIVERIES --- */}
      {activeTab === 'DELIVERIES' && (
        <div className="px-4 flex-1 flex flex-col space-y-4 animate-in slide-in-from-right-4">
          {myDeliveries.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-16 opacity-50">
              <Package className="w-16 h-16 text-gray-400 mb-4" />
              <p className="font-bold text-gray-900 text-xl">Bag is Empty</p>
              <p className="text-sm text-gray-500 mt-2">You are not currently holding any documents.</p>
            </div>
          ) : (
            myDeliveries.map((doc) => (
              <div key={doc.id} onClick={() => setActiveQR(doc.tracking_number)} className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all">
                <div className="min-w-0 pr-4">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 flex items-center gap-1.5"><Building2 className="w-3 h-3"/> To: {doc.destination_office?.name || 'Unknown'}</p>
                  <h4 className="font-bold text-gray-900 truncate">{doc.title}</h4>
                  <p className="font-mono text-xs text-gray-500 mt-1">{doc.tracking_number}</p>
                </div>
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 border border-gray-100 text-gray-600">
                  <QrCode className="w-6 h-6" />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* --- BOTTOM SHEET MODAL: DOCUMENT PROCESSING --- */}
      {document && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={() => setDocument(null)}></div>
          <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-[2rem] shadow-2xl p-6 pb-8 animate-in slide-in-from-bottom-full duration-300">
            
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>

            <div className="mb-6">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2 border ${actionRoute === 'RECEIVE' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                {actionRoute === 'RECEIVE' ? 'Incoming Delivery' : 'In Your Custody'}
              </span>
              <h2 className="text-2xl font-black text-gray-900 leading-tight mb-1">{document.title}</h2>
              <p className="font-mono text-gray-500 text-sm">{document.tracking_number}</p>
            </div>

            <form onSubmit={handleProcessAction} className="space-y-5">
              
              {/* Intelligent Segmented Actions */}
              <div className="bg-gray-100 p-1.5 rounded-2xl flex gap-1">
                {actionRoute === 'RECEIVE' ? (
                  <div className="flex-1 bg-white text-purple-700 font-black py-3 rounded-xl text-sm text-center shadow-sm flex items-center justify-center gap-2">
                    <MapPin className="w-5 h-5" /> Accept Delivery
                  </div>
                ) : (
                  <>
                    <button type="button" onClick={() => setActionRoute('FORWARD')} className={`flex-1 font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 ${actionRoute === 'FORWARD' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>
                      <ArrowRight className="w-4 h-4" /> Dispatch
                    </button>
                    <button type="button" onClick={() => setActionRoute('COMPLETE')} className={`flex-1 font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 ${actionRoute === 'COMPLETE' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}>
                      <CheckCircle2 className="w-4 h-4" /> Finalize
                    </button>
                  </>
                )}
              </div>

              {actionRoute === 'FORWARD' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Destination</label>
                    <select required value={nextOfficeId} onChange={(e) => setNextOfficeId(e.target.value)} className="w-full px-3 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none text-sm font-medium">
                      <option value="">Select...</option>
                      {offices.map(off => <option key={off.id} value={off.id}>{off.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Courier</label>
                    <select required value={selectedCourierId} onChange={(e) => setSelectedCourierId(e.target.value)} className="w-full px-3 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none text-sm font-medium">
                      <option value="">Select...</option>
                      {couriers.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center shrink-0">
                  <KeyRound className="w-5 h-5 text-gray-700" />
                </div>
                <div className="flex-1">
                  <input required type="password" inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value)} className="w-full bg-transparent text-xl font-mono tracking-widest outline-none placeholder-gray-300 font-bold" placeholder="PIN CODE" />
                </div>
              </div>

              <button type="submit" disabled={isProcessing} className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
                {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : "Confirm Signature"}
              </button>
            </form>
          </div>
        </>
      )}

      {/* --- FULL SCREEN QR MODAL --- */}
      {activeQR && (
        <div className="fixed inset-0 z-[60] bg-slate-900 flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-200">
          <button onClick={() => setActiveQR(null)} className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white hover:bg-white/20">
             <X className="w-6 h-6" />
          </button>
          
          <h2 className="text-white text-2xl font-black mb-8 text-center">Hand-off Mode</h2>
          
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl mb-8 relative">
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-slate-900 rounded-full"></div>
            <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-slate-900 rounded-full"></div>
            
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${activeQR}&color=0f172a`} 
              alt="Scan Me" 
              className="w-56 h-56 object-contain"
            />
          </div>

          <p className="font-mono text-white/50 text-xl tracking-widest mb-4">{activeQR}</p>
          <div className="bg-primary/20 text-green-400 border border-green-500/30 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
            <ScanLine className="w-4 h-4" /> Receiver must scan this code
          </div>
        </div>
      )}

      {/* Custom Keyframes for Viewfinder Animation */}
      <style>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}</style>
    </div>
  );
}