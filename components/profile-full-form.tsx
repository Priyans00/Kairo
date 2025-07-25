import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ProfileFullForm({ profile, onProfileUpdate }: { profile: any; onProfileUpdate: (profile: any) => void }) {
  const [editMode, setEditMode] = useState(!profile?.name || !profile?.disease);
  const [form, setForm] = useState<{ name: string; disease: string }>({
    name: profile?.name || "",
    disease: profile?.disease || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!editMode && profile?.name && profile?.disease) {
    // Show read-only card
    return (
      <div className="flex flex-col gap-4 bg-blue-50 dark:bg-gray-800 rounded-lg p-6 shadow min-h-[200px]">
        <h2 className="text-lg font-bold mb-2">Profile Info</h2>
        <div><span className="font-semibold">Name:</span> {profile.name}</div>
        <div><span className="font-semibold">Disease:</span> {profile.disease}</div>
        <button className="btn mt-2" onClick={() => setEditMode(true)}>Edit</button>
      </div>
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("User not found. Please log in again.");
      setIsSubmitting(false);
      return;
    }
    // Save name/disease
    const { error: updateError } = await supabase.from("profiles").upsert({
      id: user.id,
      name: form.name,
      disease: form.disease,
    });
    if (updateError) {
      setError(updateError.message);
      setIsSubmitting(false);
      return;
    }
    setSuccess(true);
    setIsSubmitting(false);
    if (onProfileUpdate) onProfileUpdate({ ...profile, ...form });
    setEditMode(false); // Hide form after save
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4 bg-blue-50 dark:bg-gray-800 rounded-lg p-6 shadow min-h-[200px]">
      <h2 className="text-lg font-bold mb-2">Profile Info</h2>
      <label className="font-semibold">Name</label>
      <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
      <label className="font-semibold">Disease</label>
      <input className="input" value={form.disease} onChange={e => setForm(f => ({ ...f, disease: e.target.value }))} />
      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-green-600">Profile updated!</p>}
      <button className="btn mt-2" type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Profile"}</button>
    </form>
  );
} 