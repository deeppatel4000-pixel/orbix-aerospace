"use client";

import {
  useEffect,
  useReducer,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  Activity,
  ArrowRight,
  RadioTower,
  RotateCcw,
  ShieldCheck,
  SkipForward,
} from "lucide-react";

import type {
  MissionPresetCategory,
  MissionProfileAnalysis,
  MissionReport,
  VehicleReentryEvaluationAnalysis,
} from "@/features/engineering-lab/types";

import { StartupCheckList, type StartupCheckItem } from "./startup-check-list";
import { MISSION_STARTUP_STEPS, StartupProgress } from "./startup-progress";

export interface MissionStartupSequenceProps {
  readonly children: ReactNode;
  readonly missionCategory?: MissionPresetCategory;
  readonly missionProfileAnalysis?: MissionProfileAnalysis | null;
  readonly missionReport?: MissionReport | null;
  readonly reducedMotionOverride?: boolean;
  readonly vehicleReentryEvaluation?: VehicleReentryEvaluationAnalysis | null;
}

export interface MissionStartupSequenceState {
  readonly currentStepIndex: number;
  readonly status: "active" | "complete";
}

export type MissionStartupSequenceAction =
  | { readonly type: "advance" }
  | { readonly type: "replay" }
  | { readonly type: "skip" };

export const INITIAL_MISSION_STARTUP_STATE: MissionStartupSequenceState = {
  currentStepIndex: 0,
  status: "active",
};

// This fixed interval controls presentation cadence only. It is not mission,
// trajectory, simulation, or engineering time.
export const STARTUP_PRESENTATION_INTERVAL_MILLISECONDS = 1_100;

const categoryLabels: Readonly<Record<MissionPresetCategory, string>> = {
  "deep-space-concept": "Deep-space concept",
  "lunar-transfer": "Lunar transfer",
  "orbital-deployment": "Orbital deployment",
  "orbital-logistics": "Orbital logistics",
  "reentry-demonstration": "Reentry demonstration",
};

