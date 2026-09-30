import type { CSSProperties, ReactNode } from "react";

import { DiagramPlate } from "@/components/ui/diagram-plate";
import { Readout } from "@/components/ui/readout";
import { cn } from "@/lib/cn";
import { formatShowcaseNumber } from "@/features/showcase/components/format";
import type { MissionDiagram } from "@/features/showcase/data/mission-showcase";

type TransferDiagram = Extract<MissionDiagram, { kind: "transfer" }>;
type AllowanceDiagram = Extract<MissionDiagram, { kind: "allowances" }>;

const HALF = 160;
const OUTER_RADIUS = 150;
/** Below this drawn radius the planet and inner orbit read as one point. */
const POINT_RADIUS = 8;

/**
 * Detail A, the window around the second burn, in kilometres, drawn with
 * one scale on both axes. It runs from 600 km inside the target orbit to
 * 200 km outside it, so a 200 km altitude step is a quarter of its width.
 * It is 500 km tall on the page and 400 km tall in the capture column,
 * where the whole preset has to fit one screen.
 */
const DETAIL_INSIDE = 600;
const DETAIL_WIDTH = 800;
const DETAIL_HEIGHT = { compact: 400, page: 500 } as const;
/** Burn dot radius in the detail, in kilometres of drawing. */
const DETAIL_DOT = 7;
/**
 * Offset from the window's centre line, in km, of the direct labels
 * (Surface above, orbits below).
 */
const DETAIL_LABEL_Y = 150;
/**
 * Burn dot radius in the locator, in drawing units: 4px at the locator's
 * 10rem width, so the dots stay visible at that size.
 */
const LOCATOR_DOT = 8;

/**
 * How a transfer plate is laid out. Wherever there is a detail, detail A
 * leads at the plate's full width and the whole transfer follows as a
 * 10rem locator beside the key. At point scale there is no detail, and the
 * whole drawing is the figure: large on the page (`feature`), smaller in
 * the capture column (`compact`). `standard` is a page plate that is not
 * at point scale.
 */
export type TransferDiagramSize = "compact" | "feature" | "standard";

/**
 * True when the target orbit is so much larger than the initial one that,
 * at the drawing's scale, the planet and initial orbit collapse to a point.
 */
export function isPointScaleTransfer(diagram: MissionDiagram): boolean {
  if (diagram.kind !== "transfer") return false;
  const inner =
    diagram.planetRadiusKilometres + diagram.initialAltitudeKilometres;
  const outer =
    diagram.planetRadiusKilometres + diagram.finalAltitudeKilometres;
  return (inner / outer) * OUTER_RADIUS < POINT_RADIUS;
}

/**
 * A 24px line (or burn dot) sample for a diagram key. In an `items-start`
 * row it sits centred on the first line of its label, however many lines
 * the label wraps to.
 */
export function LegendSwatch({
  arrow = false,
  dash,
  dot = false,
  fill,
  stroke,
  width = 2,
}: {
  /** A line ending in an arrowhead on the right. */
  arrow?: boolean;
  dash?: string;
  /** A burn dot instead of a line. */
  dot?: boolean;
  /** A filled block outlined in `stroke`, for a solid body. */
  fill?: string;
  stroke: string;
  width?: number;
}) {
  return (
    <svg
      aria-hidden="true"
      className="mt-[calc(0.5lh-0.25rem)] h-2 w-6 shrink-0"
      viewBox="0 0 24 8"
    >
      {fill ? (
        <rect
          fill={fill}
          height="7"
          stroke={stroke}
          strokeWidth="1"
          width="23"
          x="0.5"
          y="0.5"
        />
      ) : dot ? (
        <circle cx="4" cy="4" fill={stroke} r="3.5" />
      ) : arrow ? (
        <>
          <line
            stroke={stroke}
            strokeWidth={width}
            x1="0"
            x2="18"
            y1="4"
            y2="4"
          />
          <path d="M17 0.5 L24 4 L17 7.5 Z" fill={stroke} />
        </>
      ) : (
        <line
          stroke={stroke}
          strokeDasharray={dash}
          strokeWidth={width}
          x1="0"
          x2="24"
          y1="4"
          y2="4"
        />
      )}
    </svg>
  );
}

