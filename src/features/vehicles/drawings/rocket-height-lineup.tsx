import type { Rocket } from "@/features/vehicles/types";

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
 * `upright` (from 64rem): the vehicles stand side by side on one ground
 * datum as outlined bars of one nominal width, spread across the full
 * content width, each top carried left by an extension line to a shared
 * column of figures, with the scale bar laid flat under the ground.
 * `level` (below 64rem): the same lineup laid on its side, one vehicle to
 * a row from a common base line, so five heights and their names fit a
 * phone without scrolling. Text sizes are chosen so figures render at
 * 11px or more at every width each layout is shown at (`level` is never
 * drawn narrower than 288px, `upright` never narrower than 960px).
 */
export const LINEUP_LAYOUTS = {
  level: { figureSize: 12.5, nameSize: 13, unitsPerMetre: 1.7 },
  upright: { figureSize: 12, nameSize: 13, unitsPerMetre: 3.2 },
} as const;

export type LineupLayoutName = keyof typeof LINEUP_LAYOUTS;

/** The metre scale bar: its length and tick step (spec 8). */
export const SCALE_BAR_M = 50;
const SCALE_TICK_M = 10;

/* Upright layout. */
/** The upright drawing's width; the vehicles spread across it. */
const UPRIGHT_WIDTH = 1000;
/**
 * The nominal width of every bar. The records give no diameter, so the
 * width is not to scale (said in the caption).
 */
export const BAR_WIDTH = 36;
const UPRIGHT_TOP = 14;
const MARGIN = 8;
/** From the figure column's right edge to where the extension lines end. */
const FIGURE_TO_LEADER = 6;
/** From the end of the extension lines to the first bar's left edge. */
const LEADER_TO_FIRST = 40;
/** Room right of the last bar, for its two-line name. */
const UPRIGHT_RIGHT = 60;
/** The gap between a bar's left edge and its extension line. */
const EXT_GAP = 3;
/** From the ground to the scale bar, under the two-line names. */
const GROUND_TO_SCALE = 62;
/** Rough advance of B612 Mono, as a share of the size. */
const MONO_ADVANCE = 0.6;

/* Level layout. */
const LEVEL_WIDTH = 300;
const BASE_X = 10;
const ROW_PITCH = 50;
const LEVEL_TOP = 4;

/** The qualifier set after an approximate height, on the same line. */
const APPROX = " approx.";
/** Scale bar tick heights: the labelled ends, and the steps between. */
const SCALE_TICK_MAJOR = 7;
const SCALE_TICK_MINOR = 3.5;

/** Half-length of the extension line across the top of each height. */
const EXT_HALF = 10;

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
  /**
   * The height's dimension line, from the ground (x1, y1) to the top
   * (x2, y2). Upright: vertical. Level: horizontal.
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

/**
 * The lineup's geometry, built only from `dimensions.height` in each
 * record, converted to metres: every vehicle stands on one ground line at
 * one scale, shortest first. The height is the only dimension drawn; no
 * diameter is recorded, so none is drawn.
 */
