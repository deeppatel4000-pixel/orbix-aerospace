import {
  MAX_COMPARISON_VEHICLES,
  type ComparisonCategory,
  type ComparisonQuery,
  type ComparisonSearchParams,
} from "@/features/compare/types";

function getFirstValue(
  value: string | readonly string[] | undefined,
): string | undefined {
  return typeof value === "string" ? value : value?.[0];
}

function parseCategory(value: string | undefined): ComparisonCategory {
  return value === "rockets" ? "rockets" : "aircraft";
}

function parseVehicleIds(value: string | undefined): readonly string[] {
  if (!value) return [];

  return Array.from(
    new Set(
      value
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  ).slice(0, MAX_COMPARISON_VEHICLES);
}

export function parseComparisonQuery(
  searchParams: ComparisonSearchParams,
): ComparisonQuery {
  return {
    category: parseCategory(getFirstValue(searchParams.category)),
    vehicleIds: parseVehicleIds(getFirstValue(searchParams.vehicles)),
  };
}
