import type {
  DistanceMeasurement,
  DistanceUnit,
} from "@/features/vehicles/types";

/**
 * Meters per recorded distance unit. Exact by definition: the
 * international foot (0.3048 m), the statute mile (1,609.344 m) and the
 * nautical mile (1,852 m).
 */
export const METRES_PER_UNIT: Readonly<Record<DistanceUnit, number>> = {
  ft: 0.3048,
  km: 1000,
  m: 1,
  mi: 1609.344,
  nmi: 1852,
};

/** A recorded distance in meters. */
export function toMetres(measurement: DistanceMeasurement) {
  return measurement.value * METRES_PER_UNIT[measurement.unit];
}

/** "52.4": meters to one decimal place, for a dimension label. */
export function formatMetres(metres: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(metres);
}

/** "172", "63.8", "124.4": a recorded value as the record gives it. */
export function formatRecorded(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 }).format(
    value,
  );
}

/**
 * A label of two lines at most, split at the space that best balances
 * them ("Space Launch" over "System (SLS)"). Short names stay on one line.
 */
export function splitName(name: string, maxOneLine = 12) {
  if (name.length <= maxOneLine) return [name];
  const words = name.split(" ");
  let best: [string, string] = [name, ""];
  let bestLength = Number.POSITIVE_INFINITY;
  for (let index = 1; index < words.length; index += 1) {
    const first = words.slice(0, index).join(" ");
    const second = words.slice(index).join(" ");
    const longest = Math.max(first.length, second.length);
    if (longest < bestLength) {
      best = [first, second];
      bestLength = longest;
    }
  }
  return best[1] ? best : [name];
}

/**
 * The end marks of a dimension line: a short oblique tick through each
 * end, at 45 degrees, as on an architectural drawing. Returns SVG path
 * data.
 */
export function obliqueTicks(
  ends: readonly (readonly [number, number])[],
  size = 4,
) {
  return ends
    .map(([x, y]) => `M${x - size} ${y + size}L${x + size} ${y - size}`)
    .join("");
}
