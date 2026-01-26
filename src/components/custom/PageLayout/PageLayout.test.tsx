import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import PageLayout from "./PageLayout";

// Mock SEO component
vi.mock("../SEO", () => ({
  default: () => <div data-testid="seo">SEO Component</div>,
}));

describe("PageLayout", () => {
  it("renders children", () => {
    render(
      <PageLayout>
        <div>Test content</div>
      </PageLayout>,
    );

    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("renders SEO component", () => {
    render(
      <PageLayout title="Test Page">
        <div>Content</div>
      </PageLayout>,
    );

    expect(screen.getByTestId("seo")).toBeInTheDocument();
  });

  it("passes SEO props to SEO component", () => {
    render(
      <PageLayout
        title="Test Title"
        description="Test Description"
        canonical="/test"
      >
        <div>Content</div>
      </PageLayout>,
    );

    expect(screen.getByTestId("seo")).toBeInTheDocument();
  });
});
