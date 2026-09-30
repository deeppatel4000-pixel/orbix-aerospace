"use client";

import { useEffect, useMemo, useReducer, useState } from "react";

import { EmptyState } from "@/components/ui/empty-state";

import type {
  MissionProfileAnalysis,
  MissionReport,
  VehicleReentryEvaluationAnalysis,
} from "@/features/engineering-lab/types";

import { HeadingLevel, LabHeading, useHeadingLevel } from "./lab-heading";
import { Mission3DScene } from "./mission-3d-scene";
import { ReplayControls, type ReplaySpeed } from "./replay-controls";
import {
  ReplayPhaseIndicator,
  type ReplayPresentationPhase,
} from "./replay-phase-indicator";
import { formatLabValue } from "./format-lab-value";
import { formatFigure } from "@/components/ui/readout";
import { LabUnit } from "./lab-unit";
import {
  MISSION_STAGE,
  MISSION_STAGE_SEQUENCE,
  type CoreMissionStage,
} from "../mission-stages";

export interface MissionReplayProps {
  readonly missionProfileAnalysis?: MissionProfileAnalysis | null;
  readonly missionReport?: MissionReport | null;
  readonly reducedMotionOverride?: boolean;
  readonly vehicleReentryEvaluation?: VehicleReentryEvaluationAnalysis | null;
}

export interface MissionReplayState {
  readonly currentPhaseIndex: number;
  readonly isPlaying: boolean;
  readonly speed: ReplaySpeed;
}

export type MissionReplayAction =
  | { readonly type: "play" }
  | { readonly type: "pause" }
  | { readonly type: "restart" }
  | { readonly speed: ReplaySpeed; readonly type: "set-speed" }
  | { readonly phaseIndex: number; readonly type: "select-phase" }
  | { readonly totalPhases: number; readonly type: "advance" };

const INITIAL_REPLAY_STATE: MissionReplayState = {
  currentPhaseIndex: 0,
  isPlaying: false,
  speed: 1,
};

const presentationDelayMilliseconds: Readonly<Record<ReplaySpeed, number>> = {
  0.5: 4_800,
  1: 2_400,
  2: 1_200,
};

const reducedMotionDelayMilliseconds = 3_600;

export function missionReplayReducer(
  state: MissionReplayState,
  action: MissionReplayAction,
): MissionReplayState {
  if (action.type === "play") return { ...state, isPlaying: true };
  if (action.type === "pause") return { ...state, isPlaying: false };

  if (action.type === "restart") {
    return { ...state, currentPhaseIndex: 0, isPlaying: false };
  }

  if (action.type === "set-speed") {
    return { ...state, speed: action.speed };
  }

  if (action.type === "select-phase") {
    return {
      ...state,
      currentPhaseIndex: action.phaseIndex,
      isPlaying: false,
    };
  }

  if (
    action.totalPhases === 0 ||
    state.currentPhaseIndex >= action.totalPhases - 1
  ) {
    return { ...state, isPlaying: false };
  }

  return { ...state, currentPhaseIndex: state.currentPhaseIndex + 1 };
}

