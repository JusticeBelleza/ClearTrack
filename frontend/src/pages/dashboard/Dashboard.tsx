import { useState, useEffect } from "react";
import { Users, FileText, Activity, ShieldAlert, AlertTriangle, ScanLine, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    activeDocuments: 0,
    stuckDocuments: 0 // Simulating ARTA warnings
  });
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch real counts from the database
        const { count: usersCount } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true });
        const { count: pendingCount } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('is_approved', false);
        const { count: docsCount } = await supabase.from('documents').select('*', { count: 'exact', head: true }).neq('status', 'COMPLETED');

        setMetrics({
          totalUsers: usersCount || 0,
          pendingUsers: pendingCount || 0,
          activeDocuments: docsCount || 0,
          stuckDocuments: 2 // Hardcoded for demo purposes until we build the ARTA logic
        });

        // Fetch the 5 most recently created/scanned documents
        const { data: docs } = await supabase
          .from('documents')
          .select('id, tracking_number, title, status, document_type, created_at')
          .order('created_at', { ascending: false })
          .limit(6);

        if (docs) setRecentDocs(docs);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary" />
          Command Center
        </h1>
        <p className="text-sm text-gray-500 mt-1">System-wide overview of the Capitol document network.</p>
      </div>

      {/* Top Row: System KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Active Users */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-gray-900 leading-none">{metrics.totalUsers}</h3>
            <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider">Active Personnel</p>
          </div>
        </div>

        {/* Pending Access Requests (Actionable) */}
        <Link to="/admin/users" className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm flex flex-col gap-3 relative overflow-hidden hover:shadow-md transition-all group">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
          <div className="absolute top-4 right-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="w-5 h-5" />
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-100 transition-colors">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-amber-600 leading-none">{metrics.pendingUsers}</h3>
            <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider group-hover:text-amber-700 transition-colors">Pending Access</p>
          </div>
        </Link>

        {/* Documents In Transit */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-gray-900 leading-none">{metrics.activeDocuments}</h3>
            <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider">Docs In Transit</p>
          </div>
        </div>

        {/* ARTA Warnings (Actionable) */}
        <div className="bg-white p-5 rounded-2xl border border-red-200 shadow-sm flex flex-col gap-3 relative overflow-hidden hover:shadow-md transition-all cursor-pointer group">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 group-hover:bg-red-100 transition-colors">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-red-600 leading-none">{metrics.stuckDocuments}</h3>
            <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider group-hover:text-red-700 transition-colors">ARTA Warnings</p>
          </div>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Live Routing Feed (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ScanLine className="w-5 h-5 text-primary" />
              Live Routing Feed
            </h2>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-gray-400 font-medium">Synchronizing with Capitol Network...</div>
            ) : recentDocs.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {recentDocs.map((doc) => (
                  <div key={doc.id} className="p-5 hover:bg-gray-50 transition-colors flex justify-between items-center gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-primary mb-1 tracking-wider">{doc.tracking_number}</p>
                      <h4 className="font-semibold text-gray-900 text-sm truncate">{doc.title}</h4>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{doc.document_type || 'Uncategorized Document'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-md tracking-wide border ${
                        doc.status === 'CREATED' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        doc.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-100' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {doc.status}
                      </span>
                      <p className="text-[10px] text-gray-400 mt-2 font-medium flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" /> Just now
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
               <div className="p-12 text-center flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                <FileText className="w-12 h-12 text-gray-300 mb-3" />
                <p className="font-medium text-gray-500">No documents in transit.</p>
                <p className="text-sm mt-1">When staff generate barcodes, they will appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: ARTA Watchlist & Quick Configs (1/3 width) */}
        <div className="space-y-6">
          
          {/* Action Required Box */}
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 shadow-sm">
            <h3 className="font-bold text-amber-900 text-sm flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-amber-600" />
              ARTA Deadline Approaching
            </h3>
            <div className="bg-white p-3 rounded-xl border border-amber-100 text-sm shadow-sm mb-2">
              <p className="font-bold text-gray-900 text-xs tracking-wider text-primary">ABRA-2026-X9B2</p>
              <p className="text-gray-600 truncate mt-0.5 font-medium">Leave Application (J. Dela Cruz)</p>
              <p className="text-xs text-red-600 mt-2 font-bold bg-red-50 inline-block px-2 py-1 rounded">Stuck in HR for 4 Days</p>
            </div>
          </div>

          {/* Quick Actions / Configuration Links */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Setup</h2>
            <div className="space-y-3">
              <Link to="/admin/configs" className="block bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-primary hover:shadow-md transition-all group">
                <h4 className="font-bold text-gray-900 text-sm group-hover:text-primary transition-colors">Manage Departments</h4>
                <p className="text-xs text-gray-500 mt-0.5">Add or remove Capitol offices</p>
              </Link>
              
              <Link to="/admin/configs" className="block bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-primary hover:shadow-md transition-all group">
                <h4 className="font-bold text-gray-900 text-sm group-hover:text-primary transition-colors">Document Categories</h4>
                <p className="text-xs text-gray-500 mt-0.5">Update dropdown templates</p>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}