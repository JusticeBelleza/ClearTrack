import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function AdminRoute() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If the user is NOT a system admin, kick them back to their dashboard
  if (profile?.role !== 'system_admin') {
    return <Navigate to="/" replace />;
  }

  // If they are an admin, let them through to the admin pages
  return <Outlet />;
}