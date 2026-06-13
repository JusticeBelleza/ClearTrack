import { useState, useEffect, useRef } from "react";
import { 
  FilePlus2, Plus, Trash2, Camera, UploadCloud, 
  File as FileIcon, X, Loader2, CheckCircle2, AlertCircle, Building2
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

// Types for our dynamic form
interface AttachedFile {
  file: File;
  previewUrl?: string;
}

interface DocumentEntry {
  id: string; // Temporary UI ID
  title: string;
  categoryId: string;
  files: AttachedFile[];
}

export default function CreateDocument() {
  const { profile } = useAuth();
  
  // States
  const [categories, setCategories] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMode, setSuccessMode] = useState(false);
  const [error, setError] = useState("");
  const [generatedTrackingNumbers, setGeneratedTrackingNumbers] = useState<string[]>([]);

  // The dynamic array of documents to register
  const [documents, setDocuments] = useState<DocumentEntry[]>([
    { id: crypto.randomUUID(), title: "", categoryId: "", files: [] }
  ]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from('workflow_templates').select('id, name').order('name');
    if (data) setCategories(data);
  };

  // --- FORM MANIPULATION HANDLERS ---
  const addDocument = () => {
    setDocuments([...documents, { id: crypto.randomUUID(), title: "", categoryId: "", files: [] }]);
  };

  const removeDocument = (id: string) => {
    if (documents.length === 1) return; // Always keep at least one
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  const updateDocument = (id: string, field: keyof DocumentEntry, value: any) => {
    setDocuments(documents.map(doc => doc.id === id ? { ...doc, [field]: value } : doc));
  };

  // --- FILE HANDLING ---
  const handleFileSelect = (docId: string, newFiles: FileList | null) => {
    if (!newFiles) return;
    const fileArray = Array.from(newFiles).map(file => ({
      file,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));

    setDocuments(documents.map(doc => {
      if (doc.id === docId) {
        return { ...doc, files: [...doc.files, ...fileArray] };
      }
      return doc;
    }));
  };

  const removeFile = (docId: string, fileIndex: number) => {
    setDocuments(documents.map(doc => {
      if (doc.id === docId) {
        const newFiles = [...doc.files];
        // Revoke object URL to prevent memory leaks
        if (newFiles[fileIndex].previewUrl) URL.revokeObjectURL(newFiles[fileIndex].previewUrl!);
        newFiles.splice(fileIndex, 1);
        return { ...doc, files: newFiles };
      }
      return doc;
    }));
  };

  // --- SUBMISSION LOGIC ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.office_id) return setError("You must be assigned to an office to register documents.");
    
    // Validate all fields
    const missingFields = documents.some(doc => !doc.title.trim() || !doc.categoryId);
    if (missingFields) return setError("Please fill in all titles and categories before submitting.");

    setIsSubmitting(true);
    setError("");
    const newTrackingNumbers: string[] = [];

    try {
      // Process each document in the batch
      for (const doc of documents) {
        // 1. Generate Tracking Number (e.g., ABRA-2026-X8B9)
        const year = new Date().getFullYear();
        const randomString = Math.random().toString(36).substring(2, 6).toUpperCase();
        const trackingNumber = `ABRA-${year}-${randomString}`;
        newTrackingNumbers.push(trackingNumber);

        // Get Category Name for the DB
        const categoryName = categories.find(c => c.id === doc.categoryId)?.name || 'General';

        // 2. Insert into Database
        const { data: insertedDoc, error: insertError } = await supabase
          .from('documents')
          .insert({
            tracking_number: trackingNumber,
            title: doc.title.trim(),
            document_type: categoryName,
            originating_office_id: profile.office_id,
            current_office_id: profile.office_id, // Starts in the creator's office
            current_custodian_id: profile.id,     // Creator is the first custodian
            status: 'CREATED'
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // 3. Insert Initial Routing Log
        await supabase.from('routing_logs').insert({
          document_id: insertedDoc.id,
          performed_by_user_id: profile.id,
          from_office_id: profile.office_id,
          action_taken: 'CREATED',
          remarks: 'Document formally registered into the Capitol system.'
        });

        // 4. Upload Files to Supabase Storage (If any)
        if (doc.files.length > 0) {
          for (const attached of doc.files) {
            const fileExt = attached.file.name.split('.').pop();
            const fileName = `${crypto.randomUUID()}.${fileExt}`;
            const filePath = `${trackingNumber}/${fileName}`;
            
            // Upload to the 'attachments' bucket
            await supabase.storage.from('attachments').upload(filePath, attached.file);
          }
        }
      }

      setGeneratedTrackingNumbers(newTrackingNumbers);
      setSuccessMode(true);
      
    } catch (err: any) {
      setError(err.message || "Failed to register documents. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- SUCCESS VIEW ---
  if (successMode) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-in zoom-in-95 duration-500 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Registration Complete!</h1>
        <p className="text-gray-500 mb-8">You successfully registered {generatedTrackingNumbers.length} document(s).</p>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-left mb-8 space-y-3">
          <h3 className="font-bold text-gray-900 text-sm mb-4 uppercase tracking-wider">Generated Tracking Numbers</h3>
          {generatedTrackingNumbers.map((tn, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <span className="font-mono text-xl font-bold text-primary tracking-widest">{tn}</span>
              <span className="text-xs font-bold bg-white px-3 py-1 rounded shadow-sm border border-gray-200">
                Doc {index + 1}
              </span>
            </div>
          ))}
          <p className="text-xs text-amber-600 font-medium pt-3 flex gap-2 items-center">
            <AlertCircle className="w-4 h-4" /> Please write these numbers on the physical documents or print the barcodes.
          </p>
        </div>

        <button 
          onClick={() => {
            setDocuments([{ id: crypto.randomUUID(), title: "", categoryId: "", files: [] }]);
            setSuccessMode(false);
            setGeneratedTrackingNumbers([]);
          }}
          className="bg-gray-900 hover:bg-black text-white px-8 py-3.5 rounded-xl font-bold transition-colors shadow-lg"
        >
          Register More Documents
        </button>
      </div>
    );
  }

  // --- MAIN FORM VIEW ---
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <FilePlus2 className="w-6 h-6 text-primary" />
          Batch Registration
        </h1>
        <p className="text-sm text-gray-500 mt-1">Register one or multiple documents into the Capitol routing engine.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-start gap-3 text-sm animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Dynamic Document List */}
        <div className="space-y-5">
          {documents.map((doc, index) => (
            <div key={doc.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative group">
              
              {/* Card Header (Title & Remove Button) */}
              <div className="bg-gray-50 border-b border-gray-100 px-5 py-3 flex justify-between items-center">
                <h3 className="font-bold text-gray-700 text-sm">Document #{index + 1}</h3>
                {documents.length > 1 && (
                  <button type="button" onClick={() => removeDocument(doc.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="p-5 space-y-5">
                {/* Inputs: Title & Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Document Title</label>
                    <input required value={doc.title} onChange={(e) => updateDocument(doc.id, 'title', e.target.value)} placeholder="e.g. Travel Order - Mayor's Office" className="w-full px-4 py-2.5 border rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Category</label>
                    <select required value={doc.categoryId} onChange={(e) => updateDocument(doc.id, 'categoryId', e.target.value)} className="w-full px-4 py-2.5 border rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all appearance-none">
                      <option value="">Select Category...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Attachments Section */}
                <div className="pt-4 border-t border-gray-100">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-3">Physical Attachments (Optional)</label>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 mb-4">
                    
                    {/* MOBILE ONLY: Direct Camera Access */}
                    <label className="md:hidden flex-1 cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 border border-blue-200 transition-colors text-sm">
                      <Camera className="w-4 h-4" /> Take Photo
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFileSelect(doc.id, e.target.files)} />
                    </label>
                    
                    {/* ALL DEVICES: Standard File Picker */}
                    <label className="flex-1 cursor-pointer bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 border border-gray-200 transition-colors text-sm">
                      <UploadCloud className="w-4 h-4" /> Upload File(s)
                      <input type="file" multiple accept="image/*,application/pdf" className="hidden" onChange={(e) => handleFileSelect(doc.id, e.target.files)} />
                    </label>

                  </div>

                  {/* Attachment Previews */}
                  {doc.files.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
                      {doc.files.map((attached, fileIdx) => (
                        <div key={fileIdx} className="relative group bg-gray-50 border border-gray-200 rounded-lg p-2 flex flex-col items-center justify-center text-center overflow-hidden h-24">
                          {attached.previewUrl ? (
                            <img src={attached.previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-10 transition-opacity" />
                          ) : (
                            <FileIcon className="w-6 h-6 text-gray-400 mb-1 z-10" />
                          )}
                          <span className="text-[10px] text-gray-700 font-medium truncate w-full z-10 px-1 relative">{attached.file.name}</span>
                          <span className="text-[8px] text-gray-500 z-10 relative">{(attached.file.size / 1024 / 1024).toFixed(2)} MB</span>
                          
                          <button type="button" onClick={() => removeFile(doc.id, fileIdx)} className="absolute top-1 right-1 bg-red-100 hover:bg-red-500 text-red-600 hover:text-white p-1 rounded-md transition-colors z-20">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Form Controls */}
        <div className="flex flex-col md:flex-row gap-4 pt-2">
          {/* Add Another Document Button */}
          <button 
            type="button" 
            onClick={addDocument}
            className="flex-1 border-2 border-dashed border-gray-300 hover:border-primary hover:bg-green-50 hover:text-primary text-gray-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Plus className="w-5 h-5" /> Add Another Document
          </button>

          {/* Master Submit Button */}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="flex-1 bg-primary hover:bg-green-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-600/20 disabled:opacity-70 disabled:cursor-not-allowed text-lg"
          >
            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Complete Registration"}
          </button>
        </div>

      </form>
    </div>
  );
}