import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, QrCode, FileText, Settings, 
  LogOut, ShieldCheck 
} from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Scan QR", path: "/scan", icon: QrCode },
    { name: "My Docs", path: "/documents", icon: FileText }, // Shortened name for mobile screens
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  const currentNav = navItems.find(item => 
    item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* DESKTOP SIDEBAR (Hidden on mobile phones) */}
      <aside className="hidden md:flex w-64 bg-primary text-primary-foreground flex-col shadow-xl z-20 shrink-0">
        <div className="h-16 flex items-center px-6 gap-3 border-b border-green-900/50 bg-green-950/30">
          <ShieldCheck className="w-7 h-7 text-yellow-500 shrink-0" />
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-tight whitespace-nowrap">ClearTrack</h1>
            <p className="text-[10px] text-green-300 font-medium uppercase tracking-wider">Prov. of Abra</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentNav?.name === item.name;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 ${
                  isActive 
                    ? "bg-green-700/60 text-white font-semibold shadow-inner border-l-4 border-yellow-500" 
                    : "text-green-100/70 hover:bg-green-800/40 hover:text-white border-l-4 border-transparent"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-yellow-400" : ""}`} />
                {item.name === "My Docs" ? "My Documents" : item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-green-900/50 bg-green-950/30">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 w-full text-left text-green-200/70 hover:bg-red-500/20 hover:text-red-400 rounded-md transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50 h-screen overflow-hidden">
        
        {/* TOP HEADER */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shadow-sm z-10 shrink-0">
          
          {/* Mobile Branding (Replaces sidebar logo on phones) */}
          <div className="flex items-center gap-2 md:hidden">
            <ShieldCheck className="w-6 h-6 text-yellow-500" />
            <h1 className="text-lg font-bold text-green-900 tracking-tight">ClearTrack</h1>
          </div>

          {/* Desktop Page Title */}
          <h2 className="hidden md:block text-xl font-semibold text-gray-800 truncate">
            {currentNav?.name === "My Docs" ? "My Documents" : (currentNav?.name || "Capitol Portal")}
          </h2>
          
          {/* User Profile & Actions */}
          <div className="flex items-center gap-4 shrink-0">
             <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-700">Admin User</p>
                <p className="text-xs text-gray-500">System Administrator</p>
             </div>
             <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-bold border border-green-200 shadow-sm text-sm">
                AD
             </div>
             
             {/* Mobile Logout Button (Since sidebar is hidden on phones) */}
             <button onClick={handleLogout} className="md:hidden p-2 text-gray-400 hover:text-red-500 transition-colors">
               <LogOut className="w-5 h-5" />
             </button>
          </div>
        </header>

        {/* SCROLLABLE PAGE CONTENT */}
        {/* Note: pb-20 is added on mobile so content doesn't hide behind the bottom nav */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 pb-20 md:pb-8">
          <Outlet />
        </main>
        
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex justify-around items-center px-2 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        {navItems.map((item) => {
          const isActive = currentNav?.name === item.name;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? "text-green-700" : "text-gray-400 hover:text-green-600"
              }`}
            >
              {/* Added a subtle highlight pill behind the active icon for a premium look */}
              <div className={`p-1 px-4 rounded-full transition-colors ${isActive ? "bg-green-100/80" : ""}`}>
                <Icon className={`w-5 h-5 ${isActive ? "text-green-700" : ""}`} />
              </div>
              <span className={`text-[10px] font-medium ${isActive ? "font-bold text-green-800" : ""}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}