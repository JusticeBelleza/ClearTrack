import { useState, useEffect } from "react";
import { 
  Users, ShieldAlert, Activity, 
  Server, ShieldCheck, Clock, Building2, Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase"; // Your live Vault key

export default function Dashboard() {
  // Live State Variables
  const [totalUsers, setTotalUsers] = useState(0);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real data from Supabase when the dashboard loads
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      
      try {
        // 1. Get total number of registered employees
        const { count } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true });
          
        if (count !== null) setTotalUsers(count);

        // 2. Get the 5 most recently registered employees
        const { data: users, error } = await supabase
          .from('user_profiles')
          .select('id, full_name, email, role, offices(name)')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        if (users) setRecentUsers(users);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Hardcoded for now until we build the document routing engine
  const sysMetrics = {
    pendingApprovals: 0,
    activeWorkflows: 0,
    systemUptime: "99.9%"
  };

  const auditLogs = [
    { id: 1, action: "System Initialized", user: "System", details: "ClearTrack environment booted", time: "Just now", type: "system" },
  ];

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-6">
      
      {/* Page Title & Context */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Admin</h1>
        <p className="text-sm text-gray-500">Oversee network health and access.</p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 leading-none">{totalUsers}</h3>
            <p className="text-[11px] font-medium text-gray-500 mt-1 uppercase tracking-wider">Active Users</p>
          </div>
        </div>

        <Link to="/admin/users" className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm flex flex-col gap-2 relative overflow-hidden transition-all hover:shadow-md active:scale-95 cursor-pointer group">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
          <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-100">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-amber-600 leading-none">{sysMetrics.pendingApprovals}</h3>
            <p className="text-[11px] font-medium text-gray-500 mt-1 uppercase tracking-wider group-hover:text-amber-700">Approvals</p>
          </div>
        </Link>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 leading-none">{sysMetrics.activeWorkflows}</h3>
            <p className="text-[11px] font-medium text-gray-500 mt-1 uppercase tracking-wider">Workflows</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2">
          <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-green-600 leading-none">{sysMetrics.systemUptime}</h3>
            <p className="text-[11px] font-medium text-gray-500 mt-1 uppercase tracking-wider">Uptime</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Real Users Database Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Recently Registered Personnel
            </h2>
          </div>
          
          <div className="space-y-3">
            {recentUsers.map((req) => (
              <div key={req.id} className="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4 transition-all hover:border-gray-200 hover:shadow-md">
                 
                 <div className="flex justify-between items-start gap-2">
                    <div className="flex gap-3 items-center min-w-0">
                       <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 font-bold text-sm border border-gray-200 shrink-0">
                          {getInitials(req.full_name)}
                       </div>
                       <div className="min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm truncate">{req.full_name || 'Unknown User'}</h4>
                          <p className="text-xs text-gray-500 truncate">{req.email}</p>
                       </div>
                    </div>
                    <span className="shrink-0 bg-blue-50 text-blue-700 border border-blue-100 text-[10px] uppercase font-bold px-2 py-1 rounded-md tracking-wide">
                      {req.role}
                    </span>
                 </div>

                 <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                   <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5 truncate pr-2">
                     <Building2 className="w-3.5 h-3.5 shrink-0" /> 
                     <span className="truncate">{req.offices?.name || 'No Office Assigned'}</span>
                   </p>
                 </div>
              </div>
            ))}

            {recentUsers.length === 0 && (
              <div className="p-8 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 border-dashed">
                No personnel registered yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: System Audit Log */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-400" />
            Audit Log
          </h2>
          
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-[400px] overflow-y-auto">
            <div className="space-y-5">
              {auditLogs.map((log, i) => (
                <div key={log.id} className="flex gap-4 relative">
                  {i !== auditLogs.length - 1 && (
                    <div className="absolute left-4 top-8 bottom-[-20px] w-[1px] bg-gray-100"></div>
                  )}
                  
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 bg-blue-50 text-blue-600 border border-blue-100">
                    <Server className="w-3.5 h-3.5" />
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{log.action}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">{log.details}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{log.user}</span>
                      <span className="text-[10px] text-gray-300">• {log.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}