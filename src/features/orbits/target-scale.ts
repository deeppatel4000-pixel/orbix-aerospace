import { EARTH_MEAN_RADIUS_METRES } from "@/features/engineering-lab/calculators";

/**
 * The target-altitude control: a native range input on a log scale from
 * 160 km to 400,000 km (v4 plan, section 5), with snap stops.
 */

export const TARGET_MIN_ALTITUDE_METRES = 160_000;
export const TARGET_MAX_ALTITUDE_METRES = 400_000_000;
/** Range input positions, 0 to this value. */
export const TARGET_SCALE_STEPS = 1_000;
/** A drag or arrow key within this many positions of a stop lands on it. */
export const SNAP_TOLERANCE_STEPS = 12;

/**
 * Mean Earth-Moon distance, centre to centre: 384,400 km, the Moon's
 * semimajor axis in the NASA Moon Fact Sheet
 * (https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html).
 */
export const MOON_MEAN_DISTANCE_METRES = 384_400_000;

export interface TargetStop {
  readonly id: "geo" | "iss" | "moon";
  /** Button text. */
  readonly label: string;
  /** Altitude above Earth's mean radius, metres. */
  readonly altitudeMetres: number;
  /** Words added to the slider's value text, for example "ISS altitude". */
  readonly description: string;
  /** A muted line shown under the readout while this stop is selected. */
  readonly note?: string;
}

export const TARGET_STOPS: readonly TargetStop[] = [
  {
    altitudeMetres: 408_000,
    description: "ISS altitude",
    id: "iss",
    label: "ISS",
  },
  {
    altitudeMetres: 35_786_000,
    description: "geostationary altitude",
    id: "geo",
    label: "GEO",
  },
  {
    // The orbit's radius is the Moon's mean distance from Earth's centre.
    altitudeMetres: MOON_MEAN_DISTANCE_METRES - EARTH_MEAN_RADIUS_METRES,
    description:
      "orbit radius equal to the Moon's mean distance, 384,400 km from Earth's centre",
    id: "moon",
    label: "Moon",
    note: "384,400 km from Earth's centre (NASA Moon Fact Sheet); Moon's gravity ignored.",
  },
];

const LOG_RATIO = Math.log(
  TARGET_MAX_ALTITUDE_METRES / TARGET_MIN_ALTITUDE_METRES,
);

/**
 * Rounds an altitude to three significant figures in kilometres (1 km at
 * least), so the readout does not flicker through meaningless digits.
 */
export function roundTargetAltitude(altitudeMetres: number): number {
  const kilometres = altitudeMetres / 1_000;
  const magnitude = 10 ** Math.max(0, Math.floor(Math.log10(kilometres)) - 2);
  return Math.round(kilometres / magnitude) * magnitude * 1_000;
}

/** Exact altitude at a slider position (no rounding). */
export function positionToAltitude(position: number): number {
  const clamped = Math.min(TARGET_SCALE_STEPS, Math.max(0, position));
  return (
    TARGET_MIN_ALTITUDE_METRES *
    Math.exp((LOG_RATIO * clamped) / TARGET_SCALE_STEPS)
  );
}

/** Slider position for an altitude, clamped to the scale. */
export function altitudeToPosition(altitudeMetres: number): number {
  const position =
    (Math.log(altitudeMetres / TARGET_MIN_ALTITUDE_METRES) / LOG_RATIO) *
    TARGET_SCALE_STEPS;
  return Math.min(TARGET_SCALE_STEPS, Math.max(0, position));
}

export interface TargetSelection {
  /** Slider position, 0 to TARGET_SCALE_STEPS. */
  readonly position: number;
  readonly altitudeMetres: number;
  /** The stop the selection sits on, if any. */
  readonly stop?: TargetStop;
}

export function selectionForStop(stop: TargetStop): TargetSelection {
  return {
    altitudeMetres: stop.altitudeMetres,
    position: altitudeToPosition(stop.altitudeMetres),
    stop,
  };
}

export function selectionForAltitude(altitudeMetres: number): TargetSelection {
  const stop = TARGET_STOPS.find(
    (candidate) => candidate.altitudeMetres === altitudeMetres,
  );
  return stop
    ? selectionForStop(stop)
    : { altitudeMetres, position: altitudeToPosition(altitudeMetres) };
}

/**
 * The selection for a new slider position. It snaps to a stop within
 * SNAP_TOLERANCE_STEPS only while moving toward that stop, so one arrow
 * key press always leaves a stop instead of being pulled back to it. The
 * two ends of the scale never snap, so Home and End reach them at once.
 */
export function snapTarget(
  previousPosition: number,
  nextPosition: number,
): TargetSelection {
  const atEnd = nextPosition <= 0 || nextPosition >= TARGET_SCALE_STEPS;
  for (const stop of atEnd ? [] : TARGET_STOPS) {
    const stopPosition = altitudeToPosition(stop.altitudeMetres);
    const nextDistance = Math.abs(nextPosition - stopPosition);
    const previousDistance = Math.abs(previousPosition - stopPosition);
    if (
      nextDistance <= SNAP_TOLERANCE_STEPS &&
      nextDistance < previousDistance
    ) {
      return selectionForStop(stop);
    }
  }

  return {
    altitudeMetres: roundTargetAltitude(positionToAltitude(nextPosition)),
    position: nextPosition,
  };
}
