import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export interface Relative {
  id?: string;
  relative_profile_id: string;
  relationship: string;
  name: string;
}

export default function LinkedAccounts({ relatives, onRelativesChange }: { relatives: Relative[]; onRelativesChange: (rels: Relative[]) => void }) {
  const [showModal, setShowModal] = useState(false);
  const [, setEditIdx] = useState<number | null>(null);
  const [form, setForm] = useState<Relative>({
    relative_profile_id: "",
    relationship: "",
    name: ""
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Move handleSave inside the component
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.relationship.trim()) { 
      setError("All fields required"); 
      return; 
    }
    
    const supabase = createClient();
    
    // First create a relative profile
    const { data: profileData, error: profileError } = await supabase
      .from("relative_profiles")
      .insert({
        name: form.name
      })
      .select()
      .single();

    if (profileError) { 
      setError(profileError.message); 
      return; 
    }

    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("User not found");
      return;
    }

    // Then create the relative relationship
    const { data: relativeData, error: relativeError } = await supabase
      .from("relatives")
      .insert({
        user_id: user.id,
        relative_profile_id: profileData.id,
        relationship: form.relationship
      })
      .select()
      .single();

    if (relativeError) { 
      setError(relativeError.message); 
      return; 
    }

    const newRelative = {
      ...relativeData,
      name: profileData.name
    };

    onRelativesChange([...relatives, newRelative]);
    setShowModal(false);
    
    // Navigate to the relative's medication page
    router.push(`/protected/relative/${profileData.id}`);
  }

  function openAdd() {
    setForm({
      relative_profile_id: "", // Change from relative_id
      relationship: "",
      name: ""
    });
    setEditIdx(null);
    setShowModal(true);
  }

  // Add this function inside the LinkedAccounts component
  async function handleDelete(idx: number) {
    const relative = relatives[idx];
    if (!relative || !relative.relative_profile_id) return;
  
    const supabase = createClient();
  
    // First delete associated medications
    const { error: medError } = await supabase
      .from("medications")
      .delete()
      .eq("relative_profile_id", relative.relative_profile_id);
  
    if (medError) {
      setError(medError.message);
      return;
    }
  
    // Then delete the relative relationship
    const { error: relError } = await supabase
      .from("relatives")
      .delete()
      .eq("relative_profile_id", relative.relative_profile_id);
  
    if (relError) {
      setError(relError.message);
      return;
    }
  
    // Finally delete the relative profile
    const { error: profileError } = await supabase
      .from("relative_profiles")
      .delete()
      .eq("id", relative.relative_profile_id);
  
    if (profileError) {
      setError(profileError.message);
      return;
    }
  
    onRelativesChange(relatives.filter((_, i) => i !== idx));
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold">Linked Relatives</h2>
        <button className="btn btn-primary" onClick={openAdd}>Add Relative</button>
      </div>
      <div className="flex-1 overflow-y-auto pr-2">
        <ul className="divide-y divide-blue-200 dark:divide-gray-700">
          {relatives.map((rel, idx) => (
            <li key={rel.id || idx} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <div className="font-semibold text-lg">{rel.name}</div>
                <div className="text-xs text-gray-500">{rel.relationship}</div>
              </div>
              <div className="flex gap-2">
                <button 
                  className="btn btn-secondary btn-xs"
                  onClick={() => router.push(`/protected/relative/${rel.relative_profile_id}`)} // Change from rel.relative_id
                >
                  View Medications
                </button>
                <button 
                  className="btn btn-danger btn-xs" 
                  onClick={() => handleDelete(idx)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
          {relatives.length === 0 && (
            <li className="text-gray-400 text-sm">No relatives added.</li>
          )}
        </ul>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form onSubmit={handleSave} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col gap-4">
            <h3 className="text-lg font-bold mb-2">Add Relative</h3>
            <label className="font-semibold">Name</label>
            <input 
              className="input" 
              value={form.name} 
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
              required 
            />
            <label className="font-semibold">Relationship</label>
            <input 
              className="input" 
              value={form.relationship} 
              onChange={e => setForm(f => ({ ...f, relationship: e.target.value }))} 
              required 
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-2 mt-4">
              <button type="submit" className="btn">Save</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}