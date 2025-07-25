"use client";

import MedicationSchedule from "@/components/medication-schedule";
import LinkedAccounts from "@/components/linked-accounts";
import { LogoutButton } from "@/components/logout-button";
import ProfileFullForm from "@/components/profile-full-form";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const [medications, setMedications] = useState([]);
  const [relatives, setRelatives] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <main className="flex-1 w-full flex flex-col items-center justify-center">
      <div className="w-full max-w-6xl flex flex-col gap-8 px-4 py-8">
        <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-4">My Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 flex flex-col gap-6">
            <ProfileFullForm profile={profile} onProfileUpdate={setProfile} />
          </section>
          <section className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 flex flex-col gap-6">
            <MedicationSchedule medications={medications} onMedicationsChange={setMedications} />
          </section>
          <section className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 flex flex-col gap-6 md:col-span-2">
            <LinkedAccounts relatives={relatives} onRelativesChange={setRelatives} />
          </section>
        </div>
      </div>
    </main>
  );
}
