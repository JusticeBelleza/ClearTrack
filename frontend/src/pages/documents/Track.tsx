import { useState } from "react";
import { 
  Search, MapPin, Clock, CheckCircle2, 
  FileText, Loader2, AlertCircle, Building2,
  ArrowDownCircle, Flag
} from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function Track() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  
  const [document, setDocument] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setIsSearching(true);
    setError("");
    setDocument(null);
    setLogs([]);

    try {
      // 1. Fetch Document Details
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .select(`
          *,
          originating_office:offices!originating_office_id(name),
          current_office:offices!current_office_id(name)
        `)
        .eq('tracking_number', trackingNumber.trim().toUpperCase())
        .single();

      if (docError || !docData) throw new Error("Document not found. Please check the tracking number.");

      // 2. Fetch the entire Routing History for this document
      const { data: logData, error: logError } = await supabase
        .from('routing_logs')
        .select(`
          *,
          user_profiles(full_name),
          offices(name)
        `)
        .eq('document_id', docData.id)
        .order('created_at', { ascending: false });

      if (logError) throw logError;

      setDocument(docData);
      setLogs(logData || []);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const formatTime = (isoString: string) => {
    return new Intl.DateTimeFormat('en-PH', { 
      month: 'short', day: 'numeric', 
      hour: 'numeric', minute: '2-digit', hour12: true 
    }).format(new Date(isoString));
  };

  // UI Helpers
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CREATED': return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase border border-blue-200">Registered</span>;
      case 'IN_TRANSIT': return <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase border border-amber-200 flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-ping"></div> In Transit</span>;
      case 'RECEIVED': return <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase border border-purple-200">Received</span>;
      case 'COMPLETED': return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase border border-green-200 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>;
      default: return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">{status}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* Header & Search */}
      <div className="bg-slate-900 rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20">
            <Search className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-black mb-2">Track a Document</h1>
          <p className="text-slate-300 font-medium mb-8">Enter a Capitol Tracking Number to view its live status and routing history.</p>
          
          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text" 
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. ABRA-2026-X8B9"
              className="w-full pl-6 pr-32 py-4 rounded-2xl text-gray-900 font-mono text-lg tracking-widest outline-none focus:ring-4 focus:ring-primary/50 shadow-lg uppercase"
            />
            <button 
              type="submit"
              disabled={isSearching || !trackingNumber}
              className="absolute right-2 top-2 bottom-2 bg-primary hover:bg-green-500 text-white px-6 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px]"
            >
              {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : "Track"}
            </button>
          </form>

          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded-xl flex items-center justify-center gap-2 text-sm backdrop-blur-sm">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}
        </div>
      </div>

      {/* RESULTS VIEW */}
      {document && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          
          {/* Document Summary Card */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-primary font-mono text-sm tracking-widest mb-1.5 font-bold">{document.tracking_number}</p>
              <h2 className="text-2xl font-black text-gray-900 mb-2">{document.title}</h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-md font-bold uppercase text-[10px] tracking-wider">
                  <FileText className="w-3.5 h-3.5" /> {document.document_type}
                </span>
                <span className="flex items-center gap-1.5">
                  <Flag className="w-4 h-4 text-gray-400" /> Origin: <strong>{document.originating_office?.name}</strong>
                </span>
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end gap-3 shrink-0 border-t border-gray-100 pt-4 md:pt-0 md:border-0">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Status</span>
              {getStatusBadge(document.status)}
              {document.status !== 'COMPLETED' && (
                <span className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" /> At: <strong>{document.current_office?.name}</strong>
                </span>
              )}
            </div>
          </div>

          {/* DYNAMIC VERTICAL TIMELINE */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8">
            <h3 className="font-bold text-gray-900 mb-8 uppercase tracking-wider text-sm flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> Routing History
            </h3>

            <div className="space-y-0 relative pl-4 md:pl-8">
              {/* Vertical Line */}
              <div className="absolute top-2 bottom-6 left-6 md:left-10 w-0.5 bg-gray-100"></div>

              {logs.map((log, index) => {
                const isLatest = index === 0; // The log at the top of the list is the most recent
                
                return (
                  <div key={log.id} className="relative pl-8 md:pl-12 pb-8 last:pb-0 group">
                    
                    {/* Timeline Node/Dot */}
                    <div className={`absolute top-1 left-[-11px] md:left-[5px] w-6 h-6 rounded-full border-4 shadow-sm z-10 transition-colors ${
                      isLatest ? 'bg-primary border-green-100 scale-125' : 'bg-gray-300 border-white group-hover:bg-gray-400'
                    }`}></div>

                    {/* Content Card */}
                    <div className={`bg-gray-50 border rounded-2xl p-4 md:p-5 transition-all ${
                      isLatest ? 'border-primary/30 shadow-md bg-white' : 'border-gray-100 shadow-sm hover:shadow-md'
                    }`}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                            log.action_taken === 'CREATED' ? 'bg-blue-100 text-blue-700' :
                            log.action_taken === 'FORWARDED' ? 'bg-amber-100 text-amber-700' :
                            log.action_taken === 'RECEIVED' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {log.action_taken}
                          </span>
                          <span className="text-xs text-gray-500 font-mono">{formatTime(log.created_at)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex items-start gap-2">
                          <Building2 className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                          <p><strong>Office:</strong> {log.offices?.name}</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                          <p><strong>Processed by:</strong> {log.user_profiles?.full_name}</p>
                        </div>
                        {log.remarks && (
                          <div className="mt-3 bg-white border border-gray-100 p-3 rounded-xl text-gray-600 text-xs italic">
                            "{log.remarks}"
                          </div>
                        )}
                      </div>

                    </div>
                    
                    {/* Animated "In Transit" indicator between nodes if the latest status is IN_TRANSIT */}
                    {isLatest && document.status === 'IN_TRANSIT' && index === 0 && (
                      <div className="absolute top-12 left-[1px] md:left-[17px] bottom-0 w-0.5 flex flex-col items-center justify-center gap-1 z-20">
                         <ArrowDownCircle className="w-4 h-4 text-amber-500 animate-bounce bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}