import { useId } from "react";

/** Mean Earth radius used for drawing only (IUGG mean radius). */
const EARTH_RADIUS_METRES = 6_371_000;

const VIEW_SIZE = 400;
const CENTRE = VIEW_SIZE / 2;
const MAXIMUM_DRAWN_RADIUS = 180;

export interface OrbitDiagramProps {
  /** Altitude of the starting circular orbit, metres. */
  readonly initialAltitudeMetres?: number;
  /** Altitude of the target circular orbit, metres. */
  readonly finalAltitudeMetres?: number;
  /** Radius (from Earth's centre) of a single maneuver orbit, metres. */
  readonly maneuverOrbitRadiusMetres?: number;
  /** Accessible title for the figure. */
  readonly title: string;
  /** Plain-language description of what is drawn. */
  readonly description: string;
}

interface LegendEntry {
  readonly dash?: string;
  readonly label: string;
  readonly stroke: string;
}

/**
 * Orbits drawn to scale around Earth from the computed altitudes.
 *
 * A Hohmann transfer is the half ellipse whose periapsis and apoapsis touch
 * the two circular orbits, with Earth at one focus. Colour is never the only
 * cue: each orbit also has its own line style and a legend entry.
 */
export function OrbitDiagram({
  description,
  finalAltitudeMetres,
  initialAltitudeMetres,
  maneuverOrbitRadiusMetres,
  title,
}: OrbitDiagramProps) {
  const reactId = useId().replaceAll(":", "");
  const titleId = `orbit-diagram-title-${reactId}`;
  const descriptionId = `orbit-diagram-description-${reactId}`;

  const r1 =
    initialAltitudeMetres !== undefined
      ? EARTH_RADIUS_METRES + initialAltitudeMetres
      : maneuverOrbitRadiusMetres;
  const r2 =
    finalAltitudeMetres !== undefined
      ? EARTH_RADIUS_METRES + finalAltitudeMetres
      : undefined;
  const largestRadius = Math.max(EARTH_RADIUS_METRES, r1 ?? 0, r2 ?? 0);
  const scale = MAXIMUM_DRAWN_RADIUS / largestRadius;
  const earthRadius = Math.max(2, EARTH_RADIUS_METRES * scale);
  const drawnR1 = r1 !== undefined ? r1 * scale : undefined;
  const drawnR2 = r2 !== undefined ? r2 * scale : undefined;

  const legend: LegendEntry[] = [
    { label: "Earth (mean radius 6,371 km)", stroke: "var(--orbix-data-4)" },
  ];

  let transferPath: string | undefined;
  if (drawnR1 !== undefined && drawnR2 !== undefined && drawnR1 !== drawnR2) {
    const semiMajor = (drawnR1 + drawnR2) / 2;
    const semiMinor = Math.sqrt(drawnR1 * drawnR2);
    // Periapsis on the right of Earth, apoapsis on the left; upper half only.
    transferPath = `M ${CENTRE + drawnR1} ${CENTRE} A ${semiMajor} ${semiMinor} 0 0 0 ${CENTRE - drawnR2} ${CENTRE}`;
  }

  if (drawnR1 !== undefined) {
    legend.push({
      label:
        initialAltitudeMetres !== undefined
          ? "Initial orbit"
          : "Maneuver orbit",
      stroke: "var(--orbix-data-1)",
    });
  }
  if (drawnR2 !== undefined) {
    legend.push({
      dash: "2 4",
      label: "Target orbit",
      stroke: "var(--orbix-data-3)",
    });
  }
  if (transferPath) {
    legend.push({
      dash: "8 5",
      label: "Transfer path (half ellipse)",
      stroke: "var(--orbix-data-2)",
    });
  }

  return (
    <figure className="m-0">
      <svg
        aria-labelledby={`${titleId} ${descriptionId}`}
        className="mx-auto block h-auto w-full max-w-md"
        role="img"
        viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
      >
        <title id={titleId}>{title}</title>
        <desc id={descriptionId}>{description}</desc>

        <circle
          cx={CENTRE}
          cy={CENTRE}
          fill="var(--orbix-surface-raised)"
          r={earthRadius}
          stroke="var(--orbix-data-4)"
          strokeWidth="1"
        />
        {drawnR1 !== undefined ? (
          <circle
            cx={CENTRE}
            cy={CENTRE}
            fill="none"
            r={drawnR1}
            stroke="var(--orbix-data-1)"
            strokeWidth="1.5"
          />
        ) : null}
        {drawnR2 !== undefined ? (
          <circle
            cx={CENTRE}
            cy={CENTRE}
            fill="none"
            r={drawnR2}
            stroke="var(--orbix-data-3)"
            strokeDasharray="2 4"
            strokeWidth="1.5"
          />
        ) : null}
        {transferPath ? (
          <path
            d={transferPath}
            fill="none"
            stroke="var(--orbix-data-2)"
            strokeDasharray="8 5"
            strokeWidth="2"
          />
        ) : null}
      </svg>

      <figcaption className="mt-3 text-sm leading-6 text-muted">
        <ul className="flex flex-wrap gap-x-6 gap-y-1">
          {legend.map((entry) => (
            <li className="flex items-center gap-2" key={entry.label}>
              <svg aria-hidden="true" height="8" width="24">
                <line
                  stroke={entry.stroke}
                  strokeDasharray={entry.dash}
                  strokeWidth="2"
                  x1="0"
                  x2="24"
                  y1="4"
                  y2="4"
                />
              </svg>
              <span className="text-text-secondary">{entry.label}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2">
          Drawn to scale from the computed altitudes. Low orbits sit close to
          Earth&apos;s surface at this scale.
        </p>
      </figcaption>
    </figure>
  );
}