export function missionStartupSequenceReducer(
  state: MissionStartupSequenceState,
  action: MissionStartupSequenceAction,
): MissionStartupSequenceState {
  if (action.type === "replay") return INITIAL_MISSION_STARTUP_STATE;
  if (action.type === "skip") return { ...state, status: "complete" };
  if (state.status === "complete") return state;

  if (state.currentStepIndex >= MISSION_STARTUP_STEPS.length - 1) {
    return { ...state, status: "complete" };
  }

  return {
    currentStepIndex: state.currentStepIndex + 1,
    status: "active",
  };
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

export function MissionStartupSequence({
  children,
  missionCategory,
  missionProfileAnalysis,
  missionReport,
  reducedMotionOverride,
  vehicleReentryEvaluation,
}: MissionStartupSequenceProps) {
  const [state, dispatch] = useReducer(
    missionStartupSequenceReducer,
    INITIAL_MISSION_STARTUP_STATE,
  );
  const reducedMotion = useReducedMotion(reducedMotionOverride);
  const startupRegionRef = useRef<HTMLElement>(null);
  const replayButtonRef = useRef<HTMLButtonElement>(null);

  const missionName =
    missionReport?.missionSummary.missionName ??
    missionProfileAnalysis?.missionName ??
    "Not Reported";
  const category = missionCategory
    ? categoryLabels[missionCategory]
    : "Not Reported";
  const systemsDetected =
    missionProfileAnalysis?.missionSummaryState.analysesResolved;

  const startupChecks: readonly StartupCheckItem[] = [
    {
      available: Boolean(missionProfileAnalysis),
      id: "mission-profile",
      label: "Mission profile loaded",
    },
    {
      available: Boolean(
        missionProfileAnalysis?.missionSummaryState.hasDeltaVBudget ||
        missionReport?.orbitalAnalysis,
      ),
      id: "orbital-systems",
      label: "Orbital systems available",
    },
    {
      available: Boolean(
        missionProfileAnalysis?.missionSummaryState
          .hasVehicleReentryEvaluation ||
        missionProfileAnalysis?.missionSummaryState.hasVehicleComparison ||
        missionReport?.vehicleAnalysis ||
        vehicleReentryEvaluation,
      ),
      id: "vehicle-data",
      label: "Vehicle data available",
    },
    {
      available: Boolean(
        missionProfileAnalysis?.tpsRecommendation ||
        missionReport?.thermalAnalysis ||
        vehicleReentryEvaluation,
      ),
      id: "thermal-data",
      label: "Thermal data available",
    },
    {
      available: Boolean(
        missionProfileAnalysis || missionReport || vehicleReentryEvaluation,
      ),
      id: "visualization-systems",
      label: "Visualization systems ready",
    },
  ];

  useEffect(() => {
    if (state.status !== "active") return;

    // Reduced-motion mode shortens the fixed UI transition and suppresses
    // decorative animation; neither timing value represents mission time.
    const timeout = window.setTimeout(
      () => dispatch({ type: "advance" }),
      reducedMotion ? 150 : STARTUP_PRESENTATION_INTERVAL_MILLISECONDS,
    );
    return () => window.clearTimeout(timeout);
  }, [reducedMotion, state.currentStepIndex, state.status]);

  useEffect(() => {
    if (state.status === "active") {
      startupRegionRef.current?.focus();
    } else {
      replayButtonRef.current?.focus();
    }
  }, [state.currentStepIndex, state.status]);

  function handleKeyboard(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      dispatch({ type: "skip" });
      return;
    }

    if (event.key === "Enter" && event.target === event.currentTarget) {
      event.preventDefault();
      dispatch({ type: "advance" });
    }
  }

  const activeStep =
    MISSION_STARTUP_STEPS[state.currentStepIndex] ?? MISSION_STARTUP_STEPS[0];

  return (
    <div
      className="relative"
      data-reduced-motion={reducedMotion ? "true" : "false"}
      data-startup-status={state.status}
    >
      {state.status === "complete" ? (
        <div className="mb-3 flex justify-end">
          <button
            aria-label="Replay Mission Control startup"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/12 bg-[#071318] px-3 py-2 font-mono text-[0.6rem] tracking-[0.08em] text-[#9db0b4] uppercase transition-colors outline-none hover:border-accent/30 hover:text-accent focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none"
            onClick={() => dispatch({ type: "replay" })}
            ref={replayButtonRef}
            type="button"
          >
            <RotateCcw aria-hidden="true" size={13} />
            Replay startup
          </button>
        </div>
      ) : null}

      {children}

      {state.status === "active" ? (
        <section
          aria-describedby="mission-startup-keyboard-help"
          aria-label="ORBIX Mission Control initialization"
          className="technical-grid absolute inset-0 z-50 flex min-h-[46rem] items-center justify-center overflow-auto rounded-2xl border border-white/12 bg-[#02080c]/98 p-4 text-[#e2eaeb] shadow-[0_35px_100px_rgba(0,0,0,0.55)] outline-none focus-visible:ring-2 focus-visible:ring-accent sm:p-8"
          onKeyDown={handleKeyboard}
          ref={startupRegionRef}
          tabIndex={0}
        >
          <div className="w-full max-w-4xl rounded-2xl border border-white/10 bg-[#061116]/95 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.35)] sm:p-8">
            <header className="flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.22em] text-accent uppercase">
                  <Activity
                    aria-hidden="true"
                    className="motion-safe:animate-pulse motion-reduce:animate-none"
                    size={15}
                  />
                  ORBIX
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
                  Mission Control Initialization
                </h2>
                <p className="mt-3 text-sm text-[#83999e]">
                  Initializing mission: {missionName}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-signal/20 bg-signal/5 px-4 py-3 text-signal">
                <ShieldCheck aria-hidden="true" size={15} />
                <span className="font-mono text-[0.56rem] tracking-[0.09em] uppercase">
                  Educational simulation
                </span>
              </div>
            </header>

            <StartupProgress currentStepIndex={state.currentStepIndex} />

            <div
              aria-live="polite"
              className="mt-8 min-h-[20rem] rounded-2xl border border-white/10 bg-black/15 p-5 sm:p-7"
              data-startup-step={activeStep.id}
            >
              <p className="font-mono text-[0.56rem] tracking-[0.16em] text-accent uppercase">
                Initialization step {state.currentStepIndex + 1} of{" "}
                {MISSION_STARTUP_STEPS.length}
              </p>
              <h3 className="mt-2 text-xl font-semibold uppercase">
                {activeStep.label}
              </h3>

              {state.currentStepIndex === 0 ? (
                <StartupCheckList items={startupChecks} />
              ) : null}

              {state.currentStepIndex === 1 ? (
                <dl className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-[#071318] p-4">
                    <dt className="font-mono text-[0.55rem] tracking-[0.1em] text-[#71868c] uppercase">
                      Mission name
                    </dt>
                    <dd className="mt-2 text-sm font-semibold text-[#d2dddf]">
                      {missionName}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#071318] p-4">
                    <dt className="font-mono text-[0.55rem] tracking-[0.1em] text-[#71868c] uppercase">
                      Category
                    </dt>
                    <dd className="mt-2 text-sm font-semibold text-[#d2dddf]">
                      {category}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#071318] p-4">
                    <dt className="font-mono text-[0.55rem] tracking-[0.1em] text-[#71868c] uppercase">
                      Systems detected
                    </dt>
                    <dd className="mt-2">
                      <output className="font-mono text-lg font-semibold text-accent">
                        {systemsDetected ?? "Not Reported"}
                      </output>
                    </dd>
                  </div>
                </dl>
              ) : null}

              {state.currentStepIndex === 2 ? (
                <div className="mt-8 text-center">
                  <RadioTower
                    aria-hidden="true"
                    className="mx-auto text-accent motion-safe:animate-pulse motion-reduce:animate-none"
                    size={32}
                  />
                  <p className="mt-5 font-mono text-[0.6rem] tracking-[0.18em] text-signal uppercase">
                    Command Center Ready
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                    Mission Ready
                  </p>
                  <p className="mt-3 text-sm text-[#83999e]">
                    Entering Mission Control...
                  </p>
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                aria-label="Skip Mission Control startup"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/12 px-4 py-2 text-xs font-semibold text-[#91a5aa] transition-colors outline-none hover:border-white/25 hover:text-white focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none"
                onClick={() => dispatch({ type: "skip" })}
                type="button"
              >
                <SkipForward aria-hidden="true" size={14} />
                Skip startup
              </button>
              <button
                aria-label="Continue Mission Control startup"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-accent/35 bg-accent/10 px-4 py-2 text-xs font-semibold text-accent transition-colors outline-none hover:bg-accent/15 focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none"
                onClick={() => dispatch({ type: "advance" })}
                type="button"
              >
                Continue
                <ArrowRight aria-hidden="true" size={14} />
              </button>
            </div>

            <p className="sr-only" id="mission-startup-keyboard-help">
              Press Enter to continue the startup sequence or Escape to skip it.
            </p>
            <p aria-live="polite" className="sr-only" role="status">
              Mission Control initialization step {state.currentStepIndex + 1}:{" "}
              {activeStep.label}.
            </p>
            <footer className="mt-6 border-t border-white/10 pt-4 text-xs leading-5 text-[#657b81]">
              Startup cadence is presentation timing only. It does not represent
              mission, trajectory, simulation, or engineering time.
            </footer>
          </div>
        </section>
      ) : null}
    </div>
  );
}
