import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ProfileSettingsForm({ profile, onProfileUpdate }) {
  const [form, setForm] = useState({ name: profile.name || "", disease: profile.disease || "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdate(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    const supabase = createClient();
    const { error: updateError } = await supabase.from("profiles").update({
      name: form.name,
      disease: form.disease,
    }).eq("id", profile.id);
    if (updateError) {
      setError(updateError.message);
      setIsSubmitting(false);
      return;
    }
    setSuccess(true);
    setIsSubmitting(false);
    if (onProfileUpdate) onProfileUpdate({ ...profile, ...form });
  }

  return (
    <form onSubmit={handleUpdate} className="flex flex-col gap-4 max-w-md bg-white dark:bg-gray-900 rounded shadow p-6">
      <label className="font-semibold">Name</label>
      <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
      <label className="font-semibold">Disease</label>
      <input className="input" value={form.disease} onChange={e => setForm(f => ({ ...f, disease: e.target.value }))} />
      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-green-600">Profile updated!</p>}
      <button className="btn" type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Changes"}</button>
    </form>
  );
} 