/**
 * The largest 1, 2 or 5 times a power of ten, in km, that spans at most
 * `maxShare` of a drawing `widthKilometres` wide.
 */
function scaleBarKilometres(widthKilometres: number, maxShare = 0.35): number {
  const limit = widthKilometres * maxShare;
  const power = 10 ** Math.floor(Math.log10(limit));
  const step = [5, 2, 1].find((multiple) => multiple * power <= limit) ?? 1;
  return step * power;
}

/**
 * A scale bar set under a drawing: a rule with end ticks whose width is
 * the bar's share of the drawing's width, so it stays true at every
 * rendered size. Its length is set just after the right tick, so the
 * number stays on the point it measures to however short the bar is.
 */
function ScaleBar({ widthKilometres }: { widthKilometres: number }) {
  const kilometres = scaleBarKilometres(widthKilometres);
  const share = kilometres / widthKilometres;

  return (
    <p className="orbix-micro mt-3 flex items-center gap-2 text-text-muted">
      <span
        aria-hidden="true"
        className="relative block h-2 flex-none border-x border-text-muted before:absolute before:inset-x-0 before:top-1/2 before:h-px before:bg-text-muted"
        style={{ width: percent(share) }}
      />
      <span className="whitespace-nowrap">
        <span className="sr-only">Scale bar: </span>
        <Readout>{formatShowcaseNumber(kilometres)}</Readout> km
      </span>
    </p>
  );
}

/** A small label over one panel of a drawing, in the uppercase data face. */
function PanelLabel({ children }: { children: ReactNode }) {
  return <p className="orbix-caps mb-3 text-text-muted">{children}</p>;
}

/**
 * A label set on a drawing in the data face at 11px. It is HTML over the
 * SVG, so it keeps that size however large the drawing is set.
 */
const drawingLabel =
  "orbix-micro pointer-events-none absolute whitespace-nowrap text-text-muted";

function percent(share: number): string {
  return `${share * 100}%`;
}

// Strokes keep their screen width however large the drawing is set.
const line = { vectorEffect: "non-scaling-stroke" } as const;

/**
 * Two circular orbits and the half ellipse that joins them, drawn to scale
 * around the planet. The ellipse has its focus at the planet's centre,
 * periapsis on the inner orbit and apoapsis on the outer one. Unless the
 * drawing is at point scale, detail A enlarges the second burn with one
 * scale on both axes, so the altitudes can be read apart, and the whole
 * transfer is a locator that marks detail A's window.
 */
