"use client";

import {
  useEffect,
  useReducer,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
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
import { formatLabValue } from "../visualization/format-lab-value";

export interface DemoModeProps {
  readonly insights?: MissionInsightsAnalysis;
  readonly missionProfile?: MissionProfileAnalysis;
  readonly missionScenario?: MissionScenario;
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
            ? formatLabValue(value)
            : (value ?? "Not reported")}
          {value !== undefined && unit ? (
            <span className="ml-1 text-muted">{unit}</span>
          ) : null}
        </output>
      </dd>
    </div>
  );
}

function EmptyPanel({ children }: { readonly children: ReactNode }) {
  return (
    <p className="orbix-empty-state text-sm leading-6 text-muted">{children}</p>
  );
}

export function DemoMode({
  insights,
  missionProfile,
  missionScenario,
  report,
}: DemoModeProps) {
  const [state, dispatchState] = useReducer(
    demoModeReducer,
    INITIAL_DEMO_MODE_STATE,
  );
  const stepFocusRef = useRef<HTMLElement>(null);
  const statusFocusRef = useRef<HTMLDivElement>(null);
  // Focus moves only after the reader acts (Next, Back, Restart, Skip, or the
  // step keys). Tying it to a user action, not to "not the first render",
  // keeps it correct under StrictMode's double effects: merely opening the
  // workspace never pulls focus out of the tab that opened it.
  const pendingFocusRef = useRef(false);
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

  function dispatch(action: Parameters<typeof dispatchState>[0]) {
    pendingFocusRef.current = true;
    dispatchState(action);
  }

  useEffect(() => {
    if (!pendingFocusRef.current) return;
    pendingFocusRef.current = false;

    if (state.status === "active") {
      stepFocusRef.current?.focus();
    } else {
      statusFocusRef.current?.focus();
    }
  }, [state.currentStepIndex, state.status]);

  function handleKeyboard(event: KeyboardEvent<HTMLElement>) {
    const target = event.target as HTMLElement;
    // Leave arrow keys to form controls and links inside a step.
    if (target.closest("input, select, textarea, button, a, summary")) return;

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
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(16rem,0.7fr)]">
          <section aria-labelledby="demo-objective-title">
            <p className="orbix-label" id="demo-objective-title">
              Mission objective
            </p>
            <p className="mt-1 text-base font-semibold text-foreground">
              {missionName}
            </p>
            <p className="mt-2 max-w-[68ch] text-sm leading-6 text-text-secondary">
              {report?.missionAssessment.educationalSummary ??
                missionDescription}
            </p>
          </section>
          <dl>
            <DemoMetric label="Mission category" value={missionCategory} />
            <div className="border-t border-border-subtle py-2 text-sm">
              <dt className="text-muted">Scenario description</dt>
              <dd className="mt-1 text-foreground">{missionDescription}</dd>
            </div>
          </dl>
        </div>
      );
    }

    if (activeStep.id === "mission-architecture") {
      return (
        <div className="space-y-6">
          <section aria-labelledby="demo-selected-systems-title">
            <h5
              className="text-sm font-semibold text-foreground"
              id="demo-selected-systems-title"
            >
              Selected systems
            </h5>
            {systems.length ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text-secondary">
                {systems.map((system) => (
                  <li key={system}>{system}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted">
                No integrated systems were supplied.
              </p>
            )}
          </section>

          <div className="grid gap-x-8 gap-y-6 lg:grid-cols-2">
            <section aria-labelledby="demo-orbital-design-title">
              <h5
                className="text-sm font-semibold text-foreground"
                id="demo-orbital-design-title"
              >
                Orbital design
              </h5>
              <dl className="mt-2">
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
            <section aria-labelledby="demo-vehicle-configuration-title">
              <h5
                className="text-sm font-semibold text-foreground"
                id="demo-vehicle-configuration-title"
              >
                Vehicle configuration
              </h5>
              <dl className="mt-2">
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
        <dl className="grid gap-x-8 sm:grid-cols-2">
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
        </dl>
      );
    }

    if (activeStep.id === "mission-visualization") {
      return (
        <div className="space-y-6">
          <MissionOrbitVisualization analysis={missionProfile} />
          <ReentryProfileVisualization analysis={evaluation} />
        </div>
      );
    }

    if (activeStep.id === "engineering-review") {
      return (
        <div className="space-y-6">
          <dl className="grid gap-x-8 sm:grid-cols-2">
            <DemoMetric
              label="Vehicles compared"
              value={comparison?.comparisonMetadata.vehiclesCompared}
            />
            <DemoMetric
              label="Selected vehicle"
              value={comparison?.recommendedVehicle.vehicleName}
            />
          </dl>
          <MissionInsightsPanel analysis={insights} />
          {report ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <section aria-labelledby="demo-assumptions-title">
                <h5
                  className="text-sm font-semibold text-foreground"
                  id="demo-assumptions-title"
                >
                  Assumptions
                </h5>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-muted">
                  {report.missionAssessment.modelAssumptions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
              <section aria-labelledby="demo-limitations-title">
                <h5
                  className="text-sm font-semibold text-foreground"
                  id="demo-limitations-title"
                >
                  Limits
                </h5>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-muted">
                  {report.missionAssessment.limitations.map((item) => (
                    <li key={item}>{item}</li>
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
      className="min-w-0 text-foreground"
      onKeyDown={handleKeyboard}
    >
      <header className="border-b border-border-subtle pb-4">
        <h3 className="orbix-h3 text-foreground">Guided tour of a mission</h3>
        <p className="mt-2 max-w-[68ch] text-sm leading-6 text-muted">
          Six steps that follow one example mission from concept to analysis,
          diagrams, review and presentation. The tour only shows results that
          already exist; it runs no new analysis.
        </p>
      </header>

      <div className="space-y-6 pt-6">
        <ol
          aria-label="Orbix demo steps"
          className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-3 xl:grid-cols-6"
        >
          {DEMO_STEPS.map((step, index) => {
            const isActive =
              state.status === "active" && index === state.currentStepIndex;

            return (
              <li
                aria-current={isActive ? "step" : undefined}
                className={
                  isActive
                    ? "border-b-2 border-accent py-2 font-medium text-foreground"
                    : "border-b-2 border-border py-2 text-muted"
                }
                key={step.id}
              >
                <span className="orbix-data mr-2">{index + 1}</span>
                {step.shortLabel}
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
          <div ref={statusFocusRef} tabIndex={-1} className="outline-none">
            <EmptyState
              action={
                <Button
                  onClick={() => dispatch({ type: "restart" })}
                  variant="secondary"
                >
                  <RotateCcw aria-hidden="true" size={16} />
                  Restart guided tour
                </Button>
              }
              description={
                state.status === "complete"
                  ? "You have seen every step of the mission workflow using the example results."
                  : "No mission data was changed. Restart the tour whenever you like."
              }
              title={
                state.status === "complete"
                  ? "Guided review complete"
                  : "Demo tour skipped"
              }
            />
          </div>
        )}

        <p
          className="text-sm leading-6 text-muted"
          id="demo-mode-keyboard-help"
        >
          Use the buttons to move between steps. With focus inside the tour but
          not on a control, the left and right arrow keys change steps, Home
          restarts and Escape skips the tour.
        </p>
        <p aria-live="polite" className="sr-only" role="status">
          {state.status === "active"
            ? `Demo step ${state.currentStepIndex + 1}: ${activeStep.label}.`
            : state.status === "complete"
              ? "Orbix guided demo complete."
              : "Orbix guided demo skipped."}
        </p>
      </div>
    </article>
  );
}
