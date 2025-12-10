/**
 * Fetch wrapper with cold-start handling for Render backend
 * Automatically retries failed requests and provides status feedback
 */

export type FetchStatus = "success" | "timeout" | "unreachable";

export interface FetchWithColdStartOptions {
  /** Maximum time to retry in milliseconds (default: 60000 = 60s) */
  maxRetryTime?: number;
  /** Initial retry delay in milliseconds (default: 1000 = 1s) */
  initialRetryDelay?: number;
  /** Maximum delay between retries in milliseconds (default: 5000 = 5s) */
  maxRetryDelay?: number;
  /** Callback fired on each retry attempt */
  onRetry?: (attempt: number, delay: number) => void;
  /** Callback fired when backend is detected as waking up */
  onBackendWaking?: () => void;
  /** Abort signal for manual cancellation */
  signal?: AbortSignal;
}

export interface FetchResult<T = unknown> {
  status: FetchStatus;
  data?: T;
  error?: string;
  attempts: number;
  totalTime: number; // ms
}

/**
 * Fetches with automatic retry and cold-start handling
 * 
 * @example
 * const result = await fetchWithColdStart(
 *   'https://api.example.com/data',
 *   { method: 'POST', body: JSON.stringify({ ... }) },
 *   { maxRetryTime: 60000 }
 * );
 * 
 * if (result.status === 'success') {
 *   console.log(result.data);
 * } else if (result.status === 'timeout') {
 *   console.log('Backend is waking up, please retry');
 * }
 */
export async function fetchWithColdStart<T = unknown>(
  url: string,
  init?: RequestInit,
  options: FetchWithColdStartOptions = {}
): Promise<FetchResult<T>> {
  const {
    maxRetryTime = 60000,
    initialRetryDelay = 1000,
    maxRetryDelay = 5000,
    onRetry,
    onBackendWaking,
    signal,
  } = options;

  const startTime = Date.now();
  let attempt = 0;
  let lastError: Error | null = null;
  let retryDelay = initialRetryDelay;
  let backendWakingDetected = false;

  while (Date.now() - startTime < maxRetryTime) {
    attempt++;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s request timeout

      const response = await fetch(url, {
        ...init,
        signal: signal || controller.signal,
      });

      clearTimeout(timeoutId);

      // Success response
      if (response.ok) {
        const data = await parseResponse<T>(response);
        return {
          status: "success",
          data,
          attempts: attempt,
          totalTime: Date.now() - startTime,
        };
      }

      // 5xx errors might indicate cold start
      if (response.status >= 500) {
        lastError = new Error(`Server error: ${response.status}`);
        if (!backendWakingDetected) {
          backendWakingDetected = true;
          onBackendWaking?.();
        }
        // Retry on server error
        await delay(retryDelay);
        retryDelay = Math.min(retryDelay * 1.5, maxRetryDelay);
        onRetry?.(attempt, retryDelay);
        continue;
      }

      // 4xx errors (except 408/429) are likely real errors - don't retry
      if (response.status >= 400 && response.status < 500) {
        const body = await response.text();
        return {
          status: "unreachable",
          error: `${response.status}: ${body || response.statusText}`,
          attempts: attempt,
          totalTime: Date.now() - startTime,
        };
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Abort signal was triggered
      if (signal?.aborted) {
        return {
          status: "unreachable",
          error: "Request was cancelled",
          attempts: attempt,
          totalTime: Date.now() - startTime,
        };
      }

      // Network/timeout errors - likely cold start, retry
      if (!backendWakingDetected) {
        backendWakingDetected = true;
        onBackendWaking?.();
      }

      await delay(retryDelay);
      retryDelay = Math.min(retryDelay * 1.5, maxRetryDelay);
      onRetry?.(attempt, retryDelay);
      continue;
    }
  }

  // Timeout reached
  return {
    status: "timeout",
    error: lastError?.message || "Backend did not respond within timeout period",
    attempts: attempt,
    totalTime: Date.now() - startTime,
  };
}

/**
 * Parse response with proper error handling
 */
async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  if (contentType?.includes("text")) {
    return (await response.text()) as unknown as T;
  }

  return (await response.blob()) as unknown as T;
}

/**
 * Simple delay utility
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
