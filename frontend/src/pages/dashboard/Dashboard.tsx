import { useState, useEffect } from "react";
import { 
  Users, FileText, Activity, ShieldAlert, AlertTriangle, 
  ScanLine, Clock, ArrowRight, FilePlus2, Inbox, Loader2, CheckCircle2 
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

export default function Dashboard() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'system_admin';

  // State for Admin Command Center
  const [adminMetrics, setAdminMetrics] = useState({ totalUsers: 0, pendingUsers: 0, activeDocuments: 0, stuckDocuments: 0 });
  const [adminDocs, setAdminDocs] = useState<any[]>([]);
  
  // State for Staff Workspace
  const [staffMetrics, setStaffMetrics] = useState({ inMyOffice: 0, createdByMe: 0 });
  const [staffDocs, setStaffDocs] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    if (isAdmin) {
      fetchAdminData();
    } else {
      fetchStaffData();
    }
  }, [profile, isAdmin]);

  // --- ADMIN DATA FETCHING ---
  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const { count: uCount } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true });
      const { count: pCount } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('is_approved', false);
      const { count: dCount } = await supabase.from('documents').select('*', { count: 'exact', head: true }).neq('status', 'COMPLETED');
      setAdminMetrics({ totalUsers: uCount || 0, pendingUsers: pCount || 0, activeDocuments: dCount || 0, stuckDocuments: 2 });

      const { data } = await supabase.from('documents').select('id, tracking_number, title, status, document_type, created_at').order('created_at', { ascending: false }).limit(6);
      if (data) setAdminDocs(data);
    } finally {
      setIsLoading(false);
    }
  };

  // --- STAFF DATA FETCHING ---
  const fetchStaffData = async () => {
    setIsLoading(true);
    try {
      // 1. Count docs currently sitting in the staff member's office
      const { count: officeCount } = await supabase.from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('current_office_id', profile?.office_id)
        .neq('status', 'COMPLETED');

      // 2. Count docs originated by this staff member's office
      const { count: originCount } = await supabase.from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('originating_office_id', profile?.office_id);

      setStaffMetrics({ inMyOffice: officeCount || 0, createdByMe: originCount || 0 });

      // 3. Get the latest documents currently sitting in their office for them to process
      const { data } = await supabase.from('documents')
        .select('id, tracking_number, title, status, document_type, created_at')
        .eq('current_office_id', profile?.office_id)
        .neq('status', 'COMPLETED')
        .order('updated_at', { ascending: false })
        .limit(5);

      if (data) setStaffDocs(data);
    } finally {
      setIsLoading(false);
    }
  };

  // --- VIEW 1: SYSTEM ADMIN COMMAND CENTER ---
  if (isAdmin) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" /> Command Center
          </h1>
          <p className="text-sm text-gray-500 mt-1">System-wide overview of the Capitol document network.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><Users className="w-5 h-5" /></div>
            <div><h3 className="text-3xl font-black text-gray-900 leading-none">{adminMetrics.totalUsers}</h3><p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider">Active Personnel</p></div>
          </div>
          <Link to="/admin/users" className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm flex flex-col gap-3 relative overflow-hidden hover:shadow-md transition-all group">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
            <div className="absolute top-4 right-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRight className="w-5 h-5" /></div>
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-100 transition-colors"><ShieldAlert className="w-5 h-5" /></div>
            <div><h3 className="text-3xl font-black text-amber-600 leading-none">{adminMetrics.pendingUsers}</h3><p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider group-hover:text-amber-700 transition-colors">Pending Access</p></div>
          </Link>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600"><FileText className="w-5 h-5" /></div>
            <div><h3 className="text-3xl font-black text-gray-900 leading-none">{adminMetrics.activeDocuments}</h3><p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider">Docs In Transit</p></div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-red-200 shadow-sm flex flex-col gap-3 relative overflow-hidden hover:shadow-md transition-all cursor-pointer group">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 group-hover:bg-red-100 transition-colors"><AlertTriangle className="w-5 h-5" /></div>
            <div><h3 className="text-3xl font-black text-red-600 leading-none">{adminMetrics.stuckDocuments}</h3><p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider group-hover:text-red-700 transition-colors">ARTA Warnings</p></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><ScanLine className="w-5 h-5 text-primary" /> Live Routing Feed</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {adminDocs.map((doc) => (
                <div key={doc.id} className="p-5 hover:bg-gray-50 transition-colors flex justify-between items-center border-b last:border-0">
                  <div>
                    <p className="text-xs font-bold text-primary mb-1 tracking-wider">{doc.tracking_number}</p>
                    <h4 className="font-semibold text-gray-900 text-sm truncate">{doc.title}</h4>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-md tracking-wide bg-gray-50 text-gray-700 border border-gray-200">{doc.status}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 shadow-sm">
              <h3 className="font-bold text-amber-900 text-sm flex items-center gap-2 mb-3"><Clock className="w-4 h-4 text-amber-600" /> ARTA Deadline Approaching</h3>
              <div className="bg-white p-3 rounded-xl border border-amber-100 text-sm shadow-sm">
                <p className="font-bold text-gray-900 text-xs tracking-wider text-primary">ABRA-2026-X9B2</p>
                <p className="text-xs text-red-600 mt-2 font-bold bg-red-50 inline-block px-2 py-1 rounded">Stuck in HR for 4 Days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 2: STAFF PERSONAL WORKSPACE ---
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-6 animate-in fade-in duration-500">
      
      {/* Welcome Banner */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="relative z-10 text-center md:text-left">
          <h1 className="text-3xl font-black mb-2">Welcome back, {profile?.full_name?.split(' ')[0]}!</h1>
          <p className="text-slate-300 font-medium">Your office currently has <strong className="text-white">{staffMetrics.inMyOffice} document(s)</strong> waiting to be processed.</p>
        </div>
        <div className="relative z-10 flex gap-3 w-full md:w-auto">
          <Link to="/documents/new" className="flex-1 md:flex-none bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
            <FilePlus2 className="w-5 h-5" /> Register
          </Link>
          <Link to="/scan" className="flex-1 md:flex-none bg-primary hover:bg-green-500 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)] flex items-center justify-center gap-2">
            <ScanLine className="w-5 h-5" /> Scan QR
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Docs in Office */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Inbox className="w-5 h-5 text-primary" /> Pending in My Office
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
            ) : staffDocs.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {staffDocs.map((doc) => (
                  <div key={doc.id} className="p-5 hover:bg-gray-50 transition-colors flex justify-between items-center gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-primary mb-1 tracking-wider">{doc.tracking_number}</p>
                      <h4 className="font-semibold text-gray-900 text-sm truncate">{doc.title}</h4>
                      <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-bold">{doc.document_type}</p>
                    </div>
                    <Link to="/scan" className="shrink-0 bg-gray-900 hover:bg-black text-white text-[10px] uppercase font-bold px-3 py-2 rounded-lg tracking-wider transition-colors">
                      Process
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3 opacity-50" />
                <p className="font-bold text-gray-900">Your queue is clear.</p>
                <p className="text-sm mt-1">There are no documents waiting in your office.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Office Stats */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-400" /> My Contributions
          </h2>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><FileText className="w-5 h-5" /></div>
            <div>
              <h3 className="text-3xl font-black text-gray-900 leading-none">{staffMetrics.createdByMe}</h3>
              <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider">Docs Registered By Office</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}