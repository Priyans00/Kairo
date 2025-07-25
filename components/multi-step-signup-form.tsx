import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const steps = ["Personal Info", "Disease Info"];

export interface Profile {
  id: string;
  name: string;
  disease: string;
}

interface Props {
  onProfileComplete: (profile: Profile) => void;
}

export default function MultiStepSignupForm({ onProfileComplete } : Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    disease: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Insert profile data into Supabase
  async function handleProfileSubmit() {
    setIsSubmitting(true);
    setError(null);
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setError("User not found. Please log in again.");
      setIsSubmitting(false);
      return;
    }
    // Insert into profiles table
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id,
      name: form.name,
      disease: form.disease,
    });
    if (profileError) {
      setError(profileError.message);
      setIsSubmitting(false);
      return;
    }
    setSuccess(true);
    setIsSubmitting(false);
    if (onProfileComplete) onProfileComplete({ ...form, id: user.id });
  }

  function renderStep() {
    if (success) {
      return <div className="text-green-600 font-semibold text-center">Profile complete! You can now use your dashboard.</div>;
    }
    switch (step) {
      case 0:
        return (
          <div className="flex flex-col gap-4">
            <label className="font-semibold">Name</label>
            <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <button className="btn" onClick={() => setStep(1)}>Next</button>
          </div>
        );
      case 1:
        return (
          <div className="flex flex-col gap-4">
            <label className="font-semibold">Disease</label>
            <input className="input" value={form.disease} onChange={e => setForm(f => ({ ...f, disease: e.target.value }))} />
            <button className="btn" onClick={handleProfileSubmit} disabled={isSubmitting}>Finish</button>
            <button className="btn btn-secondary" onClick={() => setStep(0)}>Back</button>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded shadow p-8 flex flex-col gap-6">
      <div className="flex gap-2 mb-4">
        {steps.map((s, i) => (
          <div key={s} className={`flex-1 h-2 rounded ${i <= step ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-700"}`} />
        ))}
      </div>
      <h2 className="text-xl font-bold text-blue-700 dark:text-blue-300 mb-2">{steps[step]}</h2>
      {renderStep()}
    </div>
  );
} 