import { useState, useEffect } from "react";
import { 
  Users as UsersIcon, UserCheck, ShieldAlert, CheckCircle2, 
  XCircle, Loader2, Building2, Briefcase, Mail, Phone, Shield
} from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'active'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch users and join with the offices table to get the department name
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          offices ( name, code )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    if (!window.confirm("Approve this user for system access?")) return;
    setProcessingId(userId);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_approved: true })
        .eq('id', userId);
      
      if (error) throw error;
      await fetchUsers(); // Refresh the list
    } catch (err: any) {
      alert("Failed to approve user: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRevoke = async (userId: string) => {
    if (!window.confirm("Revoke access for this user? They will no longer be able to log in.")) return;
    setProcessingId(userId);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_approved: false })
        .eq('id', userId);
      
      if (error) throw error;
      await fetchUsers();
    } catch (err: any) {
      alert("Failed to revoke user: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!window.confirm(`Change this user's role to ${newRole.toUpperCase()}?`)) return;
    setProcessingId(userId);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
      await fetchUsers();
    } catch (err: any) {
      alert("Failed to change role: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  // Filter users based on the active tab
  const pendingUsers = users.filter(u => !u.is_approved);
  const activeUsers = users.filter(u => u.is_approved);
  const displayUsers = activeTab === 'pending' ? pendingUsers : activeUsers;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <UsersIcon className="w-6 h-6 text-primary" />
          User Management
        </h1>
        <p className="text-sm text-gray-500 mt-1">Approve registrations and manage employee system access.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'pending' 
              ? 'border-amber-500 text-amber-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Pending Approvals
          {pendingUsers.length > 0 && (
            <span className="bg-amber-100 text-amber-700 py-0.5 px-2 rounded-full text-xs ml-1">
              {pendingUsers.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'active' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Active Personnel
        </button>
      </div>

      {/* User List */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
        </div>
      ) : displayUsers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-gray-900 font-bold text-lg">All caught up!</h3>
          <p className="text-gray-500 text-sm mt-1">There are no {activeTab} users to display.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayUsers.map((user) => (
            <div key={user.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all relative overflow-hidden group">
              
              {/* Colored Edge Strip */}
              <div className={`absolute top-0 left-0 w-1 h-full ${!user.is_approved ? 'bg-amber-400' : user.role === 'system_admin' ? 'bg-purple-500' : 'bg-green-500'}`}></div>

              <div className="flex justify-between items-start mb-4 pl-2">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{user.full_name}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 font-mono">
                    ID: {user.employee_id}
                  </p>
                </div>
                {user.role === 'system_admin' && (
                  <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] px-2 py-1 rounded font-bold flex items-center gap-1 uppercase tracking-wider shrink-0">
                    <Shield className="w-3 h-3" /> Admin
                  </span>
                )}
              </div>

              <div className="space-y-2.5 mb-5 pl-2">
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <Building2 className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <span className="leading-snug font-medium">{user.offices?.name || 'No Office Assigned'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Briefcase className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>{user.designation} <span className="text-gray-400 text-xs">({user.employment_status})</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                  <a href={`mailto:${user.email}`} className="hover:text-primary transition-colors">{user.email}</a>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>{user.contact_number || 'N/A'}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex gap-2 pl-2">
                {activeTab === 'pending' ? (
                  <button
                    onClick={() => handleApprove(user.id)}
                    disabled={processingId === user.id}
                    className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 font-bold py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    {processingId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                    Approve Access
                  </button>
                ) : (
                  <>
                    <select 
                      value={user.role} 
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={processingId === user.id}
                      className="bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-lg px-2 py-2 outline-none focus:ring-2 focus:ring-primary w-full"
                    >
                      <option value="staff">Capitol Staff</option>
                      <option value="system_admin">System Admin</option>
                    </select>
                    <button
                      onClick={() => handleRevoke(user.id)}
                      disabled={processingId === user.id}
                      title="Revoke Access"
                      className="px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors flex items-center justify-center shrink-0"
                    >
                      {processingId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    </button>
                  </>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}