---
name: testing
description: Write and organize tests using Vitest, React Testing Library, and Playwright. Use when writing unit tests, integration tests, or E2E tests.
---

# Testing

This project uses multiple testing tools depending on the type of test needed.

## Testing Stack

- **Vitest**: Unit and integration tests
- **React Testing Library (RTL)**: Component testing
- **Playwright**: E2E tests

## Unit & Integration Tests (Vitest + RTL)

### Setup

Tests are configured in `vitest.config.ts` and setup in `src/tests/setup.tsx`.

**Import testing utilities from setup**: You can import commonly used testing utilities directly from `@tests/setup`:

```tsx
// Instead of importing from multiple places:
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";

// You can import from setup (if exported):
import { render, screen, userEvent, describe, it, expect, vi } from "@tests/setup";
```

The setup file exports:

- `render`, `screen`, `waitFor`, `within` from `@testing-library/react`
- `userEvent` from `@testing-library/user-event`
- `vi`, `expect`, `describe`, `it`, `beforeEach`, `afterEach`, `beforeAll`, `afterAll` from `vitest`

### Component Tests

Test components in `src/components/custom/[ComponentName]/[ComponentName].test.tsx`:

```tsx
// src/components/custom/Button/Button.test.tsx
// Import from setup for convenience
import { render, screen, userEvent, describe, it, expect, vi } from "@tests/setup";
import Button from "./Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click</Button>);
    
    await user.click(screen.getByText("Click"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Hook Tests

Test custom hooks:

```tsx
// src/hooks/useCounter/useCounter.test.tsx
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useCounter } from "./useCounter";

describe("useCounter", () => {
  it("initializes with 0", () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it("increments count", () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
});
```

### API Route Tests

Test API routes (Pages Router: handler is the default export from the route file):

```tsx
// src/pages/api/users.test.ts
import { describe, it, expect } from "vitest";
import { createMocks } from "node-mocks-http";
import handler from "./users";

describe("/api/users", () => {
  it("returns users on GET", async () => {
    const { req, res } = createMocks({
      method: "GET",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty("data");
  });
});
```

### Test Utilities

**Recommended**: Import testing utilities from `@tests/setup` for convenience:

```tsx
// All-in-one import from setup
import { 
  render, 
  screen, 
  waitFor, 
  within,
  userEvent,
  describe, 
  it, 
  expect, 
  vi,
  beforeEach,
  afterEach 
} from "@tests/setup";
```

The setup file (`src/tests/setup.tsx`) exports:

- **RTL utilities**: `render`, `screen`, `waitFor`, `within` from `@testing-library/react`
- **User events**: `userEvent` from `@testing-library/user-event`
- **Vitest utilities**: `vi`, `expect`, `describe`, `it`, `beforeEach`, `afterEach`, `beforeAll`, `afterAll`
- **Mocks**: Sonner toast, ResizeObserver, IntersectionObserver are pre-configured

You can also import directly from the source packages if you prefer:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
```

## E2E Tests (Playwright)

### Setup e2e

E2E tests go in `e2e/` directory.

### Writing E2E Tests

```tsx
// e2e/homepage.spec.ts
import { test, expect } from "@playwright/test";

test("homepage loads correctly", async ({ page }) => {
  await page.goto("/");
  
  await expect(page).toHaveTitle(/Next.js/);
  await expect(page.locator("h1")).toBeVisible();
});

test("navigation works", async ({ page }) => {
  await page.goto("/");
  await page.click("text=About");
  
  await expect(page).toHaveURL("/about");
});
```

### Running E2E Tests

```bash
# Run E2E tests
npx playwright test

# Run in UI mode
npx playwright test --ui

# Run specific test
npx playwright test e2e/homepage.spec.ts
```

## Test Organization

### File Structure

```txt
src/
├── components/
│   └── custom/
│       └── Component/
│           ├── Component.tsx
│           └── Component.test.tsx
├── hooks/
│   └── useHook/
│       ├── useHook.ts
│       └── useHook.test.tsx
└── pages/
    └── api/
        └── users.ts
        └── users.test.ts

e2e/
└── feature.spec.ts
```

### Naming Conventions

- Test files: `[name].test.tsx` or `[name].test.ts`
- E2E tests: `[feature].spec.ts`
- Test descriptions: Use `describe` blocks for grouping, `it` or `test` for individual tests

## Best Practices

### 1. Test Behavior, Not Implementation

```tsx
// ❌ Bad - tests implementation
it("sets state to true", () => {
  // ...
});

// ✅ Good - tests behavior
it("shows error message when validation fails", () => {
  // ...
});
```

### 2. Use Accessible Queries

```tsx
// ❌ Bad
screen.getByClassName("button");

// ✅ Good
screen.getByRole("button", { name: "Submit" });
screen.getByLabelText("Email");
screen.getByText("Welcome");
```

### 3. Test User Interactions

```tsx
import userEvent from "@testing-library/user-event";

it("submits form on button click", async () => {
  const user = userEvent.setup();
  render(<Form />);
  
  await user.type(screen.getByLabelText("Email"), "test@example.com");
  await user.click(screen.getByRole("button", { name: "Submit" }));
  
  expect(screen.getByText("Success")).toBeInTheDocument();
});
```

### 4. Mock External Dependencies

```tsx
// Mock API calls
vi.mock("@/lib/api/client", () => ({
  fetchUsers: vi.fn(() => Promise.resolve([{ id: 1, name: "Test" }])),
}));

// Mock next/router
vi.mock("next/router", () => ({
  useRouter: () => ({
    push: vi.fn(),
    query: {},
  }),
}));
```

### 5. Clean Up

```tsx
import { cleanup, render } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm exec playwright test
```

## Important Notes

- **Use Vitest** for unit/integration tests
- **Use React Testing Library** for component tests
- **Use Playwright** for E2E tests
- **Test user behavior**, not implementation details
- **Use accessible queries** (getByRole, getByLabelText, etc.)
- **Mock external dependencies** (API calls, router, etc.)
- **Keep tests simple and focused** - one assertion per test when possible
