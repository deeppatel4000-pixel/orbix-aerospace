"use client";

import { useId } from "react";
import { Flame, Gauge, Plane } from "lucide-react";

import type {
  ReentryTrajectoryPoint,
  VehicleReentryEvaluationAnalysis,
} from "@/features/engineering-lab/types";

export interface ReentryProfileVisualizationProps {
  readonly analysis?: VehicleReentryEvaluationAnalysis | null;
}

const MAXIMUM_RENDERED_POINTS = 96;

const telemetryFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

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

export function ReentryProfileVisualization({
  analysis,
}: ReentryProfileVisualizationProps) {
  const reactId = useId().replaceAll(":", "");
  const titleId = `reentry-title-${reactId}`;
  const descriptionId = `reentry-description-${reactId}`;
  const gridId = `reentry-grid-${reactId}`;
  const atmosphereGradientId = `atmosphere-gradient-${reactId}`;
  const heatingGradientId = `heating-gradient-${reactId}`;
  const spacecraftGlowId = `reentry-spacecraft-glow-${reactId}`;
  const trajectoryPoints = analysis?.trajectory.trajectoryPoints ?? [];

  if (
    analysis === undefined ||
    analysis === null ||
    trajectoryPoints.length === 0
  ) {
    return (
      <section
        aria-label="Reentry profile visualization"
        className="rounded-2xl border border-border bg-background/45 p-6"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Plane aria-hidden="true" size={19} />
          </span>
          <div>
            <p className="orbix-label text-accent">Reentry telemetry</p>
            <h3 className="mt-1 text-lg font-semibold">
              Reentry visualization unavailable
            </h3>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-muted">
          A completed vehicle reentry evaluation with trajectory points is
          required to render this profile.
        </p>
      </section>
    );
  }

  const plotLeft = 62;
  const plotRight = 604;
  const plotTop = 42;
  const plotBottom = 306;
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
  const altitudePath = sampledPoints
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${plotX(point.timeSeconds).toFixed(2)} ${plotAltitudeY(point.altitudeMeters).toFixed(2)}`,
    )
    .join(" ");
  const velocityPath = sampledPoints
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${plotX(point.timeSeconds).toFixed(2)} ${plotVelocityY(point.velocityMetersPerSecond).toFixed(2)}`,
    )
    .join(" ");
  const peakDeceleration = analysis.trajectory.peakDeceleration;
  const peakDecelerationX = plotX(peakDeceleration.timeSeconds);
  const peakDecelerationY = plotAltitudeY(peakDeceleration.altitudeMeters);
  const thermalDataAvailable = analysis.thermalHistory.thermalPoints.length > 0;
  const peakHeating = thermalDataAvailable
    ? analysis.thermalHistory.peakHeatFlux
    : undefined;
  const peakHeatingX = peakHeating ? plotX(peakHeating.timeSeconds) : 0;
  const peakHeatingY = peakHeating
    ? plotAltitudeY(peakHeating.altitudeMeters)
    : 0;
  const visualSummary = `${analysis.vehicle.vehicleName} descends from ${analysis.trajectory.initialState.altitudeMeters} metres to ${analysis.trajectory.finalState.altitudeMeters} metres while velocity changes from ${analysis.trajectory.initialState.velocityMetersPerSecond} metres per second to ${analysis.trajectory.finalState.velocityMetersPerSecond} metres per second.`;

  return (
    <section
      aria-labelledby={`${titleId}-panel`}
      className="overflow-hidden rounded-2xl border border-border bg-[#071015]"
    >
      <header className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[0.62rem] tracking-[0.16em] text-accent uppercase">
            Atmospheric descent // Time history
          </p>
          <h3 className="mt-1 text-lg font-semibold" id={`${titleId}-panel`}>
            Reentry Profile Visualization
          </h3>
        </div>
        <span className="w-fit rounded-full border border-accent/25 bg-accent/8 px-3 py-1.5 font-mono text-[0.65rem] tracking-[0.08em] text-accent uppercase">
          {analysis.vehicle.vehicleName}
        </span>
      </header>

      <div className="p-3 sm:p-5">
        <svg
          aria-labelledby={`${titleId} ${descriptionId}`}
          className="h-auto w-full"
          role="img"
          viewBox="0 0 660 380"
        >
          <title id={titleId}>Vehicle reentry time history</title>
          <desc id={descriptionId}>{visualSummary}</desc>
          <defs>
            <pattern
              height="24"
              id={gridId}
              patternUnits="userSpaceOnUse"
              width="24"
            >
              <path
                d="M 24 0 L 0 0 0 24"
                fill="none"
                stroke="rgba(118, 164, 173, 0.08)"
                strokeWidth="1"
              />
            </pattern>
            <linearGradient
              id={atmosphereGradientId}
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#12313b" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#1d6572" stopOpacity="0.38" />
            </linearGradient>
            <radialGradient id={heatingGradientId}>
              <stop offset="0%" stopColor="#f2a76f" stopOpacity="0.8" />
              <stop offset="45%" stopColor="#df6f55" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#df6f55" stopOpacity="0" />
            </radialGradient>
            <filter
              height="300%"
              id={spacecraftGlowId}
              width="300%"
              x="-100%"
              y="-100%"
            >
              <feGaussianBlur result="blur" stdDeviation="3" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect fill={`url(#${gridId})`} height="380" width="660" />
          <rect
            fill={`url(#${atmosphereGradientId})`}
            height={plotHeight}
            width={plotWidth}
            x={plotLeft}
            y={plotTop}
          />

          <line
            stroke="#49636a"
            strokeWidth="1"
            x1={plotLeft}
            x2={plotLeft}
            y1={plotTop}
            y2={plotBottom}
          />
          <line
            stroke="#49636a"
            strokeWidth="1"
            x1={plotLeft}
            x2={plotRight}
            y1={plotBottom}
            y2={plotBottom}
          />

          {peakHeating ? (
            <circle
              cx={peakHeatingX}
              cy={peakHeatingY}
              fill={`url(#${heatingGradientId})`}
              r="54"
            />
          ) : null}

          <path
            d={altitudePath}
            fill="none"
            stroke="#77d6c8"
            strokeWidth="2.5"
          />
          <path
            d={velocityPath}
            fill="none"
            opacity="0.9"
            stroke="#e3b273"
            strokeDasharray="7 5"
            strokeWidth="2"
          />

          {peakHeating ? (
            <g>
              <circle
                cx={peakHeatingX}
                cy={peakHeatingY}
                fill="#f2a76f"
                r="4"
                stroke="#071015"
                strokeWidth="2"
              />
              <text
                fill="#f1b384"
                fontFamily="monospace"
                fontSize="9"
                x={peakHeatingX + 9}
                y={peakHeatingY - 9}
              >
                PEAK HEATING
              </text>
            </g>
          ) : null}

          <g>
            <circle
              cx={peakDecelerationX}
              cy={peakDecelerationY}
              fill="#8db8df"
              r="4"
              stroke="#071015"
              strokeWidth="2"
            />
            <text
              fill="#a8c8e5"
              fontFamily="monospace"
              fontSize="9"
              x={peakDecelerationX + 9}
              y={peakDecelerationY + 17}
            >
              PEAK DECELERATION
            </text>
          </g>

          <g aria-hidden="true" className="motion-reduce:hidden">
            <path
              d="M -7 -4 L 7 0 L -7 4 Z"
              fill="#f4ead0"
              filter={`url(#${spacecraftGlowId})`}
            >
              <animateMotion
                dur="10s"
                path={altitudePath}
                repeatCount="indefinite"
                rotate="auto"
              />
            </path>
          </g>
          <path
            aria-hidden="true"
            className="motion-safe:hidden"
            d={`M ${plotX(analysis.trajectory.initialState.timeSeconds) - 7} ${plotAltitudeY(analysis.trajectory.initialState.altitudeMeters) - 4} L ${plotX(analysis.trajectory.initialState.timeSeconds) + 7} ${plotAltitudeY(analysis.trajectory.initialState.altitudeMeters)} L ${plotX(analysis.trajectory.initialState.timeSeconds) - 7} ${plotAltitudeY(analysis.trajectory.initialState.altitudeMeters) + 4} Z`}
            fill="#f4ead0"
            filter={`url(#${spacecraftGlowId})`}
          />

          <g fill="#8099a0" fontFamily="monospace" fontSize="9">
            <text textAnchor="end" x={plotLeft - 9} y={plotTop + 3}>
              {telemetryFormatter.format(maximumAltitude)} m
            </text>
            <text textAnchor="end" x={plotLeft - 9} y={plotBottom + 3}>
              0 m
            </text>
            <text textAnchor="middle" x={plotLeft} y={plotBottom + 24}>
              0 s
            </text>
            <text textAnchor="end" x={plotRight} y={plotBottom + 24}>
              {telemetryFormatter.format(analysis.trajectory.durationSeconds)} s
            </text>
            <text
              textAnchor="middle"
              transform={`rotate(-90 18 ${(plotTop + plotBottom) / 2})`}
              x="18"
              y={(plotTop + plotBottom) / 2}
            >
              ALTITUDE
            </text>
            <text textAnchor="middle" x={(plotLeft + plotRight) / 2} y="356">
              ELAPSED TIME
            </text>
          </g>

          <g fontFamily="monospace" fontSize="9">
            <line
              stroke="#77d6c8"
              strokeWidth="2"
              x1="427"
              x2="449"
              y1="24"
              y2="24"
            />
            <text fill="#9eb6bc" x="455" y="27">
              ALTITUDE PROFILE
            </text>
            <line
              stroke="#e3b273"
              strokeDasharray="5 3"
              strokeWidth="2"
              x1="538"
              x2="560"
              y1="24"
              y2="24"
            />
            <text fill="#9eb6bc" x="566" y="27">
              VELOCITY
            </text>
          </g>
        </svg>
      </div>

      <div className="grid border-t border-white/10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 sm:border-r sm:border-white/10">
          <p className="font-mono text-[0.6rem] tracking-[0.12em] text-[#8099a0] uppercase">
            Velocity change
          </p>
          <p className="mt-1 font-mono text-sm text-[#d6e1e3]">
            {telemetryFormatter.format(
              analysis.trajectory.initialState.velocityMetersPerSecond,
            )}
            {}→{}
            {telemetryFormatter.format(
              analysis.trajectory.finalState.velocityMetersPerSecond,
            )}
            {}
            m/s
          </p>
        </div>
        <div className="border-t border-white/10 p-4 sm:border-t-0 lg:border-r">
          <p className="flex items-center gap-1.5 font-mono text-[0.6rem] tracking-[0.12em] text-[#8099a0] uppercase">
            <Flame aria-hidden="true" size={12} /> Peak heating
          </p>
          <p className="mt-1 font-mono text-sm text-[#e8b07f]">
            {peakHeating
              ? `${telemetryFormatter.format(peakHeating.heatFluxKilowattsPerSquareMetre)} kW/m²`
              : "Thermal profile unavailable"}
          </p>
        </div>
        <div className="border-t border-white/10 p-4 sm:border-r sm:border-white/10 lg:border-t-0">
          <p className="flex items-center gap-1.5 font-mono text-[0.6rem] tracking-[0.12em] text-[#8099a0] uppercase">
            <Gauge aria-hidden="true" size={12} /> Peak deceleration
          </p>
          <p className="mt-1 font-mono text-sm text-[#a8c8e5]">
            {telemetryFormatter.format(peakDeceleration.decelerationGs)} g
          </p>
        </div>
        <div className="border-t border-white/10 p-4 lg:border-t-0">
          <p className="font-mono text-[0.6rem] tracking-[0.12em] text-[#8099a0] uppercase">
            Timeline
          </p>
          <p className="mt-1 font-mono text-sm text-[#d6e1e3]">
            {telemetryFormatter.format(analysis.trajectory.durationSeconds)} s
          </p>
        </div>
      </div>

      <p className="sr-only">{visualSummary}</p>
    </section>
  );
}
