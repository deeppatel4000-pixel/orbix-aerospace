import type { Aircraft, DistanceMeasurement } from "@/features/vehicles/types";

import { ScaleFigure } from "./scale-figure";
import {
  formatMetres,
  formatRecorded,
  obliqueTicks,
  splitName,
  toMetres,
} from "./units";

/**
 * The two layouts of the drawing. Each is one scale for every aircraft in
 * it; the aircraft are packed into rows, smallest span first, as many to a
 * row as fit the width. `narrow` is set below 40rem, `standard` from
 * 40rem. The viewBox width and the text sizes are chosen so that the
 * figures render at 11px or more at every width each layout is shown at
 * (`narrow` is never drawn narrower than 288px, `standard` never narrower
 * than 592px).
 */
export const COMPARISON_LAYOUTS = {
  narrow: { figureSize: 12.5, nameSize: 13, unitsPerMetre: 4.2, width: 300 },
  standard: { figureSize: 13, nameSize: 14, unitsPerMetre: 6.5, width: 690 },
} as const;

export type ComparisonLayoutName = keyof typeof COMPARISON_LAYOUTS;

/** Where the span line crosses the centreline, as a fraction of the length from the nose. */
export const SPAN_LINE_AT = 0.6;

/** The scale bar's length, its tick step and its labelled step, in metres. */
const SCALE_BAR_M = 20;
const SCALE_TICK_M = 5;
const SCALE_LABEL_M = 10;

const MARGIN_X = 8;
const MARGIN_TOP = 6;
/** Gap between the end of a line and its label. */
const LABEL_GAP = 8;
/** Space between two aircraft in a row. */
const GAP = 20;
const ROW_GAP = 22;
const NAME_GAP = 10;

function lineHeight(size: number) {
  return size + 2;
}

/** Room right of the right wingtip for the span label ("55.6 ft", 7 characters of mono). */
function spanLabelZone(figureSize: number) {
  return LABEL_GAP + 7 * 0.6 * figureSize + 2;
}

/** Room above the nose for the two-line length label. */
function lengthLabelZone(figureSize: number) {
  return LABEL_GAP + lineHeight(figureSize) + figureSize * 0.8 + 2;
}

function nameZone(nameSize: number) {
  return NAME_GAP + 2 * lineHeight(nameSize) + 2;
}

export interface ComparisonAircraft {
  readonly id: string;
  readonly name: string;
  readonly nameLines: readonly string[];
  readonly lengthM: number;
  readonly wingspanM: number;
  /** "69 ft" as recorded, and "21.0 m" (empty when recorded in metres). */
  readonly lengthLabel: readonly [string, string];
  readonly wingspanLabel: readonly [string, string];
  /** Left edge of the entry: the left wingtip, where the name starts. */
  readonly left: number;
  /** Right edge of the entry, past the span label. */
  readonly right: number;
  /** The centreline's x, and its nose and tail y. */
  readonly centreX: number;
  readonly noseY: number;
  readonly tailY: number;
  /** The span line: its y and its wingtip x values. */
  readonly spanY: number;
  readonly spanLeft: number;
  readonly spanRight: number;
}

export interface ComparisonGeometry {
  readonly aircraft: readonly ComparisonAircraft[];
  readonly height: number;
  readonly layout: (typeof COMPARISON_LAYOUTS)[ComparisonLayoutName];
  readonly scaleBar: {
    readonly ticks: readonly {
      readonly labelled: boolean;
      readonly metres: number;
      readonly x: number;
    }[];
    readonly y: number;
  };
  readonly width: number;
}

function dimensionLabels(measurement: DistanceMeasurement, metres: number) {
  return [
    `${formatRecorded(measurement.value)} ${measurement.unit}`,
    measurement.unit === "m" ? "" : `${formatMetres(metres)} m`,
  ] as const;
}

/**
 * The drawing's geometry, built only from `dimensions.length` and
 * `dimensions.wingspan` in each record, converted to metres. Each aircraft
 * is drawn from above, nose up, as a dimension cross: a centreline as long
 * as the recorded length and a span line as wide as the recorded wingspan,
 * crossing at `SPAN_LINE_AT` of the length for every aircraft. Nothing
 * else about the shape is recorded, so no outline is drawn. Smallest
 * wingspan first; tails level within a row.
 */
