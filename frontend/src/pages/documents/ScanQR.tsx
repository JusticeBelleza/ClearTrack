import { useState, useRef, useEffect } from "react";
import { ScanLine, Search, ArrowRight, CheckCircle2, Loader2, AlertCircle, MapPin, Building2, KeyRound } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

export default function ScanQR() {
  const { profile } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [document, setDocument] = useState<any>(null);
  
  // Routing State
  const [actionRoute, setActionRoute] = useState<'RECEIVE' | 'FORWARD' | 'COMPLETE' | null>(null);
  const [nextOfficeId, setNextOfficeId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [pin, setPin] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [offices, setOffices] = useState<any[]>([]);

  // Keep input focused for USB Barcode Scanners
  useEffect(() => {
    inputRef.current?.focus();
    fetchOffices();
  }, []);

  const fetchOffices = async () => {
    const { data } = await supabase.from('offices').select('id, name').order('name');
    if (data) setOffices(data);
  };

  // --- 1. SEARCH FOR DOCUMENT ---
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
        .select(`*, originating_office:offices!originating_office_id(name), current_office:offices!current_office_id(name)`)
        .eq('tracking_number', trackingNumber.trim().toUpperCase())
        .single();

      if (fetchError || !data) throw new Error("Document not found. Please check the tracking number.");
      if (data.status === 'COMPLETED') throw new Error("This document has already been marked as Completed.");

      setDocument(data);

      // Routing Logic Engine:
      if (data.current_office_id !== profile?.office_id) {
        setActionRoute('RECEIVE'); // It's coming from outside, so we must Receive it
      } else {
        setActionRoute('FORWARD'); // We have it, so we must Forward or Complete it
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  // --- 2. PROCESS ROUTING ACTION ---
  const handleProcessAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return setError("Authentication error.");
    if (pin !== profile.signature_pin) return setError("Invalid e-Signature PIN.");
    if (actionRoute === 'FORWARD' && !nextOfficeId) return setError("Please select the next office destination.");

    setIsProcessing(true);
    setError("");

    try {
      let newStatus = document.status;
      let newOfficeId = document.current_office_id;

      if (actionRoute === 'RECEIVE') {
        newStatus = 'RECEIVED';
        newOfficeId = profile.office_id; // Custody transfers to current user's office
      } else if (actionRoute === 'FORWARD') {
        newStatus = 'IN_TRANSIT';
        newOfficeId = nextOfficeId; // Custody transfers to target office
      } else if (actionRoute === 'COMPLETE') {
        newStatus = 'COMPLETED';
      }

      // 1. Update Document Location & Status
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          current_office_id: newOfficeId,
          current_custodian_id: profile.id,
          status: newStatus
        })
        .eq('id', document.id);

      if (updateError) throw updateError;

      // 2. Write to Immutable Audit Log
      const { error: logError } = await supabase
        .from('routing_logs')
        .insert({
          document_id: document.id,
          performed_by_user_id: profile.id,
          from_office_id: profile.office_id,
          action_taken: actionRoute,
          remarks: remarks || `Document ${actionRoute.toLowerCase()} via barcode scan.`
        });

      if (logError) throw logError;

      // Success Reset
      alert(`Document successfully ${actionRoute.toLowerCase()}!`);
      setDocument(null);
      setTrackingNumber("");
      setPin("");
      setRemarks("");
      inputRef.current?.focus();

    } catch (err: any) {
      setError(err.message || "Failed to process document.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <ScanLine className="w-6 h-6 text-primary" />
          Document Scanner
        </h1>
        <p className="text-sm text-gray-500 mt-1">Scan or type a barcode to receive, forward, or complete documents.</p>
      </div>

      {/* SCAN INPUT BOX */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 border-4 border-blue-100/50">
          <Search className="w-7 h-7 text-blue-500" />
        </div>
        
        <form onSubmit={handleScan} className="max-w-md mx-auto space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Awaiting Scanner Input</label>
            <input 
              ref={inputRef}
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. ABRA-2026-XYZ"
              className="w-full text-center text-2xl font-black font-mono tracking-widest py-4 border-2 border-dashed border-gray-300 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all uppercase"
            />
          </div>
          <button 
            type="submit" 
            disabled={isSearching || !trackingNumber}
            className="w-full bg-gray-900 hover:bg-black text-white py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : "Fetch Document"}
          </button>
        </form>

        {error && (
          <div className="max-w-md mx-auto mt-4 bg-red-50 text-red-600 p-3 rounded-lg flex items-start gap-2 text-sm border border-red-100 text-left">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="font-medium leading-snug">{error}</p>
          </div>
        )}
      </div>

      {/* DOCUMENT PROCESSING MODAL / PANEL */}
      {document && (
        <div className="bg-white rounded-2xl shadow-lg border border-primary/20 overflow-hidden animate-in slide-in-from-bottom-4">
          
          {/* Document Details Header */}
          <div className="bg-slate-900 p-6 text-white">
            <div className="flex justify-between items-start mb-2">
              <span className="bg-primary/20 text-green-400 border border-green-500/30 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded">
                Current Status: {document.status}
              </span>
              <span className="text-slate-400 font-mono text-sm">{document.tracking_number}</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-1">{document.title}</h2>
            <p className="text-sm text-slate-300 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Origin: {document.originating_office?.name}
            </p>
          </div>

          {/* Action Form */}
          <form onSubmit={handleProcessAction} className="p-6 md:p-8 space-y-6">
            
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
              {actionRoute === 'RECEIVE' ? (
                <div className="flex-1 bg-white text-primary font-bold py-2.5 rounded-lg text-sm text-center shadow-sm flex items-center justify-center gap-2 border border-gray-200">
                  <MapPin className="w-4 h-4" /> Receive Document
                </div>
              ) : (
                <>
                  <button type="button" onClick={() => setActionRoute('FORWARD')} className={`flex-1 font-bold py-2.5 rounded-lg text-sm transition-all flex items-center justify-center gap-2 ${actionRoute === 'FORWARD' ? 'bg-white text-blue-600 shadow-sm border border-gray-200' : 'text-gray-500 hover:bg-gray-200'}`}>
                    <ArrowRight className="w-4 h-4" /> Forward
                  </button>
                  <button type="button" onClick={() => setActionRoute('COMPLETE')} className={`flex-1 font-bold py-2.5 rounded-lg text-sm transition-all flex items-center justify-center gap-2 ${actionRoute === 'COMPLETE' ? 'bg-white text-green-600 shadow-sm border border-gray-200' : 'text-gray-500 hover:bg-gray-200'}`}>
                    <CheckCircle2 className="w-4 h-4" /> Complete
                  </button>
                </>
              )}
            </div>

            {/* If Forwarding, show destination dropdown */}
            {actionRoute === 'FORWARD' && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Next Destination Office</label>
                <select required value={nextOfficeId} onChange={(e) => setNextOfficeId(e.target.value)} className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none">
                  <option value="">Select office...</option>
                  {offices.map(off => <option key={off.id} value={off.id}>{off.name}</option>)}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Routing Remarks (Optional)</label>
              <input value={remarks} onChange={(e) => setRemarks(e.target.value)} className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. Missing attachments, please review." />
            </div>

            {/* E-SIGNATURE PIN CONFIRMATION */}
            <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 flex items-center gap-4">
              <div className="bg-white p-2.5 rounded-lg shadow-sm border border-blue-100">
                <KeyRound className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-blue-900 block mb-1">e-Signature PIN Required</label>
                <input required type="password" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value)} className="w-full px-3 py-2 border border-blue-200 rounded-lg text-lg bg-white font-mono tracking-widest shadow-inner focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••" />
              </div>
            </div>

            <button type="submit" disabled={isProcessing} className={`w-full text-white py-4 rounded-xl font-bold transition-all shadow-md text-lg flex items-center justify-center gap-2 disabled:opacity-70 ${actionRoute === 'COMPLETE' ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-green-800'}`}>
              {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : `${actionRoute === 'RECEIVE' ? 'Sign & Receive' : actionRoute === 'FORWARD' ? 'Sign & Forward' : 'Sign & Complete'}`}
            </button>

          </form>
        </div>
      )}

    </div>
  );
}