import { analyzeHohmannTransfer } from "@/features/engineering-lab/analysis";
import {
  calculateKeplerPosition,
  calculateVisViva,
  EARTH_MEAN_RADIUS_METRES,
} from "@/features/engineering-lab/calculators";

/**
 * Everything the Transfer Explorer shows, computed by the Engineering Lab's
 * own analysis and calculators: `analyzeHohmannTransfer` for the burns and
 * time, `calculateVisViva` for speeds on the ellipse and
 * `calculateKeplerPosition` for where the craft is at a given time. This
 * file only orchestrates and formats; it adds no physics of its own.
 */

export interface TransferOrbitSummary {
  readonly altitudeMetres: number;
  readonly radiusMetres: number;
  readonly circularSpeedMetresPerSecond: number;
}

export interface TransferModel {
  readonly initial: TransferOrbitSummary;
  readonly target: TransferOrbitSummary;
  /** True when the target is higher than the start. */
  readonly raising: boolean;
  readonly gravitationalParameter: number;
  readonly planetRadiusMetres: number;
  readonly semiMajorAxisMetres: number;
  /** (r_apoapsis − r_periapsis) / (r_apoapsis + r_periapsis). */
  readonly eccentricity: number;
  /** Speed on the ellipse just after burn 1, at the starting radius. */
  readonly departureSpeedMetresPerSecond: number;
  /** Speed on the ellipse just before burn 2, at the target radius. */
  readonly arrivalSpeedMetresPerSecond: number;
  readonly firstBurnDeltaVMetresPerSecond: number;
  readonly secondBurnDeltaVMetresPerSecond: number;
  readonly totalDeltaVMetresPerSecond: number;
  readonly transferTimeSeconds: number;
}

/**
 * The transfer between two circular orbits, or `null` when the altitudes
 * are equal (there is nothing to transfer, and the calculator rejects it).
 */
export function computeTransferModel(
  initialAltitudeMetres: number,
  targetAltitudeMetres: number,
): TransferModel | null {
  if (initialAltitudeMetres === targetAltitudeMetres) return null;

  const analysis = analyzeHohmannTransfer({
    finalAltitudeMetres: targetAltitudeMetres,
    initialAltitudeMetres,
  });
  const { finalOrbit, initialOrbit, resolved, transfer } = analysis;
  const gravitationalParameter = resolved.gravitationalParameter;
  const semiMajorAxisMetres = transfer.transferSemiMajorAxisMetres;

  const speedOnEllipse = (orbitalRadiusMetres: number) =>
    calculateVisViva({
      gravitationalParameter,
      orbitalRadiusMetres,
      semiMajorAxisMetres,
    }).orbitalVelocityMetresPerSecond;

  const periapsis = Math.min(
    initialOrbit.orbitalRadiusMetres,
    finalOrbit.orbitalRadiusMetres,
  );

  return {
    arrivalSpeedMetresPerSecond: speedOnEllipse(finalOrbit.orbitalRadiusMetres),
    departureSpeedMetresPerSecond: speedOnEllipse(
      initialOrbit.orbitalRadiusMetres,
    ),
    eccentricity: 1 - periapsis / semiMajorAxisMetres,
    firstBurnDeltaVMetresPerSecond: transfer.firstBurnDeltaVMetresPerSecond,
    gravitationalParameter,
    initial: {
      altitudeMetres: initialOrbit.altitudeMetres,
      circularSpeedMetresPerSecond:
        initialOrbit.circularVelocityMetresPerSecond,
      radiusMetres: initialOrbit.orbitalRadiusMetres,
    },
    planetRadiusMetres: resolved.planetRadiusMetres,
    raising: targetAltitudeMetres > initialAltitudeMetres,
    secondBurnDeltaVMetresPerSecond: transfer.secondBurnDeltaVMetresPerSecond,
    semiMajorAxisMetres,
    target: {
      altitudeMetres: finalOrbit.altitudeMetres,
      circularSpeedMetresPerSecond: finalOrbit.circularVelocityMetresPerSecond,
      radiusMetres: finalOrbit.orbitalRadiusMetres,
    },
    totalDeltaVMetresPerSecond: transfer.totalDeltaVMetresPerSecond,
    transferTimeSeconds: transfer.transferTimeSeconds,
  };
}

export interface CraftState {
  readonly elapsedSeconds: number;
  readonly radiusMetres: number;
  readonly altitudeMetres: number;
  readonly speedMetresPerSecond: number;
  /** Angle swept from burn 1, radians, 0 to π. */
  readonly sweptAngleRadians: number;
}

/**
 * Where the craft is a fraction (0 to 1) of the way through the coast, in
 * time. Raising transfers start at periapsis (true anomaly 0), lowering
 * ones at apoapsis (π); Kepler's equation gives the true anomaly.
 */
