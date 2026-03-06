export type UserID = ReturnType<typeof crypto.randomUUID>;
export interface ErrorTracer {
  /**
   * Initialize the error tracer with the default configuration
   * @returns {void}
   *
   * @example
   * ```ts
   * const errorTracer = new ErrorTracer();
   * errorTracer.init();
   * ```
   */
  init: () => void;
  /**
   * Error trace event to collect information about the error and its context. Send it to the error tracer manager.
   * @param {Error | string} error - The error to trace.
   * @param {Record<string, string | object>} context - The context of the error. Like message, code, etc. You can define any context you want and you need, try to use the most relevant context and avoid duplicates or empty context or generic context like "error" or "error message".
   * @example
   * ```ts
   * const errorTracer = new ErrorTracer();
   * errorTracer.trace(
   *   new Error("Test error"),
   *   {
   *     message: "Test error",
   *     status: 500,
   *     code: "ERR_TEST",
   *     timestamp: new Date().toISOString(),
   *     component: "TestComponent",
   *     page: "TestPage",
   *     url: "https://test.com",
   *     user: { id: "1", name: "John Doe" },
   *     company: { id: "1", name: "Test Company" },
   *     environment: "development",
   *     browser: "Chrome",
   *     screen: { width: 1920, height: 1080 },
   *     location: { latitude: 40.7128, longitude: -74.0060 },
   *     network: { type: "WIFI", signal: 100 },
   *     performance: { loadTime: 1000, ttfb: 100, domLoad: 500, windowLoad: 1500 },
   *   },
   * );
   * ```
   */
  trace(error: Error | string, context: Record<string, unknown>): void;
  /**
   * Destroy the error tracer and remove all the adapters.
   * @returns {void}
   *
   * @example
   * ```ts
   * const errorTracer = new ErrorTracer();
   * errorTracer.destroy();
   * ```
   */
  destroy: () => void;
  /**
   * Set the user ID for the error tracer. This user ID will be used to identify the user in the error tracer and send it to the error tracer manager.
   * @param {UserID} userID - The user ID to set.
   * @example
   * ```ts
   * const errorTracer = new ErrorTracer();
   * errorTracer.setUser("1234567890");
   * ```
   */
  setUser: (userID: UserID | null) => void;
}
