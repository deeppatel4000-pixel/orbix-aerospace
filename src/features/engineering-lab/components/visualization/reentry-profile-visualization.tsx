"use client";

import { useId } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import type {
  ReentryTrajectoryPoint,
  VehicleReentryEvaluationAnalysis,
} from "@/features/engineering-lab/types";
import { figureTspans } from "./figure-tspans";
import { formatLabAltitude, formatLabValue } from "./format-lab-value";
import { useAnnotationFontSize } from "./use-annotation-font-size";
import { RecordRow } from "@/components/ui/record-row";
import { LabHeading } from "./lab-heading";

export interface ReentryProfileVisualizationProps {
  readonly analysis?: VehicleReentryEvaluationAnalysis | null;
}

const MAXIMUM_RENDERED_POINTS = 96;

/** The chart's viewBox width, user units. */
const CHART_WIDTH = 660;
/** Each vertical axis is split into this many labelled steps. */
const GRID_STEPS = 4;

/** The smallest 1, 2, 2.5 or 5 times a power of ten at or above `raw`. */
function roundAxisStep(raw: number): number {
  if (!(raw > 0)) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const multiple =
    [1, 2, 2.5, 5, 10].find((factor) => factor * magnitude >= raw * 0.999) ??
    10;
  return multiple * magnitude;
}

function sampleTrajectoryPoints(
  points: readonly ReentryTrajectoryPoint[],
): readonly ReentryTrajectoryPoint[] {
  if (points.length <= MAXIMUM_RENDERED_POINTS) return points;

  const step = Math.ceil(points.length / MAXIMUM_RENDERED_POINTS);
  const sampled = points.filter((_, index) => index % step === 0);
  const finalPoint = points.at(-1);

  if (finalPoint && sampled.at(-1) !== finalPoint) {
    sampled.push(finalPoint);
  }

  return sampled;
}

interface CalloutLine {
  /** Words, in Plex Sans. */
  readonly label: string;
  /** Figures and units, in B612 Mono. */
  readonly value: string;
}

interface Callout {
  readonly anchor: "end" | "start";
  readonly elbowX: number;
  readonly elbowY: number;
  readonly lines: readonly CalloutLine[];
  readonly shelfX: number;
  readonly textX: number;
  readonly textY: number;
  readonly width: number;
}

/**
 * Altitude (solid, left axis, km) and velocity (dashed, right axis, km/s)
 * against elapsed time, drawn from the computed trajectory points. Linework
 * in ink with the lab accent for velocity only; peak deceleration (hollow
 * square) and peak heating (hollow circle) are ink outlines with a leader
 * callout each, merged into one marker and one callout when they coincide.
 */
