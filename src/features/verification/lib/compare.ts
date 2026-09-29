/**
 * Comparison helpers for the /verification page. Kept free of React so the
 * test suite can check the exact arithmetic the page displays.
 */

/**
 * Relative floating-point allowance used only when deciding whether a value
 * sits inside the reference's rounding interval. Without it, a value such as
 * 1.6874999999999998 (the IEEE-754 result for exactly 1.6875) would be judged
 * outside a reference printed as 1.688.
 */
const FLOATING_POINT_ALLOWANCE = 1e-9;

/** Signed percentage difference of ORBIX from the reference value. */
export function percentDifference(orbix: number, reference: number): number {
  if (reference === 0) {
    throw new RangeError(
      "A reference value of zero has no relative difference.",
    );
  }

  return ((orbix - reference) / reference) * 100;
}

/**
 * True when ORBIX lies within half a unit of the last digit the source
 * prints. `resolution` is that last-digit unit in the displayed unit, for
 * example 0.001 for a value printed as 4.500.
 */
export function isWithinReferenceRounding(
  orbix: number,
  reference: number,
  resolution: number,
): boolean {
  const halfUnit = resolution / 2;

  return (
    Math.abs(orbix - reference) <= halfUnit * (1 + FLOATING_POINT_ALLOWANCE)
  );
}

/** Number of decimal places implied by a last-digit unit such as 0.001. */
export function decimalsForResolution(resolution: number): number {
  if (!(resolution > 0)) {
    throw new RangeError("Resolution must be a positive number.");
  }

  return Math.max(0, Math.round(-Math.log10(resolution)));
}

const MINUS_SIGN = "\u2212";

function formatFixed(value: number, decimals: number): string {
  const formatted = Math.abs(value).toLocaleString("en-US", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });

  return value < 0 && Number(formatted.replace(/,/g, "")) !== 0
    ? `${MINUS_SIGN}${formatted}`
    : formatted;
}

/** Reference value shown with exactly the digits the source prints. */
export function formatReferenceValue(
  value: number,
  resolution: number,
): string {
  return formatFixed(value, decimalsForResolution(resolution));
}

/**
 * ORBIX value shown with two more decimal places than the reference, so a
 * reader can always see which side of the half-unit rounding boundary it
 * falls on (one extra place can land exactly on the boundary).
 */
export function formatOrbixValue(value: number, resolution: number): string {
  return formatFixed(value, decimalsForResolution(resolution) + 2);
}

/** Percentage difference to three decimal places, with an explicit sign. */
export function formatPercentDifference(percent: number): string {
  const rounded = Number(percent.toFixed(3));

  if (rounded === 0) return "0.000%";

  return `${rounded > 0 ? "+" : MINUS_SIGN}${Math.abs(rounded).toFixed(3)}%`;
}
