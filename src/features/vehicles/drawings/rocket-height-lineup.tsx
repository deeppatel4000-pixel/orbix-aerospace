import {
  getVehicleDrawing,
  type VehicleDrawing,
} from "@/features/vehicles/data/gallery-drawings";
import type { Rocket } from "@/features/vehicles/types";

import { DrawingSourceNote } from "./drawing-credits";
import { NumText } from "./num-text";
import { ScaleFigure } from "./scale-figure";
import {
  formatMetres,
  formatRecorded,
  obliqueTicks,
  splitName,
  toMetres,
} from "./units";

export { splitName } from "./units";

/**
 * The two layouts of the lineup, each one scale for every vehicle.
 * `upright` (from 64rem): the traced side-view outlines stand side by side
 * on one ground datum, spread across the full content width, each nose
 * carried left by an extension line to a shared column of figures, with
 * the scale bar laid flat under the ground. `level` (below 64rem): the
 * same outlines laid on their sides, nose to the right, one vehicle to a
 * row from a common base line, each with a dimension line under it, so
 * five heights and their names fit a phone without scrolling. Text sizes
 * are chosen so figures render at 13px or more (v4 plan section 5) at
 * every width each layout is shown at (`level` is never drawn narrower
 * than 288px, `upright` never narrower than 960px).
 */
export const LINEUP_LAYOUTS = {
  level: { figureSize: 14, nameSize: 14, unitsPerMetre: 1.7 },
  upright: { figureSize: 14, nameSize: 14, unitsPerMetre: 3.2 },
} as const;

export type LineupLayoutName = keyof typeof LINEUP_LAYOUTS;

/** The metre scale bar: its length and tick step (spec 8). */
export const SCALE_BAR_M = 50;
const SCALE_TICK_M = 10;

/* Upright layout. */
/** The upright drawing's width; the vehicles spread across it. */
const UPRIGHT_WIDTH = 1000;
const UPRIGHT_TOP = 14;
const MARGIN = 8;
/** From the figure column's right edge to where the extension lines end. */
const FIGURE_TO_LEADER = 6;
/** From the end of the extension lines to the first outline's left edge. */
const LEADER_TO_FIRST = 40;
/** Room right of the last outline's centre, for its two-line name. */
const UPRIGHT_RIGHT = 78;
/** The gap between a nose and its extension line. */
export const EXT_GAP = 6;
/** From the ground to the scale bar, under the two-line names. */
const GROUND_TO_SCALE = 62;
/** Rough advance of B612 Mono, as a share of the size. */
const MONO_ADVANCE = 0.6;

/* Level layout. */
const LEVEL_WIDTH = 300;
const BASE_X = 10;
const LEVEL_TOP = 4;
/** Room for a row's name above its outline, and the gap under the name. */
const NAME_ROOM = 16;
const NAME_TO_OUTLINE = 6;
/** From an outline to its dimension line, and on to the next row. */
const OUTLINE_TO_DIMENSION = 6;
const ROW_GAP = 14;

/** The qualifier set after an approximate height, on the same line. */
const APPROX = " approx.";
/** Scale bar tick heights: the labelled ends, and the steps between. */
const SCALE_TICK_MAJOR = 7;
const SCALE_TICK_MINOR = 3.5;

export interface LineupVehicle {
  readonly id: string;
  /** The name split for the label under the ground line. */
  readonly nameLines: readonly string[];
  readonly name: string;
  /** Recorded height in metres, converted from the record's own unit. */
  readonly metres: number;
  /** The height as recorded, for example "111 m". */
  readonly recorded: string;
  /** The metre figure, only when the record is in another unit. */
  readonly converted?: string;
  readonly approximate: boolean;
  /** The traced side-view outline. */
  readonly drawing: VehicleDrawing;
  /**
   * Drawing units per traced metre: the outline's height times this is
   * the recorded height at the layout's scale.
   */
  readonly scale: number;
  /**
   * SVG transform that places the outline: base on the ground line, nose
   * at (x2, y2) upright or at the right end laid level.
   */
  readonly outline: string;
  /** Half the outline's drawn width, in drawing units. */
  readonly halfWidth: number;
  /**
   * The height's dimension line, from the ground (x1, y1) to the top
   * (x2, y2). Upright: the outline's centre line. Level: horizontal,
   * under the outline.
   */
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
}

