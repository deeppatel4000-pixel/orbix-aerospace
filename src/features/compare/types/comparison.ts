export const comparisonCategories = ["aircraft", "rockets"] as const;
export const MAX_COMPARISON_VEHICLES = 3;

export type ComparisonCategory = (typeof comparisonCategories)[number];
export type ComparisonCellStatus = "available" | "unavailable";

export interface ComparisonCellValue {
  readonly details?: readonly string[];
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
