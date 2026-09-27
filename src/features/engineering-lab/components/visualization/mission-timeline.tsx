"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";

import type {
  MissionProfileAnalysis,
  MissionReport,
  VehicleReentryEvaluationAnalysis,
} from "@/features/engineering-lab/types";
import { formatLabValue } from "./format-lab-value";

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
  const firstManeuver = deltaVBudget?.maneuvers[0];
  const tps = missionReport.thermalAnalysis?.tpsRecommendation;

  return [
    {
      available: deltaVBudget !== undefined,
      detail:
        firstManeuver?.name ??
        "Departure is an educational sequence label; no departure maneuver output was reported.",
      id: "departure",
      label: "Launch and departure",
      timingLabel: "Mission start",
    },
    {
      available: transfer !== undefined,
      detail: transfer
        ? `Transfer from ${formatLabValue(transfer.initialOrbit.altitudeMetres)} m to ${formatLabValue(transfer.finalOrbit.altitudeMetres)} m.`
        : "No resolved orbit-transfer output is present.",
      id: "orbit-transfer",
      label: "Orbit transfer",
      timingLabel: transfer ? "reported duration" : "Timing not reported",
      timingValue: transfer
        ? `${formatLabValue(transfer.transfer.transferTimeSeconds)} s`
        : undefined,
    },
    {
      available: planeChange !== undefined || Boolean(firstManeuver),
      detail: planeChange
        ? `${formatLabValue(planeChange.inclinationChangeDegrees)} deg reported inclination change.`
        : (firstManeuver?.name ?? "No resolved maneuver output is present."),
      id: "maneuver",
      label: "Maneuver",
      timingLabel: "Timing not reported",
    },
    {
      available: transfer !== undefined,
      detail: transfer
        ? `${formatLabValue(transfer.finalOrbit.altitudeMetres)} m reported arrival-orbit altitude.`
        : "Arrival orbit is an educational sequence label without a resolved target orbit.",
      id: "arrival-orbit",
      label: "Arrival orbit",
      timingLabel: "Timing not reported",
    },
    {
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
    {
      available: tps !== undefined,
      detail: tps
        ? `${tps.material.name} is the existing report recommendation.`
        : "No TPS recommendation is present.",
      id: "thermal-protection",
      label: "Thermal protection",
      timingLabel: "Post-reentry assessment",
    },
  ];
}

export function MissionTimeline(props: MissionTimelineProps) {
  const timelineId = useId().replaceAll(":", "");
  const phases = buildMissionPhases(props);
  const [activeIndex, setActiveIndex] = useState(0);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activePhase = phases[activeIndex] ?? phases[0];
  const progressPercentage =
    phases.length > 1 ? (activeIndex / (phases.length - 1)) * 100 : 0;

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
        <h3 className="orbix-h4 text-foreground" id={`${timelineId}-title`}>
          Mission phases
        </h3>
        <p className="text-sm text-muted">Arrow keys move between phases.</p>
      </div>

      {/* A container query, not a viewport breakpoint: the timeline sits in
       * columns of different widths, so it reflows to what it is given
       * (2, then 3, then 6 across) instead of scrolling sideways. */}
      <div className="@container mt-4">
        <div
          aria-label="Mission phases"
          className="relative grid grid-cols-2 gap-x-2 gap-y-4 pt-2 @md:grid-cols-3 @3xl:grid-cols-6"
          role="tablist"
        >
          <div
            aria-hidden="true"
            className="absolute top-7 right-[8.5%] left-[8.5%] hidden h-px bg-border @3xl:block"
          >
            <span
              className="block h-px bg-border-control"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {phases.map((phase, index) => {
            const isActive = index === activeIndex;
            const buttonId = `${timelineId}-${phase.id}-tab`;

            return (
              <button
                aria-controls={`${timelineId}-phase-detail`}
                aria-selected={isActive}
                className="group relative z-10 flex flex-col items-center rounded px-1 py-1 text-center"
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
                {/* Timeline node: a circular, non-label shape. */}
                <span
                  className={
                    "flex h-10 w-10 items-center justify-center rounded-full border text-sm transition-colors duration-150 " +
                    (isActive
                      ? "border-accent bg-accent font-semibold text-background"
                      : phase.available
                        ? "border-border-control bg-surface-raised text-foreground"
                        : "border-border-subtle bg-surface text-muted")
                  }
                >
                  <span aria-hidden="true" className="orbix-data">
                    {index + 1}
                  </span>
                </span>
                <span
                  className={
                    "mt-2 text-sm leading-5 [overflow-wrap:anywhere] " +
                    (isActive
                      ? "font-semibold text-foreground"
                      : "text-text-secondary group-hover:text-foreground")
                  }
                >
                  {phase.label}
                </span>
                <span className="orbix-label mt-1">
                  {phase.available ? "Computed" : "Label only"}
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
                  {activePhase.timingValue}
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
