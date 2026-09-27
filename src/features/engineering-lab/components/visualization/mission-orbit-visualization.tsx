"use client";

import { useId, type ReactNode } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import type { MissionProfileAnalysis } from "@/features/engineering-lab/types";

import { OrbitDiagram } from "./orbit-diagram";
import { formatLabValue } from "./format-lab-value";

export interface MissionOrbitVisualizationProps {
  readonly analysis?: MissionProfileAnalysis | null;
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

export function MissionOrbitVisualization({
  analysis,
}: MissionOrbitVisualizationProps) {
  const titleId = `mission-orbit-title-${useId().replaceAll(":", "")}`;
  const deltaVBudget = analysis?.sourceAnalyses.deltaVBudget;
  const transfer = deltaVBudget?.sourceAnalyses.hohmannTransfer;
  const planeChange = deltaVBudget?.sourceAnalyses.orbitalPlaneChange;

  if (!analysis || (!transfer && !planeChange)) {
    return (
      <EmptyState
        description="This mission profile does not include a resolved Hohmann transfer or orbital plane-change analysis."
        title="Orbital visualization unavailable"
      />
    );
  }

  const initialAltitude = transfer?.initialOrbit.altitudeMetres;
  const finalAltitude = transfer?.finalOrbit.altitudeMetres;
  const missionMode =
    transfer === undefined
      ? "Circular orbit"
      : (finalAltitude ?? 0) > (initialAltitude ?? 0)
        ? "Orbit raising"
        : (finalAltitude ?? 0) < (initialAltitude ?? 0)
          ? "Orbit lowering"
          : "Circular orbit";
  const visualSummary = transfer
    ? `${missionMode} from ${formatLabValue(transfer.initialOrbit.altitudeMetres)} m to ${formatLabValue(transfer.finalOrbit.altitudeMetres)} m altitude by a Hohmann transfer.`
    : `Circular maneuver orbit of radius ${formatLabValue(planeChange?.orbitalRadiusMetres ?? 0)} m with a ${formatLabValue(planeChange?.inclinationChangeDegrees ?? 0)} degree plane change.`;

  return (
    <section aria-labelledby={titleId} className="min-w-0">
      <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border-subtle pb-4">
        <h3 className="orbix-h3 text-foreground" id={titleId}>
          Mission orbit diagram
        </h3>
        <p className="text-sm text-text-secondary">{missionMode}</p>
      </header>

      <div className="pt-4">
        <OrbitDiagram
          description={visualSummary}
          finalAltitudeMetres={finalAltitude}
          initialAltitudeMetres={initialAltitude}
          maneuverOrbitRadiusMetres={
            transfer ? undefined : planeChange?.orbitalRadiusMetres
          }
          title="Orbital mission geometry"
        />
      </div>

      <dl className="grid gap-x-8 border-t border-border-subtle pb-2 sm:grid-cols-3">
        <Value
          label="Initial state"
          value={
            transfer ? (
              <>
                <Num>{`${formatLabValue(transfer.initialOrbit.altitudeMetres)} m`}</Num>{" "}
                altitude
              </>
            ) : (
              <>
                <Num>{`${formatLabValue(planeChange?.orbitalRadiusMetres ?? 0)} m`}</Num>{" "}
                radius
              </>
            )
          }
        />
        <Value
          label="Target state"
          value={
            transfer ? (
              <>
                <Num>{`${formatLabValue(transfer.finalOrbit.altitudeMetres)} m`}</Num>{" "}
                altitude
              </>
            ) : (
              <>
                <Num>{`${formatLabValue(planeChange?.inclinationChangeDegrees ?? 0)} deg`}</Num>{" "}
                plane change
              </>
            )
          }
        />
        <Value
          label="Delta-v"
          value={
            <Num>{`${formatLabValue(
              transfer
                ? transfer.transfer.totalDeltaVMetresPerSecond
                : (planeChange?.deltaVMetresPerSecond ?? 0),
            )} m/s`}</Num>
          }
        />
      </dl>
    </section>
  );
}
