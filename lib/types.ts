/**
 * Cold-Start Handling Types
 * 
 * Central export of all TypeScript types for the cold-start system
 * Use this for proper type hints across your application
 */

/**
 * Status of a fetch request with cold-start handling
 */
export type FetchStatus = "success" | "timeout" | "unreachable";

/**
 * Loading state of a request via useBackendRequest hook
 */
export type LoadingState = "idle" | "loading" | "waking-backend" | "error" | "success";

/**
 * Result of a fetchWithColdStart call
 */
export interface FetchResult<T = unknown> {
  /** Final status of the request */
  status: FetchStatus;

  /** Response data (only if status is "success") */
  data?: T;

  /** Error message (if failed) */
  error?: string;

  /** Number of retry attempts made */
  attempts: number;

  /** Total elapsed time in milliseconds */
  totalTime: number;
}

/**
 * Options for fetchWithColdStart function
 */
export interface FetchWithColdStartOptions {
  /** Maximum time to retry in milliseconds (default: 60000 = 60s) */
  maxRetryTime?: number;

  /** Initial retry delay in milliseconds (default: 1000 = 1s) */
  initialRetryDelay?: number;

  /** Maximum delay between retries in milliseconds (default: 5000 = 5s) */
  maxRetryDelay?: number;

  /** Callback fired on each retry attempt */
  onRetry?: (attempt: number, nextDelay: number) => void;

  /** Callback fired when backend is detected as waking up */
  onBackendWaking?: () => void;

  /** AbortSignal for manual cancellation */
  signal?: AbortSignal;
}

/**
 * Options for useBackendRequest hook
 */
export interface UseBackendRequestOptions extends FetchWithColdStartOptions {
  /** Show console logs during retry attempts */
  debug?: boolean;
}

/**
 * Return value of useBackendRequest hook
 */
export interface UseBackendRequestResult<T> {
  /** Current loading state */
  state: LoadingState;

  /** Fetched data (null if not loaded) */
  data: T | null;

  /** Error message (null if no error) */
  error: string | null;

  /** Whether currently loading (loading or waking-backend state) */
  isLoading: boolean;

  /** Function to execute a fetch request */
  execute: (url: string, init?: RequestInit) => Promise<FetchResult<T>>;

  /** Reset to idle state */
  reset: () => void;
}

/**
 * Common response type for API endpoints
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Health check response from backend
 */
export interface HealthCheckResponse {
  status: "healthy" | "degraded" | "unhealthy";
  service: string;
  timestamp?: string;
}
