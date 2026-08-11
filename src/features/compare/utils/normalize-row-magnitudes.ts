import type { ComparisonCellValue } from "@/features/compare/types";

/**
 * Row-level magnitude normalization.
 *
 * ## Why this is a whole-row decision, not a per-cell one
 *
 * A magnitude track only means anything relative to the other tracks in its
 * row. If even one present value in the row cannot participate — because it is
 * stored in a different unit, or because that cell carries no machine-readable
 * magnitude at all — then the tracks that *did* render would silently invite a
 * comparison against a value that has no track. A partly-encoded row is worse
 * than an unencoded one, so the whole row falls back to text.
 *
 * The dataset makes this cheap to enforce honestly. Every measurement is stored
 * as `{ unit, value }` (see `features/vehicles/types/measurement.ts`), so the
 * adapters copy a real number and a real unit straight through. Nothing here
 * reads, parses or infers anything from a formatted display string, and no unit
 * conversion happens anywhere: the unit is used purely as an equality key.
 *
 * That single rule is what keeps the known-unsafe speed row safe. The F-15
 * stores `{ unit: "mph", value: 1875 }` and the F-22 stores
 * `{ unit: "Mach", value: 2 }`. The units differ, so a comparison containing
 * both is rejected and neither cell gets a track — without the speed row being
 * special-cased anywhere.
 *
 * ## Missing versus uninstrumented
 *
 * These are deliberately not the same thing:
 *
 *   unavailable    The dataset genuinely has no value. The cell keeps its
 *                  existing unavailable presentation, renders no track, and is
 *                  excluded from the denominator. It does NOT make the row
 *                  ineligible — the remaining present values are still
 *                  legitimately comparable to each other.
 *
 *   available with A value the reader can see but that carries no comparable
 *   no magnitude   metadata — a composite cell, a qualitative label. This DOES
 *                  make the row ineligible, because the reader would otherwise
 *                  be shown bars next to a number that has none.
 *
 * ## Signed values
 *
 * No comparison row in the current dataset can be negative: every eligible
 * measurement is a speed, distance, mass or force, all of which are stored as
 * positive published figures. Rather than guess at a directional encoding for
 * data that does not exist, a negative magnitude makes the row ineligible. If a
 * genuinely signed quantity is ever added, that will surface as a row losing
 * its tracks, which is the safe direction to fail in.
 */

/**
 * Normalized magnitudes for one row, aligned index-for-index with `cells`.
 *
 * A `number` in `0..1` is a track length; `null` means that cell renders no
 * track. A `null` result for the whole row means the row is ineligible and must
 * render as text only.
 */
export type RowMagnitudes = readonly (number | null)[];

export function normalizeRowMagnitudes(
  cells: readonly ComparisonCellValue[],
): RowMagnitudes | null {
  const present = cells.filter((cell) => cell.status === "available");

  // Two values are the minimum that can be compared to each other at all.
  if (present.length < 2) return null;

  const magnitudes = present.map((cell) => cell.magnitude);

  // A present value with no magnitude contract makes the row ineligible.
  if (magnitudes.some((magnitude) => magnitude === undefined)) return null;

  const [first] = magnitudes;
  if (!first) return null;

  for (const magnitude of magnitudes) {
    if (!magnitude) return null;
    // The unit is an equality key, never a conversion instruction.
    if (magnitude.unit !== first.unit) return null;
    if (!Number.isFinite(magnitude.value)) return null;
    if (magnitude.value < 0) return null;
  }

  const maximum = Math.max(
    ...magnitudes.map((magnitude) => magnitude?.value ?? 0),
  );

  // Every present value is a genuine zero, so there is no scale to normalize
  // against. Dividing here would produce NaN; reporting the row as ineligible
  // is the honest outcome.
  if (maximum === 0) return null;

  return cells.map((cell) =>
    cell.status === "available" && cell.magnitude
      ? cell.magnitude.value / maximum
      : null,
  );
}
