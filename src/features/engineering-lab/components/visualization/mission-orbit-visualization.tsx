"use client";

import { useId } from "react";
import { CircleDot, Orbit } from "lucide-react";

import type { MissionProfileAnalysis } from "@/features/engineering-lab/types";

export interface MissionOrbitVisualizationProps {
  readonly analysis?: MissionProfileAnalysis | null;
}

const telemetryFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

export function MissionOrbitVisualization({
  analysis,
}: MissionOrbitVisualizationProps) {
  const reactId = useId().replaceAll(":", "");
  const markerId = `orbit-direction-${reactId}`;
  const planetGradientId = `planet-gradient-${reactId}`;
  const glowId = `spacecraft-glow-${reactId}`;
  const gridId = `orbit-grid-${reactId}`;
  const titleId = `orbit-title-${reactId}`;
  const descriptionId = `orbit-description-${reactId}`;
  const deltaVBudget = analysis?.sourceAnalyses.deltaVBudget;
  const transfer = deltaVBudget?.sourceAnalyses.hohmannTransfer;
  const planeChange = deltaVBudget?.sourceAnalyses.orbitalPlaneChange;

  if (
    analysis === undefined ||
    analysis === null ||
    (!transfer && !planeChange)
  ) {
    return (
      <section
        aria-label="Mission orbit visualization"
        className="rounded-2xl border border-border bg-background/45 p-6"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Orbit aria-hidden="true" size={19} />
          </span>
          <div>
            <p className="font-mono text-[0.65rem] tracking-[0.14em] text-accent uppercase">
              Orbital telemetry
            </p>
            <h3 className="mt-1 text-lg font-semibold">
              Orbital visualization unavailable
            </h3>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-muted">
          This mission profile does not include a resolved Hohmann transfer or
          orbital plane-change analysis.
        </p>
      </section>
    );
  }

  const centreX = 320;
  const centreY = 205;
  const isRaising =
    transfer !== undefined &&
    transfer.finalOrbit.altitudeMetres > transfer.initialOrbit.altitudeMetres;
  const isLowering =
    transfer !== undefined &&
    transfer.finalOrbit.altitudeMetres < transfer.initialOrbit.altitudeMetres;
  const initialRadius = transfer ? (isRaising ? 78 : 128) : 104;
  const targetRadius = transfer ? (isRaising ? 128 : 78) : 104;
  const transferPath = transfer
    ? `M ${centreX + initialRadius} ${centreY} C ${centreX + 118} ${centreY - 148}, ${centreX - 118} ${centreY - 148}, ${centreX - targetRadius} ${centreY}`
    : "";
  const circularPath = `M ${centreX + initialRadius} ${centreY} A ${initialRadius} ${initialRadius} 0 1 1 ${centreX + initialRadius - 0.1} ${centreY}`;
  const animationPath = transferPath || circularPath;
  const missionMode = isRaising
    ? "Orbit raising"
    : isLowering
      ? "Orbit lowering"
      : "Circular orbit";
  const visualSummary = transfer
    ? `${missionMode} from ${transfer.initialOrbit.altitudeMetres} metres to ${transfer.finalOrbit.altitudeMetres} metres using the reported Hohmann transfer path.`
    : `Circular maneuver orbit at ${planeChange?.orbitalRadiusMetres} metres radius with a reported ${planeChange?.inclinationChangeDegrees} degree plane change.`;

  return (
    <section
      aria-labelledby={`${titleId}-panel`}
      className="overflow-hidden rounded-2xl border border-border bg-[#071015]"
    >
      <header className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[0.62rem] tracking-[0.16em] text-accent uppercase">
            Orbital geometry // Mission state
          </p>
          <h3 className="mt-1 text-lg font-semibold" id={`${titleId}-panel`}>
            Mission Orbit Visualization
          </h3>
        </div>
        <span className="w-fit rounded-full border border-accent/25 bg-accent/8 px-3 py-1.5 font-mono text-[0.65rem] tracking-[0.08em] text-accent uppercase">
          {missionMode}
        </span>
      </header>

      <div className="p-3 sm:p-5">
        <svg
          aria-labelledby={`${titleId} ${descriptionId}`}
          className="h-auto w-full"
          role="img"
          viewBox="0 0 640 410"
        >
          <title id={titleId}>Orbital mission geometry</title>
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
            <radialGradient id={planetGradientId}>
              <stop offset="0%" stopColor="#4f8792" />
              <stop offset="62%" stopColor="#1f5965" />
              <stop offset="100%" stopColor="#0a2a34" />
            </radialGradient>
            <filter height="300%" id={glowId} width="300%" x="-100%" y="-100%">
              <feGaussianBlur result="blur" stdDeviation="4" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <marker
              id={markerId}
              markerHeight="7"
              markerWidth="7"
              orient="auto"
              refX="6"
              refY="3.5"
            >
              <path d="M 0 0 L 7 3.5 L 0 7 z" fill="#77d6c8" />
            </marker>
          </defs>

          <rect fill={`url(#${gridId})`} height="410" width="640" />
          <circle
            cx={centreX}
            cy={centreY}
            fill="none"
            opacity="0.35"
            r="166"
            stroke="#30525a"
            strokeDasharray="3 8"
          />

          <circle
            cx={centreX}
            cy={centreY}
            fill="none"
            r={initialRadius}
            stroke="#66aebb"
            strokeDasharray="5 6"
            strokeWidth="1.6"
          />
          {transfer ? (
            <circle
              cx={centreX}
              cy={centreY}
              fill="none"
              r={targetRadius}
              stroke="#77d6c8"
              strokeWidth="1.8"
            />
          ) : null}

          <path
            d={`M ${centreX - initialRadius} ${centreY} A ${initialRadius} ${initialRadius} 0 0 1 ${centreX} ${centreY - initialRadius}`}
            fill="none"
            markerEnd={`url(#${markerId})`}
            opacity="0.85"
            stroke="#66aebb"
            strokeWidth="1.4"
          />
          {transfer ? (
            <path
              d={`M ${centreX + targetRadius} ${centreY} A ${targetRadius} ${targetRadius} 0 0 1 ${centreX} ${centreY + targetRadius}`}
              fill="none"
              markerEnd={`url(#${markerId})`}
              opacity="0.85"
              stroke="#77d6c8"
              strokeWidth="1.4"
            />
          ) : null}

          {transfer ? (
            <path
              d={transferPath}
              fill="none"
              markerEnd={`url(#${markerId})`}
              stroke="#f2b66d"
              strokeDasharray="7 5"
              strokeWidth="2.2"
            />
          ) : null}

          <circle
            cx={centreX}
            cy={centreY}
            fill={`url(#${planetGradientId})`}
            r="43"
            stroke="#72b5bf"
            strokeWidth="1.5"
          />
          <path
            d={`M ${centreX - 36} ${centreY + 4} Q ${centreX - 9} ${centreY - 12} ${centreX + 36} ${centreY + 6}`}
            fill="none"
            opacity="0.45"
            stroke="#9ed7dc"
            strokeWidth="1.2"
          />
          <text
            fill="#b9cbd0"
            fontFamily="monospace"
            fontSize="10"
            textAnchor="middle"
            x={centreX}
            y={centreY + 65}
          >
            REFERENCE BODY
          </text>

          <g aria-hidden="true" className="motion-reduce:hidden">
            <circle fill="#f8e6b6" filter={`url(#${glowId})`} r="4.5">
              <animateMotion
                dur="12s"
                path={animationPath}
                repeatCount="indefinite"
              />
            </circle>
          </g>
          <circle
            aria-hidden="true"
            className="motion-safe:hidden"
            cx={centreX + initialRadius}
            cy={centreY}
            fill="#f8e6b6"
            filter={`url(#${glowId})`}
            r="4.5"
          />

          <g fill="#9eb6bc" fontFamily="monospace" fontSize="10">
            <text x={centreX + initialRadius + 10} y={centreY + 19}>
              INITIAL ORBIT
            </text>
            {transfer ? (
              <text x={centreX - targetRadius - 96} y={centreY + 19}>
                TARGET ORBIT
              </text>
            ) : (
              <text x={centreX - 65} y={centreY - initialRadius - 14}>
                MANEUVER ORBIT
              </text>
            )}
            {transfer ? (
              <text fill="#e3b273" x={centreX - 42} y={centreY - 138}>
                TRANSFER PATH
              </text>
            ) : null}
          </g>
        </svg>
      </div>

      <div className="grid border-t border-white/10 sm:grid-cols-3">
        <div className="p-4 sm:border-r sm:border-white/10">
          <p className="font-mono text-[0.6rem] tracking-[0.12em] text-[#8099a0] uppercase">
            Initial state
          </p>
          <p className="mt-1 font-mono text-sm text-[#d6e1e3]">
            {transfer
              ? `${telemetryFormatter.format(transfer.initialOrbit.altitudeMetres)} m altitude`
              : `${telemetryFormatter.format(planeChange?.orbitalRadiusMetres ?? 0)} m radius`}
          </p>
        </div>
        <div className="border-t border-white/10 p-4 sm:border-t-0 sm:border-r">
          <p className="font-mono text-[0.6rem] tracking-[0.12em] text-[#8099a0] uppercase">
            Target state
          </p>
          <p className="mt-1 font-mono text-sm text-[#d6e1e3]">
            {transfer
              ? `${telemetryFormatter.format(transfer.finalOrbit.altitudeMetres)} m altitude`
              : `${telemetryFormatter.format(planeChange?.inclinationChangeDegrees ?? 0)} deg plane change`}
          </p>
        </div>
        <div className="border-t border-white/10 p-4 sm:border-t-0">
          <p className="font-mono text-[0.6rem] tracking-[0.12em] text-[#8099a0] uppercase">
            Mission output
          </p>
          <p className="mt-1 flex items-center gap-2 font-mono text-sm text-accent">
            <CircleDot aria-hidden="true" size={13} />
            {transfer
              ? `${telemetryFormatter.format(transfer.transfer.totalDeltaVMetresPerSecond)} m/s`
              : `${telemetryFormatter.format(planeChange?.deltaVMetresPerSecond ?? 0)} m/s`}
          </p>
        </div>
      </div>

      <p className="sr-only">{visualSummary}</p>
    </section>
  );
}
