import { listAircraft } from "@/features/aircraft/data";
import {
  adaptAircraftComparison,
  adaptRocketComparison,
} from "@/features/compare/adapters";
import {
  MAX_COMPARISON_VEHICLES,
  type ComparisonCategory,
  type ComparisonOption,
  type ComparisonOptions,
  type ComparisonResult,
} from "@/features/compare/types";
import { listRockets } from "@/features/rockets/data";

function selectById<TItem extends { readonly id: string }>(
  items: readonly TItem[],
  ids: readonly string[],
): readonly TItem[] {
  const itemById = new Map(items.map((item) => [item.id, item]));

  return Array.from(new Set(ids))
    .slice(0, MAX_COMPARISON_VEHICLES)
    .map((id) => itemById.get(id))
    .filter((item): item is TItem => item !== undefined);
}

function toOptions(
  items: readonly {
    readonly id: string;
    readonly manufacturer: string;
    readonly name: string;
  }[],
): readonly ComparisonOption[] {
  return items.map((item) => ({
    id: item.id,
    manufacturer: item.manufacturer,
    name: item.name,
  }));
}

export function listComparisonOptions(): ComparisonOptions {
  return {
    aircraft: toOptions(listAircraft()),
    rockets: toOptions(listRockets()),
  };
}

export function getComparisonResult(
  category: ComparisonCategory,
  vehicleIds: readonly string[],
): ComparisonResult {
  if (category === "rockets") {
    return adaptRocketComparison(selectById(listRockets(), vehicleIds));
  }

  return adaptAircraftComparison(selectById(listAircraft(), vehicleIds));
}
