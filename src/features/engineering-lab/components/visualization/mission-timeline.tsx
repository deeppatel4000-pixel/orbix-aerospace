"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";

import type {
  MissionProfileAnalysis,
  MissionReport,
  VehicleReentryEvaluationAnalysis,
} from "@/features/engineering-lab/types";
import { formatLabAltitude, formatLabValue } from "./format-lab-value";
import { formatFigure } from "@/components/ui/readout";
import {
  MISSION_STAGE,
  MISSION_STAGE_SEQUENCE,
  type CoreMissionStage,
} from "../mission-stages";
import { LabHeading } from "./lab-heading";

export interface MissionTimelineProps {
  readonly missionProfileAnalysis: MissionProfileAnalysis;
  readonly missionReport: MissionReport;
  readonly vehicleReentryEvaluation?: VehicleReentryEvaluationAnalysis | null;
}

interface MissionPhase {
  readonly available: boolean;
  readonly detail: string;
  readonly id: string;
  readonly label: string;
  /** The tab's text, 16 characters or fewer. */
  readonly shortLabel: string;
  /** Descriptive timing text, set in the sans face. */
  readonly timingLabel: string;
  /** Optional machine value (number and unit) shown in mono before the label. */
  readonly timingValue?: string;
}

function buildMissionPhases({
  missionProfileAnalysis,
  missionReport,
  vehicleReentryEvaluation,
}: MissionTimelineProps): readonly MissionPhase[] {
  const deltaVBudget = missionProfileAnalysis.sourceAnalyses.deltaVBudget;
  const transfer = deltaVBudget?.sourceAnalyses.hohmannTransfer;
  const planeChange = deltaVBudget?.sourceAnalyses.orbitalPlaneChange;
  const tps = missionReport.thermalAnalysis?.tpsRecommendation;

  const transferDetail = transfer
    ? `Transfer from ${formatLabAltitude(transfer.initialOrbit.altitudeMetres)} to ${formatLabAltitude(transfer.finalOrbit.altitudeMetres)}` +
      (planeChange
        ? `, with a ${formatLabValue(planeChange.inclinationChangeDegrees)}° plane change.`
        : ".")
    : planeChange
      ? `${formatLabValue(planeChange.inclinationChangeDegrees)}° plane change; no orbit transfer was reported.`
      : "No resolved orbit-transfer output is present.";

  const corePhases: Readonly<
    Record<CoreMissionStage, Omit<MissionPhase, "shortLabel">>
  > = {
    [MISSION_STAGE.launch]: {
      available: false,
      detail:
        "Launch is not modelled; the mission starts from the reported starting orbit.",
      id: "departure",
      label: "Launch",
      timingLabel: "Mission start",
    },
    [MISSION_STAGE.orbitInsertion]: {
      available: transfer !== undefined,
      detail: transfer
        ? `Starting orbit at ${formatLabAltitude(transfer.initialOrbit.altitudeMetres)}.`
        : "No starting orbit was reported.",
      id: "orbit-insertion",
      label: "Orbit insertion",
      timingLabel: "Timing not reported",
    },
    [MISSION_STAGE.transfer]: {
      available: transfer !== undefined || planeChange !== undefined,
      detail: transferDetail,
      id: "orbit-transfer",
      label: planeChange ? "Orbit transfer and plane change" : "Orbit transfer",
      timingLabel: transfer ? "reported duration" : "Timing not reported",
      timingValue: transfer
        ? `${formatLabValue(transfer.transfer.transferTimeHours)} h`
        : undefined,
    },
    [MISSION_STAGE.arrival]: {
      available: transfer !== undefined,
      detail: transfer
        ? `${formatLabAltitude(transfer.finalOrbit.altitudeMetres)} reported arrival-orbit altitude.`
        : "No target orbit was reported.",
      id: "arrival-orbit",
      label: "Arrival orbit",
      timingLabel: "Timing not reported",
    },
    [MISSION_STAGE.reentry]: {
      available:
        vehicleReentryEvaluation !== undefined &&
        vehicleReentryEvaluation !== null,
      detail: vehicleReentryEvaluation
        ? `${vehicleReentryEvaluation.vehicle.vehicleName} completed the reported reentry profile.`
        : "No completed vehicle reentry evaluation is present.",
      id: "reentry",
      label: "Reentry",
      timingLabel: vehicleReentryEvaluation
        ? "reported duration"
        : "Timing not reported",
      timingValue: vehicleReentryEvaluation
        ? `${formatLabValue(vehicleReentryEvaluation.trajectory.durationSeconds)} s`
        : undefined,
    },
  };

  // The shared sequence, then one trailing result step: the heat-shield
  // recommendation assessed from the reentry results.
  return [
    ...MISSION_STAGE_SEQUENCE.map((stage) => ({
      ...corePhases[stage],
      shortLabel: stage,
    })),
    {
      available: tps !== undefined,
      detail: tps
        ? `${tps.material.name} is the report's recommended material.`
        : "No thermal protection recommendation is present.",
      id: "thermal-protection",
      label: "Thermal protection result",
      shortLabel: MISSION_STAGE.thermalProtection,
      timingLabel: "Assessed after reentry",
    },
  ];
}