export function aircraftComparisonGeometry(
  aircraft: readonly Aircraft[],
  layoutName: ComparisonLayoutName = "standard",
): ComparisonGeometry {
  const layout = COMPARISON_LAYOUTS[layoutName];
  const u = layout.unitsPerMetre;
  const zone = spanLabelZone(layout.figureSize);
  const available = layout.width - 2 * MARGIN_X;

  const measured = aircraft
    .map((item) => ({
      item,
      lengthM: toMetres(item.dimensions.length),
      wingspanM: toMetres(item.dimensions.wingspan),
    }))
    .filter(
      ({ lengthM, wingspanM }) =>
        Number.isFinite(lengthM) &&
        lengthM > 0 &&
        Number.isFinite(wingspanM) &&
        wingspanM > 0,
    )
    .sort((a, b) => a.wingspanM - b.wingspanM);

  // Pack into rows, in order, as many to a row as fit.
  const rows: (typeof measured)[] = [];
  let rowWidth = 0;
  for (const entry of measured) {
    const entryWidth = entry.wingspanM * u + zone;
    const current = rows.at(-1);
    if (current && rowWidth + GAP + entryWidth <= available) {
      current.push(entry);
      rowWidth += GAP + entryWidth;
    } else {
      rows.push([entry]);
      rowWidth = entryWidth;
    }
  }

  const placed: ComparisonAircraft[] = [];
  let top = MARGIN_TOP;
  for (const row of rows) {
    const longest = Math.max(...row.map(({ lengthM }) => lengthM));
    const tailY = top + lengthLabelZone(layout.figureSize) + longest * u;
    let cursor = MARGIN_X;
    for (const { item, lengthM, wingspanM } of row) {
      const span = wingspanM * u;
      const spanLeft = cursor;
      const noseY = tailY - lengthM * u;
      placed.push({
        centreX: spanLeft + span / 2,
        id: item.id,
        left: cursor,
        lengthLabel: dimensionLabels(item.dimensions.length, lengthM),
        lengthM,
        name: item.name,
        nameLines: splitName(item.name),
        noseY,
        right: spanLeft + span + zone,
        spanLeft,
        spanRight: spanLeft + span,
        spanY: noseY + SPAN_LINE_AT * lengthM * u,
        tailY,
        wingspanLabel: dimensionLabels(item.dimensions.wingspan, wingspanM),
        wingspanM,
      });
      cursor = spanLeft + span + zone + GAP;
    }
    top = tailY + nameZone(layout.nameSize) + ROW_GAP;
  }

  const scaleY = top + 4;
  const scaleX = MARGIN_X + 4;

  return {
    aircraft: placed,
    height: scaleY + 10 + layout.figureSize + 6,
    layout,
    scaleBar: {
      ticks: Array.from(
        { length: SCALE_BAR_M / SCALE_TICK_M + 1 },
        (_, index) => {
          const metres = index * SCALE_TICK_M;
          return {
            labelled: metres % SCALE_LABEL_M === 0,
            metres,
            x: scaleX + metres * u,
          };
        },
      ),
      y: scaleY,
    },
    width: layout.width,
  };
}

interface ComparisonDrawingProps {
  aircraft: readonly Aircraft[];
  className: string;
  layoutName: ComparisonLayoutName;
}

/**
 * One layout of the drawing. The centreline and span line are 1.5px, each
 * a dimension line in its own right with a 0.75px oblique tick at both
 * ends; the length is labelled at the nose, the span at the right
 * wingtip. Strokes do not scale with the drawing.
 */
