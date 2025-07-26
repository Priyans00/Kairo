"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import MedicationSchedule, { Medication } from "@/components/medication-schedule";
import { useRouter, useParams } from "next/navigation";

// Remove async from the component
export default function RelativeMedicationsPage() {
  const [relativeName, setRelativeName] = useState("");
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  

  useEffect(() => {
    // Move async logic inside useEffect
    async function fetchData() {
      const supabase = createClient();
      const { data: relativeData } = await supabase
        .from("relative_profiles")
        .select("name")
        .eq("id", id) // params.id is fine in useEffect
        .single();
      
      const { data: medsData } = await supabase
        .from("medications")
        .select("*")
        .eq("relative_profile_id", id);

      if (relativeData) {
        setRelativeName(relativeData.name);
      }
      setMedications(medsData || []);
      setLoading(false);
    }

    fetchData();
  }, [id]);

  const handleMedicationsChange = (newMedications : Medication[] ) => {
    setMedications(newMedications);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{relativeName}&apos;s Medications</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          Back to Dashboard
        </button>
      </div>
      <MedicationSchedule 
        medications={medications} 
        onMedicationsChange={handleMedicationsChange}
        relative_profile_id={id}
      />
    </div>
  );
}