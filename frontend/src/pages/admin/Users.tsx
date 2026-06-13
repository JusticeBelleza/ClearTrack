import { useState, useEffect } from "react";
import { 
  Users as UsersIcon, UserCheck, ShieldAlert, CheckCircle2, 
  XCircle, Loader2, Building2, Briefcase, Mail, Phone, Shield,
  AlertCircle, User
} from "lucide-react";
import { supabase } from "../../lib/supabase";

// Types
type Toast = { message: string; type: 'success' | 'error' } | null;
type ConfirmModal = { isOpen: boolean; action: 'approve' | 'revoke' | null; userId: string | null; userName: string };

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'active'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Custom Notifications & Modals
  const [toast, setToast] = useState<Toast>(null);
  const [modal, setModal] = useState<ConfirmModal>({ isOpen: false, action: null, userId: null, userName: "" });

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- TOAST NOTIFICATION HELPER ---
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`*, offices ( name, code )`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      showToast("Failed to load users.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // --- MODAL ACTION EXECUTOR ---
  const executeConfirm = async () => {
    if (!modal.userId || !modal.action) return;
    
    setProcessingId(modal.userId);
    const isApproving = modal.action === 'approve';
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_approved: isApproving })
        .eq('id', modal.userId);
        
      if (error) throw error;
      
      await fetchUsers();
      showToast(isApproving ? "User access approved successfully!" : "User access has been revoked.", "success");
    } catch (err: any) {
      showToast(err.message || `Failed to ${modal.action} user.`, "error");
    } finally {
      setProcessingId(null);
      setModal({ isOpen: false, action: null, userId: null, userName: "" });
    }
  };

  const pendingUsers = users.filter(u => !u.is_approved);
  const activeUsers = users.filter(u => u.is_approved);
  const displayUsers = activeTab === 'pending' ? pendingUsers : activeUsers;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500 relative">
      
      {/* FLOATING TOAST NOTIFICATION */}
      {toast && (
        <div className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300 font-medium text-sm text-white ${toast.type === 'success' ? 'bg-gray-900' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <AlertCircle className="w-5 h-5 text-white" />}
          {toast.message}
        </div>
      )}

      {/* CUSTOM CONFIRMATION MODAL */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className={`p-6 text-center ${modal.action === 'approve' ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${modal.action === 'approve' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {modal.action === 'approve' ? <UserCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {modal.action === 'approve' ? 'Approve Access?' : 'Revoke Access?'}
              </h3>
              <p className="text-sm text-gray-600">
                {modal.action === 'approve' 
                  ? <>Are you sure you want to grant system access to <strong className="text-gray-900">{modal.userName}</strong>?</> 
                  : <>Are you sure you want to revoke access for <strong className="text-gray-900">{modal.userName}</strong>? They will be locked out immediately.</>}
              </p>
            </div>
            <div className="p-4 bg-white flex gap-3">
              <button 
                onClick={() => setModal({ isOpen: false, action: null, userId: null, userName: "" })}
                disabled={processingId === modal.userId}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeConfirm}
                disabled={processingId === modal.userId}
                className={`flex-1 px-4 py-2.5 text-white rounded-xl font-bold text-sm transition-colors flex justify-center items-center gap-2 ${
                  modal.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {processingId === modal.userId ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

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
            activeTab === 'pending' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'
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
            activeTab === 'active' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Active Personnel
        </button>
      </div>

      {/* Main Table Area */}
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
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                   <th className="px-6 py-4">Employee Details</th>
                   <th className="px-6 py-4">Department & Position</th>
                   <th className="px-6 py-4">Contact Info</th>
                   {activeTab === 'active' && <th className="px-6 py-4">System Access Level</th>}
                   <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayUsers.map((user) => (
                   <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                     
                     {/* Column 1: Identity */}
                     <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${!user.is_approved ? 'bg-amber-100 text-amber-700' : user.role === 'system_admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                           {user.full_name?.substring(0,2).toUpperCase()}
                         </div>
                         <div>
                           <p className="font-bold text-gray-900">{user.full_name}</p>
                           <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {user.employee_id}</p>
                         </div>
                       </div>
                     </td>

                     {/* Column 2: Department */}
                     <td className="px-6 py-4">
                       <div className="flex items-center gap-2 text-gray-900 font-medium">
                         <Building2 className="w-4 h-4 text-gray-400" />
                         {user.offices?.code || 'N/A'} - {user.offices?.name || 'Unassigned'}
                       </div>
                       <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                         <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                         {user.designation} <span className="text-gray-400">({user.employment_status})</span>
                       </div>
                     </td>

                     {/* Column 3: Contact */}
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <a href={`mailto:${user.email}`} className="hover:text-primary transition-colors">{user.email}</a>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-xs mt-1">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {user.contact_number || 'N/A'}
                        </div>
                     </td>

                     {/* Column 4: STATIC READ-ONLY ROLE BADGE */}
                     {activeTab === 'active' && (
                       <td className="px-6 py-4">
                         <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${
                           user.role === 'system_admin' 
                            ? 'bg-purple-50 text-purple-700 border-purple-200' 
                            : 'bg-gray-50 text-gray-600 border-gray-200'
                         }`}>
                           {user.role === 'system_admin' ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                           {user.role === 'system_admin' ? 'System Admin' : 'Capitol Staff'}
                         </span>
                       </td>
                     )}

                     {/* Column 5: Actions */}
                     <td className="px-6 py-4 text-right">
                       {activeTab === 'pending' ? (
                         <button
                           onClick={() => setModal({ isOpen: true, action: 'approve', userId: user.id, userName: user.full_name })}
                           className="inline-flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 font-bold px-4 py-2 rounded-lg text-sm transition-colors"
                         >
                           <UserCheck className="w-4 h-4" /> Approve
                         </button>
                       ) : (
                         <button
                           onClick={() => setModal({ isOpen: true, action: 'revoke', userId: user.id, userName: user.full_name })}
                           className="inline-flex items-center gap-2 text-gray-500 hover:text-red-600 hover:bg-red-50 font-bold px-3 py-2 rounded-lg text-sm transition-colors"
                         >
                           <XCircle className="w-4 h-4" /> Revoke
                         </button>
                       )}
                     </td>

                   </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}