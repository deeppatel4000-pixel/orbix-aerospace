import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { siteLegal } from "@/config/site-legal";

/*
 * Shared social preview image references. The image itself is rendered by
 * src/app/opengraph-image.tsx and src/app/twitter-image.tsx. Next.js merges
 * metadata shallowly, so any page that sets its own `openGraph` or `twitter`
 * object replaces the root image; those pages spread these values in.
 */

export const socialImageAlt = `${siteConfig.wordmark}: ${siteConfig.tagline}. An educational project by ${siteLegal.operatorName}. Beside the text, a NASA photograph of the SR-71B Blackbird over the Sierra Nevada.`;

export const socialImageSize = { height: 630, width: 1200 } as const;

type OpenGraph = NonNullable<Metadata["openGraph"]>;
type Twitter = NonNullable<Metadata["twitter"]>;

export const socialOpenGraph = {
  images: [
    {
      alt: socialImageAlt,
      height: socialImageSize.height,
      type: "image/png",
      url: "/opengraph-image",
      width: socialImageSize.width,
    },
  ],
} satisfies Pick<OpenGraph, "images">;

export const socialTwitter = {
  card: "summary_large_image",
  images: [
    {
      alt: socialImageAlt,
      height: socialImageSize.height,
      url: "/twitter-image",
      width: socialImageSize.width,
    },
  ],
} satisfies Pick<Twitter, "images"> & { card: "summary_large_image" };
