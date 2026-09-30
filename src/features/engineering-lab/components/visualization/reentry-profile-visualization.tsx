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

/**
 * Altitude (solid, left axis, km) and velocity (dashed, right axis, km/s)
 * against elapsed time, drawn from the computed trajectory points. Peak
 * deceleration and peak heating are marked with distinct shapes.
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
  const plotBottom = 300;
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
  const markerInset = 7;
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
  // When the two peaks land on (nearly) the same spot, the triangle would
  // cover the square. The square then moves a marker's width to the side,
  // tied to the true point by a short leader, and the caption says why.
  const markersCoincide =
    peakHeating !== undefined &&
    Math.hypot(
      peakDecelerationX - peakHeatingX,
      peakDecelerationY - peakHeatingY,
    ) < 10;
  // The square is placed 14 units from the triangle's centre (not from its
  // own point, which can sit up to 10 units away), on the side the true
  // point lies, flipped when it would leave the plot.
  const markerSide = Math.sign(peakDecelerationX - peakHeatingX) || 1;
  const markerSideInPlot =
    peakHeatingX + markerSide * 14 > plotRight - 4 ||
    peakHeatingX + markerSide * 14 < plotLeft + 4
      ? -markerSide
      : markerSide;
  const decelerationMarkerX = markersCoincide
    ? peakHeatingX + markerSideInPlot * 14
    : peakDecelerationX;
  // Direction from the true point to the moved square, for the leader.
  const leaderDirection = Math.sign(decelerationMarkerX - peakDecelerationX);
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
          stroke="var(--orbix-data-1)"
          strokeWidth="2.5"
        />
        <path
          d={velocityPath}
          fill="none"
          stroke="var(--orbix-data-2)"
          strokeDasharray="7 5"
          strokeWidth="2"
        />

        {peakHeating ? (
          <path
            d={`M ${peakHeatingX} ${peakHeatingY - 6} L ${peakHeatingX + 6} ${peakHeatingY + 5} L ${peakHeatingX - 6} ${peakHeatingY + 5} Z`}
            fill="var(--orbix-data-2)"
            stroke="var(--orbix-surface)"
            strokeWidth="1.5"
          />
        ) : null}
        {markersCoincide ? (
          <line
            stroke="var(--orbix-data-3)"
            strokeWidth="1"
            x1={peakDecelerationX}
            x2={decelerationMarkerX - leaderDirection * 4}
            y1={peakDecelerationY}
            y2={peakDecelerationY}
          />
        ) : null}
        {/* Drawn after the triangle so it is never hidden under it. */}
        <rect
          fill="var(--orbix-data-3)"
          height="8"
          stroke="var(--orbix-surface)"
          strokeWidth="1.5"
          width="8"
          x={decelerationMarkerX - 4}
          y={peakDecelerationY - 4}
        />

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
          <text textAnchor="start" x={8} y={axisTitleTopY}>
            Altitude (km)
          </text>
          <text textAnchor="end" x={CHART_WIDTH - 4} y={axisTitleTopY}>
            Velocity (km/s)
          </text>
          <text
            textAnchor="middle"
            x={(plotLeft + plotRight) / 2}
            y={axisTitleY}
          >
            Elapsed time
          </text>
        </g>
      </svg>

      <figcaption className="mt-3 text-sm text-text-secondary">
        <ul className="flex flex-wrap gap-x-6 gap-y-1">
          <li className="flex items-center gap-2">
            <svg aria-hidden="true" height="8" width="24">
              <line
                stroke="var(--orbix-data-1)"
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
                stroke="var(--orbix-data-2)"
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
            <svg aria-hidden="true" height="10" width="10">
              <rect
                fill="var(--orbix-data-3)"
                height="8"
                width="8"
                x="1"
                y="1"
              />
            </svg>
            Peak deceleration
          </li>
          {peakHeating ? (
            <li className="flex items-center gap-2">
              <svg aria-hidden="true" height="10" width="12">
                <path d="M 6 0 L 12 10 L 0 10 Z" fill="var(--orbix-data-2)" />
              </svg>
              Peak heating
            </li>
          ) : null}
        </ul>
        {markersCoincide ? (
          <p className="mt-2 max-w-[68ch] text-pretty">
            The deceleration square is offset from the heating triangle; a
            leader marks its true point.
          </p>
        ) : null}
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
      <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border-subtle pb-4">
        <LabHeading id={titleId}>Reentry profile</LabHeading>
        <p className="text-sm text-text-secondary">
          {analysis.vehicle.vehicleName}
        </p>
      </header>

      <div className="pt-4">
        <ReentryProfileChart analysis={analysis} />
      </div>

      <RecordRow
        className="mt-2"
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
