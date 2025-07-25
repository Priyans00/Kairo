import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Relative {
  id?: string;
  relative_id: string;
  relationship: string;
}

export default function LinkedAccounts({ relatives, onRelativesChange }: { relatives: Relative[]; onRelativesChange: (rels: Relative[]) => void }) {
  const [showModal, setShowModal] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [form, setForm] = useState<Relative>({ relative_id: "", relationship: "" });
  const [error, setError] = useState<string | null>(null);

  function openAdd() {
    setForm({ relative_id: "", relationship: "" });
    setEditIdx(null);
    setShowModal(true);
  }
  function openEdit(idx: number) {
    setForm(relatives[idx]);
    setEditIdx(idx);
    setShowModal(true);
  }
  function closeModal() {
    setShowModal(false);
    setError(null);
  }
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.relative_id.trim() || !form.relationship.trim()) { setError("All fields required"); return; }
    const supabase = createClient();
    let updatedRels = [...relatives];
    if (editIdx === null) {
      // Add
      const { data, error: dbError } = await supabase.from("relatives").insert({
        relative_id: form.relative_id,
        relationship: form.relationship,
      }).select().single();
      if (dbError) { setError(dbError.message); return; }
      updatedRels.push(data);
    } else {
      // Edit
      const { id } = relatives[editIdx];
      const { data, error: dbError } = await supabase.from("relatives").update({
        relative_id: form.relative_id,
        relationship: form.relationship,
      }).eq("id", id).select().single();
      if (dbError) { setError(dbError.message); return; }
      updatedRels[editIdx] = data;
    }
    onRelativesChange(updatedRels);
    setShowModal(false);
  }
  async function handleDelete(idx: number) {
    const supabase = createClient();
    const { id } = relatives[idx];
    await supabase.from("relatives").delete().eq("id", id);
    const updated = relatives.filter((_, i) => i !== idx);
    onRelativesChange(updated);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold">Linked Relatives</h2>
        <button className="btn btn-primary" onClick={openAdd}>Add Relative</button>
      </div>
      <ul className="divide-y divide-blue-200 dark:divide-gray-700">
        {relatives.map((rel, idx) => (
          <li key={rel.id || idx} className="py-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <div className="font-semibold">{rel.relative_id}</div>
              <div className="text-xs text-gray-500">{rel.relationship}</div>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-secondary btn-xs" onClick={() => openEdit(idx)}>Edit</button>
              <button className="btn btn-danger btn-xs" onClick={() => handleDelete(idx)}>Delete</button>
            </div>
          </li>
        ))}
        {relatives.length === 0 && <li className="text-gray-400 text-sm">No relatives added.</li>}
      </ul>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form onSubmit={handleSave} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col gap-4">
            <h3 className="text-lg font-bold mb-2">{editIdx === null ? "Add" : "Edit"} Relative</h3>
            <label className="font-semibold">Relative User ID</label>
            <input className="input" value={form.relative_id} onChange={e => setForm(f => ({ ...f, relative_id: e.target.value }))} required />
            <label className="font-semibold">Relationship</label>
            <input className="input" value={form.relationship} onChange={e => setForm(f => ({ ...f, relationship: e.target.value }))} required />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-2 mt-4">
              <button type="submit" className="btn">Save</button>
              <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 