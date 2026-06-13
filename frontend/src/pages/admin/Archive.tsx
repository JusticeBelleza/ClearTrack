import { useState, useEffect } from "react";
import { 
  Archive as ArchiveIcon, Search, FileText, 
  Building2, Calendar, Loader2, CheckCircle2 
} from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function Archive() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchArchivedDocuments();
  }, []);

  const fetchArchivedDocuments = async () => {
    setIsLoading(true);
    try {
      // Fetch only COMPLETED documents, joining with offices and users for context
      const { data, error } = await supabase
        .from('documents')
        .select(`
          id,
          tracking_number,
          title,
          document_type,
          updated_at,
          current_office:offices!current_office_id(name, code),
          current_custodian:user_profiles!current_custodian_id(full_name)
        `)
        .eq('status', 'COMPLETED')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      if (data) setDocuments(data);
    } catch (err) {
      console.error("Error fetching archive:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format the completion date
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-PH', { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: 'numeric', minute: '2-digit', hour12: true 
    }).format(date);
  };

  // Search Filter Logic
  const filteredDocs = documents.filter(doc => 
    doc.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <ArchiveIcon className="w-6 h-6 text-primary" />
          Document Archive
        </h1>
        <p className="text-sm text-gray-500 mt-1">Permanent ledger of all completed and finalized Capitol documents.</p>
      </div>

      {/* Toolbar: Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search by Tracking Number or Title..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary outline-none shadow-sm"
        />
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-16 text-gray-500 bg-gray-50/50">
            <ArchiveIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-bold text-gray-900 text-lg">No archived documents found.</p>
            <p className="text-sm mt-1">Completed documents will appear here automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-6 py-4">Document Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Final Location & Custodian</th>
                  <th className="px-6 py-4">Date Completed</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors group">
                    
                    {/* Document Details */}
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200 group-hover:bg-white transition-colors">
                          <FileText className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-black text-primary text-xs tracking-widest mb-0.5">{doc.tracking_number}</p>
                          <p className="font-bold text-gray-900 truncate max-w-[250px]" title={doc.title}>
                            {doc.title}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {doc.document_type || 'Uncategorized'}
                    </td>

                    {/* Location & Custodian */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-900 font-bold text-xs mb-1">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        {doc.current_office?.name || 'Unknown Office'}
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-xs">
                        <span className="w-3.5 h-3.5 rounded-full bg-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-500 shrink-0">
                          {doc.current_custodian?.full_name?.charAt(0)}
                        </span>
                        Received by: {doc.current_custodian?.full_name}
                      </div>
                    </td>

                    {/* Date Completed */}
                    <td className="px-6 py-4 text-gray-500 text-xs font-mono">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {formatDate(doc.updated_at)}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Archived
                      </span>
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