export function rocketLineupGeometry(
  rockets: readonly Rocket[],
  layoutName: LineupLayoutName = "upright",
): LineupGeometry {
  const u = LINEUP_LAYOUTS[layoutName].unitsPerMetre;
  const measured = rockets
    .map((rocket) => ({ metres: toMetres(rocket.dimensions.height), rocket }))
    .filter(({ metres }) => Number.isFinite(metres) && metres > 0)
    .sort((a, b) => a.metres - b.metres);

  const labels = measured.map(({ metres, rocket }) => {
    const { height } = rocket.dimensions;
    return {
      approximate: height.qualifier === "approximate",
      converted: height.unit === "m" ? undefined : `${formatMetres(metres)} m`,
      id: rocket.id,
      metres,
      name: rocket.name,
      nameLines: splitName(rocket.name),
      recorded: `${formatRecorded(height.value)} ${height.unit}`,
    };
  });

  const scaleSteps = Array.from(
    { length: SCALE_BAR_M / SCALE_TICK_M + 1 },
    (_, index) => index * SCALE_TICK_M,
  );

  if (layoutName === "level") {
    const vehicles = labels.map((label, index) => {
      const y = LEVEL_TOP + index * ROW_PITCH + 30;
      return {
        ...label,
        x1: BASE_X,
        x2: BASE_X + label.metres * u,
        y1: y,
        y2: y,
      };
    });
    const bottom = LEVEL_TOP + vehicles.length * ROW_PITCH;
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
  const firstX = leaderX + LEADER_TO_FIRST + BAR_WIDTH / 2;
  const lastCentre = UPRIGHT_WIDTH - UPRIGHT_RIGHT - BAR_WIDTH / 2;
  const pitch =
    labels.length > 1 ? (lastCentre - firstX) / (labels.length - 1) : 0;
  const tallest = labels.at(-1)?.metres ?? SCALE_BAR_M;
  const groundY = UPRIGHT_TOP + tallest * u;
  const vehicles = labels.map((label, index) => {
    const x = firstX + index * pitch;
    return {
      ...label,
      x1: x,
      x2: x,
      y1: groundY,
      y2: groundY - label.metres * u,
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
      x: firstX - BAR_WIDTH / 2 + metres * u,
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
function printsFigure(vehicles: readonly LineupVehicle[], index: number) {
  const previous = vehicles[index - 1];
  return !previous || previous.metres !== vehicles[index]?.metres;
}

/**
 * An upright bar: the outline of a vehicle's recorded height at the
 * nominal width, open at the ground line, which closes it.
 */
function barPath(vehicle: Pick<LineupVehicle, "x1" | "y1" | "y2">) {
  const left = vehicle.x1 - BAR_WIDTH / 2;
  const right = vehicle.x1 + BAR_WIDTH / 2;
  return `M${left} ${vehicle.y1}V${vehicle.y2}H${right}V${vehicle.y1}`;
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
 * One layout of the lineup. Upright, each height is a 1.5px bar outline
 * of one nominal width standing on the ground datum, and a 0.75px
 * extension line carries each top to one column of figures at the left;
 * vehicles of equal height share one figure. Laid level, each height is a
 * 0.75px dimension line from the base line with 1.5px oblique end ticks,
 * and each figure sits at its line's end. Strokes do not scale with the
 * drawing.
 */
function LineupDrawing({ className, layoutName, rockets }: LineupDrawingProps) {
  const geometry = rocketLineupGeometry(rockets, layoutName);
  const { figureSize, nameSize } = LINEUP_LAYOUTS[layoutName];
  const isLevel = layoutName === "level";
  const titleId = `rocket-lineup-${layoutName}-title`;
  const descId = `rocket-lineup-${layoutName}-desc`;
  const [scaleStart] = geometry.scale;
  const scaleEnd = geometry.scale.at(-1);

  return (
    <svg
      aria-labelledby={`${titleId} ${descId}`}
      className={className}
      data-layout={layoutName}
      role="img"
      viewBox={`0 0 ${geometry.width} ${geometry.height}`}
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
        const leaderX = geometry.leaderX ?? 0;
        const figureX = geometry.figureX ?? 0;
        return (
          <g
            aria-hidden="true"
            data-metres={vehicle.metres}
            data-vehicle={vehicle.id}
            key={vehicle.id}
          >
            <g className="stroke-ink-muted" fill="none">
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
                    d={obliqueTicks([
                      [vehicle.x1, vehicle.y1],
                      [vehicle.x2, vehicle.y2],
                    ])}
                    strokeWidth={1.5}
                    vectorEffect="non-scaling-stroke"
                  />
                </>
              ) : (
                <path
                  d={barPath(vehicle)}
                  data-dimension="height"
                  strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke"
                />
              )}
              {/* Extension line at the top: across the end when laid
                  level; upright, carried left from the bar's top-left
                  corner to the figure column, above every shorter bar. */}
              <line
                data-extension=""
                strokeWidth={0.75}
                vectorEffect="non-scaling-stroke"
                {...(isLevel
                  ? {
                      x1: vehicle.x2,
                      x2: vehicle.x2,
                      y1: vehicle.y2 - EXT_HALF,
                      y2: vehicle.y2 + EXT_HALF,
                    }
                  : {
                      x1: vehicle.x2 - BAR_WIDTH / 2 - EXT_GAP,
                      x2: leaderX,
                      y1: vehicle.y2,
                      y2: vehicle.y2,
                    })}
              />
            </g>

            {isLevel ? (
              <>
                <text
                  className="fill-ink font-mono"
                  fontSize={figureSize}
                  x={vehicle.x2 + 10}
                  y={vehicle.y2 + figureSize * 0.35}
                >
                  <NumText size={figureSize} text={vehicle.recorded} />
                </text>
                {note ? (
                  <text
                    className="fill-ink-muted font-mono"
                    fontSize={figureSize}
                    x={vehicle.x2 + 10}
                    y={vehicle.y2 + figureSize * 0.35 + figureSize + 3}
                  >
                    <NumText size={figureSize} text={note} />
                  </text>
                ) : null}
                <text
                  className="fill-ink font-sans"
                  fontSize={nameSize}
                  fontWeight={500}
                  x={vehicle.x1 + 8}
                  y={vehicle.y1 - 12}
                >
                  {vehicle.name}
                </text>
              </>
            ) : (
              <>
                {printsFigure(geometry.vehicles, index) ? (
                  <text
                    className="font-mono"
                    data-figure=""
                    fontSize={figureSize}
                    textAnchor="end"
                    x={figureX}
                    y={vehicle.y2 + figureSize * 0.35}
                  >
                    <tspan className="fill-ink">
                      <NumText size={figureSize} text={vehicle.recorded} />
                    </tspan>
                    {inlineNote ? (
                      <tspan className="fill-ink-muted">{APPROX}</tspan>
                    ) : note ? (
                      <tspan
                        className="fill-ink-muted"
                        x={figureX}
                        y={vehicle.y2 + figureSize * 1.35 + 3}
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
                  x={vehicle.x1}
                  y={vehicle.y1 + 22}
                >
                  {vehicle.nameLines.map((line, lineIndex) => (
                    <tspan
                      dy={lineIndex === 0 ? 0 : 15}
                      key={line}
                      x={vehicle.x1}
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
 * The launch vehicles to one scale (spec 8): each recorded height drawn as
 * a labelled bar on a common ground, with a metre scale bar. Linework in
 * the muted ink, figures in B612 Mono, no fills. Below 64rem the lineup is
 * laid on its side. A record with no usable height is left out and named
 * in the caption.
 */
export function RocketHeightLineup({
  className,
  figureNumber,
  rockets,
}: RocketHeightLineupProps) {
  const drawn = new Set(
    rocketLineupGeometry(rockets).vehicles.map((vehicle) => vehicle.id),
  );
  const omitted = rockets.filter((rocket) => !drawn.has(rocket.id));

  return (
    <ScaleFigure
      caption={
        <>
          Recorded height of each launch vehicle, to one scale. Width not to
          scale: the records give no diameter, so every vehicle is drawn at one
          nominal width.
          {omitted.length > 0
            ? ` Not drawn, no height recorded: ${omitted.map((rocket) => rocket.name).join(", ")}.`
            : ""}
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