export function buildReplayPhases({
  missionProfileAnalysis,
  missionReport,
  vehicleReentryEvaluation,
}: Omit<
  MissionReplayProps,
  "reducedMotionOverride"
>): readonly ReplayPresentationPhase[] {
  const hasMissionData = Boolean(
    missionProfileAnalysis || missionReport || vehicleReentryEvaluation,
  );

  if (!hasMissionData) return [];

  const deltaVBudget = missionProfileAnalysis?.sourceAnalyses.deltaVBudget;
  const transfer = deltaVBudget?.sourceAnalyses.hohmannTransfer;
  const planeChange = deltaVBudget?.sourceAnalyses.orbitalPlaneChange;
  const hasReentryData = Boolean(vehicleReentryEvaluation);

  // The same stages, in the same order, as the mission phase timeline,
  // plus the one shared trailing step, Review.
  const stagePhases: Readonly<
    Record<CoreMissionStage, Omit<ReplayPresentationPhase, "label">>
  > = {
    [MISSION_STAGE.launch]: {
      description: transfer
        ? "Launch is not modelled; the mission starts from the reported starting orbit."
        : "Launch is not modelled, and no starting orbit was reported.",
      id: "launch",
      sceneMode: "orbital",
      statusLabel: "Launch is not modelled",
    },
    [MISSION_STAGE.orbitInsertion]: {
      description: transfer
        ? "The reported starting orbit."
        : "No starting orbit was reported.",
      id: "orbit-insertion",
      sceneMode: "orbital",
      statusLabel: "Showing the starting orbit",
    },
    [MISSION_STAGE.transfer]: {
      description: transfer
        ? planeChange
          ? "The Hohmann transfer between the two circular orbits, with the reported plane change."
          : "The Hohmann transfer between the two circular orbits."
        : planeChange
          ? "The reported plane change; no orbit transfer was reported."
          : "No orbit transfer was reported.",
      id: "transfer",
      sceneMode: "orbital",
      statusLabel: "Showing the transfer",
    },
    [MISSION_STAGE.arrival]: {
      description: transfer
        ? "The reported arrival orbit at the end of the transfer."
        : "No arrival orbit was reported.",
      id: "arrival",
      sceneMode: "orbital",
      statusLabel: "Showing the arrival orbit",
    },
    [MISSION_STAGE.reentry]: {
      description: hasReentryData
        ? "The computed reentry trajectory and heating results."
        : "No vehicle reentry evaluation was reported.",
      id: "reentry",
      sceneMode: "reentry",
      statusLabel: "Showing reentry results",
    },
  };

  const phases: ReplayPresentationPhase[] = MISSION_STAGE_SEQUENCE.map(
    (stage) => ({ ...stagePhases[stage], label: stage }),
  );

  phases.push({
    description: "The last step: review the reported values below.",
    id: "review",
    label: MISSION_STAGE.review,
    sceneMode: hasReentryData ? "reentry" : "orbital",
    statusLabel: "Reviewing the results",
  });

  return phases;
}

function useReducedMotion(override: boolean | undefined) {
  const [reducedMotion, setReducedMotion] = useState(override ?? false);

  useEffect(() => {
    if (override !== undefined || typeof window === "undefined") return;

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(query.matches);

    updatePreference();
    query.addEventListener("change", updatePreference);

    return () => query.removeEventListener("change", updatePreference);
  }, [override]);

  return reducedMotion;
}

function ReplayTelemetry({
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
      <dd className="min-w-0 text-right">
        <output
          className={
            value === undefined
              ? "text-muted"
              : typeof value === "number"
                ? "orbix-data text-foreground"
                : "break-words text-foreground"
          }
        >
          {typeof value === "number"
            ? formatFigure(formatLabValue(value))
            : (value ?? "Not reported")}
          {value !== undefined && unit ? <LabUnit unit={unit} /> : null}
        </output>
      </dd>
    </div>
  );
}

