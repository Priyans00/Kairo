/**
 * Example: API Route using fetchWithColdStart
 * 
 * This route demonstrates server-side usage of the cold-start handling wrapper.
 * It proxies requests to the Python backend with automatic retry logic.
 * 
 * Usage: POST /api/medicine/info with body: { name: "Aspirin" }
 */

import { fetchWithColdStart } from "@/lib/fetchWithColdStart";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL || "https://kairo-backend.onrender.com";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'name' field" },
        { status: 400 }
      );
    }

    // Use the cold-start wrapper to fetch from backend
    const result = await fetchWithColdStart(
      `${BACKEND_URL}/medicine/info`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      },
      {
        maxRetryTime: 60000,
        initialRetryDelay: 1000,
        maxRetryDelay: 5000,
      }
    );

    // Handle different response statuses
    if (result.status === "success") {
      return NextResponse.json(result.data, { status: 200 });
    }

    if (result.status === "timeout") {
      return NextResponse.json(
        {
          error:
            "Backend is waking up or unreachable. Please retry in a few seconds.",
          details: result.error,
          attempts: result.attempts,
          totalTime: result.totalTime,
        },
        { status: 503 } // Service Unavailable
      );
    }

    // status === "unreachable"
    return NextResponse.json(
      {
        error: "Backend is unreachable",
        details: result.error,
        attempts: result.attempts,
      },
      { status: 502 } // Bad Gateway
    );
  } catch (error) {
    console.error("Error in /api/medicine/info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Optional: GET handler for health check
 * Usage: GET /api/medicine/info?action=health
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get("action");

  if (action === "health") {
    // Check backend health with short timeout
    const result = await fetchWithColdStart(
      `${BACKEND_URL}/health`,
      { method: "GET" },
      {
        maxRetryTime: 10000, // 10 seconds for health check
        initialRetryDelay: 500,
      }
    );

    if (result.status === "success") {
      return NextResponse.json(result.data);
    }

    return NextResponse.json(
      { status: "unreachable", error: result.error },
      { status: 503 }
    );
  }

  return NextResponse.json(
    { error: "Invalid action" },
    { status: 400 }
  );
}
