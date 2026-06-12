import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, User, Mail, Lock, Phone, Briefcase, Building2, KeyRound, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [offices, setOffices] = useState<{ id: string; name: string }[]>([]);

  // Form State - Role is now implicit "staff" via Database Trigger
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (formData.password !== formData.confirmPassword) return setError("Passwords do not match.");
    if (formData.pin.length < 4) return setError("e-Signature PIN must be at least 4 digits.");
    if (!formData.dpaConsent) return setError("You must agree to the Data Privacy Act to register.");

    setIsLoading(true);

    try {
      // Register user with Supabase Auth
      // The Database Trigger 'on_auth_user_created' handles the profile creation as 'staff'
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
          <p className="text-sm text-gray-500 pb-6">
            Your request has been sent to the MIS Department. You will be able to log in once a System Administrator approves your account.
          </p>
          <Link to="/login" className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 rounded-xl transition-colors">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full py-12 px-4 flex justify-center bg-gray-50">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6 md:p-10 border border-gray-100 h-fit">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4 border border-green-100">
            <ShieldCheck className="w-7 h-7 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Personnel Registration</h1>
          <p className="text-sm text-gray-500 mt-1">Request access to the Capitol tracking network.</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-3.5 rounded-xl flex items-start gap-2 text-sm border border-red-100">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="font-medium leading-snug">{error}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
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
                <label className="text-xs font-semibold text-gray-700">Designation</label>
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

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Security Setup</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Password</label>
                <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition-all" placeholder="••••••••" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Confirm Password</label>
                <input required type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition-all" placeholder="••••••••" />
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-4 items-start">
              <KeyRound className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <label className="text-xs font-bold text-blue-900 block mb-1">e-Signature PIN Code</label>
                <p className="text-[10px] text-blue-700 mb-2 leading-relaxed">4-6 digit PIN for signing documents.</p>
                <input required type="password" inputMode="numeric" pattern="[0-9]*" maxLength={6} name="pin" value={formData.pin} onChange={handleChange} className="w-32 px-3 py-2 border border-blue-200 rounded-lg text-sm bg-white font-mono tracking-widest text-center shadow-inner" placeholder="----" />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer p-4 border rounded-xl hover:bg-gray-50 transition-colors">
              <input required type="checkbox" name="dpaConsent" checked={formData.dpaConsent} onChange={handleChange} className="mt-1 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
              <span className="text-[11px] text-gray-600 leading-relaxed">
                I agree to the Data Privacy Act of 2012. I understand my actions are audited.
              </span>
            </label>
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-green-800 text-white py-4 px-4 rounded-xl font-bold transition-all shadow-md">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Submit Registration Request"}
          </button>
        </form>
      </div>
    </div>
  );
}