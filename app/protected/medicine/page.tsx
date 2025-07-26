'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BubbleBackground from "@/components/ui/BubbleBackground";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from 'next/navigation';

interface MedicineInfo {
  use_case: string;
  composition: string;
  side_effects: string;
}

export default function MedicinePage() {
  const [medicineName, setMedicineName] = useState('');
  const [medicineInfo, setMedicineInfo] = useState<MedicineInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://kairo-ty16.onrender.com/medicine/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: medicineName }),
      });

      if (!response.ok) {
        throw new Error('Medicine not found or API error');
      }

      const data = await response.json();
      setMedicineInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch medicine info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center gap-6 p-4 md:p-10">
      <BubbleBackground />
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Medicine Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  placeholder="Enter medicine name"
                  required
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </form>

            {error && (
              <div className="mt-4 text-red-500">{error}</div>
            )}

            {medicineInfo && (
              <div className="mt-6 space-y-4">
                <div className="rounded-lg bg-card p-4 shadow-sm">
                  <h3 className="mb-2 font-semibold">Use Case</h3>
                  <p>{medicineInfo.use_case}</p>
                </div>
                <div className="rounded-lg bg-card p-4 shadow-sm">
                  <h3 className="mb-2 font-semibold">Composition</h3>
                  <p>{medicineInfo.composition}</p>
                </div>
                <div className="rounded-lg bg-card p-4 shadow-sm">
                  <h3 className="mb-2 font-semibold">Side Effects</h3>
                  <p>{medicineInfo.side_effects}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}