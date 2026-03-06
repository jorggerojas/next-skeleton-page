import type { ErrorTracer, UserID } from "@/types/errors";

export class ConsoleAdapter implements ErrorTracer {
  init(): void {
    console.log("ConsoleAdapter initialized");
  }

  trace(error: Error | string, context: Record<string, unknown>): void {
    console.error({ error, context });
  }

  destroy(): void {
    console.log("No-op");
  }

  setUser(userID: UserID | null): void {
    if (!userID) {
      console.log("User: null");
      return;
    }
    console.log(`User: ${userID}`);
  }
}
