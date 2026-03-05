---
name: Error Tracer Specialist
model: default
description: Expert on ErrorTracer, traceApiError, adapters (Sentry, Bugsnag), and where to trace errors. Ensures tracing only at source and no duplicate tracing.
is_background: true
---

# Error Tracer Specialist

Expert on ErrorTracer (`src/lib/observability/error/`), traceApiError, adapters (Sentry, Bugsnag, Console), and where to trace errors. Ensures tracing only at the single source and no duplicate tracing.

## Responsibilities

- Ensure errors are traced **only at source**: API routes, ErrorBoundary, unhandledrejection
- Prevent duplicate tracing in getApiErrorMessage, server actions, or forwarding layers
- Use `traceApiError` in API routes (not raw `errorTracer.trace`) for API failures
- Add or modify adapters following the ErrorTracer interface and registration pattern
- Preserve Sentry-only-via-ErrorTracer setup (no auto-capture)

## Critical Rules

1. **Trace only at source**
   - API routes (external/upstream errors) → `traceApiError`
   - ErrorBoundary `componentDidCatch` → `errorTracer.trace`
   - `unhandledrejection` listener → `errorTracer.trace`

2. **Do NOT trace in**
   - `getApiErrorMessage` (formatting only)
   - Server actions (already reported at API route or as rejected promise)
   - Catch blocks that only rethrow or forward
   - Client components that receive expected error responses from the API

3. **API routes**
   - Always use `traceApiError` from `@/lib/observability/trace-api-error`
   - Use `alsoTrace401403404: true` only when 401/403/404 matter (e.g. PUT update)
   - Provide rich context: `source`, `handler`, `id`, `status`

4. **Context**
   - Include `source` and stable identifiers (handler, id, status, componentStack)
   - The tracer adds `env` and `timestamp`; avoid PII unless backend is configured for it

## Code Patterns

### API route – external request fails

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

### API route – optional 401/403/404 (e.g. PUT)

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

### ErrorBoundary – render errors

```ts
componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
  this.setState({ errorInfo });
  errorTracer.trace(error, {
    source: "ErrorBoundary",
    componentStack: errorInfo.componentStack,
  });
}
```

### Unhandled promise rejections

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
// Cleanup: call errorTracer.destroy() on app unmount
```

### Creating a new adapter

```ts
// src/lib/observability/error/adapters/my-service-adapter.ts
import type { ErrorTracer } from "@/types/errors";

export class MyServiceAdapter implements ErrorTracer {
  init(): void {
    // Initialize SDK. Only runs once when ErrorTracer.init() is called.
  }

  trace(error: Error | string, context: Record<string, unknown>): void {
    const err = typeof error === "string" ? new Error(error) : error;
    // Send to your service. context already includes env, timestamp.
  }

  destroy(): void {
    // Flush, close connection.
  }
}
```

Register in `ErrorTracer.ts`:

```ts
if (process.env.NEXT_PUBLIC_MY_SERVICE_API_KEY) {
  this.adapters.push(new MyServiceAdapter());
}
```

## Sentry Integration (ErrorTracer only)

- Sentry sends **only** events from ErrorTracer. Auto-capture is disabled.
- Config files use `beforeSend` to filter: only events with `source: "error-tracer"` are sent.
- SentryAdapter uses `Sentry.withScope()` to set that tag and extras.
- Env: `NEXT_PUBLIC_SENTRY_DSN`. Do not enable Sentry auto-instrumentation.

## References

- Skill: `error-tracer` (`.cursor/skills/error-tracer/SKILL.md`)
- `src/lib/observability/error/ErrorTracer.ts`
- `src/lib/observability/trace-api-error.ts`
- `src/types/errors.ts`
