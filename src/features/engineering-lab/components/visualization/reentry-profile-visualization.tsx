"use client";

import { useId, type ReactNode } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import type {
  ReentryTrajectoryPoint,
  VehicleReentryEvaluationAnalysis,
} from "@/features/engineering-lab/types";
import { formatLabValue } from "./format-lab-value";

export interface ReentryProfileVisualizationProps {
  readonly analysis?: VehicleReentryEvaluationAnalysis | null;
}

const MAXIMUM_RENDERED_POINTS = 96;

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

  const plotLeft = 64;
  const plotRight = 596;
  const plotTop = 40;
  const plotBottom = 300;
  const plotWidth = plotRight - plotLeft;
  const plotHeight = plotBottom - plotTop;
  const sampledPoints = sampleTrajectoryPoints(trajectoryPoints);
  const maximumTime = Math.max(analysis.trajectory.durationSeconds, 1);
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
  const plotX = (timeSeconds: number) =>
    plotLeft + (timeSeconds / maximumTime) * plotWidth;
  const plotAltitudeY = (altitudeMeters: number) =>
    plotBottom - (altitudeMeters / maximumAltitude) * plotHeight;
  const plotVelocityY = (velocityMetersPerSecond: number) =>
    plotBottom - (velocityMetersPerSecond / maximumVelocity) * plotHeight;
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
  const peakDeceleration = analysis.trajectory.peakDeceleration;
  const peakDecelerationX = plotX(peakDeceleration.timeSeconds);
  const peakDecelerationY = plotAltitudeY(peakDeceleration.altitudeMeters);
  const peakHeating =
    analysis.thermalHistory.thermalPoints.length > 0
      ? analysis.thermalHistory.peakHeatFlux
      : undefined;
  const visualSummary = `${analysis.vehicle.vehicleName} descends from ${formatLabValue(analysis.trajectory.initialState.altitudeMeters)} m to ${formatLabValue(analysis.trajectory.finalState.altitudeMeters)} m while velocity changes from ${formatLabValue(analysis.trajectory.initialState.velocityMetersPerSecond)} m/s to ${formatLabValue(analysis.trajectory.finalState.velocityMetersPerSecond)} m/s over ${formatLabValue(analysis.trajectory.durationSeconds)} s.`;
  const gridFractions = [0.25, 0.5, 0.75];

  return (
    <figure className="m-0">
      <svg
        aria-labelledby={`${titleId} ${descriptionId}`}
        className="block h-auto w-full"
        role="img"
        viewBox="0 0 660 350"
      >
        <title id={titleId}>Vehicle reentry time history</title>
        <desc id={descriptionId}>{visualSummary}</desc>

        {gridFractions.map((fraction) => (
          <line
            key={fraction}
            stroke="var(--orbix-data-grid)"
            strokeWidth="1"
            x1={plotLeft}
            x2={plotRight}
            y1={plotBottom - fraction * plotHeight}
            y2={plotBottom - fraction * plotHeight}
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

        <rect
          fill="var(--orbix-data-3)"
          height="8"
          stroke="var(--orbix-surface)"
          strokeWidth="1.5"
          width="8"
          x={peakDecelerationX - 4}
          y={peakDecelerationY - 4}
        />
        {peakHeating ? (
          <path
            d={`M ${plotX(peakHeating.timeSeconds)} ${plotAltitudeY(peakHeating.altitudeMeters) - 6} L ${plotX(peakHeating.timeSeconds) + 6} ${plotAltitudeY(peakHeating.altitudeMeters) + 5} L ${plotX(peakHeating.timeSeconds) - 6} ${plotAltitudeY(peakHeating.altitudeMeters) + 5} Z`}
            fill="var(--orbix-data-2)"
            stroke="var(--orbix-surface)"
            strokeWidth="1.5"
          />
        ) : null}

        <g
          fill="var(--orbix-data-axis)"
          fontFamily="var(--font-telemetry), monospace"
          fontSize="11"
        >
          <text textAnchor="end" x={plotLeft - 8} y={plotTop + 4}>
            {formatLabValue(maximumAltitude / 1000)}
          </text>
          <text textAnchor="end" x={plotLeft - 8} y={plotBottom + 4}>
            0
          </text>
          <text textAnchor="start" x={plotRight + 8} y={plotTop + 4}>
            {formatLabValue(maximumVelocity / 1000)}
          </text>
          <text textAnchor="start" x={plotRight + 8} y={plotBottom + 4}>
            0
          </text>
          <text textAnchor="middle" x={plotLeft} y={plotBottom + 20}>
            0 s
          </text>
          <text textAnchor="end" x={plotRight} y={plotBottom + 20}>
            {formatLabValue(analysis.trajectory.durationSeconds)} s
          </text>
          <text textAnchor="start" x={plotLeft - 56} y={plotTop - 16}>
            Altitude (km)
          </text>
          <text textAnchor="end" x={plotRight + 60} y={plotTop - 16}>
            Velocity (km/s)
          </text>
          <text textAnchor="middle" x={(plotLeft + plotRight) / 2} y="340">
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
      </figcaption>
    </figure>
  );
}

/** Mono is for machine values only (spec 5): callers wrap the number and
 * unit in `orbix-data` and leave connecting words in the sans face. */
function Value({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-border-subtle py-2 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right text-foreground">{value}</dd>
    </div>
  );
}

function Num({ children }: { children: string }) {
  return <span className="orbix-data">{children}</span>;
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
        <h3 className="orbix-h3 text-foreground" id={titleId}>
          Reentry profile
        </h3>
        <p className="text-sm text-text-secondary">
          {analysis.vehicle.vehicleName}
        </p>
      </header>

      <div className="pt-4">
        <ReentryProfileChart analysis={analysis} />
      </div>

      <dl className="grid gap-x-8 border-t border-border-subtle pb-2 sm:grid-cols-2 lg:grid-cols-4">
        <Value
          label="Velocity change"
          value={
            <>
              <Num>
                {formatLabValue(
                  analysis.trajectory.initialState.velocityMetersPerSecond,
                )}
              </Num>{" "}
              to{" "}
              <Num>{`${formatLabValue(analysis.trajectory.finalState.velocityMetersPerSecond)} m/s`}</Num>
            </>
          }
        />
        <div className="flex items-baseline justify-between gap-4 border-t border-border-subtle py-2 text-sm">
          <dt className="text-muted">Peak heating</dt>
          <dd
            className={
              peakHeating
                ? "orbix-data text-right text-foreground"
                : "text-right text-muted"
            }
          >
            {peakHeating
              ? `${formatLabValue(peakHeating.heatFluxKilowattsPerSquareMetre)} kW/m²`
              : "Thermal profile unavailable"}
          </dd>
        </div>
        <Value
          label="Peak deceleration"
          value={
            <Num>{`${formatLabValue(analysis.trajectory.peakDeceleration.decelerationGs)} g`}</Num>
          }
        />
        <Value
          label="Duration"
          value={
            <Num>{`${formatLabValue(analysis.trajectory.durationSeconds)} s`}</Num>
          }
        />
      </dl>
    </section>
  );
}
