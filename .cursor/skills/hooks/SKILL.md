---
name: hooks
description: Create and use custom React hooks in src/hooks/. Use when working with React and want to implement some repetitive functions or extract all the "weight" from a component into a custom functions
scope: [testing]
---

# Custom Hooks

## Location

All custom hooks go in `src/hooks/`. Export from `src/hooks/index.ts`.

## Example of available hooks

### useWindowSize

Detect window resize and get current dimensions:

```tsx
import { useWindowSize } from "@/hooks";

export default function MyComponent() {
  const { width, height } = useWindowSize();

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  return (
    <div>
      {isMobile && <MobileLayout />}
      {isTablet && <TabletLayout />}
      {isDesktop && <DesktopLayout />}
    </div>
  );
}
```

### useBodyScrollLock

Lock body scroll (useful for modals):

```tsx
import { useBodyScrollLock } from "@/hooks";

export default function Modal({ isOpen, children }) {
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  return <div className="modal">{children}</div>;
}
```

### useDebounce

Debounce a value:

```tsx
import { useState } from "react";
import { useDebounce } from "@/hooks";

export default function SearchInput() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearch) {
      // Fetch search results
      fetchResults(debouncedSearch);
    }
  }, [debouncedSearch]);

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

### useClickOutside

Detect clicks outside an element (useful for dropdowns, modals):

```tsx
import { useRef } from "react";
import { useClickOutside } from "@/hooks";

export default function Dropdown({ isOpen, onClose, children }) {
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => {
    onClose();
  }, isOpen); // Only active when isOpen is true

  if (!isOpen) return null;

  return (
    <div ref={ref} className="dropdown">
      {children}
    </div>
  );
}
```

### useAnalytics

Track events with dataLayer (GTM):

```tsx
import { useAnalytics } from "@/hooks";

export default function MyComponent() {
  const { push, trackClick, trackPageView, trackFormSubmit, trackError } = useAnalytics();

  // Track page view
  useEffect(() => {
    trackPageView("Home Page");
  }, [trackPageView]);

  // Track custom event
  const handleCustomEvent = () => {
    push("custom_event", {
      category: "engagement",
      action: "button_click",
      label: "cta_button",
    });
  };

  // Track click
  const handleClick = () => {
    trackClick("buy_button", { product_id: "123" });
  };

  // Track form submit
  const handleSubmit = () => {
    trackFormSubmit("contact_form", { email: "user@example.com" });
  };

  // Track error
  const handleError = () => {
    trackError("Payment failed", "PAYMENT_001");
  };

  return (
    <button onClick={handleClick}>
      Buy Now
    </button>
  );
}
```

## Data-fetching hooks: use actions + keys

For any hook that fetches or mutates API data, **do not** call `apiClient` or use hardcoded query keys. Use the API layer:

- **Actions** from `src/lib/api/{resource}/actions.ts` (e.g. `getUsers`, `getUser`, `createUser`, `updateUser`) as `queryFn` or `mutationFn`.
- **Keys** from `src/lib/api/{resource}/keys.ts` (e.g. `usersKeys.list(params)`, `usersKeys.detail(id)`) for `queryKey` and `invalidateQueries`.

Example:

```tsx
// src/hooks/useUser.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, getUser } from "@/lib/api/users/actions";
import { usersKeys } from "@/lib/api/users/keys";

export function useUsers(params?: GetUsersQuery, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: () => getUsers(params),
    enabled: options?.enabled ?? true,
  });
}

export function useUser(id?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: usersKeys.detail(id ?? ""),
    queryFn: () => (id ? getUser(id) : Promise.reject(new Error("ID required"))),
    enabled: (options?.enabled ?? true) && !!id,
  });
}
```

```tsx
// src/hooks/useCreateUser.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser } from "@/lib/api/users/actions";
import { usersKeys } from "@/lib/api/users/keys";

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
}
```

## Creating New Hooks

Follow this pattern:

```tsx
// src/hooks/useMyHook.ts
import { useState, useEffect } from "react";

interface UseMyHookReturn {
  value: string;
  setValue: (value: string) => void;
}

export function useMyHook(initialValue: string): UseMyHookReturn {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    // Side effect logic
  }, [value]);

  return { value, setValue };
}
```

Then export from `src/hooks/index.ts`:

```tsx
export { useMyHook } from "./useMyHook";
```

Import with:

```tsx
import { useMyHook } from "@/hooks";
```

## Important Notes

- **Prefix with `use`** - All hooks must start with `use`
- **Export from index.ts** - Import from `@/hooks`
- **Data-fetching hooks** - Use **actions** and **keys** from `src/lib/api/{resource}/`; do not use apiClient or hardcoded query keys in hooks
- **Handle SSR** - Check for `typeof window !== "undefined"` before accessing browser APIs
- **Avoid `any` type** - Define proper return types
- **Clean up effects** - Always return cleanup functions from useEffect
- **useAnalytics does NOT load GTM** - Only exposes `dataLayer.push`. GTM must be loaded separately (via `react-gtm-module` in `_app.tsx`)
