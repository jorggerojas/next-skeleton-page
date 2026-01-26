import Head from "next/head";
import { SEO_CONSTANTS_DEFAULT } from "@/constants/SEO";

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

export default function SEO({
  title = SEO_CONSTANTS_DEFAULT.title,
  description = SEO_CONSTANTS_DEFAULT.description,
  keywords = SEO_CONSTANTS_DEFAULT.keywords,
  ogImage = SEO_CONSTANTS_DEFAULT.ogImage,
  ogType = SEO_CONSTANTS_DEFAULT.ogType,
  canonical = SEO_CONSTANTS_DEFAULT.canonical,
  noindex = SEO_CONSTANTS_DEFAULT.noindex,
  nofollow = SEO_CONSTANTS_DEFAULT.nofollow,
}: SEOProps) {
  const metaRobots =
    [noindex ? "noindex" : undefined, nofollow ? "nofollow" : undefined]
      .filter(Boolean)
      .join(", ") || SEO_CONSTANTS_DEFAULT.robots;

  return (
    <Head>
      <title>{title}</title>
      <meta name='description' content={description} />
      {keywords && <meta name='keywords' content={keywords} />}
      <meta name='robots' content={metaRobots} />

      {/* Open Graph */}
      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta property='og:type' content={ogType} />
      {ogImage && <meta property='og:image' content={ogImage} />}

      {/* Twitter Card */}
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      {ogImage && <meta name='twitter:image' content={ogImage} />}

      {/* Canonical URL */}
      {canonical && <link rel='canonical' href={canonical} />}
    </Head>
  );
}
