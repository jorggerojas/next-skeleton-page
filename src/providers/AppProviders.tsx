"use client";

import type { ReactNode } from "react";
import { ErrorBoundary } from "@/components";
import { QueryProvider } from "./QueryProvider";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <QueryProvider>{children}</QueryProvider>
    </ErrorBoundary>
  );
}
