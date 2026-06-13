import { useState, useEffect } from "react";
import { 
  ActivitySquare, Search, FileText, User, Building2, 
  Clock, ArrowRight, Loader2, Filter
} from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      // We need to pull the log, the document details, the user details, and the office details all at once!
      const { data, error } = await supabase
        .from('routing_logs')
        .select(`
          id,
          action_taken,
          remarks,
          created_at,
          documents!inner ( tracking_number, title ),
          user_profiles!inner ( full_name ),
          offices!inner ( code, name )
        `)
        .order('created_at', { ascending: false })
        .limit(100); // Limit to latest 100 for performance

      if (error) throw error;
      if (data) setLogs(data);
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format timestamps beautifully
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-PH', { 
      month: 'short', day: 'numeric', 
      hour: 'numeric', minute: '2-digit', hour12: true 
    }).format(date);
  };

  // Helper for status badges
  const getBadgeStyle = (action: string) => {
    switch (action) {
      case 'CREATED': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'RECEIVED': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'FORWARDED': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'COMPLETED': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Filter Logic
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.documents.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = filterAction ? log.action_taken === filterAction : true;

    return matchesSearch && matchesAction;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <ActivitySquare className="w-6 h-6 text-primary" />
          Global Audit Log
        </h1>
        <p className="text-sm text-gray-500 mt-1">Immutable ledger of all document movements across the Capitol.</p>
      </div>

      {/* Toolbar: Search & Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by Tracking Number or Employee Name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary outline-none shadow-sm"
          />
        </div>
        <div className="relative shrink-0 md:w-48">
          <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <select 
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary outline-none shadow-sm appearance-none cursor-pointer"
          >
            <option value="">All Actions</option>
            <option value="CREATED">Created</option>
            <option value="RECEIVED">Received</option>
            <option value="FORWARDED">Forwarded</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <ActivitySquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="font-medium">No records found.</p>
            <p className="text-xs mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Document</th>
                  <th className="px-6 py-4">Action Taken</th>
                  <th className="px-6 py-4">Performed By</th>
                  <th className="px-6 py-4">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    
                    {/* Timestamp */}
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {formatTime(log.created_at)}
                      </div>
                    </td>

                    {/* Document Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                        <div>
                          <p className="font-bold text-gray-900 text-xs tracking-wider">{log.documents.tracking_number}</p>
                          <p className="text-gray-500 text-xs truncate max-w-[200px]" title={log.documents.title}>
                            {log.documents.title}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Action Badge */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${getBadgeStyle(log.action_taken)}`}>
                        {log.action_taken}
                      </span>
                      {log.remarks && (
                        <p className="text-[10px] text-gray-400 mt-1 max-w-[150px] truncate" title={log.remarks}>
                          "{log.remarks}"
                        </p>
                      )}
                    </td>

                    {/* Performed By */}
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        {log.user_profiles.full_name}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4 text-gray-600 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        {log.offices.code}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}