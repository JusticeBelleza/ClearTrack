import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "../../lib/supabase"; 
import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
  const { session } = useAuth(); // Listen to the Vault
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // If the Vault says we are logged in, instantly transport to Dashboard!
  if (session) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(""); 
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;
      
      // We leave isLoading as true if successful, so the button spins 
      // while the AuthContext safely processes the session and redirects us above.

    } catch (error: any) {
      setErrorMessage(error.message || "Failed to connect to the Capitol network.");
      setIsLoading(false); // Only stop the spinner if there is an error
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-[45vh] bg-primary rounded-b-[4rem] shadow-2xl"></div>
        <div className="absolute top-0 left-0 w-full h-[45vh] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 z-10 mx-4 border border-gray-100">
        
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-4 border border-green-100 shadow-sm">
            <ShieldCheck className="w-10 h-10 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">ClearTrack Portal</h1>
          <p className="text-sm text-gray-500 font-medium uppercase tracking-widest mt-1">Province of Abra</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Live Error Message Box */}
          {errorMessage && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-start gap-2 text-sm border border-red-100 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="font-medium">{errorMessage}</p>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 block">Official Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-gray-50/50 hover:bg-gray-50 text-gray-900"
                placeholder="juan.delacruz@abra.gov.ph"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 block">Password</label>
              <a href="#" className="text-xs font-medium text-green-700 hover:text-green-800 transition-colors">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-gray-50/50 hover:bg-gray-50 text-gray-900"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-green-800 text-white py-3 px-4 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Sign In to System
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
            Authorized personnel only. All activity on this portal is monitored and logged in compliance with the Data Privacy Act of 2012.
          </p>
          <p className="text-sm text-gray-600 font-medium">
            New employee? <Link to="/register" className="text-primary font-bold hover:underline">Register here</Link>
          </p>
        </div>

      </div>
    </div>
  );
}