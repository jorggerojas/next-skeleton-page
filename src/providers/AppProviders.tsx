"use client";

import type { ReactNode } from "react";
import { ErrorBoundary } from "@/components";
import { QueryProvider } from "./QueryProvider";
import { FeatureFlagsProvider } from "./FeatureFlags";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <FeatureFlagsProvider>{children}</FeatureFlagsProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}
