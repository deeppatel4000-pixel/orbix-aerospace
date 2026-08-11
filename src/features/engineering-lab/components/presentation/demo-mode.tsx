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
  CheckCircle2,
  Compass,
  Orbit,
  Plane,
  Radar,
  Rocket,
  ShieldCheck,
} from "lucide-react";

import type { MissionScenario } from "@/features/engineering-lab/missions";
import type {
  MissionInsightsAnalysis,
  MissionPresetCategory,
  MissionProfileAnalysis,
  MissionReport,
} from "@/features/engineering-lab/types";

import { MissionInsightsPanel } from "../mission-insights-panel";
import { MissionOrbitVisualization } from "../visualization/mission-orbit-visualization";
import { ReentryProfileVisualization } from "../visualization/reentry-profile-visualization";
import { DemoNavigation } from "./demo-navigation";
import { DEMO_STEPS, DemoStep } from "./demo-step";
import { MissionBriefing } from "./mission-briefing";
import { MissionShowcase } from "./mission-showcase";

export interface DemoModeProps {
  readonly insights?: MissionInsightsAnalysis;
  readonly missionProfile?: MissionProfileAnalysis;
  readonly missionScenario?: MissionScenario;
  readonly reducedMotionOverride?: boolean;
  readonly report?: MissionReport;
}

export type DemoModeStatus = "active" | "complete" | "skipped";

export interface DemoModeState {
  readonly currentStepIndex: number;
  readonly status: DemoModeStatus;
}

export type DemoModeAction =
  | { readonly type: "back" }
  | { readonly type: "next" }
  | { readonly type: "restart" }
  | { readonly type: "skip" };

export const INITIAL_DEMO_MODE_STATE: DemoModeState = {
  currentStepIndex: 0,
  status: "active",
};

const categoryLabels: Readonly<Record<MissionPresetCategory, string>> = {
  "deep-space-concept": "Deep-space concept",
  "lunar-transfer": "Lunar transfer",
  "orbital-deployment": "Orbital deployment",
  "orbital-logistics": "Orbital logistics",
  "reentry-demonstration": "Reentry demonstration",
};

const valueFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

