---
name: providers
description: Create, configure, and centralize React providers in src/providers/. Use when creating new providers, setting up context providers, or organizing provider structure.
scope: [stores]
---

# React Providers

## Structure

All providers go in `src/providers/` with this structure:

```txt
src/providers/
├── ProviderName.tsx    # Individual provider
├── AppProviders.tsx   # Central provider wrapper
└── index.ts           # Exports
```

## Creating a Provider

### Individual Provider

```tsx
// src/providers/ThemeProvider.tsx
"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
```

### Provider with Configuration

```tsx
// src/providers/QueryProvider.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 3,
          },
          mutations: {
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

## Centralizing Providers

All providers must be imported and composed in `AppProviders.tsx`:

```tsx
// src/providers/AppProviders.tsx
"use client";

import type { ReactNode } from "react";
import { ErrorBoundary } from "@/components";
import { QueryProvider } from "./QueryProvider";
import { ThemeProvider } from "./ThemeProvider";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}
```

## Exporting Providers

Export all providers from `index.ts`:

```tsx
// src/providers/index.ts
export { QueryProvider } from "./QueryProvider";
export { ThemeProvider, useTheme } from "./ThemeProvider";
export { AppProviders } from "./AppProviders";
```

## Usage in _app.tsx

Use `AppProviders` in `_app.tsx`:

```tsx
// src/pages/_app.tsx
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AppProviders } from "@/providers";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppProviders>
      <Component {...pageProps} />
    </AppProviders>
  );
}
```

## Important Rules

- **Always use "use client"** directive for client-side providers
- **Compose all providers** in `AppProviders.tsx`
- **Export from index.ts** for easy imports
- **Use TypeScript** - define proper types for context values
- **Avoid `any` type** - use proper types or `unknown` if needed
- **Provider order matters** - outer providers can't access inner providers
- **ErrorBoundary should be outermost** to catch all errors

## Provider Order

Recommended order in `AppProviders`:

1. `ErrorBoundary` (outermost - catches all errors)
2. `QueryProvider` (data fetching)
3. Theme/UI providers
4. Feature-specific providers
5. Children (innermost)

## Custom Hooks

If a provider exposes a custom hook, export it from the provider file and from `index.ts`:

```tsx
// src/providers/ThemeProvider.tsx
export function useTheme() {
  // ... implementation
}

// src/providers/index.ts
export { ThemeProvider, useTheme } from "./ThemeProvider";
```