export function ReentryProfileChart({
  analysis,
}: {
  readonly analysis: VehicleReentryEvaluationAnalysis;
}) {
  const reactId = useId().replaceAll(":", "");
  const titleId = `reentry-title-${reactId}`;
  const descriptionId = `reentry-description-${reactId}`;
  const trajectoryPoints = analysis.trajectory.trajectoryPoints;
  // Axis text renders at exactly 11 CSS px at every column width: on a
  // phone the 660-unit drawing is about 360px wide, so the size in user
  // units grows and the rows under the plot move down to make room.
  const { fontSize, svgRef } = useAnnotationFontSize(
    true,
    CHART_WIDTH,
    "exact",
  );
  const maximumAltitude = Math.max(
    analysis.trajectory.initialState.altitudeMeters,
    ...trajectoryPoints.map((point) => point.altitudeMeters),
    1,
  );
  const maximumVelocity = Math.max(
    analysis.trajectory.initialState.velocityMetersPerSecond,
    ...trajectoryPoints.map((point) => point.velocityMetersPerSecond),
    1,
  );
  // Each axis runs to four round steps (10 km as 2.5 km steps, 0.75 km/s
  // as 0.2 km/s steps to 0.8), so every gridline carries a label.
  const altitudeStepKm = roundAxisStep(maximumAltitude / 1000 / GRID_STEPS);
  const velocityStepKm = roundAxisStep(maximumVelocity / 1000 / GRID_STEPS);
  const altitudeAxisMax = altitudeStepKm * GRID_STEPS * 1000;
  const velocityAxisMax = velocityStepKm * GRID_STEPS * 1000;
  const tickSteps = Array.from({ length: GRID_STEPS + 1 }, (_, step) => step);
  const altitudeTicks = tickSteps.map((step) =>
    formatLabValue(step * altitudeStepKm),
  );
  const velocityTicks = tickSteps.map((step) =>
    formatLabValue(step * velocityStepKm),
  );
  // B612 Mono advances about 0.62em per character; the axes give way so
  // the widest tick label always fits inside the drawing.
  const labelWidth = (text: string) => text.length * fontSize * 0.62;
  const widest = (labels: readonly string[]) =>
    Math.max(...labels.map(labelWidth));
  const plotLeft = Math.max(64, Math.ceil(widest(altitudeTicks) + 16));
  const plotRight = Math.min(
    596,
    Math.floor(CHART_WIDTH - widest(velocityTicks) - 12),
  );
  // Axis titles sit on their own line above the top tick labels.
  const axisTitleTopY = Math.ceil(fontSize + 6);
  const plotTop = Math.max(40, Math.ceil(axisTitleTopY + fontSize + 10));
  // CSS pixels per user unit: the text is held at 11 CSS px, so the
  // font size in user units gives the drawing's scale.
  const unitsPerPixel = fontSize / 11;
  // The plot keeps at least 200 CSS px of height, so on a phone the
  // drawing grows taller (about 4:3) instead of shrinking to a strip.
  const plotBottom = Math.ceil(plotTop + Math.max(260, 200 * unitsPerPixel));
  const timeLabelY = plotBottom + fontSize + 6;
  const axisTitleY = timeLabelY + fontSize + 8;
  const chartHeight = Math.ceil(axisTitleY + fontSize * 0.4);
  const plotWidth = plotRight - plotLeft;
  const plotHeight = plotBottom - plotTop;
  const sampledPoints = sampleTrajectoryPoints(trajectoryPoints);
  const maximumTime = Math.max(analysis.trajectory.durationSeconds, 1);
  const plotX = (timeSeconds: number) =>
    plotLeft + (timeSeconds / maximumTime) * plotWidth;
  const plotAltitudeY = (altitudeMeters: number) =>
    plotBottom - (altitudeMeters / altitudeAxisMax) * plotHeight;
  const plotVelocityY = (velocityMetersPerSecond: number) =>
    plotBottom - (velocityMetersPerSecond / velocityAxisMax) * plotHeight;
  const toPath = (y: (point: ReentryTrajectoryPoint) => number) =>
    sampledPoints
      .map(
        (point, index) =>
          `${index === 0 ? "M" : "L"} ${plotX(point.timeSeconds).toFixed(2)} ${y(point).toFixed(2)}`,
      )
      .join(" ");
  const altitudePath = toPath((point) => plotAltitudeY(point.altitudeMeters));
  const velocityPath = toPath((point) =>
    plotVelocityY(point.velocityMetersPerSecond),
  );
  // Markers are held a marker's half-width inside the plot, so a peak at
  // t = 0 or at an axis limit never sits on the axis or its tick labels.
  const markerInset = 8;
  const insetX = (x: number) =>
    Math.min(Math.max(x, plotLeft + markerInset), plotRight - markerInset);
  const insetY = (y: number) =>
    Math.min(Math.max(y, plotTop + markerInset), plotBottom - markerInset);
  const peakDeceleration = analysis.trajectory.peakDeceleration;
  const peakDecelerationX = insetX(plotX(peakDeceleration.timeSeconds));
  const peakDecelerationY = insetY(
    plotAltitudeY(peakDeceleration.altitudeMeters),
  );
  const peakHeating =
    analysis.thermalHistory.thermalPoints.length > 0
      ? analysis.thermalHistory.peakHeatFlux
      : undefined;
  const peakHeatingX = peakHeating ? insetX(plotX(peakHeating.timeSeconds)) : 0;
  const peakHeatingY = peakHeating
    ? insetY(plotAltitudeY(peakHeating.altitudeMeters))
    : 0;
  // Words in the drawing are Plex Sans at 13 CSS px (spec 5); only figures
  // and units are B612 Mono. Plex Sans advances about 0.5em per character.
  const wordSize = (fontSize * 13) / 11;
  const wordWidth = (text: string) => text.length * wordSize * 0.5;
  const lineGap = 18 * unitsPerPixel;
  // Peaks closer than this share one marker and one callout, so two
  // symbols never sit on top of each other (at t = 0, say).
  const mergeDistance = 40 * unitsPerPixel;
  const peaksMerged =
    peakHeating !== undefined &&
    Math.abs(peakHeatingX - peakDecelerationX) < mergeDistance &&
    Math.abs(peakHeatingY - peakDecelerationY) < mergeDistance;
  // Merged peaks at the same reported time state that time once, on its
  // own line ("Both at 0 s"), instead of repeating it on each.
  const sharedTime =
    peaksMerged &&
    formatLabValue(peakHeating.timeSeconds) ===
      formatLabValue(peakDeceleration.timeSeconds)
      ? formatLabValue(peakDeceleration.timeSeconds)
      : undefined;
  const timeSuffix = (seconds: number) =>
    sharedTime === undefined ? `, ${formatLabValue(seconds)} s` : "";
  const decelerationLine: CalloutLine = {
    label: "Peak deceleration",
    value: `${formatLabValue(peakDeceleration.decelerationGs)} g${timeSuffix(peakDeceleration.timeSeconds)}`,
  };
  const heatingLine: CalloutLine | undefined = peakHeating
    ? {
        label: "Peak heating",
        value: `${formatLabValue(peakHeating.heatFluxKilowattsPerSquareMetre)} kW/m²${timeSuffix(peakHeating.timeSeconds)}`,
      }
    : undefined;
  const lineWidth = (line: CalloutLine) =>
    wordWidth(`${line.label} `) + labelWidth(line.value);
  // One leader per callout: a diagonal from the marker into the plot's
  // open side, a short shelf, then the text block.
  const placeCallout = (
    markerX: number,
    markerY: number,
    lines: readonly CalloutLine[],
    extraDrop = 0,
  ): Callout => {
    const reach = 28 * unitsPerPixel;
    const shelf = 10 * unitsPerPixel;
    const width = Math.max(...lines.map(lineWidth));
    const blockHeight = (lines.length - 1) * lineGap;
    const down = markerY < plotTop + plotHeight / 2;
    let right = markerX < plotLeft + plotWidth / 2;
    if (right && markerX + reach + shelf + 4 + width > plotRight - 4) {
      right = false;
    } else if (!right && markerX - reach - shelf - 4 - width < plotLeft + 4) {
      right = true;
    }
    const direction = right ? 1 : -1;
    const elbowX = markerX + direction * reach;
    const elbowY = Math.min(
      Math.max(
        markerY + (down ? 1 : -1) * (reach + extraDrop),
        plotTop + wordSize + blockHeight / 2,
      ),
      plotBottom - 6 - blockHeight / 2,
    );
    const shelfX = elbowX + direction * shelf;
    return {
      anchor: right ? "start" : "end",
      elbowX,
      elbowY,
      lines,
      shelfX,
      textX: shelfX + direction * 4 * unitsPerPixel,
      textY: elbowY - blockHeight / 2 + wordSize * 0.35,
      width,
    };
  };
  const decelerationCallout = placeCallout(
    peakDecelerationX,
    peakDecelerationY,
    peaksMerged && heatingLine
      ? [
          heatingLine,
          decelerationLine,
          ...(sharedTime === undefined
            ? []
            : [{ label: "Both at", value: `${sharedTime} s` }]),
        ]
      : [decelerationLine],
  );
  let heatingCallout: Callout | undefined;
  if (heatingLine && !peaksMerged) {
    heatingCallout = placeCallout(peakHeatingX, peakHeatingY, [heatingLine]);
    // Two single-line callouts that would overlap: the heating one moves
    // two lines further out along its own leader.
    if (
      Math.abs(heatingCallout.textY - decelerationCallout.textY) < lineGap &&
      Math.abs(heatingCallout.textX - decelerationCallout.textX) <
        Math.max(heatingCallout.width, decelerationCallout.width)
    ) {
      heatingCallout = placeCallout(
        peakHeatingX,
        peakHeatingY,
        [heatingLine],
        2 * lineGap,
      );
    }
  }
  const visualSummary = `${analysis.vehicle.vehicleName} descends from ${formatLabAltitude(analysis.trajectory.initialState.altitudeMeters)} to ${formatLabAltitude(analysis.trajectory.finalState.altitudeMeters)} while velocity changes from ${formatLabValue(analysis.trajectory.initialState.velocityMetersPerSecond)} m/s to ${formatLabValue(analysis.trajectory.finalState.velocityMetersPerSecond)} m/s over ${formatLabValue(analysis.trajectory.durationSeconds)} s.`;

  return (
    <figure className="m-0">
      <svg
        ref={svgRef}
        aria-labelledby={`${titleId} ${descriptionId}`}
        className="block h-auto w-full"
        role="img"
        viewBox={`0 0 ${CHART_WIDTH} ${chartHeight}`}
      >
        <title id={titleId}>Vehicle reentry time history</title>
        <desc id={descriptionId}>{visualSummary}</desc>

        {tickSteps.slice(1, -1).map((step) => (
          <line
            key={step}
            stroke="var(--orbix-data-grid)"
            strokeWidth="1"
            x1={plotLeft}
            x2={plotRight}
            y1={plotBottom - (step / GRID_STEPS) * plotHeight}
            y2={plotBottom - (step / GRID_STEPS) * plotHeight}
          />
        ))}
        <line
          stroke="var(--orbix-data-axis)"
          x1={plotLeft}
          x2={plotLeft}
          y1={plotTop}
          y2={plotBottom}
        />
        <line
          stroke="var(--orbix-data-axis)"
          x1={plotRight}
          x2={plotRight}
          y1={plotTop}
          y2={plotBottom}
        />
        <line
          stroke="var(--orbix-data-axis)"
          x1={plotLeft}
          x2={plotRight}
          y1={plotBottom}
          y2={plotBottom}
        />

        <path
          d={altitudePath}
          fill="none"
          stroke="var(--ink)"
          strokeWidth="2.5"
        />
        <path
          d={velocityPath}
          fill="none"
          stroke="var(--accent-lab)"
          strokeDasharray="7 5"
          strokeWidth="2"
        />

        {/* 1px dashed drop lines from each peak to the time axis. */}
        {peakHeating && !peaksMerged ? (
          <line
            stroke="var(--ink-muted)"
            strokeDasharray="3 3"
            strokeWidth="1"
            x1={peakHeatingX}
            x2={peakHeatingX}
            y1={peakHeatingY + 6}
            y2={plotBottom}
          />
        ) : null}
        <line
          stroke="var(--ink-muted)"
          strokeDasharray="3 3"
          strokeWidth="1"
          x1={peakDecelerationX}
          x2={peakDecelerationX}
          y1={peakDecelerationY + 7}
          y2={plotBottom}
        />

        {peakHeating && !peaksMerged ? (
          <circle
            cx={peakHeatingX}
            cy={peakHeatingY}
            fill="none"
            r="6"
            stroke="var(--ink)"
            strokeWidth="1.5"
          />
        ) : null}
        <rect
          fill="none"
          height="14"
          stroke="var(--ink)"
          strokeWidth="1.5"
          width="14"
          x={peakDecelerationX - 7}
          y={peakDecelerationY - 7}
        />

        {/* Leader lines: marker, elbow, shelf. */}
        {[
          {
            callout: decelerationCallout,
            x: peakDecelerationX,
            y: peakDecelerationY,
          },
          ...(heatingCallout
            ? [{ callout: heatingCallout, x: peakHeatingX, y: peakHeatingY }]
            : []),
        ].map(({ callout, x, y }) => (
          <polyline
            fill="none"
            key={callout.lines[0]?.label}
            points={`${x + (callout.elbowX > x ? 8 : -8)},${y + (callout.elbowY > y ? 8 : -8)} ${callout.elbowX},${callout.elbowY} ${callout.shelfX},${callout.elbowY}`}
            stroke="var(--ink-muted)"
            strokeWidth="0.75"
          />
        ))}

        <g
          fill="var(--orbix-data-axis)"
          fontFamily="var(--font-telemetry), monospace"
          fontSize={fontSize}
        >
          {tickSteps.map((step) => {
            const y = plotBottom - (step / GRID_STEPS) * plotHeight + 4;

            return (
              <g key={step}>
                <text textAnchor="end" x={plotLeft - 8} y={y}>
                  {figureTspans(altitudeTicks[step] ?? "")}
                </text>
                <text textAnchor="start" x={plotRight + 8} y={y}>
                  {figureTspans(velocityTicks[step] ?? "")}
                </text>
              </g>
            );
          })}
          <text textAnchor="start" x={plotLeft} y={timeLabelY}>
            0 s
          </text>
          <text textAnchor="end" x={plotRight} y={timeLabelY}>
            {figureTspans(formatLabValue(analysis.trajectory.durationSeconds))}{" "}
            s
          </text>
        </g>
        <g
          fill="var(--ink-muted)"
          fontFamily="var(--font-sans), sans-serif"
          fontSize={wordSize}
        >
          <text textAnchor="start" x={8} y={axisTitleTopY}>
            Altitude{" "}
            <tspan
              fontFamily="var(--font-telemetry), monospace"
              fontSize={fontSize}
            >
              (km)
            </tspan>
          </text>
          <text textAnchor="end" x={CHART_WIDTH - 4} y={axisTitleTopY}>
            Velocity{" "}
            <tspan
              fontFamily="var(--font-telemetry), monospace"
              fontSize={fontSize}
            >
              (km/s)
            </tspan>
          </text>
          <text
            textAnchor="middle"
            x={(plotLeft + plotRight) / 2}
            y={axisTitleY}
          >
            Elapsed time
          </text>
        </g>

        {/* Callout text: words in Plex Sans (muted), figures in B612 Mono
         * (ink), with a ground-coloured outline so the text stays legible
         * where it crosses a curve or gridline. */}
        <g
          paintOrder="stroke"
          stroke="var(--bg-page)"
          strokeLinejoin="round"
          strokeWidth={3 * unitsPerPixel}
        >
          {[
            decelerationCallout,
            ...(heatingCallout ? [heatingCallout] : []),
          ].map((callout) =>
            callout.lines.map((line, index) => (
              <text
                fontFamily="var(--font-sans), sans-serif"
                fontSize={wordSize}
                key={line.label}
                textAnchor={callout.anchor}
                x={callout.textX}
                y={callout.textY + index * lineGap}
              >
                <tspan fill="var(--ink-muted)">{line.label} </tspan>
                <tspan
                  fill="var(--ink)"
                  fontFamily="var(--font-telemetry), monospace"
                  fontSize={fontSize}
                >
                  {figureTspans(line.value)}
                </tspan>
              </text>
            )),
          )}
        </g>
      </svg>

      <figcaption className="mt-3 text-sm text-text-secondary">
        <ul className="flex flex-wrap gap-x-6 gap-y-1">
          <li className="flex items-center gap-2">
            <svg aria-hidden="true" height="8" width="24">
              <line
                stroke="var(--ink)"
                strokeWidth="2.5"
                x1="0"
                x2="24"
                y1="4"
                y2="4"
              />
            </svg>
            Altitude profile
          </li>
          <li className="flex items-center gap-2">
            <svg aria-hidden="true" height="8" width="24">
              <line
                stroke="var(--accent-lab)"
                strokeDasharray="7 5"
                strokeWidth="2"
                x1="0"
                x2="24"
                y1="4"
                y2="4"
              />
            </svg>
            Velocity
          </li>
          <li className="flex items-center gap-2">
            <svg aria-hidden="true" height="12" width="12">
              <rect
                fill="none"
                height="10"
                stroke="var(--ink)"
                strokeWidth="1.5"
                width="10"
                x="1"
                y="1"
              />
            </svg>
            {peaksMerged
              ? "Peak heating and peak deceleration (one mark)"
              : "Peak deceleration"}
          </li>
          {peakHeating && !peaksMerged ? (
            <li className="flex items-center gap-2">
              <svg aria-hidden="true" height="12" width="12">
                <circle
                  cx="6"
                  cy="6"
                  fill="none"
                  r="5"
                  stroke="var(--ink)"
                  strokeWidth="1.5"
                />
              </svg>
              Peak heating
            </li>
          ) : null}
        </ul>
      </figcaption>
    </figure>
  );
}

