"use client";

import { useEffect, useMemo, useReducer, useState } from "react";

import { EmptyState } from "@/components/ui/empty-state";

import type {
  MissionProfileAnalysis,
  MissionReport,
  VehicleReentryEvaluationAnalysis,
} from "@/features/engineering-lab/types";

import { Mission3DScene } from "./mission-3d-scene";
import { ReplayControls, type ReplaySpeed } from "./replay-controls";
import {
  ReplayPhaseIndicator,
  type ReplayPresentationPhase,
} from "./replay-phase-indicator";
import { formatLabValue } from "./format-lab-value";

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
  const hasOrbitalData = Boolean(deltaVBudget);
  const hasReentryData = Boolean(vehicleReentryEvaluation);
  const preparationScene = hasOrbitalData ? "orbital" : "reentry";
  const phases: ReplayPresentationPhase[] = [
    {
      description: "The completed mission results are loaded for review.",
      id: "preparation",
      label: "Mission preparation",
      sceneMode: preparationScene,
      statusLabel: "Mission results loaded",
    },
  ];

  if (deltaVBudget?.maneuvers.length) {
    phases.push({
      description: "Departure, shown from the mission's maneuver sequence.",
      id: "departure",
      label: "Launch and departure",
      sceneMode: "orbital",
      statusLabel: "Showing departure maneuvers",
    });
  }

  if (hasOrbitalData) {
    phases.push({
      description:
        "The computed orbital results. No new trajectory is propagated.",
      id: "orbital-operations",
      label: "Orbital operations",
      sceneMode: "orbital",
      statusLabel: "Showing orbital results",
    });
  }

  if (transfer) {
    phases.push({
      description: "The Hohmann transfer between the two circular orbits.",
      id: "transfer",
      label: "Transfer maneuver",
      sceneMode: "orbital",
      statusLabel: "Showing the transfer",
    });
  }

  if (transfer || planeChange) {
    phases.push({
      description:
        "Arrival at the target orbit. A label for the computed orbital results, not a separate calculation.",
      id: "arrival",
      label: "Arrival and cruise",
      sceneMode: "orbital",
      statusLabel: "Showing arrival",
    });
  }

  if (hasReentryData) {
    phases.push(
      {
        description:
          "The vehicle and its entry conditions from the reentry evaluation.",
        id: "reentry-preparation",
        label: "Reentry preparation",
        sceneMode: "reentry",
        statusLabel: "Showing entry conditions",
      },
      {
        description: "The computed reentry trajectory and heating results.",
        id: "atmospheric-entry",
        label: "Atmospheric entry",
        sceneMode: "reentry",
        statusLabel: "Showing entry results",
      },
    );
  }

  phases.push({
    description: "The end of the replay.",
    id: "complete",
    label: "Mission complete",
    sceneMode: hasReentryData ? "reentry" : preparationScene,
    statusLabel: "End of replay",
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
            ? formatLabValue(value)
            : (value ?? "Not reported")}
          {value !== undefined && unit ? ` ${unit}` : ""}
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
      <header className="flex flex-col gap-2 border-b border-border-subtle pb-4 sm:flex-row sm:items-baseline sm:justify-between">
        <h3 className="orbix-h3 text-foreground" id="mission-replay-title">
          Mission replay
        </h3>
        <p className="text-sm text-text-secondary">
          <span className="text-muted">Now: </span>
          <output>{activePhase.statusLabel}</output>
        </p>
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

        <div className="overflow-x-auto pb-2">
          <ReplayPhaseIndicator
            currentPhaseIndex={state.currentPhaseIndex}
            onSelectPhase={(phaseIndex) =>
              dispatch({ phaseIndex, type: "select-phase" })
            }
            phases={phases}
          />
        </div>

        <section aria-labelledby="replay-active-phase-title">
          <p className="orbix-label">
            {activePhase.sceneMode === "orbital" ? "Orbital" : "Reentry"} phase
          </p>
          <h4
            className="orbix-h4 mt-1 text-foreground"
            id="replay-active-phase-title"
          >
            {activePhase.label}
          </h4>
          <p className="mt-1 max-w-[68ch] text-sm leading-6 text-text-secondary">
            {activePhase.description}
          </p>
        </section>

        <Mission3DScene
          initialMode={activePhase.sceneMode}
          key={activePhase.id}
          missionProfileAnalysis={
            activePhase.sceneMode === "orbital" ? missionProfileAnalysis : null
          }
          missionReport={missionReport}
          vehicleReentryEvaluation={
            activePhase.sceneMode === "reentry"
              ? vehicleReentryEvaluation
              : null
          }
        />

        <section aria-labelledby="replay-telemetry-title">
          <h4 className="orbix-h4 text-foreground" id="replay-telemetry-title">
            Values for this mission
          </h4>
          <dl className="mt-2 grid gap-x-8 sm:grid-cols-2">
            <ReplayTelemetry label="Active phase" value={activePhase.label} />
            <ReplayTelemetry
              label="Total delta-v"
              unit="m/s"
              value={missionProfileAnalysis?.totalDeltaVMetresPerSecond}
            />
            <ReplayTelemetry
              label="Transfer duration"
              unit="s"
              value={transfer?.transfer.transferTimeSeconds}
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
