/**
 * QUICK START EXAMPLE
 * 
 * The minimal code needed to add cold-start handling to a component
 * Copy this pattern into your existing components
 */

"use client";

import { useBackendRequest } from "@/lib/useBackendRequest";
import { Loader2, AlertCircle, CheckCircle2, WifiOff } from "lucide-react";

interface MyData {
  [key: string]: unknown;
}

export function QuickStartExample() {
  const { state, data, error, execute, isLoading } = useBackendRequest<MyData>(
    {
      maxRetryTime: 60000,
    }
  );

  const handleRequest = async () => {
    // Replace with your actual endpoint
    await execute("/api/your-endpoint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ /* your data */ }),
    });
  };

  // ============================================
  // Render UI based on current state
  // ============================================

  // 1. Loading - Initial request
  if (state === "loading") {
    return (
      <div className="flex items-center gap-2 text-blue-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  // 2. Backend Waking - Server is cold-starting
  if (state === "waking-backend") {
    return (
      <div className="flex items-center gap-2 text-yellow-600">
        <WifiOff className="h-4 w-4 animate-pulse" />
        <span>Backend waking up... Please wait (up to 60 seconds)</span>
      </div>
    );
  }

  // 3. Error - Timeout or unreachable
  if (state === "error") {
    return (
      <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-900">
        <div className="flex items-center gap-2 font-medium">
          <AlertCircle className="h-4 w-4" />
          <span>Backend is waking up or unreachable</span>
        </div>
        <p className="text-sm">{error}</p>
        <button
          onClick={handleRequest}
          className="text-sm font-medium underline hover:no-underline"
        >
          Retry
        </button>
      </div>
    );
  }

  // 4. Success - Data loaded
  if (state === "success" && data) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-900">
        <CheckCircle2 className="h-4 w-4" />
        <span>Success! Data loaded</span>
        {/* Display your data here */}
      </div>
    );
  }

  // 5. Idle - Initial state
  return (
    <button
      onClick={handleRequest}
      disabled={isLoading}
      className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
    >
      Fetch Data
    </button>
  );
}
