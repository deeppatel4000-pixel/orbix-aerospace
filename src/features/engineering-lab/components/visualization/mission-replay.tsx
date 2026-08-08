"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import { Clapperboard, Flame, Gauge, Orbit } from "lucide-react";

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

const replayFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

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
      description:
        "Completed mission objects are loaded into the presentation workspace.",
      id: "preparation",
      label: "Mission Preparation",
      sceneMode: preparationScene,
      statusLabel: "Data link ready",
    },
  ];

  if (deltaVBudget?.maneuvers.length) {
    phases.push({
      description:
        "Departure is presented from the existing mission maneuver sequence.",
      id: "departure",
      label: "Launch / Departure",
      sceneMode: "orbital",
      statusLabel: "Departure sequence",
    });
  }

  if (hasOrbitalData) {
    phases.push({
      description:
        "Available orbital outputs are displayed without propagating a new trajectory.",
      id: "orbital-operations",
      label: "Orbital Operations",
      sceneMode: "orbital",
      statusLabel: "Orbital telemetry active",
    });
  }

  if (transfer) {
    phases.push({
      description:
        "The resolved Hohmann transfer is presented using its existing mission outputs.",
      id: "transfer",
      label: "Transfer Maneuver",
      sceneMode: "orbital",
      statusLabel: "Transfer path active",
    });
  }

  if (transfer || planeChange) {
    phases.push({
      description:
        "Arrival and cruise are educational sequence labels for resolved orbital outputs.",
      id: "arrival",
      label: "Arrival / Cruise",
      sceneMode: "orbital",
      statusLabel: "Arrival state displayed",
    });
  }

  if (hasReentryData) {
    phases.push(
      {
        description:
          "The existing vehicle evaluation is staged for atmospheric-entry presentation.",
        id: "reentry-preparation",
        label: "Reentry Preparation",
        sceneMode: "reentry",
        statusLabel: "Entry interface pending",
      },
      {
        description:
          "Reported reentry trajectory and thermal outputs are displayed without simulation.",
        id: "atmospheric-entry",
        label: "Atmospheric Entry",
        sceneMode: "reentry",
        statusLabel: "Reentry telemetry active",
      },
    );
  }

  phases.push({
    description:
      "The replay has reached the end of the available presentation sequence.",
    id: "complete",
    label: "Mission Complete",
    sceneMode: hasReentryData ? "reentry" : preparationScene,
    statusLabel: "Replay sequence complete",
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
    <div className="rounded-lg border border-white/10 bg-[#071116] px-3 py-2.5">
      <dt className="font-mono text-[0.52rem] tracking-[0.1em] text-[#71878d] uppercase">
        {label}
      </dt>
      <dd className="mt-1">
        <output className="font-mono text-xs font-semibold text-[#d8e4e5]">
          {typeof value === "number"
            ? replayFormatter.format(value)
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
      <section
        aria-label="Mission replay"
        className="rounded-2xl border border-white/10 bg-[#040b0f] p-6"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-accent">
            <Clapperboard aria-hidden="true" size={18} />
          </span>
          <div>
            <p className="font-mono text-[0.61rem] tracking-[0.14em] text-accent uppercase">
              Mission replay
            </p>
            <h3 className="mt-1 text-lg font-semibold">
              Replay sequence unavailable
            </h3>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-[#81969b]">
          Supply a completed mission analysis, report, or vehicle reentry
          evaluation to construct a presentation sequence.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="mission-replay-title"
      className="overflow-hidden rounded-2xl border border-white/12 bg-[#03090d]"
      data-reduced-motion={reducedMotion ? "true" : "false"}
    >
      <header className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="flex items-center gap-2 font-mono text-[0.61rem] tracking-[0.16em] text-accent uppercase">
            <Clapperboard aria-hidden="true" size={14} />
            Mission replay // Presentation sequence
          </p>
          <h3 className="mt-1 text-lg font-semibold" id="mission-replay-title">
            Mission Replay
          </h3>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-accent/20 bg-accent/6 px-4 py-2.5">
          <span
            aria-hidden="true"
            className={
              "h-2 w-2 rounded-full bg-accent " +
              (state.isPlaying
                ? "motion-safe:animate-pulse motion-reduce:animate-none"
                : "opacity-55")
            }
          />
          <div>
            <p className="font-mono text-[0.5rem] tracking-[0.1em] text-[#73898e] uppercase">
              Spacecraft status
            </p>
            <output className="font-mono text-xs text-accent">
              {activePhase.statusLabel}
            </output>
          </div>
        </div>
      </header>

      <div className="space-y-6 p-5">
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

        <section
          aria-labelledby="replay-active-phase-title"
          className="rounded-xl border border-white/10 bg-[#071116] p-4"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="font-mono text-[0.56rem] tracking-[0.12em] text-accent uppercase">
                Current phase // {activePhase.statusLabel}
              </p>
              <h4
                className="mt-1 text-xl font-semibold"
                id="replay-active-phase-title"
              >
                {activePhase.label}
              </h4>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#91a5aa]">
                {activePhase.description}
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-black/15 px-3 py-1.5 font-mono text-[0.58rem] tracking-[0.08em] text-[#9eb1b5] uppercase">
              {activePhase.sceneMode === "orbital" ? (
                <Orbit aria-hidden="true" size={13} />
              ) : (
                <Flame aria-hidden="true" size={13} />
              )}
              {activePhase.sceneMode} presentation
            </span>
          </div>
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
          <div className="flex items-center gap-2">
            <Gauge aria-hidden="true" className="text-accent" size={15} />
            <h4
              className="font-mono text-[0.64rem] tracking-[0.12em] text-[#b8c7ca] uppercase"
              id="replay-telemetry-title"
            >
              Synchronized Telemetry
            </h4>
          </div>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
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

        {reducedMotion ? (
          <p className="rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-xs text-[#85999e]">
            Reduced motion mode is active. Phase updates remain discrete and
            decorative motion is suppressed by system preferences.
          </p>
        ) : null}
      </div>

      <p aria-live="polite" className="sr-only" role="status">
        Mission replay phase changed to {activePhase.label}. Spacecraft status:{" "}
        {activePhase.statusLabel}.
      </p>
    </section>
  );
}
