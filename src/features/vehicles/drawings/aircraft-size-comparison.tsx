import { formatFigure } from "@/components/ui/readout";
import type { Aircraft, DistanceMeasurement } from "@/features/vehicles/types";

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
 * any width: 4.5px per metre on a phone, where the plans stand in one
 * column (the widest, 52 m, with its labels then fits the 328px column at
 * 360px; 3.75px below 22.5rem, so it fits the 288px column at 320px),
 * and 5px from 40rem, where the plans wrap in rows (all five fit one row
 * of the 72rem container).
 */
const SCALE_CLASSES =
  "[--plan-u:3.75px] min-[22.5rem]:[--plan-u:4.5px] sm:[--plan-u:5px]" as const;

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
}

function dimensionLabels(measurement: DistanceMeasurement, metres: number) {
  return [
    `${formatRecorded(measurement.value)} ${measurement.unit}`,
    measurement.unit === "m" ? "" : `${formatMetres(metres)} m`,
  ] as const;
}

/**
 * The aircraft that can be drawn, built only from `dimensions.length` and
 * `dimensions.wingspan` in each record, converted to metres, smallest
 * wingspan first. A record missing either dimension is left out.
 */
export function aircraftPlans(
  aircraft: readonly Aircraft[],
): readonly PlanAircraft[] {
  return aircraft
    .map((item) => {
      const lengthM = toMetres(item.dimensions.length);
      const wingspanM = toMetres(item.dimensions.wingspan);
      return {
        id: item.id,
        lengthLabel: dimensionLabels(item.dimensions.length, lengthM),
        lengthM,
        name: item.name,
        wingspanLabel: dimensionLabels(item.dimensions.wingspan, wingspanM),
        wingspanM,
      };
    })
    .filter(
      ({ lengthM, wingspanM }) =>
        Number.isFinite(lengthM) &&
        lengthM > 0 &&
        Number.isFinite(wingspanM) &&
        wingspanM > 0,
    )
    .sort((a, b) => a.wingspanM - b.wingspanM);
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
 * Where the wingtips sit, as a share of the length from the nose. The
 * records give no planform, so the station is a fixed schematic choice,
 * stated in the caption.
 */
export const SPAN_STATION = 0.45;

/** The four points of a plan's outline, in drawing metres. */
function planOutline(item: Pick<PlanAircraft, "lengthM" | "wingspanM">) {
  const centre = item.wingspanM / 2;
  const station = NOSE_Y_M + item.lengthM * SPAN_STATION;
  return {
    left: [0, station],
    nose: [centre, NOSE_Y_M],
    right: [item.wingspanM, station],
    tail: [centre, NOSE_Y_M + item.lengthM],
  } as const;
}

/**
 * One aircraft seen from above, nose up, as a schematic planform: a closed
 * 1.5px outline from the nose to each wingtip at the stated station and
 * back to the tail on the centreline, built only from the recorded length
 * and wingspan. A 0.75px span dimension line runs above the plan and a
 * length dimension line to its right, each with extension lines and
 * oblique end ticks, labelled in B612 Mono. The labels are HTML, so they
 * set at one size whatever the plan's scale.
 */
function Plan({ item }: { item: PlanAircraft }) {
  const box = planViewBox(item);
  const { left, nose, right, tail } = planOutline(item);
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
        className="absolute top-0 -translate-x-1/2 text-center font-mono text-xs leading-[1.1rem] tabular-nums sm:text-[0.8125rem]"
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
            d={`M${nose.join(" ")}L${right.join(" ")}L${tail.join(" ")}L${left.join(" ")}Z`}
            data-outline=""
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
        className="absolute -translate-y-1/2 font-mono text-xs leading-[1.1rem] tabular-nums sm:text-[0.8125rem]"
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
      className="mt-8"
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
 * The aircraft to one scale (spec 8), as small multiples: each recorded
 * length and wingspan drawn from above, nose up, as a schematic planform
 * with its two dimension lines, at one shared scale, with the name under
 * each plan and one metre scale bar. Linework in the muted ink, figures
 * in B612 Mono, no fills. An aircraft missing either dimension is left
 * out and named in the caption.
 */
export function AircraftSizeComparison({
  aircraft,
  className,
  figureNumber,
}: AircraftSizeComparisonProps) {
  const plans = aircraftPlans(aircraft);
  const drawn = new Set(plans.map((item) => item.id));
  const omitted = aircraft.filter((item) => !drawn.has(item.id));

  return (
    <ScaleFigure
      caption={
        <>
          Recorded length and wingspan of each aircraft, seen from above with
          the nose up, all to one scale, feet converted at 0.3048 m. Each plan
          is schematic, an outline from the nose to wingtips at{" "}
          {SPAN_STATION * 100} percent of the length and back to the tail, since
          the records give no wing position or shape.
          {omitted.length > 0
            ? ` Not drawn, a dimension is missing: ${omitted.map((item) => item.name).join(", ")}.`
            : ""}
        </>
      }
      className={className}
      figureNumber={figureNumber}
    >
      <div className={SCALE_CLASSES}>
        {/* One column on a phone, every plan from the same left edge.
            From 40rem each row stretches to its deepest plan and every
            plan grows to fill its item, so the names along a row share one
            baseline under the plans while the noses stay level. */}
        <ul className="flex flex-col gap-y-10 sm:flex-row sm:flex-wrap sm:items-stretch sm:gap-x-8">
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
        <ScaleBar />
      </div>
    </ScaleFigure>
  );
}
