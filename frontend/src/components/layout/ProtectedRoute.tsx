import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute() {
  const { session, isLoading } = useAuth();

  // Show a loading spinner while Supabase checks the session
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-sm font-medium text-gray-500 tracking-widest uppercase">Authenticating...</p>
      </div>
    );
  }

  // If no active session, kick them back to the login screen
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // If logged in, allow them to pass through to the child routes
  return <Outlet />;
}