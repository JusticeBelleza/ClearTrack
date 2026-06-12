import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  ShieldCheck, User, Mail, Lock, Phone, Briefcase, Building2, KeyRound, 
  Loader2, AlertCircle, CheckCircle2, ArrowLeft, Eye, EyeOff 
} from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [offices, setOffices] = useState<{ id: string; name: string }[]>([]);

  // Password Visibility State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    employeeId: "",
    email: "",
    contactNumber: "",
    officeId: "",
    designation: "",
    employmentStatus: "Regular",
    password: "",
    confirmPassword: "",
    pin: "",
    dpaConsent: false,
  });

  useEffect(() => {
    const fetchOffices = async () => {
      const { data } = await supabase.from('offices').select('id, name').order('name');
      if (data) setOffices(data);
    };
    fetchOffices();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? e.target.checked : value
    }));
  };

  // --- Password Strength Logic ---
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length >= 8) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return Math.min(4, score); // Max score is 4
  };

  const passwordStrength = calculateStrength(formData.password);

  const getStrengthColor = (score: number) => {
    if (score === 0) return "bg-gray-200";
    if (score === 1) return "bg-red-500";
    if (score === 2) return "bg-orange-500";
    if (score === 3) return "bg-yellow-500";
    if (score === 4) return "bg-green-500";
    return "bg-gray-200";
  };

  const getStrengthLabel = (score: number) => {
    if (score === 0) return "";
    if (score === 1) return "Weak";
    if (score === 2) return "Fair";
    if (score === 3) return "Good";
    if (score === 4) return "Strong";
    return "";
  };
  // ------------------------------

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (formData.password !== formData.confirmPassword) return setError("Passwords do not match.");
    if (formData.pin.length < 4) return setError("e-Signature PIN must be at least 4 digits.");
    if (!formData.dpaConsent) return setError("You must agree to the Data Privacy Act to register.");
    if (passwordStrength < 2) return setError("Please choose a stronger password.");

    setIsLoading(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            employee_id: formData.employeeId,
            contact_number: formData.contactNumber,
            office_id: formData.officeId,
            designation: formData.designation,
            employment_status: formData.employmentStatus,
            signature_pin: formData.pin,
          }
        }
      });

      if (signUpError) throw signUpError;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit registration.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Registration Submitted</h2>
          <p className="text-sm text-gray-500 pb-6 mt-2">
            Your request has been sent to the MIS Department. You will be able to log in once a System Administrator verifies your ID and approves your account.
          </p>
          <Link to="/login" className="flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 rounded-xl transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Return to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full py-12 px-4 flex justify-center bg-gray-50">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6 md:p-10 border border-gray-100 h-fit">
        
        {/* Header */}
        <div className="text-center mb-8 relative">
          <div className="mx-auto w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4 border border-green-100">
            <ShieldCheck className="w-7 h-7 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Personnel Registration</h1>
          <p className="text-sm text-gray-500 mt-1">Request access to the Capitol tracking network.</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-2 text-sm border border-red-100 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="font-medium leading-snug">{error}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          
          {/* Section 1: Personal Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input required name="fullName" value={formData.fullName} onChange={handleChange} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition-all" placeholder="Juan Dela Cruz" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Employee ID No.</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input required name="employeeId" value={formData.employeeId} onChange={handleChange} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition-all" placeholder="e.g. 2024-0192" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Official Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition-all" placeholder="juan@abra.gov.ph" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input required name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition-all" placeholder="0917 123 4567" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Employment Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Employment Details</h3>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Capitol Department / Office</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <select required name="officeId" value={formData.officeId} onChange={handleChange} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition-all appearance-none">
                  <option value="">Select your office...</option>
                  {offices.map(off => <option key={off.id} value={off.id}>{off.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Designation / Position</label>
                <input required name="designation" value={formData.designation} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition-all" placeholder="e.g. Admin Aide III" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Status</label>
                <select name="employmentStatus" value={formData.employmentStatus} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition-all">
                  <option value="Regular">Regular</option>
                  <option value="Casual">Casual</option>
                  <option value="Job Order">Job Order</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Security Setup */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Security Setup</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Password Input with Strength Meter & Eye Toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 flex justify-between">
                  Account Password
                  <span className={`text-[10px] font-bold ${passwordStrength > 2 ? 'text-green-600' : 'text-gray-400'}`}>
                    {getStrengthLabel(passwordStrength)}
                  </span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input 
                    required 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    className="w-full pl-9 pr-10 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition-all" 
                    placeholder="••••••••" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Strength Meter Bar */}
                {formData.password.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div 
                        key={level} 
                        className={`h-1 w-full rounded-full transition-colors duration-300 ${passwordStrength >= level ? getStrengthColor(passwordStrength) : 'bg-gray-200'}`} 
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password with Eye Toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input 
                    required 
                    type={showConfirmPassword ? "text" : "password"} 
                    name="confirmPassword" 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    className="w-full pl-9 pr-10 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition-all" 
                    placeholder="••••••••" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 flex gap-4 items-start shadow-sm mt-2">
              <div className="bg-white p-2.5 rounded-lg shadow-sm shrink-0 border border-blue-100">
                <KeyRound className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <label className="text-sm font-bold text-blue-900 block mb-1">e-Signature PIN Code</label>
                <p className="text-xs text-blue-800/80 mb-3 leading-relaxed pr-2">
                  Create a secure 4-to-6 digit PIN. You will type this PIN on your device as your <strong className="font-bold">legal digital signature</strong> whenever you accept or forward physical documents. Keep this private.
                </p>
                <input required type="password" inputMode="numeric" pattern="[0-9]*" maxLength={6} name="pin" value={formData.pin} onChange={handleChange} className="w-32 px-3 py-2.5 border border-blue-200 rounded-lg text-lg bg-white font-mono tracking-widest text-center shadow-inner focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="••••" />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer p-5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
              <input required type="checkbox" name="dpaConsent" checked={formData.dpaConsent} onChange={handleChange} className="mt-0.5 w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary shrink-0" />
              <span className="text-xs text-gray-600 leading-relaxed">
                <strong className="text-gray-900 block mb-0.5 text-sm">Data Privacy & Accountability Consent</strong> 
                By checking this box, I authorize the Provincial Government of Abra to collect and process my personal data in accordance with the Data Privacy Act of 2012 (RA 10173). I acknowledge that my system actions, document routing logs, and digital signatures are permanently recorded for official auditing.
              </span>
            </label>
          </div>

          <div className="pt-4 flex flex-col items-center gap-4 border-t border-gray-100">
            <button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-green-800 text-white py-4 rounded-xl font-bold transition-all shadow-md text-lg flex items-center justify-center gap-2 disabled:opacity-70">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Submit Registration Request"}
            </button>
            
            <Link to="/login" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors py-2">
              <ArrowLeft className="w-4 h-4" />
              Cancel and return to Sign In
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
}