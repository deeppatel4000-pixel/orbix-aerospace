import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { listAircraftIds } from "@/features/aircraft";
import { listRocketIds } from "@/features/rockets";

/**
 * Every public page, so search engines can find all of them. Removed routes
 * (/showcase) redirect and are left out. Priority favors the pages an
 * admissions reader should land on first.
 */
const STATIC_ROUTES: readonly { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/engineering-lab", priority: 0.9 },
  { path: "/verification", priority: 0.8 },
  { path: "/build-log", priority: 0.8 },
  { path: "/aircraft", priority: 0.7 },
  { path: "/rockets", priority: 0.7 },
  { path: "/compare", priority: 0.6 },
  { path: "/learn", priority: 0.6 },
  { path: "/about", priority: 0.5 },
  { path: "/credits", priority: 0.3 },
  { path: "/accessibility", priority: 0.2 },
  { path: "/privacy", priority: 0.2 },
  { path: "/terms", priority: 0.2 },
  { path: "/cookies", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const vehicles = [
    ...listAircraftIds().map((id) => `/aircraft/${id}`),
    ...listRocketIds().map((id) => `/rockets/${id}`),
  ];

  return [
    ...STATIC_ROUTES.map(({ path, priority }) => ({
      priority,
      url: `${siteConfig.url}${path === "/" ? "" : path}`,
    })),
    ...vehicles.map((path) => ({
      priority: 0.5,
      url: `${siteConfig.url}${path}`,
    })),
  ];
}
