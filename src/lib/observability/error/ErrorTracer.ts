import type { ErrorTracer as ErrorTracerType, UserID } from "@/types/errors";
import { ConsoleAdapter } from "./adapters/console-adapter";

const ENV = process.env.NODE_ENV ?? "development";

// --- Rate limit / dedup / throttle ---
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;
const DEDUP_MS = 5_000;

let throttleCount = 0;
let throttleResetAt = Date.now();
const dedup = new Map<string, number>();

function shouldThrottle(): boolean {
  const now = Date.now();
  if (now > throttleResetAt) {
    throttleCount = 0;
    throttleResetAt = now + WINDOW_MS;
    return false;
  }
  throttleCount += 1;
  return throttleCount > MAX_PER_WINDOW;
}

function dedupKey(err: Error, ctx: Record<string, unknown>): string {
  const source = String(ctx.source?.toString() ?? "unknown");
  const msg = err.message.slice(0, 100);
  const stack = (err.stack ?? "").slice(0, 200);
  return `${source}:${msg}:${stack}`;
}

function isDeduped(key: string): boolean {
  const now = Date.now();
  const last = dedup.get(key);
  if (last != null && now - last < DEDUP_MS) return true;
  dedup.set(key, now);
  return false;
}

class ErrorTracer implements ErrorTracerType {
  private readonly adapters: ErrorTracerType[] = [];
  private isInitialized = false;

  constructor() {
    if (ENV !== "production") {
      this.adapters.push(new ConsoleAdapter());
    }
  }

  init(): void {
    if (this.isInitialized) {
      return;
    }
    this.isInitialized = true;
    this.adapters.forEach((adapter) => {
      try {
        adapter.init();
      } catch {
        console.warn(
          `ErrorTracer: Adapter ${adapter.constructor.name} failed to initialize`,
        );
      }
    });
  }

  /**
   * Trace an error. Injects env. Rate limited, deduplicated, throttled.
   * Call only at the single point where the error originates.
   */
  trace(error: Error | string, context: Record<string, unknown>): void {
    if (!this.isInitialized) {
      this.init();
    }
    const err = typeof error === "string" ? new Error(error) : error;

    if (shouldThrottle()) return;

    const key = dedupKey(err, context);
    if (isDeduped(key)) return;

    const fullContext = {
      ...context,
      env: ENV,
      timestamp: new Date().toISOString(),
    };

    this.adapters.forEach((adapter) => {
      try {
        adapter.trace(err, fullContext);
      } catch {
        console.warn(
          `ErrorTracer: Adapter ${adapter.constructor.name} failed to trace error`,
        );
      }
    });
  }

  destroy(): void {
    if (!this.isInitialized) {
      return;
    }
    this.isInitialized = false;
    this.adapters.forEach((adapter) => {
      try {
        adapter.destroy();
      } catch {
        // ignore
      }
    });
  }

  setUser(userID: UserID | null): void {
    if (!userID) {
      console.log("User: null");
      return;
    }
    console.log(`User: ${userID}`);
  }
}

export const errorTracer = new ErrorTracer();

errorTracer.init();
