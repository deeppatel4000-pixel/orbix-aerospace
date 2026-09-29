import type {
  VerificationGroup,
  VerificationRow,
} from "@/features/verification/data/verification-cases";

import {
  formatOrbixValue,
  formatPercentDifference,
  formatReferenceValue,
  isWithinReferenceRounding,
  percentDifference,
} from "./compare";

export const WITHIN_ROUNDING_LABEL = "Within rounding";
export const OUTSIDE_ROUNDING_LABEL = "Outside rounding";

export interface DisplayRow {
  readonly difference: string;
  readonly differencePercent: number;
  readonly orbix: string;
  readonly reference: string;
  readonly roundingLabel: string;
  readonly withinRounding: boolean;
}

/** Everything the page prints for one comparison row. */
export function toDisplayRow(row: VerificationRow): DisplayRow {
  const { resolution, value } = row.reference;
  const differencePercent = percentDifference(row.orbix, value);
  const withinRounding = isWithinReferenceRounding(
    row.orbix,
    value,
    resolution,
  );

  return {
    difference: formatPercentDifference(differencePercent),
    differencePercent,
    orbix: formatOrbixValue(row.orbix, resolution),
    reference: formatReferenceValue(value, resolution),
    roundingLabel: withinRounding
      ? WITHIN_ROUNDING_LABEL
      : OUTSIDE_ROUNDING_LABEL,
    withinRounding,
  };
}

export interface VerificationSummary {
  readonly outsideRounding: number;
  readonly total: number;
  readonly withinRounding: number;
}

export function summarizeVerification(
  groups: readonly VerificationGroup[],
): VerificationSummary {
  const rows = groups.flatMap((group) =>
    group.cases.flatMap((item) => item.rows),
  );
  const withinRounding = rows.filter(
    (row) => toDisplayRow(row).withinRounding,
  ).length;

  return {
    outsideRounding: rows.length - withinRounding,
    total: rows.length,
    withinRounding,
  };
}
