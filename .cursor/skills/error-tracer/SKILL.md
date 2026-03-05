---
name: error-tracer
description: Trace all errors and send it to the error tracer manager (could be different ones) in one simple implementation. This tracer can manage ui, render, ux, api calls, flows, etc.
scope: [api-routes,skills,components-ui,hierarchy,hooks,normalizers,pages-router,providers,schemas,serializers,stores,testing]
---

# error-tracer

## Context & architecture

- **`ErrorTracer`** (`src/lib/observability/error/ErrorTracer.ts`): Central tracer. Holds adapters, injects `env` and `timestamp`, applies rate limit (e.g. max 10/min), dedup (same source+message+stack within 5s), and throttle. Call `trace(error, context)` only where the error originates.
- **Adapters**: Implement the `ErrorTracer` interface (`init`, `trace`, `destroy`). Each adapter sends to one backend (Bugsnag, Sentry, console). The tracer loops over them; one call can hit all configured adapters. **Sentry** is used exclusively via `ErrorTracer` — its auto-capture is disabled; only events from `SentryAdapter` reach Sentry.
- **`traceApiError`** (`src/lib/observability/trace-api-error.ts`): Helper for API routes. Decides *whether* to trace (e.g. 5xx always, 401/403/404 only when `alsoTrace401403404`), normalizes the error, then calls `errorTracer.trace`. Use this in API routes instead of calling `errorTracer` directly for API failures.
- **Do not trace** in: `getApiErrorMessage`, server actions, or any layer that only forwards errors. That would duplicate or misattribute the same failure.
- **DO NOT DUPLICATE TRACING**, if you're tracing API route errors and they're returning expected errors to client components, DO NOT TRACE THEM AGAIN.

## Instructions

- Trace **only at source**: API routes (external/upstream errors), ErrorBoundary (render), `unhandledrejection` (unhandled promise rejections).
- Do **not** trace in: `getApiErrorMessage`, server actions, or forwarding layers.
- In API routes use `traceApiError` from `@/lib/observability/trace-api-error`; use `alsoTrace401403404: true` only when 401/403/404 are relevant (e.g. PUT update).
- Prefer rich, stable context: `source`, `handler`, `id`, `status`, `componentStack`; avoid empty or generic keys.

---

## Examples

### 1. API route – external request fails (5xx or network)

```ts
// src/pages/api/users/[id].ts
import { traceApiError } from "@/lib/observability/trace-api-error";

try {
  const response = await externalClient.get(`users/${id}`);
  // ...
} catch (error) {
  traceApiError(error, {
    source: "api/users/[id]",
    handler: "handleGet",
    id,
  });
  respondSoftFailGet(res);
}
```

### 2. API route – optional 401/403/404 (e.g. PUT update)

When the *response body* indicates 401/403/404 (not an axios throw), pass a synthetic error and `alsoTrace401403404: true`:

```ts
if (putError) {
  const is5xx = putError.status >= 500;
  if (is5xx) {
    respondSoftFailPut(res);
    return;
  }
  traceApiError(
    new Error(putError.message, { cause: putError }),
    {
      source: "api/users/[id]",
      handler: "handlePut",
      id,
      status: putError.status,
    },
    { alsoTrace401403404: true },
  );
  res.status(putError.status).json({ ... });
  return;
}
```

### 3. ErrorBoundary – render errors

```ts
// src/components/custom/ErrorBoundary/ErrorBoundary.tsx (or your ErrorBoundary path)
componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
  this.setState({ errorInfo });
  errorTracer.trace(error, {
    source: "ErrorBoundary",
    componentStack: errorInfo.componentStack,
  });
}
```

### 4. Unhandled promise rejections

```ts
// src/pages/_app.tsx
const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  const reason = event.reason;
  const err =
    reason instanceof Error
      ? reason
      : new Error(String(reason ?? "Unhandled rejection"), { cause: reason });
  errorTracer.trace(err, { source: "unhandledrejection" });
};
window.addEventListener("unhandledrejection", handleUnhandledRejection);
```

### 5. What *not* to do

- Do **not** call `errorTracer.trace` or `traceApiError` inside `getApiErrorMessage` (it only formats messages).
- Do **not** trace in server actions; the failure is already reported at the API route or will surface as a rejected promise / UI error.
- Do **not** trace in every catch block that only rethrows or forwards; trace only at the single place where the error is first handled for observability.

---

## How to create adapters

