---
name: components-ui
description: Create and organize UI components in src/components/custom/. Use when creating new custom components, organizing component structure, or working with component exports.
scope: [stores,testing]
---

# UI Components

## Structure

All custom UI components go in `src/components/custom/[ComponentName]/` with this structure:

```txt
src/components/custom/
├── ComponentName/
│   ├── ComponentName.tsx    # Component implementation
│   ├── ComponentName.test.tsx  # Component tests
│   └── index.ts              # Export file
└── index.ts                  # Central export file
```

## Component Structure

### Component File

Each component must export as **default**:

```tsx
// src/components/custom/Button/Button.tsx
import type { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}

export default function Button({
  children,
  onClick,
  variant = "primary",
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
}
```

### Index File

Each component folder must have an `index.ts` that exports the default:

```tsx
// src/components/custom/Button/index.ts
export { default } from "./Button";
```

### Test File

Each component should have a test file:

```tsx
// src/components/custom/Button/Button.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Button from "./Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    // ... test implementation
  });
});
```

## Central Export

All components are exported from `src/components/custom/index.ts`:

```tsx
// src/components/custom/index.ts
export { default as ErrorBoundary } from "./ErrorBoundary";
export { default as SEO } from "./SEO";
export { default as PageLayout } from "./PageLayout";
export { default as Button } from "./Button";
```

## Usage

Import components using the `@/components` alias:

```tsx
import { ErrorBoundary, SEO, PageLayout, Button } from "@/components";

export default function MyPage() {
  const handleClick = () => {
    console.log("clicked")
  }
  return (
    <PageLayout title="My Page">
      <Button onClick={handleClick}>
        Click me
      </Button>
    </PageLayout>
  );
}
```

## Important Rules

- **Always export as default** from the component file
- **Always use `export { default } from "./ComponentName"`** in the index.ts
- **Always add tests** for each component
- **Use TypeScript** - define proper interfaces for props
- **Avoid `any` type** - use proper types or `unknown` if needed
- **Component names** should be PascalCase
- **Folder names** should match component names exactly
- **Function props from parents** must be called with the prefix "on": `onClick|onLoadingChange|onKeyUp`
- **Function inside components** must be called with the prefix "handle": `handleButtonClick|handleDrop|handleChange`
NEVER CALL A FUNCTION INSIDE A COMPONENT, ALWAYS CREATE A HANDLER FUNCTION, SEE THE FOLLOWING EXAMPLES:

```tsx

// ❌ BAD implementation
<Button onClick={()=>console.log('click')}>
  Click me
</Button>

// ✅ GOOD implementation
const handleClick = () => {
  console.log('click')
}
<Button onClick={handleClick}>
  Click me
</Button>

```

## Type Safety

Define component props with TypeScript interfaces:

```tsx
interface MyComponentProps {
  title: string;
  count?: number;
  onAction?: (id: string) => void;
}

export default function MyComponent({
  title,
  count = 0,
  onAction,
}: MyComponentProps) {
  // Component implementation
}
```

Never use `any` - use proper types or `unknown` if the type is truly unknown.
