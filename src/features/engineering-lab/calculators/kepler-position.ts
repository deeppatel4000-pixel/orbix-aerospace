import { EARTH_STANDARD_GRAVITATIONAL_PARAMETER_CUBIC_METRES_PER_SECOND_SQUARED } from "./orbital-elements";

const TWO_PI = 2 * Math.PI;

/** Convergence limit on |E - e sin E - M|, radians. */
export const KEPLER_EQUATION_TOLERANCE_RADIANS = 1e-12;
/** Newton's method converges in a handful of steps for e < 1. */
const KEPLER_MAXIMUM_ITERATIONS = 50;

export interface KeplerPositionInputs {
  /** Semi-major axis of the elliptical (or circular) orbit, meters. */
  readonly semiMajorAxisMetres: number;
  /** Orbital eccentricity, 0 <= e < 1. */
  readonly eccentricity: number;
  /** Time flown since the starting position, seconds (>= 0). */
  readonly elapsedTimeSeconds: number;
  /** True anomaly at the starting position, radians. Default 0 (periapsis). */
  readonly initialTrueAnomalyRadians?: number;
  /** Gravitational parameter GM, m³/s². Default: Earth. */
  readonly gravitationalParameter?: number;
}

export interface KeplerPositionResult {
  readonly resolvedGravitationalParameter: number;
  /** n = sqrt(GM / a³), rad/s. */
  readonly meanMotionRadiansPerSecond: number;
  /** Mean anomaly at the starting position, radians in [0, 2π). */
  readonly initialMeanAnomalyRadians: number;
  /** Mean anomaly after the elapsed time, radians in [0, 2π). */
  readonly meanAnomalyRadians: number;
  /** Solution of Kepler's equation E - e sin E = M, radians in [0, 2π). */
  readonly eccentricAnomalyRadians: number;
  /** True anomaly after the elapsed time, radians in [0, 2π). */
  readonly trueAnomalyRadians: number;
  /** Distance from the central body's center, r = a(1 - e cos E), meters. */
  readonly orbitalRadiusMetres: number;
  /** Newton iterations used to solve Kepler's equation. */
  readonly iterations: number;
}

export interface KeplerEquationSolution {
  readonly eccentricAnomalyRadians: number;
  readonly iterations: number;
}

function normalizeAngle(radians: number): number {
  const wrapped = radians % TWO_PI;
  const positive = wrapped < 0 ? wrapped + TWO_PI : wrapped;
  // A value a rounding error below 2π is 0.
  return TWO_PI - positive < 1e-15 ? 0 : positive;
}

function assertEccentricity(eccentricity: number): void {
  if (!Number.isFinite(eccentricity) || eccentricity < 0 || eccentricity >= 1) {
    throw new RangeError(
      "Eccentricity must be a number from 0 up to, but not including, 1.",
    );
  }
}

/**
 * Solves Kepler's equation E - e sin E = M for the eccentric anomaly E by
 * Newton iteration, for an ellipse (0 <= e < 1). M is reduced to [0, 2π)
 * first; the result is in [0, 2π).
 */
export function solveKeplerEquation(
  meanAnomalyRadians: number,
  eccentricity: number,
): KeplerEquationSolution {
  assertEccentricity(eccentricity);
  if (!Number.isFinite(meanAnomalyRadians)) {
    throw new RangeError("Mean anomaly must be a finite number.");
  }

  const meanAnomaly = normalizeAngle(meanAnomalyRadians);
  // Starting guess: M for low eccentricity, π for high.
  let eccentricAnomaly = eccentricity < 0.8 ? meanAnomaly : Math.PI;

  for (let iteration = 1; iteration <= KEPLER_MAXIMUM_ITERATIONS; iteration++) {
    const residual =
      eccentricAnomaly -
      eccentricity * Math.sin(eccentricAnomaly) -
      meanAnomaly;
    const derivative = 1 - eccentricity * Math.cos(eccentricAnomaly);
    const step = residual / derivative;
    eccentricAnomaly -= step;

    if (Math.abs(step) <= KEPLER_EQUATION_TOLERANCE_RADIANS) {
      return {
        eccentricAnomalyRadians: normalizeAngle(eccentricAnomaly),
        iterations: iteration,
      };
    }
  }

  throw new RangeError("Kepler's equation did not converge.");
}