export function demoModeReducer(
  state: DemoModeState,
  action: DemoModeAction,
): DemoModeState {
  if (action.type === "restart") return INITIAL_DEMO_MODE_STATE;
  if (action.type === "skip") return { ...state, status: "skipped" };

  if (action.type === "back") {
    return {
      currentStepIndex: Math.max(0, state.currentStepIndex - 1),
      status: "active",
    };
  }

  if (state.currentStepIndex >= DEMO_STEPS.length - 1) {
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

function DemoMetric({
  label,
  unit,
  value,
}: {
  readonly label: string;
  readonly unit?: string;
  readonly value?: number | string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-surface p-4">
      <dt className="font-mono text-[0.55rem] tracking-[0.11em] text-muted uppercase">
        {label}
      </dt>
      <dd className="mt-2">
        <output className="font-mono text-sm font-semibold text-foreground">
          {typeof value === "number"
            ? valueFormatter.format(value)
            : (value ?? "Not reported")}
          {value !== undefined && unit ? (
            <span className="ml-1 text-[0.64rem] font-normal text-muted">
              {unit}
            </span>
          ) : null}
        </output>
      </dd>
    </div>
  );
}

function EmptyPanel({ children }: { readonly children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-white/15 bg-black/10 px-5 py-9 text-center text-sm leading-6 text-muted">
      {children}
    </div>
  );
}

export function DemoMode({
  insights,
  missionProfile,
  missionScenario,
  reducedMotionOverride,
  report,
}: DemoModeProps) {
  const [state, dispatch] = useReducer(
    demoModeReducer,
    INITIAL_DEMO_MODE_STATE,
  );
  const reducedMotion = useReducedMotion(reducedMotionOverride);
  const stepFocusRef = useRef<HTMLElement>(null);
  const statusFocusRef = useRef<HTMLDivElement>(null);
  const hasMountedRef = useRef(false);
  const activeStep = DEMO_STEPS[state.currentStepIndex] ?? DEMO_STEPS[0];
  const missionName =
    missionProfile?.missionName ??
    report?.missionSummary.missionName ??
    missionScenario?.name ??
    "Orbix Guided Mission";
  const missionDescription =
    missionScenario?.description ??
    report?.missionSummary.description ??
    "A completed mission scenario has not been supplied to this guided presentation.";
  const missionCategory = missionScenario
    ? categoryLabels[missionScenario.category]
    : "Educational mission";
  const systems =
    report?.missionSummary.systemsUsed ?? insights?.systemsInterpreted ?? [];
  const deltaVBudget = missionProfile?.sourceAnalyses.deltaVBudget;
  const transfer = deltaVBudget?.sourceAnalyses.hohmannTransfer;
  const evaluation =
    missionProfile?.sourceAnalyses.vehicleReentryEvaluation ??
    missionProfile?.selectedVehicleRecommendation?.evaluation;
  const vehicle =
    report?.vehicleAnalysis?.selectedVehicle ??
    evaluation?.vehicle ??
    missionProfile?.selectedVehicleRecommendation?.vehicle;
  const comparison = missionProfile?.sourceAnalyses.vehicleComparison;

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    if (state.status === "active") {
      stepFocusRef.current?.focus();
    } else {
      statusFocusRef.current?.focus();
    }
  }, [state.currentStepIndex, state.status]);

  function handleKeyboard(event: KeyboardEvent<HTMLElement>) {
    if (event.target !== event.currentTarget) return;

    if (event.key === "ArrowRight") {
      event.preventDefault();
      dispatch({ type: "next" });
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      dispatch({ type: "back" });
    }
    if (event.key === "Home") {
      event.preventDefault();
      dispatch({ type: "restart" });
    }
    if (event.key === "Escape") {
      event.preventDefault();
      dispatch({ type: "skip" });
    }
  }

  function renderStepContent() {
    if (activeStep.id === "mission-concept") {
      return (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(16rem,0.7fr)]">
          <section className="rounded-xl border border-accent/20 bg-accent/5 p-5">
            <p className="font-mono text-[0.58rem] tracking-[0.14em] text-accent uppercase">
              Mission objective
            </p>
            <h4 className="mt-2 text-2xl font-semibold">{missionName}</h4>
            <p className="mt-3 text-sm leading-6 text-muted">
              {report?.missionAssessment.educationalSummary ??
                missionDescription}
            </p>
          </section>
          <dl className="grid gap-3">
            <DemoMetric label="Mission category" value={missionCategory} />
            <DemoMetric
              label="Scenario description"
              value={missionDescription}
            />
          </dl>
        </div>
      );
    }

    if (activeStep.id === "mission-architecture") {
      return (
        <div className="space-y-5">
          <section aria-labelledby="demo-selected-systems-title">
            <h4
              className="font-mono text-[0.62rem] tracking-[0.12em] text-accent uppercase"
              id="demo-selected-systems-title"
            >
              Selected systems
            </h4>
            {systems.length ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {systems.map((system) => (
                  <li
                    className="text-muted-strong flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs"
                    key={system}
                  >
                    <CheckCircle2
                      aria-hidden="true"
                      className="text-accent"
                      size={13}
                    />
                    {system}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted">
                No integrated systems were supplied.
              </p>
            )}
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-xl border border-white/10 bg-surface p-5">
              <h4 className="flex items-center gap-2 text-sm font-semibold">
                <Orbit aria-hidden="true" className="text-accent" size={16} />
                Orbital design
              </h4>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <DemoMetric
                  label="Initial altitude"
                  unit="m"
                  value={transfer?.initialOrbit.altitudeMetres}
                />
                <DemoMetric
                  label="Target altitude"
                  unit="m"
                  value={transfer?.finalOrbit.altitudeMetres}
                />
              </dl>
            </section>
            <section className="rounded-xl border border-white/10 bg-surface p-5">
              <h4 className="flex items-center gap-2 text-sm font-semibold">
                <Plane aria-hidden="true" className="text-accent" size={16} />
                Vehicle configuration
              </h4>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <DemoMetric label="Vehicle" value={vehicle?.vehicleName} />
                <DemoMetric
                  label="Vehicle mass"
                  unit="kg"
                  value={vehicle?.massKilograms}
                />
                <DemoMetric
                  label="Reference area"
                  unit="m²"
                  value={vehicle?.referenceAreaSquareMetres}
                />
                <DemoMetric
                  label="Drag coefficient"
                  value={vehicle?.dragCoefficient}
                />
              </dl>
            </section>
          </div>
        </div>
      );
    }

    if (activeStep.id === "engineering-analysis") {
      return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DemoMetric
            label="Mission delta-v"
            unit="m/s"
            value={missionProfile?.totalDeltaVMetresPerSecond}
          />
          <DemoMetric
            label="Transfer duration"
            unit="s"
            value={transfer?.transfer.transferTimeSeconds}
          />
          <DemoMetric
            label="Peak deceleration"
            unit="g"
            value={evaluation?.summary.dynamics.peakDeceleration.decelerationGs}
          />
          <DemoMetric
            label="Peak heat flux"
            unit="kW/m²"
            value={
              evaluation?.summary.thermal.peakHeatFluxKilowattsPerSquareMetre
            }
          />
        </div>
      );
    }

    if (activeStep.id === "mission-visualization") {
      return (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <DemoMetric label="Workspace" value="Mission Control" />
            <DemoMetric
              label="Orbit view"
              value={missionProfile ? "Available" : "Not supplied"}
            />
            <DemoMetric
              label="Reentry view"
              value={evaluation ? "Available" : "Not supplied"}
            />
          </div>
          <MissionOrbitVisualization analysis={missionProfile} />
          <ReentryProfileVisualization analysis={evaluation} />
        </div>
      );
    }

    if (activeStep.id === "engineering-review") {
      return (
        <div className="space-y-5">
          <dl className="grid gap-3 sm:grid-cols-2">
            <DemoMetric
              label="Trade-study vehicles"
              value={comparison?.comparisonMetadata.vehiclesCompared}
            />
            <DemoMetric
              label="Selected vehicle"
              value={comparison?.recommendedVehicle.vehicleName}
            />
          </dl>
          <MissionInsightsPanel analysis={insights} />
          {report ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <section className="rounded-xl border border-white/10 bg-surface p-5">
                <h4 className="font-mono text-[0.61rem] tracking-[0.12em] text-accent uppercase">
                  Assumptions
                </h4>
                <ul className="mt-3 space-y-2 text-xs leading-5 text-muted">
                  {report.missionAssessment.modelAssumptions.map((item) => (
                    <li className="flex gap-2" key={item}>
                      <span aria-hidden="true" className="text-accent">
                        —
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
              <section className="rounded-xl border border-signal/20 bg-signal/5 p-5">
                <h4 className="font-mono text-[0.61rem] tracking-[0.12em] text-signal uppercase">
                  Limitations
                </h4>
                <ul className="mt-3 space-y-2 text-xs leading-5 text-muted">
                  {report.missionAssessment.limitations.map((item) => (
                    <li className="flex gap-2" key={item}>
                      <span aria-hidden="true" className="text-signal">
                        —
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          ) : null}
        </div>
      );
    }

    return missionProfile ? (
      <div className="space-y-6">
        <MissionBriefing
          insights={insights}
          missionProfile={missionProfile}
          report={report}
        />
        <MissionShowcase
          insights={insights}
          missionProfile={missionProfile}
          reducedMotionOverride={reducedMotion}
          report={report}
        />
      </div>
    ) : (
      <EmptyPanel>
        Mission presentation requires a completed mission profile.
      </EmptyPanel>
    );
  }

  return (
    <article
      aria-describedby="demo-mode-keyboard-help"
      aria-label={`Orbix guided demo for ${missionName}`}
      className="technical-grid overflow-hidden rounded-2xl border border-white/12 bg-surface text-foreground shadow-[0_30px_90px_rgba(0,0,0,0.3)] outline-none focus-visible:ring-2 focus-visible:ring-accent"
      data-reduced-motion={reducedMotion ? "true" : "false"}
      onKeyDown={handleKeyboard}
      tabIndex={0}
    >
      <header className="relative overflow-hidden border-b border-white/10 px-5 py-8 sm:px-8">
        <div
          aria-hidden="true"
          className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-accent/8 blur-3xl"
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.2em] text-accent uppercase">
              <Compass aria-hidden="true" size={15} />
              ORBIX Demo Mode // Guided experience
            </p>
            <h2 className="mt-3 max-w-4xl text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Welcome to Orbix
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
              This walkthrough demonstrates how an aerospace mission moves from
              concept to analysis, visualization, engineering review, and
              presentation.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-signal/20 bg-signal/5 px-4 py-3 text-signal">
            <ShieldCheck aria-hidden="true" size={16} />
            <span className="font-mono text-[0.6rem] tracking-[0.09em] uppercase">
              Presentation only
            </span>
          </div>
        </div>
      </header>

      <div className="space-y-6 p-5 sm:p-8">
        <ol
          aria-label="Orbix demo steps"
          className="grid gap-2 sm:grid-cols-3 xl:grid-cols-6"
        >
          {DEMO_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive =
              state.status === "active" && index === state.currentStepIndex;
            const isVisited = index < state.currentStepIndex;

            return (
              <li
                aria-current={isActive ? "step" : undefined}
                className={
                  "rounded-xl border px-3 py-3 transition-colors motion-reduce:transition-none " +
                  (isActive
                    ? "border-accent/45 bg-accent/10 text-accent"
                    : isVisited
                      ? "text-muted-strong border-white/12 bg-white/5"
                      : "border-white/8 bg-black/10 text-muted")
                }
                key={step.id}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[0.54rem] tracking-[0.1em]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Icon aria-hidden="true" size={13} />
                </span>
                <span className="mt-2 block font-mono text-[0.58rem] font-semibold tracking-[0.07em] uppercase">
                  {step.shortLabel}
                </span>
              </li>
            );
          })}
        </ol>

        {state.status === "active" ? (
          <>
            <DemoStep
              focusRef={stepFocusRef}
              step={activeStep}
              stepIndex={state.currentStepIndex}
            >
              {renderStepContent()}
            </DemoStep>
            <DemoNavigation
              currentStepIndex={state.currentStepIndex}
              onBack={() => dispatch({ type: "back" })}
              onNext={() => dispatch({ type: "next" })}
              onRestart={() => dispatch({ type: "restart" })}
              onSkip={() => dispatch({ type: "skip" })}
              totalSteps={DEMO_STEPS.length}
            />
          </>
        ) : (
          <div
            className="rounded-2xl border border-accent/25 bg-accent/5 px-6 py-12 text-center outline-none focus-visible:ring-2 focus-visible:ring-accent"
            ref={statusFocusRef}
            tabIndex={-1}
          >
            {state.status === "complete" ? (
              <CheckCircle2
                aria-hidden="true"
                className="mx-auto text-accent"
                size={30}
              />
            ) : (
              <Rocket
                aria-hidden="true"
                className="mx-auto text-signal"
                size={30}
              />
            )}
            <h3 className="mt-4 text-2xl font-semibold">
              {state.status === "complete"
                ? "Guided review complete"
                : "Demo tour skipped"}
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">
              {state.status === "complete"
                ? "You have reviewed the complete Orbix mission workflow using supplied educational outputs."
                : "No mission data was changed. Restart whenever you want to resume the guided experience."}
            </p>
            <button
              aria-label="Restart Orbix demo tour"
              className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-lg border border-accent/35 bg-accent/12 px-4 py-2 text-xs font-semibold text-accent outline-none hover:bg-accent/18 focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none"
              onClick={() => dispatch({ type: "restart" })}
              type="button"
            >
              <Radar aria-hidden="true" size={14} />
              Restart guided tour
            </button>
          </div>
        )}

        {reducedMotion ? (
          <p className="rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-xs text-muted">
            Reduced motion mode is active. Guided content changes without
            decorative motion.
          </p>
        ) : null}

        <p className="sr-only" id="demo-mode-keyboard-help">
          Focus the demo region and use left or right arrow keys to change
          steps, Home to restart, and Escape to skip the tour.
        </p>
        <p aria-live="polite" className="sr-only" role="status">
          {state.status === "active"
            ? `Demo step ${state.currentStepIndex + 1}: ${activeStep.label}.`
            : state.status === "complete"
              ? "Orbix guided demo complete."
              : "Orbix guided demo skipped."}
        </p>

        <footer className="flex items-start gap-3 border-t border-white/10 pt-6 text-xs leading-5 text-muted">
          <Activity aria-hidden="true" className="mt-0.5 shrink-0" size={14} />
          Demo Mode navigates supplied objects only. It does not generate a
          mission, execute analysis, alter vehicle or TPS state, or assess
          mission feasibility.
        </footer>
      </div>
    </article>
  );
}
