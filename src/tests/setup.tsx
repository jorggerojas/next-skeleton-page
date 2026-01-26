import { expect, vi, beforeAll } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import "@testing-library/jest-dom";

// Setup environment variables
beforeAll(() => {
  process.env.NEXT_PUBLIC_NEXT_API_BASE_URL ??= "";
});

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
  Toaster: () => null,
}));

// Mock ResizeObserver
globalThis.ResizeObserver =
  globalThis.ResizeObserver ||
  vi.fn().mockImplementation(() => ({
    disconnect: vi.fn(),
    observe: vi.fn(),
    unobserve: vi.fn(),
  }));

// Mock IntersectionObserver
globalThis.IntersectionObserver =
  globalThis.IntersectionObserver ||
  vi.fn().mockImplementation(() => ({
    disconnect: vi.fn(),
    observe: vi.fn(),
    unobserve: vi.fn(),
  }));

// Extend expect with jest-dom matchers
expect.extend(matchers);

// Export testing utilities for convenience
// Note: These can be imported from @tests/setup in your test files
export { default as userEvent } from "@testing-library/user-event";
export { render, screen, waitFor, within } from "@testing-library/react";
export {
  vi,
  expect,
  describe,
  it,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
} from "vitest";
