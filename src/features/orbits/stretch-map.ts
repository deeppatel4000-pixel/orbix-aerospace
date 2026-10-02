/**
 * Stretched-altitude mapping for orbit drawings (v4 plan, section 5).
 *
 * For low orbits Earth is drawn as a circle of fixed radius and altitude is
 * mapped linearly outward from it, so the highest orbit in view lands on
 * the outer drawn radius:
 *
 *   r_drawn = R_drawn + k × altitude,  k = (r_max − R_drawn) / maxAltitude
 *
 * Heights are then drawn `stretchFactor` times taller than Earth's own
 * scale. The map never compresses heights: when that factor would fall
 * below 1, the whole drawing is set to true scale instead (Earth shrinks,
 * r_drawn = r_max × r / (R + maxAltitude)), so conics stay true conics.
 * The map is monotonic, so every orbit keeps its order.
 */

export interface StretchMapOptions {
  /** Radius of the central body, meters. */
  readonly planetRadiusMetres: number;
  /** Highest altitude in view, meters; it maps to `drawnMaxRadius`. */
  readonly maxAltitudeMetres: number;
  /**
   * Radius of the planet in drawing units while heights are stretched. In
   * the true-scale case the planet is drawn smaller than this.
   */
  readonly drawnPlanetRadius: number;
  /** Outer radius of the plot in drawing units. */
  readonly drawnMaxRadius: number;
}

export interface StretchMap {
  readonly planetRadiusMetres: number;
  /** Radius the planet is drawn at, drawing units. */
  readonly drawnPlanetRadius: number;
  readonly drawnMaxRadius: number;
  readonly maxAltitudeMetres: number;
  /** k: drawing units per meter of altitude. */
  readonly altitudeUnitsPerMetre: number;
  /** Drawing units per meter for the planet itself. */
  readonly planetUnitsPerMetre: number;
  /**
   * How many times larger a meter of altitude is drawn than a meter of the
   * planet's radius: 1 when the drawing is to scale, above 1 when heights
   * are stretched. Never below 1.
   */
  readonly stretchFactor: number;
  /** True when the whole drawing is to one scale (stretchFactor 1). */
  readonly toScale: boolean;
  /** Altitude (meters) to drawn radius. */
  altitudeToDrawn(altitudeMetres: number): number;
  /** Drawn radius back to altitude (meters). */
  drawnToAltitude(drawnRadius: number): number;
  /** Distance from the planet's center (meters) to drawn radius. */
  radiusToDrawn(radiusMetres: number): number;
  /** Drawn radius back to distance from the center (meters). */
  drawnToRadius(drawnRadius: number): number;
}

function assertPositive(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${label} must be a positive number.`);
  }
}

export function createStretchMap(options: StretchMapOptions): StretchMap {
  const {
    drawnMaxRadius,
    drawnPlanetRadius,
    maxAltitudeMetres,
    planetRadiusMetres,
  } = options;

  assertPositive(planetRadiusMetres, "Planet radius");
  assertPositive(maxAltitudeMetres, "Maximum altitude");
  assertPositive(drawnPlanetRadius, "Drawn planet radius");
  if (!(drawnMaxRadius > drawnPlanetRadius)) {
    throw new RangeError(
      "Drawn maximum radius must be larger than the drawn planet radius.",
    );
  }

  const stretchedUnitsPerMetre =
    (drawnMaxRadius - drawnPlanetRadius) / maxAltitudeMetres;
  const toScale =
    stretchedUnitsPerMetre <= drawnPlanetRadius / planetRadiusMetres;
  // To scale: one scale for everything, set so the top altitude still
  // lands on the outer radius.
  const trueScale = drawnMaxRadius / (planetRadiusMetres + maxAltitudeMetres);
  const altitudeUnitsPerMetre = toScale ? trueScale : stretchedUnitsPerMetre;
  const planetDrawn = toScale
    ? trueScale * planetRadiusMetres
    : drawnPlanetRadius;
  const planetUnitsPerMetre = planetDrawn / planetRadiusMetres;

  const altitudeToDrawn = (altitudeMetres: number) =>
    planetDrawn + altitudeUnitsPerMetre * altitudeMetres;
  const drawnToAltitude = (drawnRadius: number) =>
    (drawnRadius - planetDrawn) / altitudeUnitsPerMetre;

  return {
    altitudeToDrawn,
    altitudeUnitsPerMetre,
    drawnMaxRadius,
    drawnPlanetRadius: planetDrawn,
    drawnToAltitude,
    drawnToRadius: (drawnRadius) =>
      planetRadiusMetres + drawnToAltitude(drawnRadius),
    maxAltitudeMetres,
    planetRadiusMetres,
    planetUnitsPerMetre,
    radiusToDrawn: (radiusMetres) =>
      altitudeToDrawn(radiusMetres - planetRadiusMetres),
    stretchFactor: toScale ? 1 : altitudeUnitsPerMetre / planetUnitsPerMetre,
    toScale,
  };
}

/**
 * The stretch factor as a plain number, for example "35" or "1.4": whole
 * numbers from 10 up, two significant figures below.
 */
export function formatStretchFactor(stretchFactor: number): string {
  const rounded =
    stretchFactor >= 10
      ? Math.round(stretchFactor)
      : Number(stretchFactor.toPrecision(2));
  return rounded.toLocaleString("en-US");
}
