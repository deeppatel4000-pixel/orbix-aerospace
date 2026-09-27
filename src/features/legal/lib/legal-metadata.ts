import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

interface LegalMetadataInput {
  readonly description: string;
  readonly path: `/${string}`;
  readonly title: string;
}

/**
 * Page metadata for the reading pages. The root layout's title template adds
 * "| ORBIX" to `title`; Open Graph and Twitter entries replace the parent
 * objects entirely, so they repeat the site name and locale here.
 */
export function legalMetadata({
  description,
  path,
  title,
}: LegalMetadataInput): Metadata {
  const fullTitle = `${title} | ${siteConfig.wordmark}`;

  return {
    alternates: { canonical: path },
    description,
    openGraph: {
      description,
      locale: "en_US",
      siteName: siteConfig.wordmark,
      title: fullTitle,
      type: "website",
      url: path,
    },
    title,
    twitter: {
      card: "summary",
      description,
      title: fullTitle,
    },
  };
}