**Implement the interface** (`src/types/errors.ts`): `init()`, `trace(error, context)`, `destroy()`.

**Create the adapter file** under `src/lib/observability/error/adapters/`, e.g. `my-service-adapter.ts`:

```ts
import type { ErrorTracer } from "@/types/errors";

export class MyServiceAdapter implements ErrorTracer {
  init(): void {
    // Initialize SDK (e.g. API key, options).
    // Only runs once when ErrorTracer.init() is called.
  }

  trace(error: Error | string, context: Record<string, unknown>): void {
    const err = typeof error === "string" ? new Error(error) : error;
    // Send to your service: e.g. MyService.capture(err, context).
    // context already includes env, timestamp from ErrorTracer.
  }

  destroy(): void {
    // Teardown SDK (flush, close connection). Called on app unmount if needed.
  }
}
```

**Register in ErrorTracer** (`src/lib/observability/error/ErrorTracer.ts`): add env check and push the adapter:

```ts
if (process.env.NEXT_PUBLIC_MY_SERVICE_API_KEY) {
  this.adapters.push(new MyServiceAdapter());
}
```

Note: Use `NEXT_PUBLIC_` for keys needed by adapters that run on the client (e.g. Sentry, Bugsnag).

**Keep adapters safe**: If `init()` or `trace()` throws, the tracer catches and logs a warning; other adapters still run. Avoid throwing from adapters when possible.

---

## Sentry integration (ErrorTracer only)

Sentry is configured to send **only** events from `ErrorTracer`. All automatic capture is disabled.

- **Config files** (`instrumentation.ts`, `instrumentation-client.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`): Initialize the Sentry SDK with `NEXT_PUBLIC_SENTRY_DSN`, `tracesSampleRate: 0`, and `beforeSend: (event) => (event.tags?.source === "error-tracer" ? event : null)` so only events tagged by `SentryAdapter` are sent.
- **SentryAdapter** (`src/lib/observability/error/adapters/sentry-adapter.ts`): Uses `Sentry.withScope()` to set `source: "error-tracer"` and `setExtras(context)` before `captureException`. No adapter-level `Sentry.init()` — the SDK is already initialized by the config files.
- **next.config.ts**: `withSentryConfig` is used only for source map uploads; `autoInstrumentServerFunctions`, `autoInstrumentMiddleware`, and `autoInstrumentAppDirectory` are disabled.

Environment: `NEXT_PUBLIC_SENTRY_DSN` (required). `SENTRY_ORG` and `SENTRY_PROJECT` are used for source map uploads in CI.

---

## How to implement in the app

1. **API routes (external/upstream errors)**  
   In the route’s `catch`, call `traceApiError(error, { source: "api/...", handler, ... }, opts?)`. Use `alsoTrace401403404: true` only for flows where 401/403/404 are worth tracking (e.g. mutations).

2. **React render errors**  
   Wrap the tree (or key subtrees) in `ErrorBoundary`; in `componentDidCatch`, call `errorTracer.trace(error, { source: "ErrorBoundary", componentStack })`.

3. **Unhandled promise rejections**  
   In `_app.tsx` (or root layout), add a `unhandledrejection` listener, normalize `event.reason` to an `Error`, then `errorTracer.trace(err, { source: "unhandledrejection" })`. Clean up in the effect’s return.

4. **Config**  
   Set env vars for the adapters you use:
   - `NEXT_PUBLIC_SENTRY_DSN` – required for Sentry (used by both config files and ErrorTracer)
   - `NEXT_PUBLIC_BUGSNAG_API_KEY` – required for Bugsnag

5. **Cleanup**  
   Call `errorTracer.destroy()` on app unmount (e.g. in `_app` effect return) so adapters can flush or close.

---

## Important notes

- **Trace only at source**: API routes (external errors), ErrorBoundary (render), unhandledrejection (promises). Do **not** trace in getApiErrorMessage, server actions, or forwarding layers.
- Use **`traceApiError`** from `@/lib/observability/trace-api-error` in API routes; use **`alsoTrace401403404: true`** only when 401/403/404 matter (e.g. PUT update).
- **Adapters**: Implement `ErrorTracer` (`init`, `trace`, `destroy`), then register in `ErrorTracer.ts` behind an env flag (e.g. `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_BUGSNAG_API_KEY`). Keep each adapter focused on one backend.
- **Context**: Include `source` and stable identifiers (handler, id, status, componentStack). The tracer adds `env` and `timestamp`; avoid PII unless your backend is configured for it.