export function craftStateAt(
  model: TransferModel,
  fraction: number,
): CraftState {
  const clamped = Math.min(1, Math.max(0, fraction));
  const elapsedSeconds = clamped * model.transferTimeSeconds;
  const initialTrueAnomaly = model.raising ? 0 : Math.PI;

  const position = calculateKeplerPosition({
    eccentricity: model.eccentricity,
    elapsedTimeSeconds: elapsedSeconds,
    gravitationalParameter: model.gravitationalParameter,
    initialTrueAnomalyRadians: initialTrueAnomaly,
    semiMajorAxisMetres: model.semiMajorAxisMetres,
  });

  let swept = position.trueAnomalyRadians - initialTrueAnomaly;
  swept = ((swept % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  // A hair behind the start wraps to just under 2π; it is the start.
  if (swept > 1.5 * Math.PI) swept = 0;
  if (clamped === 1) swept = Math.PI;
  swept = Math.min(Math.PI, swept);

  const speedMetresPerSecond = calculateVisViva({
    gravitationalParameter: model.gravitationalParameter,
    orbitalRadiusMetres: position.orbitalRadiusMetres,
    semiMajorAxisMetres: model.semiMajorAxisMetres,
  }).orbitalVelocityMetresPerSecond;

  return {
    altitudeMetres: position.orbitalRadiusMetres - model.planetRadiusMetres,
    elapsedSeconds,
    radiusMetres: position.orbitalRadiusMetres,
    speedMetresPerSecond,
    sweptAngleRadians: swept,
  };
}

/* ------------------------------------------------------------------ *
 * Formatting and narration.
 * ------------------------------------------------------------------ */

const wholeNumber = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});
const oneDecimal = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

/** Joins a value to its unit so the two never break across lines. */
const NBSP = "\u00A0";

/** Below this delta-v (m/s) speeds are shown to one decimal. */
export const SMALL_BURN_METRES_PER_SECOND = 100;

/**
 * Decimal places for a burn and the speeds either side of it: one when
 * the burn is under 100 m/s, so the shown numbers subtract to the shown
 * delta-v; none otherwise.
 */
export function burnDecimals(deltaVMetresPerSecond: number): 0 | 1 {
  return Math.abs(deltaVMetresPerSecond) < SMALL_BURN_METRES_PER_SECOND ? 1 : 0;
}

/** Decimal places for a model's total: one if either burn uses one. */
export function totalDecimals(model: TransferModel): 0 | 1 {
  return Math.max(
    burnDecimals(model.firstBurnDeltaVMetresPerSecond),
    burnDecimals(model.secondBurnDeltaVMetresPerSecond),
  ) as 0 | 1;
}

/** "7,784" (m/s, whole numbers), or "7,784.3" with `decimals` 1. */
export function formatSpeed(
  metresPerSecond: number,
  decimals: 0 | 1 = 0,
): string {
  return (decimals === 1 ? oneDecimal : wholeNumber).format(metresPerSecond);
}

/** "35,786" (km, whole numbers). */
export function formatAltitudeKm(altitudeMetres: number): string {
  return wholeNumber.format(altitudeMetres / 1_000);
}

/**
 * A duration in words: "45 min" under an hour, "5 h 17 min" under two
 * days, "4.9 days" beyond. Each number is joined to its unit by a
 * non-breaking space.
 */
export function formatDuration(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60);
  if (totalMinutes < 60) return `${totalMinutes}${NBSP}min`;
  if (seconds < 48 * 3_600) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes === 0
      ? `${hours}${NBSP}h`
      : `${hours}${NBSP}h ${minutes}${NBSP}min`;
  }
  return `${oneDecimal.format(seconds / 86_400)}${NBSP}days`;
}

export interface TransferNarration {
  readonly burn1: string;
  readonly coast: string;
  readonly burn2: string;
}

/** One sentence per step, filled only from computed values. */
export function narrateTransfer(model: TransferModel): TransferNarration {
  const km = (altitudeMetres: number) =>
    `${formatAltitudeKm(altitudeMetres)}${NBSP}km`;
  const start = km(model.initial.altitudeMetres);
  const end = km(model.target.altitudeMetres);
  const ms = (value: number, decimals: 0 | 1) =>
    `${formatSpeed(value, decimals)}${NBSP}m/s`;
  const d1 = burnDecimals(model.firstBurnDeltaVMetresPerSecond);
  const d2 = burnDecimals(model.secondBurnDeltaVMetresPerSecond);
  const time = formatDuration(model.transferTimeSeconds);
  const burn1Speeds = `by ${ms(model.firstBurnDeltaVMetresPerSecond, d1)}, from ${ms(model.initial.circularSpeedMetresPerSecond, d1)} to ${ms(model.departureSpeedMetresPerSecond, d1)}`;
  const burn2Speeds = `by ${ms(model.secondBurnDeltaVMetresPerSecond, d2)}, from ${ms(model.arrivalSpeedMetresPerSecond, d2)} to ${ms(model.target.circularSpeedMetresPerSecond, d2)}`;
  const arrival = ms(model.arrivalSpeedMetresPerSecond, d2);

  if (model.raising) {
    return {
      burn1: `Burn 1 at ${start}: speed up ${burn1Speeds}, which stretches the circle into an ellipse that reaches ${end}.`,
      burn2: `Burn 2 at ${end}: speed up ${burn2Speeds}, the speed of a circular orbit at that height.`,
      coast: `Coast for ${time} to the far side of the ellipse, slowing to ${arrival} on the climb.`,
    };
  }

  return {
    burn1: `Burn 1 at ${start}: slow down ${burn1Speeds}, which turns the circle into an ellipse that dips to ${end}.`,
    burn2: `Burn 2 at ${end}: slow down ${burn2Speeds}, the speed of a circular orbit at that height.`,
    coast: `Coast for ${time} to the far side of the ellipse, speeding up to ${arrival} on the way down.`,
  };
}

/**
 * The fixed assumptions line (v4 plan, section 5). It names the radius the
 * altitudes are measured from, because published worked examples (the
 * Verification page's Hohmann case) use a different Earth radius and so
 * print slightly different figures for the same altitudes.
 */
export const TRANSFER_ASSUMPTIONS = `Assumes circular orbits in one plane, instant burns and Earth's gravity only. Altitudes are measured from Earth's mean radius, ${(EARTH_MEAN_RADIUS_METRES / 1_000).toLocaleString("en-US")} km.`;
