"use client";

import { useEffect, useReducer, type KeyboardEvent } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type {
  MissionInsightsAnalysis,
  MissionProfileAnalysis,
  MissionReport,
} from "@/features/engineering-lab/types";

import { SHOWCASE_PHASES, ShowcasePhase } from "./showcase-phase";
import { ShowcaseStage } from "./showcase-stage";
import { ShowcaseTelemetry } from "./showcase-telemetry";

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
  if (action.type === "play") return { ...state, isPlaying: true };
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
        <h3 className="orbix-h3 mt-1 text-foreground">
          {missionProfile.missionName}
        </h3>
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
          {state.isPlaying ? (
            <Button
              aria-label="Pause mission showcase"
              onClick={() => dispatch({ type: "pause" })}
              variant="secondary"
            >
              <Pause aria-hidden="true" size={16} />
              Pause
            </Button>
          ) : (
            <Button
              aria-label="Play mission showcase"
              disabled={isLastPhase}
              onClick={() => dispatch({ type: "play" })}
              variant="secondary"
            >
              <Play aria-hidden="true" size={16} />
              Play
            </Button>
          )}
          <Button
            aria-label="Previous showcase phase"
            disabled={state.currentPhaseIndex === 0}
            onClick={() => dispatch({ type: "previous" })}
            variant="ghost"
          >
            <ChevronLeft aria-hidden="true" size={16} />
            Previous
          </Button>
          <Button
            aria-label="Next showcase phase"
            disabled={isLastPhase}
            onClick={() => dispatch({ type: "next" })}
            variant="ghost"
          >
            Next
            <ChevronRight aria-hidden="true" size={16} />
          </Button>
          <Button
            aria-label="Restart mission showcase"
            onClick={() => dispatch({ type: "restart" })}
            variant="ghost"
          >
            <RotateCcw aria-hidden="true" size={16} />
            Restart
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)]">
          <nav aria-label="Walkthrough phases">
            <ol className="space-y-0.5">
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
          Play advances one phase every few seconds and stops at the last phase.
          With focus inside the walkthrough, the left and right arrow keys
          change phase and Home restarts.
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
