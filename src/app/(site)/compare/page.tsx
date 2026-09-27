import type { Metadata } from "next";

import {
  ComparePage,
  getComparisonResult,
  listComparisonOptions,
  parseComparisonQuery,
  type ComparisonSearchParams,
} from "@/features/compare";

interface CompareRouteProps {
  searchParams: Promise<ComparisonSearchParams>;
}

const description =
  "Compare two or three aircraft or launch vehicles side by side: dimensions, mass, thrust and performance as published, in their original units.";

const socialTitle = "Compare vehicles | ORBIX";

export const metadata: Metadata = {
  alternates: { canonical: "/compare" },
  description,
  openGraph: {
    description,
    locale: "en_US",
    siteName: "ORBIX",
    title: socialTitle,
    type: "website",
    url: "/compare",
  },
  title: "Compare vehicles",
  twitter: {
    card: "summary",
    description,
    title: socialTitle,
  },
};

export default async function CompareRoute({
  searchParams,
}: CompareRouteProps) {
  const query = parseComparisonQuery(await searchParams);
  const options = listComparisonOptions();
  const result = getComparisonResult(query.category, query.vehicleIds);

  return (
    <ComparePage category={query.category} options={options} result={result} />
  );
}
