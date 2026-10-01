import { formatFigure } from "@/components/ui/readout";
import {
  getVehicleDrawing,
  type VehicleDrawing,
} from "@/features/vehicles/data/gallery-drawings";
import type { Aircraft, DistanceMeasurement } from "@/features/vehicles/types";

import { DrawingSourceNote } from "./drawing-credits";
import { ScaleFigure } from "./scale-figure";
import { formatMetres, formatRecorded, obliqueTicks, toMetres } from "./units";

/** Space around each plan's drawing, in metres. */
const PLAN_PAD_M = 1;
/**
 * From each plan to its dimension lines, in metres: the span line runs
 * this far above the nose, the length line this far right of the right
 * wingtip.
 */
const DIM_OFFSET_M = 2.5;
/** The gap between the outline and an extension line, and the overshoot. */
const EXT_GAP_M = 0.6;
/** Half-length of a dimension line's oblique end tick, in metres. */
const TICK_M = 0.8;
/**
 * Where the nose sits, in metres from the top of every plan's drawing:
 * the same for every plan, so the noses along a row are level.
 */
export const NOSE_Y_M = PLAN_PAD_M + DIM_OFFSET_M;

/** The scale bar's length, tick step and labelled step, in metres. */
export const SCALE_BAR_M = 20;
const SCALE_TICK_M = 5;
const SCALE_LABEL_M = 10;

/**
 * The shared scale, as CSS lengths per metre at each width. Every plan and
 * the scale bar are sized from `--plan-u`, so all of them use one scale at
 * any width. The plans wrap in rows, smallest wingspan first: on a phone
 * two to a row at 4.5px per metre (3.75px below 22.5rem, so two fit the
 * 288px column at 320px), with the B-2 alone on the last row; from 40rem
 * at 5px; from 64rem the four fighters share the first row at 8px per
 * metre (9px from 80rem), with the B-2 on its own row under them.
 */
const SCALE_CLASSES =
  "[--plan-u:3.75px] min-[22.5rem]:[--plan-u:4.5px] sm:[--plan-u:5px] lg:[--plan-u:8px] xl:[--plan-u:9px]" as const;

/** Room above each plan for the span label, and the gap before the length label. */
const SPAN_LABEL_ROOM = "2.5rem";
const LENGTH_LABEL_GAP = "0.5rem";

export interface PlanAircraft {
  readonly id: string;
  readonly name: string;
  readonly lengthM: number;
  readonly wingspanM: number;
  /** "107.4 ft" as recorded, and "32.7 m" (empty when recorded in metres). */
  readonly lengthLabel: readonly [string, string];
  readonly wingspanLabel: readonly [string, string];
  /** The traced top-view outline, scaled to the recorded dimensions. */
  readonly drawing: VehicleDrawing;
}

function dimensionLabels(measurement: DistanceMeasurement, metres: number) {
  return [
    `${formatRecorded(measurement.value)} ${measurement.unit}`,
    measurement.unit === "m" ? "" : `${formatMetres(metres)} m`,
  ] as const;
}

/** Both recorded dimensions are present and positive. */
function isMeasured(lengthM: number, wingspanM: number) {
  return (
    Number.isFinite(lengthM) &&
    lengthM > 0 &&
    Number.isFinite(wingspanM) &&
    wingspanM > 0
  );
}

/**
 * The aircraft that can be drawn, built from `dimensions.length` and
 * `dimensions.wingspan` in each record, converted to metres, and the
 * vehicle's traced top-view outline, smallest wingspan first. A record
 * missing either dimension or an outline is left out.
 */