export function TransferOrbitDiagram({
  diagram,
  missionId,
  size = "standard",
}: {
  diagram: TransferDiagram;
  missionId: string;
  size?: TransferDiagramSize;
}) {
  const planet = diagram.planetRadiusKilometres;
  const inner = planet + diagram.initialAltitudeKilometres;
  const outer = planet + diagram.finalAltitudeKilometres;
  const scale = OUTER_RADIUS / outer;
  const r1 = inner * scale;
  const r2 = outer * scale;
  const initial = formatShowcaseNumber(diagram.initialAltitudeKilometres);
  const final = formatShowcaseNumber(diagram.finalAltitudeKilometres);
  const captionId = `${missionId}-transfer-caption`;
  const compact = size === "compact";
  const detailHeight = compact ? DETAIL_HEIGHT.compact : DETAIL_HEIGHT.page;

  // At point scale Earth and the initial orbit are smaller than the first
  // burn marker, so neither is drawn and there is no detail; the caption
  // says so. The marker (7 or 8 units across) stays larger than Earth or
  // the initial orbit (about 5 units across) at that scale.
  const pointScale = r1 < POINT_RADIUS;
  const hasDetail = !pointScale;
  const dotRadius = hasDetail ? LOCATOR_DOT : size === "feature" ? 3.5 : 4;

  // Detail A's window, in kilometres from the planet's centre, and the
  // same window in the whole drawing's units.
  const windowLeft = outer - DETAIL_INSIDE;
  const windowRight = windowLeft + DETAIL_WIDTH;
  const box = {
    height: detailHeight * scale,
    width: DETAIL_WIDTH * scale,
    x: HALF + windowLeft * scale,
    y: HALF - (detailHeight / 2) * scale,
  };

  const drawing = (
    <div className="relative">
      <svg
        aria-label={`Scale drawing: transfer from a ${initial} km circular orbit to a ${final} km circular orbit around Earth.`}
        className="block h-auto w-full"
        role="img"
        viewBox={`0 0 ${HALF * 2} ${HALF * 2}`}
      >
        {pointScale ? null : (
          <>
            <circle
              cx={HALF}
              cy={HALF}
              fill="var(--orbix-surface-raised)"
              r={planet * scale}
              stroke="var(--orbix-border-strong)"
              {...line}
            />
            <circle
              cx={HALF}
              cy={HALF}
              fill="none"
              r={r1}
              stroke="var(--orbix-data-4)"
              strokeDasharray="2 3"
              strokeWidth="1.5"
              {...line}
            />
          </>
        )}
        <circle
          cx={HALF}
          cy={HALF}
          fill="none"
          r={r2}
          stroke="var(--orbix-data-1)"
          strokeWidth="2"
          {...line}
        />
        <path
          d={`M ${HALF - r1} ${HALF} A ${(r1 + r2) / 2} ${Math.sqrt(r1 * r2)} 0 0 1 ${HALF + r2} ${HALF}`}
          fill="none"
          stroke="var(--orbix-data-2)"
          strokeDasharray="6 4"
          strokeWidth="2"
          {...line}
        />
        {[HALF - r1, HALF + r2].map((cx) => (
          <circle
            cx={cx}
            cy={HALF}
            fill="var(--orbix-data-2)"
            key={cx}
            r={dotRadius}
            stroke="var(--orbix-surface)"
            strokeWidth="1"
            {...line}
          />
        ))}
        {hasDetail ? (
          <rect
            fill="none"
            height={box.height}
            stroke="var(--orbix-border-control)"
            strokeWidth="1"
            width={box.width}
            x={box.x}
            y={box.y}
            {...line}
          />
        ) : null}
      </svg>
      {hasDetail ? (
        // The window is only a few pixels across at locator size, so its
        // letter stands 12px above it on a 1px leader. The leader rises
        // from the window's outer edge, which lies outside the target
        // orbit, so it crosses no other line.
        <span
          aria-hidden="true"
          className="pointer-events-none absolute flex -translate-x-1/2 -translate-y-full flex-col items-center"
          style={{
            left: percent((box.x + box.width) / (HALF * 2)),
            top: percent(box.y / (HALF * 2)),
          }}
        >
          <span className="orbix-micro pb-0.5 text-text-muted">A</span>
          <span className="block h-3 w-px bg-border-control" />
        </span>
      ) : null}
    </div>
  );

  // Where each circle crosses a label line (the same at +y and -y), as a
  // share of the window.
  const across = (radius: number) =>
    (Math.sqrt(radius ** 2 - DETAIL_LABEL_Y ** 2) - windowLeft) / DETAIL_WIDTH;
  // The surface label sits in the upper half and the orbit labels in the
  // lower half, so neighbouring labels never share a line of text.
  const detailLines = [
    { label: "Surface", radius: planet, y: -DETAIL_LABEL_Y },
    { label: `${initial} km`, radius: inner, y: DETAIL_LABEL_Y },
    { label: `${final} km`, radius: outer, y: DETAIL_LABEL_Y },
  ].filter(({ radius }) => radius > windowLeft && radius < windowRight);
  const labelTop = (y: number) => (y + detailHeight / 2) / detailHeight;

  // Detail A, in kilometres with the planet's centre at the origin; the
  // viewBox crops it to the window.
  const detail = hasDetail ? (
    <div className="min-w-0">
      <PanelLabel>Detail A, second burn</PanelLabel>
      <div className="relative">
        <svg
          aria-label={`Enlarged scale drawing of the second burn, detail A, in a window ${formatShowcaseNumber(DETAIL_WIDTH)} km wide: Earth's surface, the ${initial} km orbit, and the transfer meeting the ${final} km orbit.`}
          className="block h-auto w-full"
          role="img"
          viewBox={`${windowLeft} ${-detailHeight / 2} ${DETAIL_WIDTH} ${detailHeight}`}
        >
          <circle
            cx="0"
            cy="0"
            fill="var(--orbix-surface-raised)"
            r={planet}
            stroke="var(--orbix-border-strong)"
            {...line}
          />
          <circle
            cx="0"
            cy="0"
            fill="none"
            r={inner}
            stroke="var(--orbix-data-4)"
            strokeDasharray="2 3"
            strokeWidth="1.5"
            {...line}
          />
          <circle
            cx="0"
            cy="0"
            fill="none"
            r={outer}
            stroke="var(--orbix-data-1)"
            strokeWidth="2"
            {...line}
          />
          <path
            d={`M ${-inner} 0 A ${(inner + outer) / 2} ${Math.sqrt(inner * outer)} 0 0 1 ${outer} 0`}
            fill="none"
            stroke="var(--orbix-data-2)"
            strokeDasharray="6 4"
            strokeWidth="2"
            {...line}
          />
          <circle
            cx={outer}
            cy="0"
            fill="var(--orbix-data-2)"
            r={DETAIL_DOT}
            stroke="var(--orbix-surface)"
            strokeWidth="1"
            {...line}
          />
        </svg>
        {/* Each label needs up to about 72px ("Surface" and its 8px gap)
            before the next line, a quarter of the panel, so they show once
            the plate is 20.5rem wide: an 18rem panel inside the 20px
            padding that a plate this narrow has. Below that
            the key names the surface and the burn, and the line styles
            name the orbits. */}
        <div
          aria-hidden="true"
          className="hidden @min-[20.5rem]/transfer:block"
        >
          {detailLines.map(({ label, radius, y }) => (
            <span
              className={cn(drawingLabel, "ml-2 -translate-y-1/2")}
              key={label}
              style={{
                left: percent(across(radius)),
                top: percent(labelTop(y)),
              }}
            >
              {label}
            </span>
          ))}
          <span
            className={cn(
              drawingLabel,
              "flex -translate-y-1/2 items-center gap-1",
            )}
            style={{
              left: `calc(${percent((DETAIL_INSIDE + DETAIL_DOT) / DETAIL_WIDTH)} + 2px)`,
              top: "50%",
            }}
          >
            <span className="block h-px w-3 bg-text-muted" />
            Burn 2
          </span>
        </div>
      </div>
      <ScaleBar widthKilometres={DETAIL_WIDTH} />
    </div>
  ) : null;

  const whole = (
    <div
      className={cn(
        "min-w-0",
        hasDetail
          ? "w-40 shrink-0"
          : cn("mx-auto w-full", compact ? "max-w-[15rem]" : "max-w-[34rem]"),
      )}
    >
      <PanelLabel>
        {hasDetail ? "Whole transfer" : "Whole transfer, to scale"}
      </PanelLabel>
      {drawing}
      {/* A locator only places detail A; the detail carries the scale. */}
      {hasDetail ? null : <ScaleBar widthKilometres={(HALF * 2) / scale} />}
    </div>
  );

  // Key entries shown only while the detail's direct labels are hidden.
  const narrowOnly = "flex items-start gap-2 @min-[20.5rem]/transfer:hidden";

  const key = (
    <ul
      aria-label="Diagram key"
      className={cn(
        "grid min-w-0 content-start gap-2 text-sm text-text-secondary",
        !hasDetail && "border-t border-border-subtle pt-4",
      )}
    >
      {hasDetail ? (
        <li className={narrowOnly}>
          <LegendSwatch
            fill="var(--orbix-surface-raised)"
            stroke="var(--orbix-border-strong)"
          />
          <span>Earth, bounded by its surface</span>
        </li>
      ) : null}
      <li className="flex items-start gap-2">
        <LegendSwatch
          dash={pointScale ? undefined : "2 3"}
          dot={pointScale}
          stroke={pointScale ? "var(--orbix-data-2)" : "var(--orbix-data-4)"}
        />
        <span>
          Initial orbit, {initial} km
          {pointScale
            ? ", smaller than the first burn marker at this scale"
            : null}
        </span>
      </li>
      <li className="flex items-start gap-2">
        <LegendSwatch stroke="var(--orbix-data-1)" />
        <span>Target orbit, {final} km</span>
      </li>
      <li className="flex items-start gap-2">
        <LegendSwatch dash="6 4" stroke="var(--orbix-data-2)" />
        <span>Transfer half ellipse, dots mark the two burns</span>
      </li>
      {hasDetail ? (
        <li className={narrowOnly}>
          <LegendSwatch dot stroke="var(--orbix-data-2)" />
          <span>Burn 2, the dot in detail A</span>
        </li>
      ) : null}
      {hasDetail ? (
        <li className="flex items-start gap-2">
          <LegendSwatch stroke="var(--orbix-border-control)" width={1} />
          <span>Window A, enlarged as detail A</span>
        </li>
      ) : null}
    </ul>
  );

  // The wrapper is the container the plate's layout responds to, measured
  // at the plate's outer width. From 24rem the locator stands beside the
  // key, and on the page beside the caption too; below that everything
  // stacks.
  return (
    <div className="@container/transfer min-w-0">
      <DiagramPlate
        aria-labelledby={captionId}
        className={cn(
          "grid content-start",
          compact ? "gap-5 lg:p-5" : "gap-6",
          hasDetail &&
            "@min-[24rem]/transfer:grid-cols-[10rem_minmax(0,1fr)] @min-[24rem]/transfer:gap-x-5",
        )}
      >
        {hasDetail ? (
          <>
            <div className="min-w-0 @min-[24rem]/transfer:col-span-2">
              {detail}
            </div>
            <span
              aria-hidden="true"
              className="-my-2 block h-px bg-border-subtle @min-[24rem]/transfer:col-span-2"
            />
            <div
              className={cn(
                "min-w-0",
                !compact && "@min-[24rem]/transfer:row-span-2",
              )}
            >
              {whole}
            </div>
            {key}
          </>
        ) : (
          <>
            {whole}
            {key}
          </>
        )}
        <figcaption
          className={cn(
            "orbix-label border-t border-border-subtle pt-4",
            // The capture's key column is too narrow to hold the caption
            // as well, so there it runs the full width below.
            compact && hasDetail && "@min-[24rem]/transfer:col-span-2",
          )}
          id={captionId}
        >
          {diagram.planetRadiusSource === "calculator-default"
            ? `Drawn to scale from the preset altitudes. Earth radius ${formatShowcaseNumber(planet)} km is the calculators’ standard value, not a preset input.`
            : `Drawn to scale from the preset altitudes and the preset’s planet radius of ${formatShowcaseNumber(planet)} km.`}
          {pointScale
            ? " At this scale Earth and the initial orbit are smaller than the first burn marker beside the center, so they are not drawn."
            : " Detail A uses one scale on both axes."}
        </figcaption>
      </DiagramPlate>
    </div>
  );
}

