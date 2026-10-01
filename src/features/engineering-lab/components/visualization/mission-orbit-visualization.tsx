"use client";

import { useId } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { RecordRow } from "@/components/ui/record-row";
import type { MissionProfileAnalysis } from "@/features/engineering-lab/types";

import { OrbitDiagram } from "./orbit-diagram";
import {
  altitudeReadout,
  formatLabAltitude,
  formatLabValue,
} from "./format-lab-value";
import { LabHeading } from "./lab-heading";

export interface MissionOrbitVisualizationProps {
  readonly analysis?: MissionProfileAnalysis | null;
}

/** A record-row figure for a distance, in km from 1 km up. */
function altitudeItem(label: string, metres: number) {
  const { unit, value } = altitudeReadout(metres);
  return { label, unit, value: formatLabValue(value) };
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
    ? `${missionMode} from ${formatLabAltitude(transfer.initialOrbit.altitudeMetres)} to ${formatLabAltitude(transfer.finalOrbit.altitudeMetres)} altitude by a Hohmann transfer.`
    : `Circular maneuver orbit of radius ${formatLabAltitude(planeChange?.orbitalRadiusMetres ?? 0)} with a ${formatLabValue(planeChange?.inclinationChangeDegrees ?? 0)} degree plane change.`;

  return (
    <section aria-labelledby={titleId} className="min-w-0">
      <header className="flex flex-wrap items-baseline justify-between gap-2 pb-4">
        <LabHeading id={titleId}>Mission orbit diagram</LabHeading>
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

      <RecordRow
        className="mt-4"
        items={
          transfer
            ? [
                altitudeItem(
                  "Initial altitude",
                  transfer.initialOrbit.altitudeMetres,
                ),
                altitudeItem(
                  "Target altitude",
                  transfer.finalOrbit.altitudeMetres,
                ),
                {
                  label: "Delta-v",
                  unit: "m/s",
                  value: formatLabValue(
                    transfer.transfer.totalDeltaVMetresPerSecond,
                  ),
                },
              ]
            : [
                altitudeItem(
                  "Orbit radius",
                  planeChange?.orbitalRadiusMetres ?? 0,
                ),
                {
                  // The degree sign sits on the figure with no space, as in
                  // the report and ground track, so it travels in the value.
                  label: "Plane change",
                  value: `${formatLabValue(
                    planeChange?.inclinationChangeDegrees ?? 0,
                  )}°`,
                },
                {
                  label: "Delta-v",
                  unit: "m/s",
                  value: formatLabValue(
                    planeChange?.deltaVMetresPerSecond ?? 0,
                  ),
                },
              ]
        }
      />
    </section>
  );
}
