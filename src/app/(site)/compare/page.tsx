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

export const metadata: Metadata = {
  title: "Comparison Engine",
  description:
    "Compare aircraft or launch vehicles through a structured engineering matrix.",
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
