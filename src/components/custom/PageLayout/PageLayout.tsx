import type { ReactNode } from "react";
import Seo, { type SEOProps } from "../SEO";

interface PageLayoutProps extends SEOProps {
  children: ReactNode;
}

export default function PageLayout({ children, ...seoProps }: PageLayoutProps) {
  return (
    <>
      <Seo {...seoProps} />
      {children}
    </>
  );
}