export interface LineupGeometry {
  /**
   * Upright only: the right edge of the figure column (figures are set
   * flush right here) and the x where every extension line ends.
   */
  readonly figureX?: number;
  readonly leaderX?: number;
  readonly layout: LineupLayoutName;
  readonly height: number;
  /** The ground line (upright) or base line (level). */
  readonly ground: {
    readonly x1: number;
    readonly y1: number;
    readonly x2: number;
    readonly y2: number;
  };
  /** Scale bar ticks from 0 to `SCALE_BAR_M`, as points on the bar, which lies flat in both layouts. */
  readonly scale: readonly {
    readonly metres: number;
    readonly x: number;
    readonly y: number;
  }[];
  readonly vehicles: readonly LineupVehicle[];
  readonly width: number;
}

/** A usable recorded height, in metres. */
function recordedMetres(rocket: Rocket) {
  const metres = toMetres(rocket.dimensions.height);
  return Number.isFinite(metres) && metres > 0 ? metres : undefined;
}

/** Rounded to 1/1000 of a drawing unit, for compact transforms. */
function r(value: number) {
  return Math.round(value * 1000) / 1000;
}

/**
 * The lineup's geometry, built from `dimensions.height` in each record,
 * converted to metres, and each vehicle's traced side-view outline,
 * scaled so its height is the recorded height: every vehicle stands on one
 * ground line at one scale, shortest first. Widths follow the source
 * drawings at the same scale; the records give no diameter. A record with
 * no usable height or no outline is left out.
 */
export function rocketLineupGeometry(
  rockets: readonly Rocket[],
  layoutName: LineupLayoutName = "upright",
): LineupGeometry {
  const u = LINEUP_LAYOUTS[layoutName].unitsPerMetre;
  const measured = rockets
    .flatMap((rocket) => {
      const metres = recordedMetres(rocket);
      const drawing = getVehicleDrawing(rocket.id);
      return drawing && metres !== undefined
        ? [{ drawing, metres, rocket }]
        : [];
    })
    .sort((a, b) => a.metres - b.metres);

  const labels = measured.map(({ drawing, metres, rocket }) => {
    const { height } = rocket.dimensions;
    const scale = (metres * u) / drawing.heightM;
    return {
      approximate: height.qualifier === "approximate",
      converted: height.unit === "m" ? undefined : `${formatMetres(metres)} m`,
      drawing,
      halfWidth: (drawing.widthM * scale) / 2,
      id: rocket.id,
      metres,
      name: rocket.name,
      nameLines: splitName(rocket.name),
      recorded: `${formatRecorded(height.value)} ${height.unit}`,
      scale,
    };
  });

  const scaleSteps = Array.from(
    { length: SCALE_BAR_M / SCALE_TICK_M + 1 },
    (_, index) => index * SCALE_TICK_M,
  );

  if (layoutName === "level") {
    let top = LEVEL_TOP;
    const vehicles = labels.map((label) => {
      const axisY = top + NAME_ROOM + NAME_TO_OUTLINE + label.halfWidth;
      const dimensionY = axisY + label.halfWidth + OUTLINE_TO_DIMENSION;
      top = dimensionY + ROW_GAP;
      const x2 = BASE_X + label.metres * u;
      const k = label.scale;
      return {
        ...label,
        // Nose to the right: the drawing's y (nose 0, base at the bottom)
        // runs right to left from the nose, its x down the row.
        outline: `matrix(0 ${r(k)} ${r(-k)} 0 ${r(x2)} ${r(axisY - label.halfWidth)})`,
        x1: BASE_X,
        x2,
        y1: dimensionY,
        y2: dimensionY,
      };
    });
    const bottom = top - ROW_GAP + 6;
    const scaleY = bottom + 14;
    return {
      ground: { x1: BASE_X, x2: BASE_X, y1: LEVEL_TOP, y2: bottom },
      height: scaleY + 26,
      layout: layoutName,
      scale: scaleSteps.map((metres) => ({
        metres,
        x: BASE_X + metres * u,
        y: scaleY,
      })),
      vehicles,
      width: LEVEL_WIDTH,
    };
  }

  const { figureSize } = LINEUP_LAYOUTS.upright;
  const figureChars = Math.max(
    0,
    ...labels.map((label) =>
      Math.max(
        label.recorded.length + (label.approximate ? APPROX.length : 0),
        (label.converted ?? "").length,
      ),
    ),
  );
  const figureX = MARGIN + figureChars * MONO_ADVANCE * figureSize;
  const leaderX = figureX + FIGURE_TO_LEADER;
  const firstHalf = labels[0]?.halfWidth ?? 0;
  const firstX = leaderX + LEADER_TO_FIRST + firstHalf;
  const lastCentre =
    UPRIGHT_WIDTH -
    Math.max(UPRIGHT_RIGHT, (labels.at(-1)?.halfWidth ?? 0) + MARGIN);
  const pitch =
    labels.length > 1 ? (lastCentre - firstX) / (labels.length - 1) : 0;
  const tallest = labels.at(-1)?.metres ?? SCALE_BAR_M;
  const groundY = UPRIGHT_TOP + tallest * u;
  const vehicles = labels.map((label, index) => {
    const x = firstX + index * pitch;
    const topY = groundY - label.metres * u;
    return {
      ...label,
      outline: `translate(${r(x - label.halfWidth)} ${r(topY)}) scale(${r(label.scale)})`,
      x1: x,
      x2: x,
      y1: groundY,
      y2: topY,
    };
  });
  const width = UPRIGHT_WIDTH;
  const scaleY = groundY + GROUND_TO_SCALE;

  return {
    figureX,
    ground: { x1: leaderX, x2: width - MARGIN, y1: groundY, y2: groundY },
    height: scaleY + 6 + figureSize + 8,
    layout: layoutName,
    leaderX,
    scale: scaleSteps.map((metres) => ({
      metres,
      x: firstX - firstHalf + metres * u,
      y: scaleY,
    })),
    vehicles,
    width,
  };
}

