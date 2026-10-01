import { formatFigure } from "@/components/ui/readout";
import type { Aircraft, DistanceMeasurement } from "@/features/vehicles/types";

import { ScaleFigure } from "./scale-figure";
import { formatMetres, formatRecorded, obliqueTicks, toMetres } from "./units";

/**
 * Space around each plan, in metres: above it for the span dimension
 * line, right of it for the length dimension line. Drawn at the shared
 * scale, so every plan's nose sits the same distance below the top of its
 * drawing and the noses along a row are level.
 */
export const PLAN_PAD_M = 3;
/** The dimension lines' offset from the plan, in metres. */
const DIMENSION_OFFSET_M = 1.6;
/** Half-length of a dimension end tick, in metres. */
const TICK_M = 0.7;

/** The scale bar's length, tick step and labelled step, in metres. */
export const SCALE_BAR_M = 20;
const SCALE_TICK_M = 5;
const SCALE_LABEL_M = 10;

/**
 * The shared scale, as CSS lengths per metre at each width. Every plan and
 * the scale bar are sized from `--plan-u`, so all of them use one scale at
 * any width: 4.5px per metre on a phone (the widest plan, 52 m, then fits
 * a 288px column) and 5px from 40rem, where all five plans and their
 * figures fit one row of the 72rem container.
 */
const SCALE_CLASSES = "[--plan-u:4.5px] sm:[--plan-u:5px]" as const;

/** Room left of each plan, in metres, for the span line's end tick. */
const LEFT_PAD_M = 1;

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
 * One plan's drawing box in metres: the plan plus its padding. The plan's
 * left wingtip is at x = 0, so the box starts at `x` (negative).
 */
export function planViewBox(item: Pick<PlanAircraft, "lengthM" | "wingspanM">) {
  return {
    height: item.lengthM + PLAN_PAD_M + 0.5,
    width: LEFT_PAD_M + item.wingspanM + PLAN_PAD_M,
    x: -LEFT_PAD_M,
  };
}

/** A CSS length: `metres` at the shared scale. */
function atScale(metres: number) {
  return `calc(var(--plan-u) * ${Math.round(metres * 1000) / 1000})`;
}

const thin = {
  strokeWidth: 0.75,
  vectorEffect: "non-scaling-stroke",
} as const;

/**
 * One aircraft seen from above, nose up: the recorded length and wingspan
 * as a dashed envelope (nothing else about the shape is recorded, so no
 * outline is drawn), its centreline, and a dimension line for each.
 */
function Plan({ item }: { item: PlanAircraft }) {
  const box = planViewBox(item);
  const left = 0;
  const right = item.wingspanM;
  const nose = PLAN_PAD_M;
  const tail = PLAN_PAD_M + item.lengthM;
  const spanY = nose - DIMENSION_OFFSET_M;
  const lengthX = right + DIMENSION_OFFSET_M;

  return (
    <svg
      aria-hidden="true"
      className="block h-auto overflow-visible"
      data-plan=""
      style={{ width: atScale(box.width) }}
      viewBox={`${box.x} 0 ${box.width} ${box.height}`}
    >
      <g className="stroke-ink-muted" fill="none" strokeLinecap="butt">
        <path
          {...thin}
          d={`M${left} ${nose}H${right}V${tail}H${left}Z`}
          data-envelope=""
          strokeDasharray="4 3"
        />
        <line
          {...thin}
          data-centreline=""
          strokeDasharray="10 3 2 3"
          x1={item.wingspanM / 2}
          x2={item.wingspanM / 2}
          y1={nose - 0.6}
          y2={tail + 0.4}
        />
        <line
          {...thin}
          data-dimension="span"
          x1={left}
          x2={right}
          y1={spanY}
          y2={spanY}
        />
        <line
          {...thin}
          data-dimension="length"
          x1={lengthX}
          x2={lengthX}
          y1={nose}
          y2={tail}
        />
        <path
          d={obliqueTicks(
            [
              [left, spanY],
              [right, spanY],
              [lengthX, nose],
              [lengthX, tail],
            ],
            TICK_M,
          )}
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </svg>
  );
}

/** A recorded figure in ink, then its metre conversion muted. */
function FigurePair({ label }: { label: readonly [string, string] }) {
  return (
    <span className="whitespace-nowrap">
      <span className="text-ink">{formatFigure(label[0])}</span>
      {label[1] ? (
        <span className="ml-[1ch] text-ink-muted">
          {formatFigure(label[1])}
        </span>
      ) : null}
    </span>
  );
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
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
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
 * length and wingspan drawn from above, nose up, side by side at one shared
 * scale, with the name and both dimensions under each plan and one metre
 * scale bar. Linework in the muted ink, figures in B612 Mono, no fills. An
 * aircraft missing either dimension is left out and named in the caption.
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
          the nose up, all to one scale, feet converted at 0.3048 m.
          {omitted.length > 0
            ? ` Not drawn, a dimension is missing: ${omitted.map((item) => item.name).join(", ")}.`
            : ""}
        </>
      }
      className={className}
      figureNumber={figureNumber}
    >
      <div className={SCALE_CLASSES}>
        <ul className="flex flex-wrap items-start gap-x-6 gap-y-10 sm:gap-x-8">
          {plans.map((item) => (
            <li
              className="min-w-0"
              data-length-m={item.lengthM}
              data-vehicle={item.id}
              data-wingspan-m={item.wingspanM}
              key={item.id}
            >
              <Plan item={item} />
              <p className="mt-3 text-sm font-medium text-ink">{item.name}</p>
              <dl className="mt-1 grid grid-cols-[auto_auto] justify-start gap-x-3 text-xs leading-6 sm:text-[0.8125rem]">
                <dt className="text-ink-muted">Length</dt>
                <dd className="font-mono tabular-nums">
                  <FigurePair label={item.lengthLabel} />
                </dd>
                <dt className="text-ink-muted">Span</dt>
                <dd className="font-mono tabular-nums">
                  <FigurePair label={item.wingspanLabel} />
                </dd>
              </dl>
            </li>
          ))}
        </ul>
        <ScaleBar />
      </div>
    </ScaleFigure>
  );
}