export function MissionReplay({
  missionProfileAnalysis,
  missionReport,
  reducedMotionOverride,
  vehicleReentryEvaluation,
}: MissionReplayProps) {
  const phases = useMemo(
    () =>
      buildReplayPhases({
        missionProfileAnalysis,
        missionReport,
        vehicleReentryEvaluation,
      }),
    [missionProfileAnalysis, missionReport, vehicleReentryEvaluation],
  );
  const [state, dispatch] = useReducer(
    missionReplayReducer,
    INITIAL_REPLAY_STATE,
  );
  const reducedMotion = useReducedMotion(reducedMotionOverride);
  const headingLevel = useHeadingLevel();
  const activePhase = phases[state.currentPhaseIndex] ?? phases[0];
  const transfer =
    missionProfileAnalysis?.sourceAnalyses.deltaVBudget?.sourceAnalyses
      .hohmannTransfer;

  useEffect(() => {
    if (!state.isPlaying || phases.length === 0) return;

    const delay = reducedMotion
      ? reducedMotionDelayMilliseconds
      : presentationDelayMilliseconds[state.speed];
    const timeout = window.setTimeout(
      () => dispatch({ totalPhases: phases.length, type: "advance" }),
      delay,
    );

    return () => window.clearTimeout(timeout);
  }, [
    phases.length,
    reducedMotion,
    state.currentPhaseIndex,
    state.isPlaying,
    state.speed,
  ]);

  if (!activePhase) {
    return (
      <EmptyState
        description="Supply a completed mission analysis, report, or vehicle reentry evaluation to build a replay."
        title="Replay sequence unavailable"
      />
    );
  }

  return (
    <section
      aria-labelledby="mission-replay-title"
      className="min-w-0"
      data-reduced-motion={reducedMotion ? "true" : "false"}
    >
      <header className="border-b border-border-subtle pb-4">
        <LabHeading id="mission-replay-title">Mission replay</LabHeading>
      </header>

      <div className="space-y-6 pt-6">
        <ReplayControls
          currentPhaseIndex={state.currentPhaseIndex}
          currentPhaseLabel={activePhase.label}
          isPlaying={state.isPlaying}
          onPause={() => dispatch({ type: "pause" })}
          onPlay={() => dispatch({ type: "play" })}
          onRestart={() => dispatch({ type: "restart" })}
          onSpeedChange={(speed) => dispatch({ speed, type: "set-speed" })}
          speed={state.speed}
          totalPhases={phases.length}
        />

        {/* The step row reflows to its column (2, 3 or 6 across). */}
        <div className="@container border-t border-border-subtle pt-6">
          <ReplayPhaseIndicator
            currentPhaseIndex={state.currentPhaseIndex}
            onSelectPhase={(phaseIndex) =>
              dispatch({ phaseIndex, type: "select-phase" })
            }
            phases={phases}
          />
        </div>

        {/* The selected step's note. Its name is already on the step row and
         * in the status line, so it is not repeated as a heading here. */}
        <p className="max-w-[68ch] text-sm leading-6 text-text-secondary">
          {activePhase.description}
        </p>

        <HeadingLevel level={headingLevel + 1}>
          <Mission3DScene
            initialMode={activePhase.sceneMode}
            key={activePhase.id}
            missionProfileAnalysis={
              activePhase.sceneMode === "orbital"
                ? missionProfileAnalysis
                : null
            }
            missionReport={missionReport}
            vehicleReentryEvaluation={
              activePhase.sceneMode === "reentry"
                ? vehicleReentryEvaluation
                : null
            }
          />
        </HeadingLevel>

        <section aria-labelledby="replay-telemetry-title">
          <LabHeading id="replay-telemetry-title" offset={1} variant="sub">
            Values for this mission
          </LabHeading>
          <dl className="mt-2 grid gap-x-8 sm:grid-cols-2">
            <ReplayTelemetry label="Active phase" value={activePhase.label} />
            <ReplayTelemetry
              label="Total delta-v"
              unit="m/s"
              value={missionProfileAnalysis?.totalDeltaVMetresPerSecond}
            />
            <ReplayTelemetry
              label="Transfer duration"
              unit="h"
              value={transfer?.transfer.transferTimeHours}
            />
            <ReplayTelemetry
              label="Vehicle"
              value={vehicleReentryEvaluation?.vehicle.vehicleName}
            />
            <ReplayTelemetry
              label="Peak heating"
              unit="kW/m²"
              value={
                vehicleReentryEvaluation?.summary.thermal
                  .peakHeatFluxKilowattsPerSquareMetre
              }
            />
          </dl>
        </section>

        <p className="text-sm leading-6 text-muted">
          Play steps through the phases one at a time and stops at the end.
          {reducedMotion
            ? " Reduced motion is on, so each phase is held longer and nothing animates between phases."
            : " Nothing animates between phases."}
        </p>
      </div>

      <p aria-live="polite" className="sr-only" role="status">
        Mission replay phase changed to {activePhase.label}.{" "}
        {state.isPlaying ? "Playing." : "Paused."}
      </p>
    </section>
  );
}
