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
    
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setError("User not found. Please log in again.");
      setIsSubmitting(false);
      return;
    }
    
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();
    
    if (existingProfile) {
      setError("Profile already exists. Redirecting...");
      setIsSubmitting(false);
      // Profile exists, just update it
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          name: form.name,
          disease: form.disease,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
        
      if (updateError) {
        setError(updateError.message);
        setIsSubmitting(false);
        return;
      }
      
      setSuccess(true);
      setIsSubmitting(false);
      if (onProfileComplete) onProfileComplete({ ...form, id: user.id });
      return;
    }
    
    // Insert NEW profile (only if it doesn't exist)
    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      name: form.name,
      disease: form.disease,
      email: user.email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    
    if (profileError) {
      // Check if it's a duplicate key error (profile was created by trigger)
      if (profileError.code === '23505') {
        // Profile was created by database trigger, just update it
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            name: form.name,
            disease: form.disease,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
          
        if (updateError) {
          setError(updateError.message);
          setIsSubmitting(false);
          return;
        }
      } else {
        setError(profileError.message);
        setIsSubmitting(false);
        return;
      }
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