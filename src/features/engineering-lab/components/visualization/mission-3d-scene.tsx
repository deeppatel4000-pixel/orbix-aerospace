"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import type {
  MissionProfileAnalysis,
  MissionReport,
  VehicleReentryEvaluationAnalysis,
} from "@/features/engineering-lab/types";

import { OrbitDiagram } from "./orbit-diagram";
import { ReentryProfileChart } from "./reentry-profile-visualization";
import {
  altitudeReadout,
  formatLabAltitude,
  formatLabValue,
} from "./format-lab-value";
import { formatFigure } from "@/components/ui/readout";
import { LabHeading } from "./lab-heading";

export type Mission3DMode = "orbital" | "reentry";

export interface Mission3DSceneProps {
  readonly initialMode?: Mission3DMode;
  readonly missionProfileAnalysis?: MissionProfileAnalysis | null;
  readonly missionReport?: MissionReport | null;
  readonly vehicleReentryEvaluation?: VehicleReentryEvaluationAnalysis | null;
}

const sceneModes = [
  { id: "orbital", label: "Orbital mission" },
  { id: "reentry", label: "Reentry mission" },
] as const;

function SceneValue({
  label,
  unit,
  value,
}: {
  readonly label: string;
  readonly unit?: string;
  readonly value: number | string | undefined;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-border-subtle py-2 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right">
        <output
          className={
            value === undefined
              ? "text-muted"
              : typeof value === "number"
                ? "orbix-data text-foreground"
                : "text-foreground"
          }
        >
          {typeof value === "number"
            ? formatFigure(formatLabValue(value))
            : (value ?? "Not reported")}
          {value !== undefined && unit ? ` ${unit}` : ""}
        </output>
      </dd>
    </div>
  );
}

/**
 * The mission geometry in two views, as real tabs: the orbits drawn to scale
 * from the computed altitudes, and the reentry altitude and velocity history.
 * Nothing rotates or moves on its own. The export keeps its historical name
 * so existing imports and deep links do not break.
 */
