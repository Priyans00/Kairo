/**
 * Example: Medicine Info Component with Cold-Start Handling
 * 
 * This component demonstrates how to use the useBackendRequest hook
 * to fetch medicine information with automatic retry and loading states.
 */

"use client";

import { useState } from "react";
import { useBackendRequest } from "@/lib/useBackendRequest";
import { Loader2, AlertCircle, CheckCircle2, WifiOff } from "lucide-react";
import Image from "next/image";

interface MedicineInfo {
  use_case: string;
  composition: string;
  side_effects: string;
  image_url?: string;
  manufacturer?: string;
  reviews?: {
    excellent?: string;
    average?: string;
    poor?: string;
  };
}

export function MedicineInfoFetcher() {
  const [medicineName, setMedicineName] = useState("");
  const { state, data, error, execute, isLoading, reset } =
    useBackendRequest<MedicineInfo>({
      maxRetryTime: 60000, // 60 seconds
      initialRetryDelay: 1000, // Start with 1 second
      debug: true,
    });

  const handleFetch = async () => {
    if (!medicineName.trim()) return;

    const result = await execute(
      `${process.env.NEXT_PUBLIC_BACKEND_URL || "https://kairo-backend.onrender.com"}/medicine/info`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: medicineName }),
      }
    );

    if (result.status === "success") {
      console.log("✅ Fetched medicine info:", result.data);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
      <h2 className="text-lg font-semibold">Medicine Information</h2>

      {/* Input Section */}
      <div className="flex gap-2">
        <input
          type="text"
          value={medicineName}
          onChange={(e) => setMedicineName(e.target.value)}
          placeholder="Enter medicine name (e.g., Aspirin)"
          disabled={isLoading}
          onKeyDown={(e) => e.key === "Enter" && handleFetch()}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm disabled:opacity-50 dark:border-gray-600 dark:bg-gray-900"
        />
        <button
          onClick={handleFetch}
          disabled={isLoading || !medicineName.trim()}
          className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Loading State */}
      {state === "loading" && (
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-3 text-blue-900 dark:bg-blue-900/20 dark:text-blue-300">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Searching for medicine information...</span>
        </div>
      )}

      {/* Backend Waking State */}
      {state === "waking-backend" && (
        <div className="flex items-center gap-2 rounded-lg bg-yellow-50 px-4 py-3 text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-300">
          <WifiOff className="h-5 w-5 animate-pulse" />
          <span>Backend is waking up... Please wait (up to 60 seconds)</span>
        </div>
      )}

      {/* Error State */}
      {state === "error" && error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-red-900 dark:bg-red-900/20 dark:text-red-300">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Error: Backend is waking up or unreachable</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={() => {
                reset();
                handleFetch();
              }}
              className="mt-2 text-sm font-medium underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Success State - Display Medicine Info */}
      {state === "success" && data && (
        <div className="space-y-3 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
          <div className="flex items-center gap-2 text-green-900 dark:text-green-300">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-semibold">Medicine Information Found</span>
          </div>

          {data.image_url && (
            <Image
              src={data.image_url}
              alt={medicineName}
              width={300}
              height={200}
              className="max-h-48 rounded-lg object-cover"
            />
          )}

          <div className="space-y-2 text-sm">
            <div>
              <p className="font-medium text-green-900 dark:text-green-300">
                Use Case:
              </p>
              <p className="mt-1 text-green-800 dark:text-green-400">
                {data.use_case}
              </p>
            </div>

            <div>
              <p className="font-medium text-green-900 dark:text-green-300">
                Composition:
              </p>
              <p className="mt-1 text-green-800 dark:text-green-400">
                {data.composition}
              </p>
            </div>

            <div>
              <p className="font-medium text-green-900 dark:text-green-300">
                Side Effects:
              </p>
              <p className="mt-1 text-green-800 dark:text-green-400">
                {data.side_effects}
              </p>
            </div>

            {data.manufacturer && (
              <div>
                <p className="font-medium text-green-900 dark:text-green-300">
                  Manufacturer:
                </p>
                <p className="mt-1 text-green-800 dark:text-green-400">
                  {data.manufacturer}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={reset}
            className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Search Another Medicine
          </button>
        </div>
      )}
    </div>
  );
}
