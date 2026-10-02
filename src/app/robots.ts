import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

/** Allow every crawler everywhere and point it at the sitemap. */
export default function robots(): MetadataRoute.Robots {
  return {
    host: siteConfig.url,
    rules: { allow: "/", userAgent: "*" },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