/** Eccentric anomaly from true anomaly, radians in [0, 2π). */
function eccentricFromTrueAnomaly(
  trueAnomalyRadians: number,
  eccentricity: number,
): number {
  const half = trueAnomalyRadians / 2;
  return normalizeAngle(
    2 *
      Math.atan2(
        Math.sqrt(1 - eccentricity) * Math.sin(half),
        Math.sqrt(1 + eccentricity) * Math.cos(half),
      ),
  );
}

/** True anomaly from eccentric anomaly, radians in [0, 2π). */
function trueFromEccentricAnomaly(
  eccentricAnomalyRadians: number,
  eccentricity: number,
): number {
  const half = eccentricAnomalyRadians / 2;
  return normalizeAngle(
    2 *
      Math.atan2(
        Math.sqrt(1 + eccentricity) * Math.sin(half),
        Math.sqrt(1 - eccentricity) * Math.cos(half),
      ),
  );
}

/**
 * Position on an ideal two-body elliptical orbit after a given time:
 * the starting true anomaly gives the starting mean anomaly, the mean
 * anomaly advances at n = sqrt(GM / a³), and Kepler's equation
 * E - e sin E = M is solved for E by Newton iteration. Inputs and outputs
 * use SI units and radians.
 */
export function calculateKeplerPosition(
  inputs: KeplerPositionInputs,
): KeplerPositionResult {
  const {
    eccentricity,
    elapsedTimeSeconds,
    initialTrueAnomalyRadians = 0,
    semiMajorAxisMetres,
  } = inputs;

  if (!Number.isFinite(semiMajorAxisMetres) || semiMajorAxisMetres <= 0) {
    throw new RangeError("Semi-major axis must be a positive number.");
  }
  assertEccentricity(eccentricity);
  if (!Number.isFinite(elapsedTimeSeconds) || elapsedTimeSeconds < 0) {
    throw new RangeError("Elapsed time must be zero or a positive number.");
  }
  if (!Number.isFinite(initialTrueAnomalyRadians)) {
    throw new RangeError("Initial true anomaly must be a finite number.");
  }
  if (
    inputs.gravitationalParameter !== undefined &&
    (!Number.isFinite(inputs.gravitationalParameter) ||
      inputs.gravitationalParameter <= 0)
  ) {
    throw new RangeError("Gravitational parameter must be a positive number.");
  }

  const resolvedGravitationalParameter =
    inputs.gravitationalParameter ??
    EARTH_STANDARD_GRAVITATIONAL_PARAMETER_CUBIC_METRES_PER_SECOND_SQUARED;
  const meanMotionRadiansPerSecond = Math.sqrt(
    resolvedGravitationalParameter / semiMajorAxisMetres ** 3,
  );

  const initialEccentricAnomaly = eccentricFromTrueAnomaly(
    initialTrueAnomalyRadians,
    eccentricity,
  );
  const initialMeanAnomalyRadians = normalizeAngle(
    initialEccentricAnomaly - eccentricity * Math.sin(initialEccentricAnomaly),
  );
  const meanAnomalyRadians = normalizeAngle(
    initialMeanAnomalyRadians + meanMotionRadiansPerSecond * elapsedTimeSeconds,
  );
  const { eccentricAnomalyRadians, iterations } = solveKeplerEquation(
    meanAnomalyRadians,
    eccentricity,
  );

  return {
    eccentricAnomalyRadians,
    initialMeanAnomalyRadians,
    iterations,
    meanAnomalyRadians,
    meanMotionRadiansPerSecond,
    orbitalRadiusMetres:
      semiMajorAxisMetres *
      (1 - eccentricity * Math.cos(eccentricAnomalyRadians)),
    resolvedGravitationalParameter,
    trueAnomalyRadians: trueFromEccentricAnomaly(
      eccentricAnomalyRadians,
      eccentricity,
    ),
  };
}
