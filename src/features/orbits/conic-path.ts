import type { StretchMap } from "./stretch-map";

/**
 * Samples a true conic (ellipse or circle) and turns it into SVG path data
 * through a stretch map. The geometry is the orbit equation
 * r(ν) = a(1 − e²) / (1 + e cos ν); only the radius is remapped for drawing,
 * so the angle of every sample stays exact.
 */

export interface PolarPoint {
  /** Distance from the central body's centre, metres. */
  readonly radiusMetres: number;
  /** Polar angle in the drawing, radians, counter-clockwise from +x. */
  readonly angleRadians: number;
}

export interface ConicArc {
  readonly semiMajorAxisMetres: number;
  /** 0 <= e < 1. */
  readonly eccentricity: number;
  /** Drawing angle of periapsis, radians. */
  readonly periapsisAngleRadians: number;
  /** True anomaly at the start of the arc, radians. */
  readonly fromTrueAnomalyRadians: number;
  /** True anomaly at the end of the arc, radians (may be below `from`). */
  readonly toTrueAnomalyRadians: number;
  /** Number of segments. Default 96. */
  readonly segments?: number;
}

export interface Point {
  readonly x: number;
  readonly y: number;
}

/** r(ν) for an ellipse, metres. */
export function conicRadius(
  semiMajorAxisMetres: number,
  eccentricity: number,
  trueAnomalyRadians: number,
): number {
  return (
    (semiMajorAxisMetres * (1 - eccentricity ** 2)) /
    (1 + eccentricity * Math.cos(trueAnomalyRadians))
  );
}

export function sampleConic(arc: ConicArc): PolarPoint[] {
  const segments = arc.segments ?? 96;
  if (!Number.isInteger(segments) || segments < 1) {
    throw new RangeError("Segments must be a positive whole number.");
  }
  if (!(arc.eccentricity >= 0 && arc.eccentricity < 1)) {
    throw new RangeError("Only circles and ellipses (0 <= e < 1) are sampled.");
  }

  const span = arc.toTrueAnomalyRadians - arc.fromTrueAnomalyRadians;
  return Array.from({ length: segments + 1 }, (_, index) => {
    const trueAnomaly = arc.fromTrueAnomalyRadians + (span * index) / segments;
    return {
      angleRadians: arc.periapsisAngleRadians + trueAnomaly,
      radiusMetres: conicRadius(
        arc.semiMajorAxisMetres,
        arc.eccentricity,
        trueAnomaly,
      ),
    };
  });
}

/** A polar point to SVG coordinates (y down) around `centre`. */
export function polarToSvg(
  point: PolarPoint,
  map: StretchMap,
  centre: Point,
): Point {
  const drawn = map.radiusToDrawn(point.radiusMetres);
  return {
    x: centre.x + drawn * Math.cos(point.angleRadians),
    y: centre.y - drawn * Math.sin(point.angleRadians),
  };
}

function coordinate(value: number): string {
  // Two decimals is far below a device pixel; never print "-0.00".
  const fixed = value.toFixed(2);
  return fixed === "-0.00" ? "0.00" : fixed;
}

/** Polyline path data, "M x y L x y ...". */
export function toSvgPath(points: readonly Point[]): string {
  return points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${coordinate(point.x)} ${coordinate(point.y)}`,
    )
    .join(" ");
}
