'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface MedicineInfo {
  use_case: string;
  composition: string;
  side_effects: string;
  image_url?: string;
  manufacturer?: string;
  reviews?: {
    excellent: string | number;
    average: string | number;
    poor: string | number;
  };
}

export default function MedicineInfo() {
  const [medicineName, setMedicineName] = useState('');
  const [medicineInfo, setMedicineInfo] = useState<MedicineInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <Card>
      <CardHeader>
        <CardTitle>Medicine Information</CardTitle>
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
          <div className="mt-4 space-y-2">
            <div>
              <strong>Use Case:</strong>
              <p>{medicineInfo.use_case}</p>
            </div>
            <div>
              <strong>Composition:</strong>
              <p>{medicineInfo.composition}</p>
            </div>
            <div>
              <strong>Side Effects:</strong>
              <p>{medicineInfo.side_effects}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}