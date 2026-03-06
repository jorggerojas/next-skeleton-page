import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { AppProviders } from "@/providers";
import { errorTracer } from "@/lib/observability/error";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const err =
        reason instanceof Error
          ? reason
          : new Error(String(reason ?? "Unhandled rejection"), {
              cause: reason,
            });
      errorTracer.trace(err, { source: "unhandledrejection" });
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
      errorTracer.destroy();
    };
  }, []);

  return (
    <AppProviders>
      <Component {...pageProps} />
    </AppProviders>
  );
}