export function aircraftPlans(
  aircraft: readonly Aircraft[],
): readonly PlanAircraft[] {
  return aircraft
    .flatMap((item) => {
      const lengthM = toMetres(item.dimensions.length);
      const wingspanM = toMetres(item.dimensions.wingspan);
      const drawing = getVehicleDrawing(item.id);
      if (!drawing || !isMeasured(lengthM, wingspanM)) return [];
      return [
        {
          drawing,
          id: item.id,
          lengthLabel: dimensionLabels(item.dimensions.length, lengthM),
          lengthM,
          name: item.name,
          wingspanLabel: dimensionLabels(item.dimensions.wingspan, wingspanM),
          wingspanM,
        },
      ];
    })
    .sort((a, b) => a.wingspanM - b.wingspanM);
}

/**
 * The transform that places a traced outline on its plan: nose at
 * `NOSE_Y_M`, left wingtip at x = 0, stretched so its box is exactly the
 * recorded wingspan by the recorded length (the traced box already matches
 * them to within a millimetre).
 */
export function outlineTransform(
  item: Pick<PlanAircraft, "drawing" | "lengthM" | "wingspanM">,
) {
  const sx = item.wingspanM / item.drawing.widthM;
  const sy = item.lengthM / item.drawing.heightM;
  return `translate(0 ${NOSE_Y_M}) scale(${round6(sx)} ${round6(sy)})`;
}

function round6(value: number) {
  return Math.round(value * 1e6) / 1e6;
}

/**
 * One plan's drawing box in metres: the plan, its two dimension lines and
 * padding. The plan's left wingtip is at x = 0, so the box starts at `x`
 * (negative).
 */
export function planViewBox(item: Pick<PlanAircraft, "lengthM" | "wingspanM">) {
  return {
    height: NOSE_Y_M + item.lengthM + PLAN_PAD_M,
    width: PLAN_PAD_M + item.wingspanM + DIM_OFFSET_M + PLAN_PAD_M,
    x: -PLAN_PAD_M,
  };
}

/** A CSS length: `metres` at the shared scale. */
function atScale(metres: number) {
  return `calc(var(--plan-u) * ${Math.round(metres * 1000) / 1000})`;
}

/** Dimension, extension and scale-bar tick lines. */
const thin = {
  strokeWidth: 0.75,
  vectorEffect: "non-scaling-stroke",
} as const;

/** The plan outline, the dimension end ticks and the scale bar. */
const object = {
  strokeWidth: 1.5,
  vectorEffect: "non-scaling-stroke",
} as const;

/**
 * One aircraft seen from above, nose up: its traced outline as a closed
 * 1.5px line, scaled to the recorded length and wingspan. A 0.75px span
 * dimension line runs above the plan and a length dimension line to its
 * right, each with extension lines and oblique end ticks, labelled in
 * B612 Mono. The labels are HTML, so they set at one size whatever the
 * plan's scale.
 */
