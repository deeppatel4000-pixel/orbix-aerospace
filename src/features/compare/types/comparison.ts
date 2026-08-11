import type { MeasurementUnit } from "@/features/vehicles/types";

export const comparisonCategories = ["aircraft", "rockets"] as const;
export const MAX_COMPARISON_VEHICLES = 3;

export type ComparisonCategory = (typeof comparisonCategories)[number];
export type ComparisonCellStatus = "available" | "unavailable";

/**
 * The machine-readable half of a comparison cell.
 *
 * `value` is the raw published number exactly as the dataset stores it, and
 * `unit` is the dataset's own unit. Neither is derived from the formatted
 * display string, and `unit` is only ever compared for equality — nothing in
 * the comparison feature converts between units.
 *
 * Present only on cells whose displayed value is a single measurement. A cell
 * that renders more than one quantity (`Length: 69 ft` with a wingspan detail,
 * a payload tied to an orbit and a launch configuration) deliberately has no
 * magnitude, because a single track could not say which quantity it encodes.
 */
export interface ComparisonMagnitude {
  readonly unit: MeasurementUnit;
  readonly value: number;
}

export interface ComparisonCellValue {
  readonly details?: readonly string[];
  readonly magnitude?: ComparisonMagnitude;
  readonly note?: string;
  readonly status: ComparisonCellStatus;
  readonly value: string;
}

export interface ComparisonRow {
  readonly cells: readonly ComparisonCellValue[];
  readonly description?: string;
  readonly id: string;
  readonly label: string;
}

export interface ComparisonVehicle {
  readonly detailHref: string;
  readonly id: string;
  readonly manufacturer: string;
  readonly name: string;
}

export interface ComparisonResult {
  readonly category: ComparisonCategory;
  readonly rows: readonly ComparisonRow[];
  readonly vehicles: readonly ComparisonVehicle[];
}

export interface ComparisonOption {
  readonly id: string;
  readonly manufacturer: string;
  readonly name: string;
}

export type ComparisonOptions = Readonly<
  Record<ComparisonCategory, readonly ComparisonOption[]>
>;

export interface ComparisonQuery {
  readonly category: ComparisonCategory;
  readonly vehicleIds: readonly string[];
}

export type ComparisonSearchParams = Readonly<
  Record<string, string | readonly string[] | undefined>
>;
