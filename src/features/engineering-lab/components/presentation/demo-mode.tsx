"use client";

import {
  useEffect,
  useReducer,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button";
import type { MissionScenario } from "@/features/engineering-lab/missions";
import type {
  MissionInsightsAnalysis,
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
import { MissionIdentity } from "../visualization/mission-identity";
import {
  altitudeReadout,
  formatLabValue,
} from "../visualization/format-lab-value";
import { formatFigure } from "@/components/ui/readout";
import {
  HeadingLevel,
  LabHeading,
  useHeadingLevel,
} from "../visualization/lab-heading";
import { LabUnit } from "../visualization/lab-unit";

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
            ? formatFigure(formatLabValue(value))
            : (value ?? "Not reported")}
          {value !== undefined && unit ? <LabUnit unit={unit} /> : null}
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
  // The tour's title, then the step title one below, then step content.
  const headingLevel = useHeadingLevel();
  const missionName =
    missionProfile?.missionName ??
    report?.missionSummary.missionName ??
    missionScenario?.name ??
    "ORBIX Guided Mission";
  const missionDescription =
    missionScenario?.description ??
    report?.missionSummary.description ??
    "A completed mission scenario has not been supplied to this guided presentation.";
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
        // The identity block above already names the mission and its
        // category, so the first step adds only the objective.
        <section
          aria-labelledby="demo-objective-title"
          className="border-t border-border-subtle pt-3"
        >
          <p className="orbix-label" id="demo-objective-title">
            Mission objective
          </p>
          <p className="mt-1 max-w-[68ch] text-sm leading-6 text-text-secondary">
            {missionDescription}
          </p>
        </section>
      );
    }

    if (activeStep.id === "mission-architecture") {
      return (
        <div className="space-y-6">
          <section aria-labelledby="demo-selected-systems-title">
            <LabHeading
              offset={2}
              variant="sub"
              id="demo-selected-systems-title"
            >
              Selected systems
            </LabHeading>
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
              <LabHeading
                offset={2}
                variant="sub"
                id="demo-orbital-design-title"
              >
                Orbital design
              </LabHeading>
              <dl className="mt-2">
                <DemoMetric
                  label="Initial altitude"
                  {...altitudeReadout(transfer?.initialOrbit.altitudeMetres)}
                />
                <DemoMetric
                  label="Target altitude"
                  {...altitudeReadout(transfer?.finalOrbit.altitudeMetres)}
                />
              </dl>
            </section>
            <section aria-labelledby="demo-vehicle-configuration-title">
              <LabHeading
                offset={2}
                variant="sub"
                id="demo-vehicle-configuration-title"
              >
                Vehicle configuration
              </LabHeading>
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
            unit="h"
            value={transfer?.transfer.transferTimeHours}
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
        <div className="space-y-8">
          <MissionOrbitVisualization analysis={missionProfile} />
          <div className="border-t border-border-subtle pt-8">
            <ReentryProfileVisualization analysis={evaluation} />
          </div>
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
                <LabHeading
                  offset={2}
                  variant="sub"
                  id="demo-assumptions-title"
                >
                  Assumptions
                </LabHeading>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-muted">
                  {report.missionAssessment.modelAssumptions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
              <section aria-labelledby="demo-limitations-title">
                <LabHeading
                  offset={2}
                  variant="sub"
                  id="demo-limitations-title"
                >
                  Limits
                </LabHeading>
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
          category={missionScenario?.category}
          insights={insights}
          missionProfile={missionProfile}
          report={report}
        />
        <MissionShowcase
          category={missionScenario?.category}
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
      aria-label={`ORBIX guided demo for ${missionName}`}
      className="min-w-0 text-foreground"
      onKeyDown={handleKeyboard}
    >
      <MissionIdentity
        category={missionScenario?.category}
        missionName={missionName}
      />

      <div className="space-y-6 pt-6">
        {/* Transport above the step row, as in the walkthrough and the
         * replay. */}
        {state.status === "active" ? (
          <DemoNavigation
            currentStepIndex={state.currentStepIndex}
            onBack={() => dispatch({ type: "back" })}
            onNext={() => dispatch({ type: "next" })}
            onRestart={() => dispatch({ type: "restart" })}
            onSkip={() => dispatch({ type: "skip" })}
            totalSteps={DEMO_STEPS.length}
          />
        ) : null}
        <ol
          aria-label="ORBIX demo steps"
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
              <HeadingLevel level={headingLevel + 2}>
                {renderStepContent()}
              </HeadingLevel>
            </DemoStep>
          </>
        ) : (
          // The end state sits behind a hairline, not in a second box inside
          // the tool frame, and its title is one level below the tour's.
          <div
            className="border-t border-border-subtle pt-5 outline-none"
            ref={statusFocusRef}
            tabIndex={-1}
          >
            <LabHeading offset={1}>
              {state.status === "complete"
                ? "Guided review complete"
                : "Demo tour skipped"}
            </LabHeading>
            <p className="mt-2 max-w-prose text-sm leading-6 text-muted">
              {state.status === "complete"
                ? "You have seen every step of the mission workflow using the example results."
                : "No mission data was changed. Restart the tour whenever you like."}
            </p>
            <Button
              className="mt-4"
              onClick={() => dispatch({ type: "restart" })}
              variant="secondary"
            >
              Restart guided tour
            </Button>
          </div>
        )}

        <p
          className="text-sm leading-6 text-muted"
          id="demo-mode-keyboard-help"
        >
          The tour shows results that already exist; it runs no new analysis.
          Use the buttons to move between steps. With focus inside the tour but
          not on a control, the left and right arrow keys change steps, Home
          restarts and Escape skips the tour.
        </p>
        <p aria-live="polite" className="sr-only" role="status">
          {state.status === "active"
            ? `Demo step ${state.currentStepIndex + 1}: ${activeStep.label}.`
            : state.status === "complete"
              ? "ORBIX guided demo complete."
              : "ORBIX guided demo skipped."}
        </p>
      </div>
    </article>
  );
}