export function ReentryProfileVisualization({
  analysis,
}: ReentryProfileVisualizationProps) {
  const titleId = `reentry-profile-title-${useId().replaceAll(":", "")}`;

  if (!analysis || analysis.trajectory.trajectoryPoints.length === 0) {
    return (
      <EmptyState
        description="A completed vehicle reentry evaluation with trajectory points is required to draw this profile."
        title="Reentry visualization unavailable"
      />
    );
  }

  const peakHeating =
    analysis.thermalHistory.thermalPoints.length > 0
      ? analysis.thermalHistory.peakHeatFlux
      : undefined;

  return (
    <section aria-labelledby={titleId} className="min-w-0">
      <header className="flex flex-wrap items-baseline justify-between gap-2 pb-4">
        <LabHeading id={titleId}>Reentry profile</LabHeading>
        <p className="text-sm text-text-secondary">
          {analysis.vehicle.vehicleName}
        </p>
      </header>

      <div className="pt-4">
        <ReentryProfileChart analysis={analysis} />
      </div>

      {/* Five figures: 3 + 2 from sm, one row of five from lg, so no
       * figure is left on a row of its own. */}
      <RecordRow
        className="mt-8 sm:[&>dl]:grid-cols-3 lg:[&>dl]:grid-cols-5"
        items={[
          {
            label: "Entry velocity",
            unit: "m/s",
            value: formatLabValue(
              analysis.trajectory.initialState.velocityMetersPerSecond,
            ),
          },
          {
            label: "Final velocity",
            unit: "m/s",
            value: formatLabValue(
              analysis.trajectory.finalState.velocityMetersPerSecond,
            ),
          },
          peakHeating
            ? {
                label: "Peak heating",
                unit: "kW/m²",
                value: formatLabValue(
                  peakHeating.heatFluxKilowattsPerSquareMetre,
                ),
              }
            : {
                label: "Peak heating",
                value: (
                  <span className="font-sans text-sm text-muted">
                    Thermal profile unavailable
                  </span>
                ),
              },
          {
            label: "Peak deceleration",
            unit: "g",
            value: formatLabValue(
              analysis.trajectory.peakDeceleration.decelerationGs,
            ),
          },
          {
            label: "Duration",
            unit: "s",
            value: formatLabValue(analysis.trajectory.durationSeconds),
          },
        ]}
      />
    </section>
  );
}
