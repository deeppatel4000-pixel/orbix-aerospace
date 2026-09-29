"use client";

import { useEffect, useReducer, type KeyboardEvent } from "react";
import { Pause, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import type {
  MissionInsightsAnalysis,
  MissionProfileAnalysis,
  MissionReport,
} from "@/features/engineering-lab/types";

import { SHOWCASE_PHASES, ShowcasePhase } from "./showcase-phase";
import { ShowcaseStage } from "./showcase-stage";
import { ShowcaseTelemetry } from "./showcase-telemetry";
import { LabHeading } from "../visualization/lab-heading";

export interface MissionShowcaseProps {
  readonly insights?: MissionInsightsAnalysis;
  readonly missionProfile: MissionProfileAnalysis;
  readonly report?: MissionReport;
}

export interface MissionShowcaseState {
  readonly currentPhaseIndex: number;
  readonly isPlaying: boolean;
}

export type MissionShowcaseAction =
  | { readonly type: "next" }
  | { readonly type: "pause" }
  | { readonly type: "play" }
  | { readonly type: "previous" }
  | { readonly type: "restart" }
  | { readonly phaseIndex: number; readonly type: "select" };

export const INITIAL_SHOWCASE_STATE: MissionShowcaseState = {
  currentPhaseIndex: 0,
  isPlaying: false,
};

const SHOWCASE_PRESENTATION_INTERVAL_MILLISECONDS = 4_200;

export function missionShowcaseReducer(
  state: MissionShowcaseState,
  action: MissionShowcaseAction,
): MissionShowcaseState {
  if (action.type === "play") {
    // Play at the last phase starts again from phase 1, so the toggle never
    // has to be disabled (a disabled button that holds focus drops it).
    return state.currentPhaseIndex >= SHOWCASE_PHASES.length - 1
      ? { currentPhaseIndex: 0, isPlaying: true }
      : { ...state, isPlaying: true };
  }
  if (action.type === "pause") return { ...state, isPlaying: false };
  if (action.type === "restart") return INITIAL_SHOWCASE_STATE;

  if (action.type === "select") {
    return {
      currentPhaseIndex: action.phaseIndex,
      isPlaying: false,
    };
  }

  if (action.type === "previous") {
    return {
      currentPhaseIndex: Math.max(0, state.currentPhaseIndex - 1),
      isPlaying: false,
    };
  }

  if (state.currentPhaseIndex >= SHOWCASE_PHASES.length - 1) {
    return { ...state, isPlaying: false };
  }

  return {
    ...state,
    currentPhaseIndex: state.currentPhaseIndex + 1,
  };
}

export function MissionShowcase({
  insights,
  missionProfile,
  report,
}: MissionShowcaseProps) {
  const [state, dispatch] = useReducer(
    missionShowcaseReducer,
    INITIAL_SHOWCASE_STATE,
  );
  const activePhase =
    SHOWCASE_PHASES[state.currentPhaseIndex] ?? SHOWCASE_PHASES[0];
  const reviewInsight =
    activePhase.scene === "review" ? insights?.insights[0]?.summary : undefined;

  useEffect(() => {
    if (!state.isPlaying) return;

    const timeout = window.setTimeout(
      () => dispatch({ type: "next" }),
      SHOWCASE_PRESENTATION_INTERVAL_MILLISECONDS,
    );
    return () => window.clearTimeout(timeout);
  }, [state.currentPhaseIndex, state.isPlaying]);

  function handleKeyboard(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      dispatch({ type: "next" });
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      dispatch({ type: "previous" });
    }
    if (event.key === "Home") {
      event.preventDefault();
      dispatch({ type: "restart" });
    }
  }

  const isFirstPhase = state.currentPhaseIndex === 0;
  const isLastPhase = state.currentPhaseIndex === SHOWCASE_PHASES.length - 1;

  return (
    <article
      aria-describedby="mission-showcase-keyboard-help"
      aria-label={`Mission walkthrough for ${missionProfile.missionName}`}
      className="min-w-0 text-foreground"
      onKeyDown={handleKeyboard}
    >
      <header className="border-b border-border-subtle pb-4">
        <p className="orbix-label">Mission walkthrough</p>
        <LabHeading className="mt-1">{missionProfile.missionName}</LabHeading>
        <p className="mt-2 max-w-[68ch] text-sm leading-6 text-muted">
          Steps through the completed results one phase at a time. It is a
          presentation of existing values, not a flight simulation.
        </p>
      </header>

      <div className="space-y-6 pt-6">
        <div
          aria-label="Walkthrough controls"
          className="flex flex-wrap items-center gap-2"
          role="group"
        >
          {/* One primary toggle, as in the replay controls. It is never
           * disabled, so it keeps focus when auto-play reaches the end. */}
          <Button
            aria-label={
              state.isPlaying
                ? "Pause mission showcase"
                : "Play mission showcase"
            }
            onClick={() =>
              dispatch({ type: state.isPlaying ? "pause" : "play" })
            }
          >
            {state.isPlaying ? (
              <Pause aria-hidden="true" size={16} />
            ) : (
              <Play aria-hidden="true" size={16} />
            )}
            {state.isPlaying ? "Pause" : "Play"}
          </Button>
          {/* aria-disabled rather than disabled: reaching the first or last
           * phase must not drop focus from the button just pressed. */}
          <Button
            aria-disabled={isFirstPhase || undefined}
            aria-label="Previous showcase phase"
            arrow="back"
            onClick={() => {
              if (!isFirstPhase) dispatch({ type: "previous" });
            }}
            variant="ghost"
          >
            Previous
          </Button>
          <Button
            aria-disabled={isLastPhase || undefined}
            aria-label="Next showcase phase"
            arrow="right"
            onClick={() => {
              if (!isLastPhase) dispatch({ type: "next" });
            }}
            variant="ghost"
          >
            Next
          </Button>
          <Button
            aria-label="Restart mission showcase"
            onClick={() => dispatch({ type: "restart" })}
            variant="secondary"
          >
            Restart
          </Button>
        </div>

        <div className="space-y-6">
          {/* The same step row as the mission phases, replay and guided
           * demo: 3 or 6 across by the column's width. */}
          <nav aria-label="Walkthrough phases" className="@container">
            <ol className="grid grid-cols-2 gap-x-4 gap-y-1 @md:grid-cols-3 @3xl:grid-cols-6">
              {SHOWCASE_PHASES.map((phase, index) => (
                <ShowcasePhase
                  active={index === state.currentPhaseIndex}
                  index={index}
                  key={phase.id}
                  onSelect={(phaseIndex) =>
                    dispatch({ phaseIndex, type: "select" })
                  }
                  phase={phase}
                />
              ))}
            </ol>
          </nav>

          <ShowcaseStage
            insight={reviewInsight}
            phase={activePhase}
            phaseNumber={state.currentPhaseIndex + 1}
            phaseTotal={SHOWCASE_PHASES.length}
          />
        </div>

        <div className="border-t border-border-subtle pt-6">
          <ShowcaseTelemetry missionProfile={missionProfile} report={report} />
        </div>

        <p
          className="text-sm leading-6 text-muted"
          id="mission-showcase-keyboard-help"
        >
          Play advances one phase every few seconds and stops at the last phase,
          where Play starts again from phase 1. With focus inside the
          walkthrough, the left and right arrow keys change phase and Home
          restarts.
        </p>
        <p aria-live="polite" className="sr-only" role="status">
          Mission showcase phase {state.currentPhaseIndex + 1}:{" "}
          {activePhase.label}.
          {state.isPlaying ? " Showcase playing." : " Showcase paused."}
        </p>
      </div>
    </article>
  );
}
