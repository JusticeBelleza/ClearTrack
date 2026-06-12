import { useState, useEffect } from "react";
import { Building2, FileCode2, Plus, Trash2, Loader2, AlertCircle, Info } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function Configs() {
  const [activeTab, setActiveTab] = useState<'departments' | 'categories'>('departments');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Data States
  const [offices, setOffices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Form States
  const [newOfficeName, setNewOfficeName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [officesRes, categoriesRes] = await Promise.all([
        supabase.from('offices').select('*').order('name'),
        supabase.from('workflow_templates').select('*').order('name')
      ]);

      if (officesRes.data) setOffices(officesRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- DEPARTMENT HANDLERS ---
  const handleAddOffice = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      // Auto-generate a random 5-digit number (e.g., "49210")
      const generatedCode = Math.floor(10000 + Math.random() * 90000).toString();

      const { error: insertError } = await supabase
        .from('offices')
        .insert([{ name: newOfficeName, code: generatedCode }]);

      if (insertError) throw insertError;
      
      setNewOfficeName("");
      await fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to add office.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOffice = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this office?")) return;
    setError("");
    try {
      const { error: deleteError } = await supabase.from('offices').delete().eq('id', id);
      if (deleteError) {
        // Handle Foreign Key Constraint Error
        if (deleteError.code === '23503') {
          throw new Error("Cannot delete this office. There are users or documents currently assigned to it.");
        }
        throw deleteError;
      }
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // --- CATEGORY HANDLERS ---
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const { error: insertError } = await supabase
        .from('workflow_templates')
        .insert([{ name: newCategoryName }]);

      if (insertError) throw insertError;
      
      setNewCategoryName("");
      await fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to add category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    setError("");
    try {
      const { error: deleteError } = await supabase.from('workflow_templates').delete().eq('id', id);
      if (deleteError) {
        if (deleteError.code === '23503') {
          throw new Error("Cannot delete this category. It is currently being used by existing documents.");
        }
        throw deleteError;
      }
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Configurations</h1>
        <p className="text-sm text-gray-500 mt-1">Manage Capitol departments and global document routing types.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => { setActiveTab('departments'); setError(""); }}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'departments' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Capitol Departments
        </button>
        <button
          onClick={() => { setActiveTab('categories'); setError(""); }}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'categories' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileCode2 className="w-4 h-4" />
          Document Categories
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* LEFT: ADD NEW FORM */}
          <div className="md:col-span-1">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm sticky top-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Add New {activeTab === 'departments' ? 'Department' : 'Category'}
              </h3>
              
              {activeTab === 'departments' ? (
                <form onSubmit={handleAddOffice} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">Department Name</label>
                    <input required value={newOfficeName} onChange={(e) => setNewOfficeName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. Provincial Health Office" />
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-green-800 text-white py-2.5 rounded-lg font-bold text-sm transition-colors flex justify-center items-center gap-2 disabled:opacity-70 mt-2">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Department"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">Category Name</label>
                    <input required value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. Travel Order" />
                  </div>
                  <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-xs flex gap-2">
                    <Info className="w-4 h-4 shrink-0" />
                    <p>Categories appear in the dropdown when employees register new documents.</p>
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-green-800 text-white py-2.5 rounded-lg font-bold text-sm transition-colors flex justify-center items-center gap-2 disabled:opacity-70">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Category"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* RIGHT: DATA LIST */}
          <div className="md:col-span-2 space-y-3">
            {activeTab === 'departments' ? (
              offices.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200">No departments configured yet.</div>
              ) : (
                offices.map((office) => (
                  <div key={office.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                      <h4 className="font-bold text-gray-900">{office.name}</h4>
                      <span className="inline-block mt-1 bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded tracking-wider">
                        CODE: {office.code}
                      </span>
                    </div>
                    <button onClick={() => handleDeleteOffice(office.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )
            ) : (
              categories.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200">No categories configured yet.</div>
              ) : (
                categories.map((category) => (
                  <div key={category.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                    <h4 className="font-bold text-gray-900 flex items-center gap-3">
                      <FileCode2 className="w-5 h-5 text-gray-400" />
                      {category.name}
                    </h4>
                    <button onClick={() => handleDeleteCategory(category.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )
            )}
          </div>

        </div>
      )}
    </div>
  );
}