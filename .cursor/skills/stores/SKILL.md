---
name: stores
description: Create and manage Zustand stores for UI state in src/stores/. Use when managing global UI state like modals, sidebars, loading states, or toggles.
scope: [testing]
---

# Zustand Stores

## Overview

Stores are for **UI state only**. Do not use stores for server data (use React Query instead).

## Location

All stores go in `src/stores/`. Export from `src/stores/index.ts`.

## UI Store

The main UI store (`src/stores/ui.ts`) provides common UI states:

```tsx
import { useUIStore } from "@/stores";

// Modal
const { isModalOpen, openModal, closeModal, toggleModal } = useUIStore();

// Sidebar
const { isSidebarOpen, openSidebar, closeSidebar, toggleSidebar } = useUIStore();

// Loading
const { isLoading, setLoading } = useUIStore();

// Generic toggles
const { toggles, setToggle, getToggle, toggle } = useUIStore();
```

## Usage Examples

### Modal State

```tsx
import { useUIStore } from "@/stores";

export default function MyComponent() {
  const { isModalOpen, openModal, closeModal } = useUIStore();

  return (
    <div>
      <button onClick={openModal}>Open Modal</button>
      {isModalOpen && (
        <Modal onClose={closeModal}>
          <p>Modal content</p>
        </Modal>
      )}
    </div>
  );
}
```

### Generic Toggles

```tsx
import { useUIStore } from "@/stores";

export default function MyComponent() {
  const { getToggle, toggle } = useUIStore();

  const isMenuOpen = getToggle("menu");

  return (
    <button onClick={() => toggle("menu")}>
      {isMenuOpen ? "Close" : "Open"} Menu
    </button>
  );
}
```

### With Selectors (Performance)

```tsx
import { useUIStore } from "@/stores";

// Only re-render when isModalOpen changes
const isModalOpen = useUIStore((state) => state.isModalOpen);
const openModal = useUIStore((state) => state.openModal);
```

## Creating New Stores

For new UI stores, follow this pattern:

```tsx
// src/stores/my-store.ts
import { create } from "zustand";

interface MyState {
  value: boolean;
  setValue: (value: boolean) => void;
  toggle: () => void;
}

export const useMyStore = create<MyState>((set) => ({
  value: false,
  setValue: (value) => set({ value }),
  toggle: () => set((state) => ({ value: !state.value })),
}));
```

Then export from `src/stores/index.ts`:

```tsx
export { useUIStore } from "./ui";
export { useMyStore } from "./my-store";
```

## Important Notes

- **UI state only** - Do not use for server data
- **Use selectors** - Select only needed state to avoid unnecessary re-renders
- **Export from index.ts** - Import from `@/stores`
- **Avoid `any` type** - Define proper interfaces for state
- **Keep stores small** - One store per domain/feature
