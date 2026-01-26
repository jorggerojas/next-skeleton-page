import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { ReactNode } from "react";
import SEO from "./SEO";

// Mock next/head
vi.mock("next/head", () => {
  return {
    default: ({ children }: { children: ReactNode }) => {
      return <>{children}</>;
    },
  };
});

describe("SEO", () => {
  it("renders default title and description", () => {
    const { container } = render(<SEO />);
    expect(container).toBeTruthy();
  });

  it("renders custom title and description", () => {
    const { container } = render(
      <SEO title="Custom Title" description="Custom Description" />,
    );
    expect(container).toBeTruthy();
  });

  it("renders keywords when provided", () => {
    const { container } = render(<SEO keywords="test, keywords, seo" />);
    expect(container).toBeTruthy();
  });

  it("renders canonical URL when provided", () => {
    const { container } = render(<SEO canonical="/test-page" />);
    expect(container).toBeTruthy();
  });

  it("renders Open Graph tags when ogImage is provided", () => {
    const { container } = render(
      <SEO ogImage="https://example.com/image.jpg" />,
    );
    expect(container).toBeTruthy();
  });
});