export function MissionTimeline(props: MissionTimelineProps) {
  const timelineId = useId().replaceAll(":", "");
  const phases = buildMissionPhases(props);
  const [activeIndex, setActiveIndex] = useState(0);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activePhase = phases[activeIndex] ?? phases[0];

  function selectPhase(index: number) {
    setActiveIndex(index);
  }

  function focusPhase(index: number) {
    selectPhase(index);
    buttonRefs.current[index]?.focus();
  }

  function handlePhaseKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      focusPhase((index + 1) % phases.length);
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      focusPhase((index - 1 + phases.length) % phases.length);
    }

    if (event.key === "Home") {
      event.preventDefault();
      focusPhase(0);
    }

    if (event.key === "End") {
      event.preventDefault();
      focusPhase(phases.length - 1);
    }
  }

  return (
    <section aria-labelledby={`${timelineId}-title`}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <LabHeading id={`${timelineId}-title`}>Mission phases</LabHeading>
        <p className="text-sm text-muted">Arrow keys move between phases.</p>
      </div>

      {/* The same step row as the guided demo: B612 Mono number, label,
       * 2px rule under each step, accent under the selected one. A
       * container query, not a viewport breakpoint, sets 2, 3 or 6 across
       * (the longer trailing label gets a wider track),
       * so the row reflows to its column instead of scrolling sideways. */}
      <div className="@container mt-4">
        <div
          aria-label="Mission phases"
          className="grid grid-cols-2 gap-x-4 gap-y-1 @md:grid-cols-3 @3xl:grid-cols-[repeat(5,minmax(0,1fr))_minmax(0,1.5fr)]"
          role="tablist"
        >
          {phases.map((phase, index) => {
            const isActive = index === activeIndex;
            const buttonId = `${timelineId}-${phase.id}-tab`;

            return (
              <button
                aria-controls={`${timelineId}-phase-detail`}
                aria-selected={isActive}
                className={
                  "flex min-h-11 flex-col items-start justify-end border-b-2 py-2 text-left text-sm leading-5 transition-colors focus-visible:outline-offset-[-2px] " +
                  (isActive
                    ? "border-accent font-medium text-foreground"
                    : phase.available
                      ? "border-border text-text-secondary hover:border-border-control hover:text-foreground"
                      : "border-border text-muted hover:border-border-control hover:text-foreground")
                }
                id={buttonId}
                key={phase.id}
                onClick={() => selectPhase(index)}
                onKeyDown={(event) => handlePhaseKeyDown(event, index)}
                ref={(element) => {
                  buttonRefs.current[index] = element;
                }}
                role="tab"
                tabIndex={isActive ? 0 : -1}
                type="button"
              >
                {/* A status only when it differs from the norm. */}
                {phase.available ? null : (
                  <span className="orbix-label mb-1">Label only</span>
                )}
                <span className="[overflow-wrap:anywhere]">
                  <span aria-hidden="true" className="orbix-data mr-2">
                    {index + 1}
                  </span>
                  {/* Short, so every label sits on one line over the
                   * shared rule; the panel below gives the full name. */}
                  {phase.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {activePhase ? (
        <div
          aria-labelledby={`${timelineId}-${activePhase.id}-tab`}
          className="mt-3 flex flex-col gap-2 border-t border-border-subtle pt-3 sm:flex-row sm:items-start sm:justify-between"
          id={`${timelineId}-phase-detail`}
          role="tabpanel"
          tabIndex={0}
        >
          <div>
            <p className="text-sm font-semibold text-foreground">
              {activePhase.label}
            </p>
            <p className="mt-1 max-w-[68ch] text-sm leading-6 text-text-secondary">
              {activePhase.detail}
            </p>
          </div>
          <output className="shrink-0 text-sm text-foreground">
            {activePhase.timingValue ? (
              <>
                <span className="orbix-data">
                  {formatFigure(activePhase.timingValue)}
                </span>{" "}
              </>
            ) : null}
            {activePhase.timingLabel}
          </output>
        </div>
      ) : null}
    </section>
  );
}
