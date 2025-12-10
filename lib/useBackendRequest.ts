/**
 * React hook for handling API requests with cold-start loading states
 * 
 * Provides automatic UI state management for requests to the backend
 * including "waking backend" and timeout states
 */

"use client";

import { useState, useCallback, useRef } from "react";
import {
  fetchWithColdStart,
  type FetchResult,
  type FetchWithColdStartOptions,
} from "./fetchWithColdStart";

export type LoadingState = "idle" | "loading" | "waking-backend" | "error" | "success";

export interface UseBackendRequestOptions extends FetchWithColdStartOptions {
  /** Show console logs during retry attempts */
  debug?: boolean;
}

export interface UseBackendRequestResult<T> {
  state: LoadingState;
  data: T | null;
  error: string | null;
  isLoading: boolean;
  execute: (
    url: string,
    init?: RequestInit
  ) => Promise<FetchResult<T>>;
  reset: () => void;
}

/**
 * Hook for making API requests with cold-start handling
 * 
 * @example
 * const { state, data, error, execute, isLoading } = useBackendRequest<{ count: number }>({
 *   maxRetryTime: 60000,
 * });
 * 
 * const handleFetch = async () => {
 *   const result = await execute('/api/data', { method: 'GET' });
 *   if (result.status === 'success') {
 *     console.log(result.data);
 *   }
 * };
 */
export function useBackendRequest<T = unknown>(
  options: UseBackendRequestOptions = {}
): UseBackendRequestResult<T> {
  const [state, setState] = useState<LoadingState>("idle");
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (url: string, init?: RequestInit): Promise<FetchResult<T>> => {
      // Cancel any previous request
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      setState("loading");
      setError(null);
      setData(null);

      const result = await fetchWithColdStart<T>(url, init, {
        ...options,
        signal: abortControllerRef.current.signal,
        onBackendWaking: () => {
          if (options.debug) console.log("Backend waking detected");
          setState("waking-backend");
          options.onBackendWaking?.();
        },
        onRetry: (attempt, delay) => {
          if (options.debug) {
            console.log(
              `Retry attempt ${attempt}, next retry in ${delay}ms`
            );
          }
          options.onRetry?.(attempt, delay);
        },
      });

      if (result.status === "success") {
        setData(result.data as T);
        setState("success");
      } else {
        setError(result.error || "Request failed");
        setState("error");
      }

      return result;
    },
    [options]
  );

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    setState("idle");
    setData(null);
    setError(null);
  }, []);

  return {
    state,
    data,
    error,
    isLoading: state === "loading" || state === "waking-backend",
    execute,
    reset,
  };
}
