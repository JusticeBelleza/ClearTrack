import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, FilePlus2, CheckCircle2, Loader2, FileCode2, AlertCircle, ShieldAlert } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

export default function CreateDocument() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [templates, setTemplates] = useState<{ id: string; name: string }[]>([]);
  const [successData, setSuccessData] = useState<{ trackingNumber: string; title: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    classification: "Internal",
    templateId: "", // Used to categorize the document
  });

  // Fetch Workflow Templates for the dropdown on load
  useEffect(() => {
    const fetchTemplates = async () => {
      const { data } = await supabase.from('workflow_templates').select('*').order('name');
      if (data) setTemplates(data);
    };
    fetchTemplates();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return setError("You must be logged in and approved to create documents.");
    
    setIsLoading(true);
    setError("");

    try {
      // 1. Generate a unique Tracking Number
      const uniqueString = Math.random().toString(36).substring(2, 8).toUpperCase();
      const trackingNumber = `ABRA-${new Date().getFullYear()}-${uniqueString}`;

      // 2. We need the template name for the document_type column
      const selectedTemplate = templates.find(t => t.id === formData.templateId);
      const documentTypeName = selectedTemplate ? selectedTemplate.name : 'Uncategorized';

      // 3. Insert into the Documents table (SAFE UUID HANDLING applied here)
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert({
          tracking_number: trackingNumber,
          title: formData.title,
          document_type: documentTypeName, // Saved purely for categorization/reporting
          workflow_template_id: formData.templateId === "other" || formData.templateId === "" ? null : formData.templateId, 
          originating_office_id: profile.office_id,
          current_office_id: profile.office_id, 
          current_custodian_id: profile.id,     
          is_public: formData.classification === "Public",
          status: 'CREATED'
        })
        .select('id')
        .single();

      if (docError) throw docError;

      // 4. Create the very first Audit Log entry
      const { error: logError } = await supabase
        .from('routing_logs')
        .insert({
          document_id: docData.id,
          performed_by_user_id: profile.id,
          from_office_id: profile.office_id,
          action_taken: 'CREATED',
          remarks: `Document categorized as: ${documentTypeName}`
        });

      if (logError) throw logError;

      setSuccessData({ trackingNumber, title: formData.title });

    } catch (err: any) {
      setError(err.message || "Failed to create document.");
    } finally {
      setIsLoading(false);
    }
  };

  // SUCCESS SCREEN
  if (successData) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-sm border border-gray-100 text-center">
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Registered</h2>
        <p className="text-gray-500 mb-8">Please write this tracking number on the physical document or print the barcode.</p>
        
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 mb-8">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Official Tracking Number</p>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 font-mono tracking-wider">
            {successData.trackingNumber}
          </h1>
        </div>

        <div className="flex gap-4 justify-center">
          <button onClick={() => setSuccessData(null)} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-xl transition-colors">
            Register Another
          </button>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-primary hover:bg-green-800 text-white font-bold rounded-xl transition-colors shadow-md">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // REGISTRATION FORM
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <FilePlus2 className="w-6 h-6 text-primary" />
          Register New Document
        </h1>
        <p className="text-sm text-gray-500 mt-1">Generate a tracking number before routing physical papers.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-2 text-sm border border-red-100">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Document Title / Subject</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input required name="title" value={formData.title} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition-all" placeholder="e.g., Payroll Voucher for June 2026" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Document Category</label>
              <div className="relative">
                <FileCode2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <select required name="templateId" value={formData.templateId} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition-all appearance-none">
                  <option value="">Select category...</option>
                  {templates.map(tpl => <option key={tpl.id} value={tpl.id}>{tpl.name}</option>)}
                  <option value="other">Other / Uncategorized</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Security Classification</label>
              <div className="relative">
                <ShieldAlert className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <select required name="classification" value={formData.classification} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition-all appearance-none">
                  <option value="Internal">Internal (Capitol Routing Only)</option>
                  <option value="External">External (Outbound to other agency)</option>
                  <option value="Confidential">Confidential (Restricted Log)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-green-800 text-white py-4 rounded-xl font-bold transition-all shadow-md text-lg flex items-center justify-center gap-2 disabled:opacity-70">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Generate Tracking Barcode"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}