function ComparisonDrawing({
  aircraft,
  className,
  layoutName,
}: ComparisonDrawingProps) {
  const geometry = aircraftComparisonGeometry(aircraft, layoutName);
  const { figureSize, nameSize } = geometry.layout;
  const lh = lineHeight(figureSize);
  const titleId = `aircraft-comparison-${layoutName}-title`;
  const descId = `aircraft-comparison-${layoutName}-desc`;
  const summary = geometry.aircraft
    .map(
      (item) =>
        `${item.name}: length ${item.lengthLabel.filter(Boolean).join(", ")}; wingspan ${item.wingspanLabel.filter(Boolean).join(", ")}`,
    )
    .join(". ");
  const [firstTick] = geometry.scaleBar.ticks;
  const lastTick = geometry.scaleBar.ticks.at(-1);

  return (
    <svg
      aria-labelledby={`${titleId} ${descId}`}
      className={className}
      data-layout={layoutName}
      role="img"
      viewBox={`0 0 ${geometry.width} ${geometry.height}`}
    >
      <title id={titleId}>
        Aircraft length and wingspan drawn to one scale
      </title>
      <desc id={descId}>{`${summary}.`}</desc>

      {geometry.aircraft.map((item) => {
        const spanLabelX = item.spanRight + LABEL_GAP;
        return (
          <g
            aria-hidden="true"
            data-length-m={item.lengthM}
            data-vehicle={item.id}
            data-wingspan-m={item.wingspanM}
            key={item.id}
          >
            <g className="stroke-ink-muted" fill="none" strokeLinecap="butt">
              {/* The length along the centreline, the span across it; each
                  is its own dimension line, with an oblique tick at each end. */}
              <line
                data-dimension="length"
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
                x1={item.centreX}
                x2={item.centreX}
                y1={item.noseY}
                y2={item.tailY}
              />
              <line
                data-dimension="span"
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
                x1={item.spanLeft}
                x2={item.spanRight}
                y1={item.spanY}
                y2={item.spanY}
              />
              <path
                d={obliqueTicks([
                  [item.centreX, item.noseY],
                  [item.centreX, item.tailY],
                  [item.spanLeft, item.spanY],
                  [item.spanRight, item.spanY],
                ])}
                strokeWidth={0.75}
                vectorEffect="non-scaling-stroke"
              />
            </g>

            {/* Length at the nose end of the centreline. */}
            <text
              className="font-mono"
              fontSize={figureSize}
              textAnchor="middle"
              x={item.centreX}
              y={item.noseY - LABEL_GAP - (item.lengthLabel[1] ? lh : 0)}
            >
              <tspan className="fill-ink">{item.lengthLabel[0]}</tspan>
              {item.lengthLabel[1] ? (
                <tspan className="fill-ink-muted" dy={lh} x={item.centreX}>
                  {item.lengthLabel[1]}
                </tspan>
              ) : null}
            </text>
            {/* Span at the right wingtip end of the span line: recorded
                figure above the line, metres below it. */}
            <text className="font-mono" fontSize={figureSize}>
              <tspan className="fill-ink" x={spanLabelX} y={item.spanY - 5}>
                {item.wingspanLabel[0]}
              </tspan>
              {item.wingspanLabel[1] ? (
                <tspan
                  className="fill-ink-muted"
                  x={spanLabelX}
                  y={item.spanY + 5 + figureSize * 0.75}
                >
                  {item.wingspanLabel[1]}
                </tspan>
              ) : null}
            </text>

            <text
              className="fill-ink font-sans"
              fontSize={nameSize}
              fontWeight={500}
              x={item.left}
              y={item.tailY + NAME_GAP + nameSize * 0.8}
            >
              {item.nameLines.map((line, index) => (
                <tspan
                  dy={index === 0 ? 0 : lineHeight(nameSize)}
                  key={line}
                  x={item.left}
                >
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        );
      })}

      {/* Metre scale bar. */}
      {firstTick && lastTick ? (
        <g aria-hidden="true">
          <g className="stroke-ink-muted" fill="none">
            <line
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
              x1={firstTick.x}
              x2={lastTick.x}
              y1={geometry.scaleBar.y}
              y2={geometry.scaleBar.y}
            />
            {geometry.scaleBar.ticks.map((tick) => (
              <line
                key={tick.metres}
                strokeWidth={0.75}
                vectorEffect="non-scaling-stroke"
                x1={tick.x}
                x2={tick.x}
                y1={geometry.scaleBar.y - (tick.labelled ? 5 : 3)}
                y2={geometry.scaleBar.y}
              />
            ))}
          </g>
          {geometry.scaleBar.ticks
            .filter((tick) => tick.labelled)
            .map((tick) => (
              <text
                className="fill-ink-muted font-mono"
                fontSize={figureSize}
                key={tick.metres}
                textAnchor="middle"
                x={tick.x}
                y={geometry.scaleBar.y + 8 + figureSize * 0.8}
              >
                {tick.metres}
              </text>
            ))}
          <text
            className="fill-ink-muted font-mono"
            fontSize={figureSize}
            x={lastTick.x + figureSize}
            y={geometry.scaleBar.y + 8 + figureSize * 0.8}
          >
            m
          </text>
        </g>
      ) : null}
    </svg>
  );
}

interface AircraftSizeComparisonProps {
  aircraft: readonly Aircraft[];
  className?: string;
  figureNumber?: string;
}

/**
 * The aircraft to one scale (spec 8): each recorded length and wingspan as
 * a dimension cross seen from above, labelled at its ends, with a metre
 * scale bar. Linework in the muted ink, figures in B612 Mono, no fills.
 * Below 40rem the same drawing is set in more rows at a smaller scale. An
 * aircraft missing either dimension is left out and named in the caption.
 */
export function AircraftSizeComparison({
  aircraft,
  className,
  figureNumber,
}: AircraftSizeComparisonProps) {
  const drawn = new Set(
    aircraftComparisonGeometry(aircraft).aircraft.map((item) => item.id),
  );
  const omitted = aircraft.filter((item) => !drawn.has(item.id));

  return (
    <ScaleFigure
      caption={
        <>
          Length and wingspan of each aircraft to one scale, seen from above
          with the nose up, from the figures in its record, converted from feet
          to metres at 0.3048 m per foot. Each aircraft is its centreline and
          span line, not its outline; the span line crosses three fifths of the
          way back from the nose on every aircraft, not where the wing sits.
          {omitted.length > 0
            ? ` Not drawn, a dimension is missing: ${omitted.map((item) => item.name).join(", ")}.`
            : ""}
        </>
      }
      className={className}
      figureNumber={figureNumber}
    >
      <ComparisonDrawing
        aircraft={aircraft}
        className="block h-auto w-full max-w-[26rem] sm:hidden"
        layoutName="narrow"
      />
      <ComparisonDrawing
        aircraft={aircraft}
        className="hidden h-auto w-full max-w-[42rem] sm:block"
        layoutName="standard"
      />
    </ScaleFigure>
  );
}