/** The preset's ordered maneuver allowances as bars on one scale. */
export function AllowanceBars({
  diagram,
  missionId,
}: {
  diagram: AllowanceDiagram;
  missionId: string;
}) {
  const largest = Math.max(
    ...diagram.maneuvers.map((maneuver) => maneuver.deltaVMetresPerSecond),
  );
  const captionId = `${missionId}-allowances-caption`;

  return (
    <DiagramPlate aria-labelledby={captionId}>
      {/* The plate's label, set like the panel labels on the transfer
          plates so the figures read as one set of drawings. */}
      <figcaption className="orbix-caps mb-3 text-text-muted" id={captionId}>
        Delta-v allowances, in flight order
      </figcaption>
      <ol className="grid gap-4">
        {diagram.maneuvers.map((maneuver) => (
          <li key={maneuver.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 text-sm">
              <span className="text-text-secondary">{maneuver.name}</span>
              <span className="text-text-primary">
                <Readout>
                  {formatShowcaseNumber(maneuver.deltaVMetresPerSecond)}
                </Readout>{" "}
                <span className="text-text-muted">m/s</span>
              </span>
            </div>
            <span
              aria-hidden="true"
              className="orbix-magnitude max-w-none"
              style={
                {
                  "--orbix-magnitude": maneuver.deltaVMetresPerSecond / largest,
                } as CSSProperties
              }
            >
              <span className="orbix-magnitude__fill" />
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-5 flex flex-wrap items-baseline justify-between gap-x-4 border-t border-border-subtle pt-4 text-sm">
        <span className="text-text-secondary">Sum of the allowances</span>
        <span className="text-text-primary">
          <Readout>{formatShowcaseNumber(diagram.sumMetresPerSecond)}</Readout>{" "}
          <span className="text-text-muted">m/s</span>
        </span>
      </p>
      <p className="orbix-label mt-3">
        Allowances are preset inputs, not optimized trajectory values. Their sum
        is the only derived number.
      </p>
    </DiagramPlate>
  );
}
