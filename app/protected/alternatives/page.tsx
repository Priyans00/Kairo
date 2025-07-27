'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BubbleBackground from "@/components/ui/BubbleBackground";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface AlternativeItem {
  medicine_name: string;
  composition: string;
  use_case: string;
  side_effects: string;
  image_url?: string;
  manufacturer?: string;
  reviews?: {
    excellent: string | number;
    average: string | number;
    poor: string | number;
  };
}

export default function AlternativesPage() {
  const [medicineName, setMedicineName] = useState('');
  const [alternatives, setAlternatives] = useState<AlternativeItem[]>([]);
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
      const response = await fetch(`https://kairo-ty16.onrender.com/medicine/alternatives?name=${encodeURIComponent(medicineName)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch alternatives');
      }

      const data = await response.json();
      setAlternatives(data.alternatives);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center gap-8 p-6 md:p-12 bg-gradient-to-b from-background to-background/80">
      <BubbleBackground />
      <div className="w-full max-w-4xl space-y-8">
        <Card className="border-2 shadow-lg transition-all duration-300 hover:shadow-xl">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
              Medicine Alternatives
            </CardTitle>
            <p className="text-muted-foreground">Enter a medicine name to find alternative options</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="text"
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  placeholder="Enter medicine name"
                  className="flex-1 text-lg transition-all duration-200 focus:ring-2 focus:ring-primary"
                  required
                />
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-2 text-lg font-medium transition-all duration-200 hover:scale-105"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Searching...
                    </span>
                  ) : 'Search'}
                </Button>
              </div>
            </form>

            {error && (
              <div className="mt-6 p-4 rounded-lg bg-destructive/10 text-destructive animate-fadeIn">
                <p className="text-center">{error}</p>
              </div>
            )}

            {alternatives.length > 0 && (
              <div className="mt-8 space-y-6 animate-fadeIn">
                {alternatives.map((alt, index) => (
                  <Card key={index} className="border shadow-md transition-all duration-300 hover:shadow-lg overflow-hidden">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {alt.image_url && (
                          <div className="relative aspect-square rounded-xl overflow-hidden">
                            <Image
                              src={alt.image_url}
                              alt={alt.medicine_name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="space-y-4">
                          <h3 className="text-2xl font-semibold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
                            {alt.medicine_name}
                          </h3>
                          {alt.manufacturer && (
                            <div className="text-sm text-muted-foreground">
                              Manufactured by: {alt.manufacturer}
                            </div>
                          )}
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium text-lg">Composition</h4>
                              <p className="text-muted-foreground">{alt.composition}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-lg">Use Case</h4>
                              <p className="text-muted-foreground">{alt.use_case}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-lg">Side Effects</h4>
                              <p className="text-muted-foreground">{alt.side_effects}</p>
                            </div>
                          </div>
                          {alt.reviews && (
                            <div className="mt-4 space-y-2">
                              <h4 className="font-medium text-lg">User Reviews</h4>
                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                                  <div className="font-medium text-green-700 dark:text-green-300">{alt.reviews.excellent}%</div>
                                  <div className="text-sm text-muted-foreground">Excellent</div>
                                </div>
                                <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
                                  <div className="font-medium text-yellow-700 dark:text-yellow-300">{alt.reviews.average}%</div>
                                  <div className="text-sm text-muted-foreground">Average</div>
                                </div>
                                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20">
                                  <div className="font-medium text-red-700 dark:text-red-300">{alt.reviews.poor}%</div>
                                  <div className="text-sm text-muted-foreground">Poor</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}