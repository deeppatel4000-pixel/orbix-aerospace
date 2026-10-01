import type { Metadata } from "next";

import {
  ComparePage,
  getComparisonResult,
  listComparisonOptions,
  parseComparisonQuery,
  type ComparisonSearchParams,
} from "@/features/compare";
import { socialOpenGraph, socialTwitter } from "@/lib/social-image";

/**
 * The comparison shown when the address names no vehicles (v4 plan section
 * 3: Compare opens preloaded, not empty). Each id must exist in its
 * registry; an unknown id is dropped by `getComparisonResult`.
 */
const DEFAULT_VEHICLES = {
  aircraft: ["sr-71-blackbird", "f-22-raptor", "b-2-spirit"],
  rockets: ["saturn-v", "space-launch-system", "starship"],
} as const;

interface CompareRouteProps {
  searchParams: Promise<ComparisonSearchParams>;
}

const description =
  "Compare two or three aircraft or launch vehicles side by side: published dimensions, mass, thrust and performance, in their original units, with outlines drawn to one scale.";

const socialTitle = "Compare vehicles | ORBIX";

export const metadata: Metadata = {
  alternates: { canonical: "/compare" },
  description,
  openGraph: {
    ...socialOpenGraph,
    description,
    locale: "en_US",
    siteName: "ORBIX",
    title: socialTitle,
    type: "website",
    url: "/compare",
  },
  title: "Compare vehicles",
  twitter: {
    ...socialTwitter,
    description,
    title: socialTitle,
  },
};

export default async function CompareRoute({
  searchParams,
}: CompareRouteProps) {
  const params = await searchParams;
  const query = parseComparisonQuery(params);
  const options = listComparisonOptions();
  // Only a missing `vehicles` parameter loads the default; an explicit
  // empty one (`?vehicles=`) still shows the empty state.
  const vehicleIds =
    params.vehicles === undefined
      ? DEFAULT_VEHICLES[query.category]
      : query.vehicleIds;
  const result = getComparisonResult(query.category, vehicleIds);

  return (
    <ComparePage category={query.category} options={options} result={result} />
  );
}