function Plan({ item }: { item: PlanAircraft }) {
  const box = planViewBox(item);
  // The span's ends (the wingtips, at the outline's widest point) and the
  // length's ends (nose and tail on the centreline) for the dimension and
  // extension lines.
  const tipY = NOSE_Y_M + item.lengthM * widestStation(item.drawing);
  const left = [0, tipY] as const;
  const right = [item.wingspanM, tipY] as const;
  const nose = [item.wingspanM / 2, NOSE_Y_M] as const;
  const tail = [item.wingspanM / 2, NOSE_Y_M + item.lengthM] as const;
  const spanY = PLAN_PAD_M;
  const lengthX = item.wingspanM + DIM_OFFSET_M;
  const extTop = spanY - EXT_GAP_M;
  const extRight = lengthX + EXT_GAP_M;

  return (
    <div
      aria-hidden="true"
      className="relative"
      style={{
        paddingRight: `calc(${LENGTH_LABEL_GAP} + 3.25rem)`,
        paddingTop: SPAN_LABEL_ROOM,
      }}
    >
      <span
        className="absolute top-0 -translate-x-1/2 text-center font-mono text-[0.8125rem] leading-[1.1rem] tabular-nums"
        data-label="span"
        style={{ left: atScale(PLAN_PAD_M + item.wingspanM / 2) }}
      >
        <FigureLines label={item.wingspanLabel} />
      </span>
      <svg
        className="block h-auto overflow-visible"
        data-plan=""
        style={{ width: atScale(box.width) }}
        viewBox={`${box.x} 0 ${box.width} ${box.height}`}
      >
        <g className="stroke-ink-muted" fill="none" strokeLinecap="butt">
          <path
            {...object}
            d={item.drawing.d}
            data-outline=""
            strokeLinejoin="round"
            transform={outlineTransform(item)}
          />
          {/* Span: extension lines up from both wingtips, past the
              dimension line above the nose. */}
          <path
            {...thin}
            d={`M${left[0]} ${left[1] - EXT_GAP_M}V${extTop}M${right[0]} ${right[1] - EXT_GAP_M}V${extTop}`}
          />
          <line
            {...thin}
            data-dimension="span"
            x1={left[0]}
            x2={right[0]}
            y1={spanY}
            y2={spanY}
          />
          {/* Length: extension lines right from the nose and the tail,
              past the dimension line beside the plan. */}
          <path
            {...thin}
            d={`M${nose[0] + EXT_GAP_M} ${nose[1]}H${extRight}M${tail[0] + EXT_GAP_M} ${tail[1]}H${extRight}`}
          />
          <line
            {...thin}
            data-dimension="length"
            x1={lengthX}
            x2={lengthX}
            y1={nose[1]}
            y2={tail[1]}
          />
          <path
            {...object}
            d={obliqueTicks(
              [
                [left[0], spanY],
                [right[0], spanY],
                [lengthX, nose[1]],
                [lengthX, tail[1]],
              ],
              TICK_M,
            )}
          />
        </g>
      </svg>
      <span
        className="absolute -translate-y-1/2 font-mono text-[0.8125rem] leading-[1.1rem] tabular-nums"
        data-label="length"
        style={{
          left: `calc(${atScale(PLAN_PAD_M + lengthX)} + ${LENGTH_LABEL_GAP})`,
          top: `calc(${SPAN_LABEL_ROOM} + ${atScale(nose[1] + item.lengthM / 2)})`,
        }}
      >
        <FigureLines label={item.lengthLabel} />
      </span>
    </div>
  );
}

/**
 * Where the outline is widest, as a share of its length from the nose: the
 * y of the right-most point of the traced path, so the span's extension
 * lines start at the wingtip.
 */
function widestStation(drawing: VehicleDrawing) {
  const numbers = drawing.d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  let bestX = Number.NEGATIVE_INFINITY;
  let bestY = 0;
  for (let index = 0; index + 1 < numbers.length; index += 2) {
    const x = numbers[index]!;
    if (x > bestX) {
      bestX = x;
      bestY = numbers[index + 1]!;
    }
  }
  return drawing.heightM > 0 ? bestY / drawing.heightM : 0;
}

/** A recorded figure in ink, with its metre conversion muted under it. */
function FigureLines({ label }: { label: readonly [string, string] }) {
  return (
    <>
      <span className="block whitespace-nowrap text-ink">
        {formatFigure(label[0])}
      </span>
      {label[1] ? (
        <span className="block whitespace-nowrap text-ink-muted">
          {formatFigure(label[1])}
        </span>
      ) : null}
    </>
  );
}

/** A figure and its conversion as one spoken phrase. */
function spokenFigures(label: readonly [string, string]) {
  return label[1] ? `${label[0]} (${label[1]})` : label[0];
}