export function Mission3DScene({
  initialMode,
  missionProfileAnalysis,
  missionReport,
  vehicleReentryEvaluation,
}: Mission3DSceneProps) {
  const baseId = `mission-scene-${useId().replaceAll(":", "")}`;
  const deltaVBudget = missionProfileAnalysis?.sourceAnalyses.deltaVBudget;
  const transfer = deltaVBudget?.sourceAnalyses.hohmannTransfer;
  const planeChange = deltaVBudget?.sourceAnalyses.orbitalPlaneChange;
  const hasOrbitalScene = Boolean(transfer || planeChange);
  const hasReentryScene = Boolean(
    vehicleReentryEvaluation?.trajectory.trajectoryPoints.length,
  );
  const [activeMode, setActiveMode] = useState<Mission3DMode>(
    initialMode ?? (hasOrbitalScene ? "orbital" : "reentry"),
  );
  const modeRefs = useRef<Array<HTMLButtonElement | null>>([]);

  if (!hasOrbitalScene && !hasReentryScene) {
    return (
      <EmptyState
        description="A resolved orbital transfer, orbital maneuver, or vehicle reentry evaluation is required to draw the mission scene."
        title="Mission scene unavailable"
      />
    );
  }

  const isAvailable = (mode: Mission3DMode) =>
    mode === "orbital" ? hasOrbitalScene : hasReentryScene;

  function handleModeKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;

    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex =
      (index + direction + sceneModes.length) % sceneModes.length;
    const nextMode = sceneModes[nextIndex];

    if (nextMode && isAvailable(nextMode.id)) {
      setActiveMode(nextMode.id);
      modeRefs.current[nextIndex]?.focus();
    }
  }

  const activeLabel =
    sceneModes.find((mode) => mode.id === activeMode)?.label ?? "";

  return (
    <section aria-labelledby={`${baseId}-title`} className="min-w-0">
      <header className="border-b border-border-subtle pb-4">
        <LabHeading id={`${baseId}-title`}>Mission scene</LabHeading>
      </header>

      <div
        aria-label="Mission scene view"
        className="orbix-tabs mt-4 overflow-visible"
        role="tablist"
      >
        {sceneModes.map((mode, index) => {
          const isActive = mode.id === activeMode;

          return (
            <button
              aria-controls={`${baseId}-panel`}
              aria-selected={isActive}
              className="orbix-tab"
              disabled={!isAvailable(mode.id)}
              id={`${baseId}-${mode.id}-tab`}
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              onKeyDown={(event) => handleModeKeyDown(event, index)}
              ref={(element) => {
                modeRefs.current[index] = element;
              }}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              type="button"
            >
              {mode.label}
            </button>
          );
        })}
      </div>

      <div
        aria-labelledby={`${baseId}-${activeMode}-tab`}
        className="pt-4 sm:pt-6"
        id={`${baseId}-panel`}
        role="tabpanel"
        tabIndex={0}
      >
        {activeMode === "orbital" ? (
          <div
            aria-label="Orbital mission scene"
            className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]"
            role="group"
          >
            <OrbitDiagram
              description={
                transfer
                  ? `Initial orbit at ${formatLabAltitude(transfer.initialOrbit.altitudeMetres)}, target orbit at ${formatLabAltitude(transfer.finalOrbit.altitudeMetres)}, joined by a Hohmann transfer.`
                  : `Maneuver orbit of radius ${formatLabAltitude(planeChange?.orbitalRadiusMetres ?? 0)}.`
              }
              finalAltitudeMetres={transfer?.finalOrbit.altitudeMetres}
              initialAltitudeMetres={transfer?.initialOrbit.altitudeMetres}
              maneuverOrbitRadiusMetres={
                transfer ? undefined : planeChange?.orbitalRadiusMetres
              }
              title="Earth with orbital mission paths"
            />
            <dl>
              {/* The case drawn, not a phase: inside the replay the phase
               * is whichever step is selected, so naming one here would
               * contradict it. */}
              <SceneValue
                label="Orbital case"
                value={transfer ? "Hohmann transfer" : "Plane change"}
              />
              <SceneValue
                label="Total delta-v"
                unit="m/s"
                value={
                  missionReport?.orbitalAnalysis?.totalDeltaVMetresPerSecond ??
                  missionProfileAnalysis?.totalDeltaVMetresPerSecond
                }
              />
              <SceneValue
                label="Transfer duration"
                unit="h"
                value={transfer?.transfer.transferTimeHours}
              />
              <SceneValue
                label="Plane change"
                unit="deg"
                value={planeChange?.inclinationChangeDegrees}
              />
            </dl>
          </div>
        ) : vehicleReentryEvaluation ? (
          <div
            aria-label="Reentry mission scene"
            className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]"
            role="group"
          >
            <ReentryProfileChart analysis={vehicleReentryEvaluation} />
            <dl>
              <SceneValue
                label="Vehicle"
                value={vehicleReentryEvaluation.vehicle.vehicleName}
              />
              <SceneValue
                label="Initial altitude"
                {...altitudeReadout(
                  vehicleReentryEvaluation.summary.flight.initialAltitudeMeters,
                )}
              />
              <SceneValue
                label="Reentry duration"
                unit="s"
                value={
                  vehicleReentryEvaluation.summary.flight.reentryDurationSeconds
                }
              />
              <SceneValue
                label="Peak heating"
                unit="kW/m²"
                value={
                  vehicleReentryEvaluation.summary.thermal
                    .peakHeatFluxKilowattsPerSquareMetre
                }
              />
            </dl>
          </div>
        ) : null}
      </div>

      <p aria-live="polite" className="sr-only" role="status">
        Mission scene view: {activeLabel}.
      </p>
    </section>
  );
}
