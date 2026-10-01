"use client";

import { useId, type ReactNode } from "react";

import { cn } from "@/lib/cn";

import { figureTspans } from "./figure-tspans";
import { useAnnotationFontSize } from "./use-annotation-font-size";

/** Mean Earth radius used for drawing only (IUGG mean radius). */
const EARTH_RADIUS_METRES = 6_371_000;

const VIEW_SIZE = 400;
const CENTRE = VIEW_SIZE / 2;
const MAXIMUM_DRAWN_RADIUS = 180;
/**
 * The large drawing's viewBox is trimmed to the outer ring plus the 6-unit
 * burn tick that crosses it, so the linework meets the column's edges and
 * lines up with the legend, caption and readout below it.
 */
const LARGE_VIEW_INSET = 7;
const LARGE_VIEW_MIN = CENTRE - MAXIMUM_DRAWN_RADIUS - LARGE_VIEW_INSET;
const LARGE_VIEW_SIZE = 2 * (MAXIMUM_DRAWN_RADIUS + LARGE_VIEW_INSET);
/** B612 Mono advance per character, em (measured about 0.65). */
const MONO_ADVANCE = 0.66;

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
  /**
   * `default` caps the drawing at 28rem for use inside a tool; `large` lets
   * it fill its column, for the Engineering Lab hero.
   */
  readonly size?: "default" | "large";
  /**
   * Replaces the default scale note under the legend. The hero passes one
   * sentence that also names the case drawn.
   */
  readonly caption?: ReactNode;
}

interface LegendEntry {
  readonly dash?: string;
  readonly label: string;
  readonly stroke: string;
  readonly width?: number;
}

/**
 * Series styles. The line style tells the series apart, so only the initial
 * orbit carries the division accent (spec 4: accent about 10 percent).
 */
const INITIAL_ORBIT = { stroke: "var(--orbix-accent)", width: 1.5 } as const;
const TARGET_ORBIT = {
  dash: "2 4",
  stroke: "var(--orbix-text-muted)",
  width: 1.5,
} as const;
const TRANSFER_PATH = {
  dash: "8 5",
  stroke: "var(--orbix-text-primary)",
  width: 1.25,
} as const;
const EARTH_OUTLINE = "var(--orbix-data-4)";

/**
 * Below this altitude (as a share of Earth's radius) the orbits crowd the
 * planet's outline at true scale, so a magnified limb view is added.
 */
const LOW_ORBIT_SHARE = 0.15;

/**
 * Orbits drawn to scale around Earth from the computed altitudes.
 *
 * A Hohmann transfer is the half ellipse whose periapsis and apoapsis touch
 * the two circular orbits, with Earth at one focus. Colour is never the only
 * cue: each orbit also has its own line style and a legend entry.
 */
const kilometres = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

/** Annotation text: B612 Mono, muted. Its size is set per render. */
const ANNOTATION_TEXT = {
  fill: "var(--orbix-text-muted)",
  fontFamily: "var(--font-telemetry)",
} as const;

/**
 * The large drawing's label size before it is measured: 11 x 374 / drawn
 * width, rounded up, so the labels never render under 11 CSS px before
 * hydration. Below 48rem the drawing is capped at 18rem (288px); from 48rem
 * it fills the figure.
 */
const ANNOTATION_FLOOR_MAX = 16.25;
const ANNOTATION_FLOOR_CLASS =
  "text-[16.25px] @[18rem]:text-[14.5px] md:@[22.5rem]:text-[11.5px] md:@[25.5rem]:text-[11px]";

/**
 * B612 Mono has no subscript digits (U+2081, U+2082), so subscripts are
 * drawn as a smaller, lowered plain digit.
 */
function Subscript({
  children,
  shift,
}: {
  readonly children: string;
  /** Downward offset in user units; the text after it moves back up. */
  readonly shift: number;
}) {
  return (
    <tspan dy={shift} fontSize="0.75em">
      {children}
    </tspan>
  );
}

/** Limb view geometry: the top 20 degrees of Earth's outline. */
const LIMB_WIDTH = 400;
const LIMB_HALF_ANGLE = (10 * Math.PI) / 180;
const LIMB_EARTH_RADIUS = LIMB_WIDTH / 2 / Math.sin(LIMB_HALF_ANGLE);
const LIMB_SAGITTA = LIMB_EARTH_RADIUS * (1 - Math.cos(LIMB_HALF_ANGLE));
/** Tallest drawn altitude the stretch factor aims for, user units. */
const LIMB_TARGET_HEIGHT = 120;
const LIMB_STRETCHES = [100, 50, 20, 10, 5, 2, 1] as const;
const LIMB_TOP_PAD = 34;
/**
 * The altitude scale sits just right of the arc's apex, where each orbit
 * is still level, so labels set above their orbit's line never cross it.
 */