/** The metre scale bar, at the shared scale. */
function ScaleBar() {
  const ticks = Array.from(
    { length: SCALE_BAR_M / SCALE_TICK_M + 1 },
    (_, index) => index * SCALE_TICK_M,
  );
  return (
    <div
      aria-hidden="true"
      data-scale-bar=""
      style={{ width: atScale(SCALE_BAR_M) }}
    >
      <svg
        className="block h-2 w-full overflow-visible"
        preserveAspectRatio="none"
        viewBox={`0 0 ${SCALE_BAR_M} 2`}
      >
        <g className="stroke-ink-muted" fill="none">
          <line
            {...object}
            data-scale-line=""
            x1={0}
            x2={SCALE_BAR_M}
            y1={2}
            y2={2}
          />
          {ticks.map((metres) => (
            <line
              {...thin}
              key={metres}
              x1={metres}
              x2={metres}
              y1={metres % SCALE_LABEL_M === 0 ? 0 : 1}
              y2={2}
            />
          ))}
        </g>
      </svg>
      <div className="relative mt-1 h-5 font-mono text-[0.8125rem] text-ink-muted tabular-nums">
        {ticks
          .filter((metres) => metres % SCALE_LABEL_M === 0)
          .map((metres) => (
            <span
              className="absolute top-0 -translate-x-1/2 whitespace-nowrap"
              key={metres}
              style={{ left: `${(metres / SCALE_BAR_M) * 100}%` }}
            >
              {metres}
              {metres === SCALE_BAR_M ? " m" : ""}
            </span>
          ))}
      </div>
    </div>
  );
}

interface AircraftSizeComparisonProps {
  aircraft: readonly Aircraft[];
  className?: string;
  figureNumber?: string;
}

/**
 * The aircraft to one scale (spec 8), as small multiples: each traced
 * top-view outline, nose up, scaled to the recorded length and wingspan,
 * with its two dimension lines, at one shared scale, with the name under
 * each plan and one metre scale bar above them. Linework in the muted ink, figures
 * in B612 Mono, no fills. An aircraft missing a dimension or an outline
 * is left out and named in the caption, and every outline's source is
 * credited there.
 */
export function AircraftSizeComparison({
  aircraft,
  className,
  figureNumber,
}: AircraftSizeComparisonProps) {
  const plans = aircraftPlans(aircraft);
  const drawn = new Set(plans.map((item) => item.id));
  const omitted = aircraft.filter((item) => !drawn.has(item.id));
  const unmeasured = omitted.filter(
    (item) =>
      !isMeasured(
        toMetres(item.dimensions.length),
        toMetres(item.dimensions.wingspan),
      ),
  );
  const undrawn = omitted.filter((item) => !unmeasured.includes(item));
  const names = (items: readonly Aircraft[]) =>
    items.map((item) => item.name).join(", ");

  return (
    <ScaleFigure
      caption={
        <>
          Each aircraft seen from above, nose up, all to one scale. Every
          outline is scaled to the length and wingspan in its record, with feet
          converted at 0.3048 m.
          {unmeasured.length > 0
            ? ` Not drawn, a dimension is missing: ${names(unmeasured)}.`
            : ""}
          {undrawn.length > 0
            ? ` Not drawn, no outline yet: ${names(undrawn)}.`
            : ""}{" "}
          <DrawingSourceNote vehicles={plans} />
        </>
      }
      className={className}
      figureNumber={figureNumber}
    >
      <div className={SCALE_CLASSES}>
        {/* The scale bar first, beside the smallest plans. Each row of
            plans stretches to its deepest plan and every plan grows to
            fill its item, so the names along a row share one baseline
            under the plans while the noses stay level. */}
        <ScaleBar />
        <ul className="mt-8 flex flex-row flex-wrap items-stretch gap-x-4 gap-y-10 sm:gap-x-8">
          {plans.map((item) => (
            <li
              className="flex min-w-0 flex-col"
              data-length-m={item.lengthM}
              data-vehicle={item.id}
              data-wingspan-m={item.wingspanM}
              key={item.id}
            >
              <div className="flex-1">
                <Plan item={item} />
              </div>
              <p className="mt-3 text-sm font-medium text-ink">
                {item.name}
                <span className="sr-only">
                  {`: length ${spokenFigures(item.lengthLabel)}, wingspan ${spokenFigures(item.wingspanLabel)}.`}
                </span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </ScaleFigure>
  );
}
