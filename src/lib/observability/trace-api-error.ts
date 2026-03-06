import axios from "axios";
import { errorTracer } from "@/lib/observability/error";

/**
 * API error tracing strategy:
 * - Trace ONLY at source: API routes (external API errors), ErrorBoundary (render), unhandledrejection (promises)
 * - Do NOT trace in: getApiErrorMessage, server actions, or any forwarding layer
 */

/** Status codes we optionally trace (auth/forbidden/not-found on mutations). */
const OPTIONAL_TRACE_STATUSES = [401, 403, 404] as const;

/**
 * Always trace: 5xx, network (no response).
 * Optionally trace 401/403/404 when relevant (e.g. update returns 404).
 * When error is not axios, uses context.status if provided.
 */
export function shouldTraceApiError(
  error: unknown,
  context: { status?: number },
  opts?: { alsoTrace401403404?: boolean },
): boolean {
  let status: number | undefined;

  if (axios.isAxiosError(error)) {
    if (!error.response) return true; // network error
    status = error.response.status;
  } else {
    status = context?.status;
  }

  if (status == null) return true; // unknown = trace to be safe

  if (status >= 500) return true;
  if (
    opts?.alsoTrace401403404 &&
    OPTIONAL_TRACE_STATUSES.includes(
      status as (typeof OPTIONAL_TRACE_STATUSES)[number],
    )
  )
    return true;

  return false;
}

/** Normalize to Error for tracing. */
export function toError(error: unknown, fallbackMessage: string): Error {
  if (error instanceof Error) return error;
  return new Error(fallbackMessage, { cause: error });
}

/**
 * Trace API errors. Use ONLY at the single point where the error originates (API routes).
 * Rate limit, dedup and throttle are applied inside errorTracer.trace().
 */
export function traceApiError(
  error: unknown,
  context: {
    source: string;
    status?: number;
    url?: string;
    method?: string;
    [k: string]: unknown;
  },
  opts?: { alsoTrace401403404?: boolean },
): void {
  if (!shouldTraceApiError(error, context, opts)) return;

  const err = toError(
    error,
    axios.isAxiosError(error)
      ? String(error.response?.data?.errors ?? error.message)
      : "Unknown API error",
  );

  errorTracer.trace(err, context);
}
