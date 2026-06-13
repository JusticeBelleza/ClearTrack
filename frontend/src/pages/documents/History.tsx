import { useState, useEffect } from "react";
import { 
  History as HistoryIcon, FileText, Clock, 
  MapPin, Loader2, Search, CheckCircle2
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

export default function History() {
  const { profile } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (profile?.id) {
      fetchMyHistory();
    }
  }, [profile]);

  const fetchMyHistory = async () => {
    setIsLoading(true);
    try {
      // Fetch ONLY logs performed by the currently logged-in user
      const { data, error } = await supabase
        .from('routing_logs')
        .select(`
          id,
          action_taken,
          remarks,
          created_at,
          documents!inner ( tracking_number, title, document_type, status ),
          offices!inner ( name, code )
        `)
        .eq('performed_by_user_id', profile!.id)
        .order('created_at', { ascending: false })
        .limit(50); // Show latest 50 for speed

      if (error) throw error;
      if (data) setLogs(data);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (isoString: string) => {
    return new Intl.DateTimeFormat('en-PH', { 
      month: 'short', day: 'numeric', 
      hour: 'numeric', minute: '2-digit', hour12: true 
    }).format(new Date(isoString));
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATED': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'RECEIVED': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'FORWARDED': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'COMPLETED': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Filter based on search input
  const filteredLogs = logs.filter(log => 
    log.documents.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.documents.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <HistoryIcon className="w-6 h-6 text-primary" />
          My Processing History
        </h1>
        <p className="text-sm text-gray-500 mt-1">Your personal ledger of documents you have registered, received, and forwarded.</p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search your history..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary outline-none shadow-sm"
        />
      </div>

      {/* Data List (Card-based layout for better mobile experience) */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm">
          <HistoryIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-gray-900 font-bold text-lg">No history found.</h3>
          <p className="text-gray-500 text-sm mt-1">Documents you process using the scanner will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <div key={log.id} className="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Document Details */}
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 mt-1">
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-black text-primary text-xs tracking-widest">{log.documents.tracking_number}</span>
                    {log.documents.status === 'COMPLETED' && (
                       <span className="flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                         <CheckCircle2 className="w-3 h-3" /> Finalized
                       </span>
                    )}
                  </div>
                  <h4 className="font-bold text-gray-900 truncate text-sm md:text-base leading-snug">{log.documents.title}</h4>
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">{log.documents.document_type}</p>
                </div>
              </div>

              {/* Action Taken (The "Receipt") */}
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center pt-3 md:pt-0 border-t border-gray-50 md:border-0 shrink-0">
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider border mb-1.5 ${getActionColor(log.action_taken)}`}>
                  {log.action_taken}
                </span>
                
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-mono flex items-center gap-1.5 justify-end mb-0.5">
                    <Clock className="w-3.5 h-3.5" />
                    {formatTime(log.created_at)}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1.5 justify-end">
                    <MapPin className="w-3.5 h-3.5" />
                    {log.offices.code}
                  </p>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}