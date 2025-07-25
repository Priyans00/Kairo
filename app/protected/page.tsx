"use client";

import MedicationSchedule from "@/components/medication-schedule";
import LinkedAccounts from "@/components/linked-accounts";
import { Relative } from "@/components/linked-accounts";
import { Medication } from "@/components/medication-schedule";
import ProfileFullForm from "@/components/profile-full-form";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import MultiStepSignupForm from "@/components/multi-step-signup-form";
import BubbleBackground from "@/components/ui/BubbleBackground";


export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [relatives, setRelatives] = useState<Relative[]>([]);
  const [loading, setLoading] = useState(true);

  interface Profile {
    id: string;
    name: string;
    disease: string;
  }

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      const { data: medsData } = await supabase.from("medications").select("*").eq("user_id", user.id);
      const { data: relsData } = await supabase.from("relatives").select("*").eq("user_id", user.id);
      setProfile(profileData || null);
      setMedications(medsData || []);
      setRelatives(relsData || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <main className="flex-1 w-full flex flex-col items-center justify-center p-4">
      <BubbleBackground />
      <div className="w-full max-w-7xl flex flex-col gap-8">
        <header className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-blue-700 dark:text-blue-300">My Dashboard</h1>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-1 bg-gray-200 dark:bg-gray-900 rounded-xl shadow-lg p-8 flex flex-col gap-6 h-[600px]">
          {profile ? (
            <ProfileFullForm profile={profile} onProfileUpdate={setProfile} />
          ) : (
            <MultiStepSignupForm onProfileComplete={setProfile} />
          )}

          </section>
          <section className="lg:col-span-2 bg-gray-200 dark:bg-gray-900 rounded-xl shadow-lg p-8 flex flex-col gap-6 h-[600px] overflow-y-auto">
            <MedicationSchedule medications={medications} onMedicationsChange={setMedications} />
          </section>
          <section className="lg:col-span-3 bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 flex flex-col gap-6 overflow-y-auto">
            <LinkedAccounts relatives={relatives} onRelativesChange={setRelatives} />
          </section>
        </div>
      </div>
    </main>
  );
}