/**
 * Whether a vehicle's figure is printed: only the first of a run of equal
 * heights, which share one extension line and one figure.
 */
export function printsFigure(
  vehicles: readonly LineupVehicle[],
  index: number,
) {
  const previous = vehicles[index - 1];
  return !previous || previous.metres !== vehicles[index]?.metres;
}

/**
 * Laid level, the figure sits beside the nose on the outline's axis, or
 * just above it when a second line (a conversion or qualifier) follows.
 */
function levelFigureY(
  vehicle: LineupVehicle,
  figureSize: number,
  hasNote: boolean,
) {
  const axisY = vehicle.y1 - OUTLINE_TO_DIMENSION - vehicle.halfWidth;
  return axisY + figureSize * 0.35 - (hasNote ? (figureSize + 3) / 2 : 0);
}

function lineupSummary(geometry: LineupGeometry) {
  return geometry.vehicles
    .map(
      (vehicle) =>
        `${vehicle.name} ${vehicle.approximate ? "about " : ""}${vehicle.recorded}`,
    )
    .join(", ");
}

interface LineupDrawingProps {
  className: string;
  layoutName: LineupLayoutName;
  rockets: readonly Rocket[];
}

/**
 * One layout of the lineup. Upright, each vehicle is its traced 1.5px
 * outline standing on the ground datum, and a 0.75px extension line
 * carries each nose to one column of figures at the left; vehicles of
 * equal height share one figure and one extension line. Laid level, each
 * outline lies nose right, with a 0.75px dimension line under it from the
 * base line, 1.5px oblique end ticks and the figure past the nose.
 * Strokes do not scale with the drawing.
 */
