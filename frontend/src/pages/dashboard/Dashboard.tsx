import { 
  Users, ShieldAlert, Activity, 
  Server, Check, X, ShieldCheck, Clock, Building2
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const sysMetrics = {
    totalUsers: 142,
    pendingApprovals: 5,
    activeWorkflows: 18,
    systemUptime: "99.9%"
  };

  const pendingRegistrations = [
    { id: "REQ-001", name: "Maria Santos", email: "m.santos@abra.gov.ph", role: "Custodian", department: "Accounting Office", requestedAt: "2 hours ago" },
    { id: "REQ-002", name: "Engr. Julian Perez", email: "j.perez@abra.gov.ph", role: "Originator", department: "Provincial Engineering", requestedAt: "5 hours ago" },
    { id: "REQ-003", name: "Elena Gomez", email: "e.gomez@abra.gov.ph", role: "Signatory", department: "Governor's Office", requestedAt: "1 day ago" },
  ];

  const auditLogs = [
    { id: 1, action: "Workflow Template Updated", user: "Admin User", details: "Modified 'Payroll' SLA limit to 3 days", time: "10 mins ago", type: "config" },
    { id: 2, action: "Failed Login Attempt", user: "Unknown IP", details: "3 failed attempts for pbo@abra.gov.ph", time: "1 hr ago", type: "security" },
    { id: 3, action: "User Account Locked", user: "System", details: "Auto-locked pbo@abra.gov.ph due to failed logins", time: "1 hr ago", type: "security" },
    { id: 4, action: "Bulk Document Archive", user: "System", details: "Archived 1,204 completed records from 2024", time: "12 hrs ago", type: "system" },
  ];

  // Helper to get user initials for the avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-6">
      
      {/* Page Title & Context */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Admin</h1>
        <p className="text-sm text-gray-500">Oversee network health and access.</p>
      </div>

      {/* Top Metric Cards - 2x2 Grid on Mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 leading-none">{sysMetrics.totalUsers}</h3>
            <p className="text-[11px] font-medium text-gray-500 mt-1 uppercase tracking-wider">Active Users</p>
          </div>
        </div>

        <Link to="/admin/users?filter=pending" className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm flex flex-col gap-2 relative overflow-hidden transition-all hover:shadow-md active:scale-95 cursor-pointer group">
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
        
        {/* Left Column: Mobile-Optimized Registration Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Pending Requests
            </h2>
          </div>
          
          <div className="space-y-3">
            {pendingRegistrations.map((req) => (
              <div key={req.id} className="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4 transition-all hover:border-gray-200 hover:shadow-md">
                 
                 {/* Top Row: Avatar, Identity, Role Badge */}
                 <div className="flex justify-between items-start gap-2">
                    <div className="flex gap-3 items-center min-w-0">
                       <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 font-bold text-sm border border-gray-200 shrink-0">
                          {getInitials(req.name)}
                       </div>
                       <div className="min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm truncate">{req.name}</h4>
                          <p className="text-xs text-gray-500 truncate">{req.email}</p>
                       </div>
                    </div>
                    {/* Role Badge */}
                    <span className="shrink-0 bg-blue-50 text-blue-700 border border-blue-100 text-[10px] uppercase font-bold px-2 py-1 rounded-md tracking-wide">
                      {req.role}
                    </span>
                 </div>

                 {/* Bottom Row: Department & Action Buttons */}
                 <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                   <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5 truncate pr-2">
                     <Building2 className="w-3.5 h-3.5 shrink-0" /> 
                     <span className="truncate">{req.department}</span>
                   </p>
                   
                   <div className="flex gap-2 shrink-0">
                      <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200 transition-colors border border-red-100" title="Reject Request">
                        <X className="w-4 h-4" />
                      </button>
                      <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-primary text-white hover:bg-green-800 active:bg-green-900 transition-colors shadow-sm" title="Approve Request">
                        <Check className="w-4 h-4" />
                      </button>
                   </div>
                 </div>
              </div>
            ))}

            {pendingRegistrations.length === 0 && (
              <div className="p-8 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 border-dashed">
                No pending registration requests at this time.
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
                  
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                    log.type === 'security' ? 'bg-red-50 text-red-600 border border-red-100' : 
                    log.type === 'config' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-gray-50 text-gray-600 border border-gray-200'
                  }`}>
                    {log.type === 'security' ? <ShieldAlert className="w-3.5 h-3.5" /> : 
                     log.type === 'config' ? <Server className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
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