import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  FilePlus2, 
  ScanLine, 
  History,
  Users,
  Settings2,
  ActivitySquare,
  Archive,
  LogOut,
  Building2
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

export default function MainLayout() {
  const { profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const isAdmin = profile?.role === 'system_admin';

  // --- MENU DEFINITIONS (Shortened names to fit mobile perfectly) ---
  const staffLinks = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Register", icon: FilePlus2, path: "/documents/new" },
    { name: "Scan", icon: ScanLine, path: "/scan" },
    { name: "History", icon: History, path: "/history" },
  ];

  const adminLinks = [
    { name: "Command", icon: LayoutDashboard, path: "/" },
    { name: "Users", icon: Users, path: "/admin/users" },
    { name: "Configs", icon: Settings2, path: "/admin/configs" },
    { name: "Audit Log", icon: ActivitySquare, path: "/admin/audit" },
    { name: "Archive", icon: Archive, path: "/admin/archive" },
  ];

  const currentLinks = isAdmin ? adminLinks : staffLinks;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      
      {/* 📱 MOBILE TOP HEADER (Logo & Sign Out Only) */}
      <div className="md:hidden absolute top-0 left-0 w-full h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-20 shadow-sm">
        <div className="flex items-center gap-2 text-primary font-bold text-lg tracking-tight">
          <Building2 className="w-6 h-6 text-yellow-500" />
          ClearTrack
        </div>
        <button 
          onClick={handleSignOut}
          className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>

      {/* 💻 DESKTOP SIDEBAR (Sleek Premium Dark Mode) */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 shadow-xl z-10 relative">
        {/* Brand Area */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 text-white font-bold text-lg tracking-tight">
            <Building2 className="w-6 h-6 text-yellow-400" />
            ClearTrack
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {/* Section Header */}
          <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            {isAdmin ? "Admin Controls" : "Document Routing"}
          </p>

          {currentLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout Bottom Section */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0 border border-primary/30">
               {profile?.full_name?.substring(0,2).toUpperCase() || '??'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">{profile?.full_name || 'Loading...'}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold truncate">
                {isAdmin ? 'System Admin' : 'Capitol Staff'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      {/* Note: pt-14 pushes content below top header, pb-20 pushes it above bottom nav */}
      <main className="flex-1 overflow-y-auto relative pt-14 pb-20 md:pt-0 md:pb-0 bg-gray-50">
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full h-full">
          <Outlet /> 
        </div>
      </main>

      {/* 📱 MOBILE BOTTOM NAVIGATION BAR (Facebook Style) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full h-[68px] bg-white border-t border-gray-200 flex items-center justify-around px-1 z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        {currentLinks.map((link) => {
          const isActive = location.pathname === link.path;
          const Icon = link.icon;

          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                isActive ? "text-primary" : "text-gray-400 hover:text-gray-700"
              }`}
            >
              <div className={`p-1.5 rounded-full transition-all ${isActive ? "bg-green-50" : ""}`}>
                <Icon className={`w-6 h-6 ${isActive ? "text-primary fill-primary/10" : ""}`} />
              </div>
              <span className={`text-[10px] font-bold ${isActive ? "text-primary" : "text-gray-500"}`}>
                {link.name}
              </span>
            </Link>
          );
        })}
      </div>

    </div>
  );
}