function LineupDrawing({ className, layoutName, rockets }: LineupDrawingProps) {
  const geometry = rocketLineupGeometry(rockets, layoutName);
  const { figureSize, nameSize } = LINEUP_LAYOUTS[layoutName];
  const isLevel = layoutName === "level";
  const titleId = `rocket-lineup-${layoutName}-title`;
  const descId = `rocket-lineup-${layoutName}-desc`;
  const [scaleStart] = geometry.scale;
  const scaleEnd = geometry.scale.at(-1);
  const leaderX = geometry.leaderX ?? 0;
  const figureX = geometry.figureX ?? 0;

  return (
    <svg
      aria-labelledby={`${titleId} ${descId}`}
      className={className}
      data-layout={layoutName}
      role="img"
      viewBox={`0 0 ${geometry.width} ${r(geometry.height)}`}
    >
      <title id={titleId}>Launch vehicle heights drawn to one scale</title>
      <desc
        id={descId}
      >{`Recorded heights: ${lineupSummary(geometry)}. Scale bar from 0 to ${SCALE_BAR_M} m.`}</desc>

      <g aria-hidden="true" className="stroke-ink-muted" fill="none">
        {/* Ground line (base line when laid level). */}
        <line
          strokeWidth={0.75}
          vectorEffect="non-scaling-stroke"
          {...geometry.ground}
        />
        {/* Metre scale bar, 0 to 50 m, ticked every 10 m. */}
        {scaleStart && scaleEnd ? (
          <>
            <line
              data-scale-bar=""
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
              x1={scaleStart.x}
              x2={scaleEnd.x}
              y1={scaleStart.y}
              y2={scaleEnd.y}
            />
            <path
              d={geometry.scale
                .map(
                  (tick) =>
                    `M${tick.x} ${tick.y}v-${
                      tick.metres === 0 || tick.metres === SCALE_BAR_M
                        ? SCALE_TICK_MAJOR
                        : SCALE_TICK_MINOR
                    }`,
                )
                .join("")}
              strokeWidth={0.75}
              vectorEffect="non-scaling-stroke"
            />
          </>
        ) : null}
      </g>

      {scaleStart && scaleEnd ? (
        <g
          aria-hidden="true"
          className="fill-ink-muted font-mono"
          fontSize={figureSize}
        >
          <text
            textAnchor="middle"
            x={scaleStart.x}
            y={scaleStart.y + 6 + figureSize * 0.8}
          >
            0
          </text>
          <text
            textAnchor="middle"
            x={scaleEnd.x}
            y={scaleEnd.y + 6 + figureSize * 0.8}
          >
            {SCALE_BAR_M}
          </text>
          <text
            x={scaleEnd.x + figureSize * 1.4}
            y={scaleEnd.y + 6 + figureSize * 0.8}
          >
            m
          </text>
        </g>
      ) : null}

      {geometry.vehicles.map((vehicle, index) => {
        // Laid level, the qualifier goes on a second line; upright it
        // follows the figure on the same line, so it never crowds the
        // figure below.
        const note =
          vehicle.converted ?? (vehicle.approximate ? "approx." : "");
        const inlineNote = vehicle.approximate && !vehicle.converted;
        const printed = printsFigure(geometry.vehicles, index);
        return (
          <g
            aria-hidden="true"
            data-metres={vehicle.metres}
            data-vehicle={vehicle.id}
            key={vehicle.id}
          >
            <g className="stroke-ink-muted" fill="none">
              <path
                d={vehicle.drawing.d}
                data-outline=""
                strokeLinejoin="round"
                strokeWidth={1.5}
                transform={vehicle.outline}
                vectorEffect="non-scaling-stroke"
              />
              {isLevel ? (
                <>
                  <line
                    data-dimension="height"
                    strokeWidth={0.75}
                    vectorEffect="non-scaling-stroke"
                    x1={vehicle.x1}
                    x2={vehicle.x2}
                    y1={vehicle.y1}
                    y2={vehicle.y2}
                  />
                  <path
                    d={obliqueTicks(
                      [
                        [vehicle.x1, vehicle.y1],
                        [vehicle.x2, vehicle.y2],
                      ],
                      3,
                    )}
                    strokeWidth={1.5}
                    vectorEffect="non-scaling-stroke"
                  />
                </>
              ) : printed ? (
                /* Carried left from just short of the nose to the figure
                   column, above every shorter outline. */
                <line
                  data-extension=""
                  strokeWidth={0.75}
                  vectorEffect="non-scaling-stroke"
                  x1={vehicle.x2 - EXT_GAP}
                  x2={leaderX}
                  y1={vehicle.y2}
                  y2={vehicle.y2}
                />
              ) : null}
            </g>

            {isLevel ? (
              <>
                <text
                  className="fill-ink font-mono"
                  fontSize={figureSize}
                  x={vehicle.x2 + 10}
                  y={r(levelFigureY(vehicle, figureSize, Boolean(note)))}
                >
                  <NumText size={figureSize} text={vehicle.recorded} />
                </text>
                {note ? (
                  <text
                    className="fill-ink-muted font-mono"
                    fontSize={figureSize}
                    x={vehicle.x2 + 10}
                    y={r(
                      levelFigureY(vehicle, figureSize, true) + figureSize + 3,
                    )}
                  >
                    <NumText size={figureSize} text={note} />
                  </text>
                ) : null}
                <text
                  className="fill-ink font-sans"
                  fontSize={nameSize}
                  fontWeight={500}
                  x={vehicle.x1 + 6}
                  y={r(
                    vehicle.y1 -
                      OUTLINE_TO_DIMENSION -
                      2 * vehicle.halfWidth -
                      NAME_TO_OUTLINE -
                      3,
                  )}
                >
                  {vehicle.name}
                </text>
              </>
            ) : (
              <>
                {printed ? (
                  <text
                    className="font-mono"
                    data-figure=""
                    fontSize={figureSize}
                    textAnchor="end"
                    x={r(figureX)}
                    y={r(vehicle.y2 + figureSize * 0.35)}
                  >
                    <tspan className="fill-ink">
                      <NumText size={figureSize} text={vehicle.recorded} />
                    </tspan>
                    {inlineNote ? (
                      <tspan className="fill-ink-muted">{APPROX}</tspan>
                    ) : note ? (
                      <tspan
                        className="fill-ink-muted"
                        x={r(figureX)}
                        y={r(vehicle.y2 + figureSize * 1.35 + 3)}
                      >
                        <NumText size={figureSize} text={note} />
                      </tspan>
                    ) : null}
                  </text>
                ) : null}
                <text
                  className="fill-ink font-sans"
                  fontSize={nameSize}
                  fontWeight={500}
                  textAnchor="middle"
                  x={r(vehicle.x1)}
                  y={r(vehicle.y1 + 22)}
                >
                  {vehicle.nameLines.map((line, lineIndex) => (
                    <tspan
                      dy={lineIndex === 0 ? 0 : 16}
                      key={line}
                      x={r(vehicle.x1)}
                    >
                      {line}
                    </tspan>
                  ))}
                </text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

interface RocketHeightLineupProps {
  className?: string;
  /** Figure number for the caption, for example "2". */
  figureNumber?: string;
  rockets: readonly Rocket[];
}

/**
 * The launch vehicles to one scale (spec 8): each traced outline scaled to
 * its recorded height on a common ground, with a metre scale bar.
 * Linework in the muted ink, figures in B612 Mono, no fills. Below 64rem
 * the lineup is laid on its side. A record with no usable height or no
 * outline is left out and named in the caption, and every outline's
 * source is credited there.
 */
export function RocketHeightLineup({
  className,
  figureNumber,
  rockets,
}: RocketHeightLineupProps) {
  const geometry = rocketLineupGeometry(rockets);
  const drawn = new Set(geometry.vehicles.map((vehicle) => vehicle.id));
  const omitted = rockets.filter((rocket) => !drawn.has(rocket.id));
  const unmeasured = omitted.filter(
    (rocket) => recordedMetres(rocket) === undefined,
  );
  const undrawn = omitted.filter((rocket) => !unmeasured.includes(rocket));
  const names = (items: readonly Rocket[]) =>
    items.map((rocket) => rocket.name).join(", ");

  return (
    <ScaleFigure
      caption={
        <>
          Each launch vehicle at its recorded height, all to one scale. The
          records give no diameter, so widths follow the source drawings at the
          same scale.
          {unmeasured.length > 0
            ? ` Not drawn, no height recorded: ${names(unmeasured)}.`
            : ""}
          {undrawn.length > 0
            ? ` Not drawn, no outline yet: ${names(undrawn)}.`
            : ""}{" "}
          <DrawingSourceNote vehicles={geometry.vehicles} />
        </>
      }
      className={className}
      figureNumber={figureNumber}
    >
      <LineupDrawing
        className="block h-auto w-full max-w-[26rem] lg:hidden"
        layoutName="level"
        rockets={rockets}
      />
      <LineupDrawing
        className="hidden h-auto w-full lg:block"
        layoutName="upright"
        rockets={rockets}
      />
    </ScaleFigure>
  );
}