const LIMB_SCALE_X = LIMB_WIDTH / 2 + 24;

/**
 * A magnified view of the top of Earth's outline with the orbits at their
 * altitudes. The arc keeps Earth's true curvature; altitudes are stretched
 * by a whole factor, stated in the label, so orbits a few hundred
 * kilometres apart separate clearly. Nothing here is decorative: every
 * line is a computed radius.
 */
function LimbView({
  finalAltitudeMetres,
  initialAltitudeMetres,
  initialLabel,
  summary,
  title,
}: {
  readonly finalAltitudeMetres?: number;
  readonly initialAltitudeMetres?: number;
  readonly initialLabel: string;
  /** The figure's plain-language summary, read before the limb detail. */
  readonly summary: string;
  readonly title: string;
}) {
  const reactId = useId().replaceAll(":", "");
  const titleId = `orbit-limb-title-${reactId}`;
  const descriptionId = `orbit-limb-description-${reactId}`;
  const clipId = `orbit-limb-clip-${reactId}`;
  const markerId = `orbit-limb-arrow-${reactId}`;
  const { fontSize, svgRef } = useAnnotationFontSize(true, LIMB_WIDTH, "exact");

  const pixelsPerMetre = LIMB_EARTH_RADIUS / EARTH_RADIUS_METRES;
  const highest = Math.max(
    initialAltitudeMetres ?? 0,
    finalAltitudeMetres ?? 0,
  );
  const stretch =
    LIMB_STRETCHES.find(
      (factor) => factor * highest * pixelsPerMetre <= LIMB_TARGET_HEIGHT,
    ) ?? 1;
  const drawnHeight = (altitude: number) => stretch * altitude * pixelsPerMetre;
  const surfaceTop = LIMB_TOP_PAD + drawnHeight(highest);
  const height = Math.ceil(surfaceTop + LIMB_SAGITTA + 10);
  const cx = LIMB_WIDTH / 2;
  const cy = surfaceTop + LIMB_EARTH_RADIUS;
  // Height of a circle about Earth's centre where it crosses the scale line.
  const yAtScale = (radius: number) =>
    cy - Math.sqrt(radius * radius - (LIMB_SCALE_X - cx) ** 2);
  const radiusFor = (altitude: number) =>
    LIMB_EARTH_RADIUS + drawnHeight(altitude);

  const ticks = [
    0,
    ...new Set(
      [initialAltitudeMetres, finalAltitudeMetres].filter(
        (altitude): altitude is number => altitude !== undefined,
      ),
    ),
  ].sort((a, b) => a - b);
  const surfaceAtScale = yAtScale(LIMB_EARTH_RADIUS);
  const topAtScale = yAtScale(radiusFor(highest));
  const text = { ...ANNOTATION_TEXT, fontSize };
  const stretchLabel =
    stretch === 1
      ? "Limb view, altitude to scale"
      : `Limb view, altitude ×${stretch}`;
  const altitudes = [
    initialAltitudeMetres !== undefined
      ? `${initialLabel.toLowerCase()} at ${kilometres.format(initialAltitudeMetres / 1000)} km`
      : undefined,
    finalAltitudeMetres !== undefined
      ? `target orbit at ${kilometres.format(finalAltitudeMetres / 1000)} km`
      : undefined,
  ].filter(Boolean);

  return (
    <div className="min-w-0">
      <svg
        ref={svgRef}
        aria-labelledby={`${titleId} ${descriptionId}`}
        className="block h-auto w-full"
        role="img"
        viewBox={`0 0 ${LIMB_WIDTH} ${height}`}
      >
        <title id={titleId}>{title}</title>
        <desc id={descriptionId}>
          {`${summary} Limb view: the top 20 degrees of Earth's outline with the ${altitudes.join(" and the ")}. ${
            stretch === 1
              ? "Altitudes are drawn to the same scale as Earth's curvature."
              : `Altitudes are drawn ${stretch} times their true scale against Earth's curvature.`
          }`}
        </desc>
        <defs>
          <clipPath id={clipId}>
            <rect height={height} width={LIMB_WIDTH} x="0" y="0" />
          </clipPath>
          <marker
            id={markerId}
            markerHeight="8"
            markerUnits="userSpaceOnUse"
            markerWidth="8"
            orient="auto"
            refX="8"
            refY="4"
          >
            <path
              d="M 0 0 L 8 4 L 0 8"
              fill="none"
              stroke="var(--orbix-text-muted)"
              strokeWidth="1"
            />
          </marker>
        </defs>

        <g clipPath={`url(#${clipId})`}>
          <circle
            cx={cx}
            cy={cy}
            fill="none"
            r={LIMB_EARTH_RADIUS}
            stroke={EARTH_OUTLINE}
            strokeWidth="1"
          />
          {initialAltitudeMetres !== undefined ? (
            <circle
              cx={cx}
              cy={cy}
              fill="none"
              r={radiusFor(initialAltitudeMetres)}
              stroke={INITIAL_ORBIT.stroke}
              strokeWidth={INITIAL_ORBIT.width}
            />
          ) : null}
          {finalAltitudeMetres !== undefined ? (
            <circle
              cx={cx}
              cy={cy}
              fill="none"
              r={radiusFor(finalAltitudeMetres)}
              stroke={TARGET_ORBIT.stroke}
              strokeDasharray={TARGET_ORBIT.dash}
              strokeWidth={TARGET_ORBIT.width}
            />
          ) : null}
        </g>

        {/* Altitude dimension line, in the style of the hero diagram. */}
        <g>
          <line
            markerEnd={`url(#${markerId})`}
            stroke="var(--orbix-text-muted)"
            strokeWidth="1"
            x1={LIMB_SCALE_X}
            x2={LIMB_SCALE_X}
            y1={surfaceAtScale}
            y2={topAtScale}
          />
          <circle
            cx={LIMB_SCALE_X}
            cy={surfaceAtScale}
            fill="var(--orbix-text-muted)"
            r="1.5"
          />
          {ticks.map((altitude) => {
            const y = yAtScale(radiusFor(altitude));
            return (
              <g key={altitude}>
                <line
                  stroke="var(--orbix-text-muted)"
                  strokeWidth="1"
                  x1={LIMB_SCALE_X - 5}
                  x2={LIMB_SCALE_X + 5}
                  y1={y}
                  y2={y}
                />
                <text {...text} x={LIMB_SCALE_X + 9} y={y - 5}>
                  {figureTspans(kilometres.format(altitude / 1000))}
                  {" km"}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      <p className="mt-2 text-[0.8125rem] leading-5 font-medium text-muted">
        {stretchLabel}
      </p>
    </div>
  );
}

export function OrbitDiagram({
  caption,
  description,
  finalAltitudeMetres,
  initialAltitudeMetres,
  maneuverOrbitRadiusMetres,
  size = "default",
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
  const highestAltitude = largestRadius - EARTH_RADIUS_METRES;
  // A tool-sized drawing of a low orbit is shown as the magnified limb view
  // only: at true scale such orbits sit on Earth's outline and read as a
  // doubled ring, so the full disk would show nothing the limb does not.
  const withLimb =
    size === "default" &&
    highestAltitude > 0 &&
    highestAltitude < LOW_ORBIT_SHARE * EARTH_RADIUS_METRES;

  const legend: LegendEntry[] = [
    { label: "Earth (mean radius 6,371 km)", stroke: EARTH_OUTLINE },
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
      stroke: INITIAL_ORBIT.stroke,
      width: INITIAL_ORBIT.width,
    });
  }
  if (drawnR2 !== undefined) {
    legend.push({ ...TARGET_ORBIT, label: "Target orbit" });
  }
  // In the limb case the transfer path lies on the two orbit rings at this
  // scale, so it is not listed as if it could be seen; the caption says so.
  if (transferPath && !withLimb) {
    legend.push({ ...TRANSFER_PATH, label: "Transfer path (half ellipse)" });
  }

  const annotated =
    size === "large" &&
    transferPath !== undefined &&
    drawnR1 !== undefined &&
    drawnR2 !== undefined &&
    r2 !== undefined;
  // The radius dimension runs down and to the right, clear of the transfer
  // path, which uses the upper half only.
  const dimensionAngle = Math.PI / 4;
  const dimensionEnd =
    drawnR2 !== undefined
      ? {
          x: CENTRE + drawnR2 * Math.cos(dimensionAngle),
          y: CENTRE + drawnR2 * Math.sin(dimensionAngle),
        }
      : undefined;
  const {
    fontSize: annotationFontSize,
    measured,
    svgRef,
  } = useAnnotationFontSize(
    annotated,
    size === "large" ? LARGE_VIEW_SIZE : VIEW_SIZE,
  );
  // Until the drawing is measured, stepped container-query sizes (in user
  // units, set on the class) keep the labels at 11 CSS px or more; once it
  // is measured the inline size, which wins over the class, takes over.
  const annotationText = {
    ...ANNOTATION_TEXT,
    className: ANNOTATION_FLOOR_CLASS,
    fontSize: annotationFontSize,
    style: measured ? { fontSize: annotationFontSize } : undefined,
  };
  const subscriptShift = annotationFontSize * 0.25;
  // The r2 label runs along the dimension line, centred at half the
  // radius where it fits, with at least 0.5em clear of Earth and the
  // initial orbit and 1.5em clear of the dotted target ring. Where the
  // drawing is too small for that (a phone), it is set level instead, just
  // below and left of the line's inner end, where the lower half of the
  // drawing is empty.
  // Until the drawing is measured the text renders at the CSS floor
  // (up to 16.25px), so the layout assumes that size, not the 11-unit
  // default, and the label cannot overlap Earth before hydration.
  const labelSize = measured ? annotationFontSize : ANNOTATION_FLOOR_MAX;
  const dimensionText = `r2 = ${kilometres.format((r2 ?? 0) / 1000)} km`;
  const dimensionLength = dimensionText.length * labelSize * MONO_ADVANCE;
  const innerClear = Math.max(earthRadius, drawnR1 ?? 0) + labelSize * 0.5;
  const outerClear = (drawnR2 ?? 0) - labelSize * 1.5;
  const dimensionAlong = innerClear + dimensionLength <= outerClear;
  const dimensionDistance = Math.min(
    Math.max((drawnR2 ?? 0) * 0.5, innerClear + dimensionLength / 2),
    outerClear - dimensionLength / 2,
  );
  // Level placement: the text's top sits at the height where the line
  // passes, and its end stops 0.5em left of the line.
  const levelOffset = Math.max(
    innerClear + labelSize * 0.1,
    (drawnR2 ?? 0) * 0.25,
  );
  const dimensionLabel = dimensionAlong
    ? {
        anchor: "middle" as const,
        transform: `rotate(45 ${CENTRE + dimensionDistance * Math.SQRT1_2} ${CENTRE + dimensionDistance * Math.SQRT1_2})`,
        x: CENTRE + dimensionDistance * Math.SQRT1_2,
        y: CENTRE + dimensionDistance * Math.SQRT1_2 - 5,
      }
    : {
        anchor: "end" as const,
        transform: undefined,
        x: CENTRE + levelOffset - labelSize * 0.5,
        y: CENTRE + levelOffset + labelSize * 0.8,
      };

  const drawing = (
    <svg
      ref={svgRef}
      aria-labelledby={`${titleId} ${descriptionId}`}
      className={cn(
        "block h-auto w-full",
        size === "default" &&
          (withLimb
            ? "mx-auto max-w-[8rem] @[40rem]:max-w-[10rem]"
            : "mx-auto max-w-md"),
        // Below 48rem the large drawing is capped at 18rem square, so on a
        // phone the hero reaches the tool index sooner. It keeps the left
        // edge of the legend and caption below it.
        size === "large" && "max-md:max-w-[18rem]",
      )}
      role="img"
      viewBox={
        size === "large"
          ? `${LARGE_VIEW_MIN} ${LARGE_VIEW_MIN} ${LARGE_VIEW_SIZE} ${LARGE_VIEW_SIZE}`
          : `0 0 ${VIEW_SIZE} ${VIEW_SIZE}`
      }
    >
      <title id={titleId}>{title}</title>
      <desc id={descriptionId}>{description}</desc>

      <circle
        cx={CENTRE}
        cy={CENTRE}
        fill="none"
        r={earthRadius}
        stroke={EARTH_OUTLINE}
        strokeWidth="1"
      />
      {drawnR1 !== undefined ? (
        <circle
          cx={CENTRE}
          cy={CENTRE}
          fill="none"
          r={drawnR1}
          stroke={INITIAL_ORBIT.stroke}
          strokeWidth={INITIAL_ORBIT.width}
        />
      ) : null}
      {drawnR2 !== undefined ? (
        <circle
          cx={CENTRE}
          cy={CENTRE}
          fill="none"
          r={drawnR2}
          stroke={TARGET_ORBIT.stroke}
          strokeDasharray={TARGET_ORBIT.dash}
          strokeWidth={TARGET_ORBIT.width}
        />
      ) : null}
      {transferPath ? (
        <path
          d={transferPath}
          fill="none"
          stroke={TRANSFER_PATH.stroke}
          strokeDasharray={TRANSFER_PATH.dash}
          strokeWidth={TRANSFER_PATH.width}
        />
      ) : null}

      {annotated && dimensionEnd !== undefined ? (
        <g>
          {/* Burn marks: short radial ticks where each impulse is made. */}
          <line
            stroke="var(--orbix-text-muted)"
            strokeWidth="1"
            x1={CENTRE + drawnR1 - 6}
            x2={CENTRE + drawnR1 + 6}
            y1={CENTRE}
            y2={CENTRE}
          />
          <text {...annotationText} x={CENTRE + drawnR1 + 9} y={CENTRE - 5}>
            Δv<Subscript shift={subscriptShift}>1</Subscript>
          </text>
          <line
            stroke="var(--orbix-text-muted)"
            strokeWidth="1"
            x1={CENTRE - drawnR2 - 6}
            x2={CENTRE - drawnR2 + 6}
            y1={CENTRE}
            y2={CENTRE}
          />
          <text
            {...annotationText}
            x={CENTRE - drawnR2 + 9}
            y={CENTRE + 5 + annotationFontSize}
          >
            Δv<Subscript shift={subscriptShift}>2</Subscript>
          </text>

          {/* Radius dimension from Earth's centre to the target orbit. */}
          <line
            markerEnd={`url(#orbit-dimension-arrow-${reactId})`}
            stroke="var(--orbix-text-muted)"
            strokeWidth="1"
            x1={CENTRE}
            x2={dimensionEnd.x}
            y1={CENTRE}
            y2={dimensionEnd.y}
          />
          <circle
            cx={CENTRE}
            cy={CENTRE}
            fill="var(--orbix-text-muted)"
            r="1.5"
          />
          <text
            {...annotationText}
            textAnchor={dimensionLabel.anchor}
            transform={dimensionLabel.transform}
            x={dimensionLabel.x}
            y={dimensionLabel.y}
          >
            r<Subscript shift={subscriptShift}>2</Subscript>
            <tspan dy={-subscriptShift}>
              {" = "}
              {figureTspans(kilometres.format(r2 / 1000))}
              {" km"}
            </tspan>
          </text>
          <defs>
            <marker
              id={`orbit-dimension-arrow-${reactId}`}
              markerHeight="8"
              markerUnits="userSpaceOnUse"
              markerWidth="8"
              orient="auto"
              refX="8"
              refY="4"
            >
              <path
                d="M 0 0 L 8 4 L 0 8"
                fill="none"
                stroke="var(--orbix-text-muted)"
                strokeWidth="1"
              />
            </marker>
          </defs>
        </g>
      ) : null}
    </svg>
  );

  return (
    <figure className="@container m-0">
      {size === "large" ? (
        // Unframed linework on the ground (spec 8), edge to edge in its
        // column; the legend and caption sit below it on the same left edge.
        drawing
      ) : withLimb ? (
        // Full column width, left edge shared with the legend and caption.
        <div>
          <LimbView
            finalAltitudeMetres={finalAltitudeMetres}
            initialAltitudeMetres={
              initialAltitudeMetres ??
              (maneuverOrbitRadiusMetres !== undefined
                ? maneuverOrbitRadiusMetres - EARTH_RADIUS_METRES
                : undefined)
            }
            initialLabel={
              initialAltitudeMetres !== undefined
                ? "Initial orbit"
                : "Maneuver orbit"
            }
            summary={description}
            title={title}
          />
        </div>
      ) : (
        drawing
      )}

      <figcaption className="mt-3 text-sm leading-6 text-muted">
        <ul className="flex flex-wrap gap-x-6 gap-y-1">
          {legend.map((entry) => (
            <li className="flex items-center gap-2" key={entry.label}>
              <svg aria-hidden="true" height="8" width="24">
                <line
                  stroke={entry.stroke}
                  strokeDasharray={entry.dash}
                  strokeWidth={entry.width ?? 1.5}
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
          {caption ??
            (withLimb ? (
              <>
                The top 20 degrees of Earth&apos;s outline at true curvature,
                with each orbit at its computed altitude.
                {transferPath ? (
                  <> Transfer path not drawn: it runs between the two orbits.</>
                ) : null}
              </>
            ) : (
              <>Drawn to scale from the computed altitudes.</>
            ))}
        </p>
      </figcaption>
    </figure>
  );
}
