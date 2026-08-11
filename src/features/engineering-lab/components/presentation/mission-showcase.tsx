"use client";

import { useEffect, useReducer, useState, type KeyboardEvent } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

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
  readonly reducedMotionOverride?: boolean;
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

export function MissionShowcase({
  insights,
  missionProfile,
  reducedMotionOverride,
  report,
}: MissionShowcaseProps) {
  const [state, dispatch] = useReducer(
    missionShowcaseReducer,
    INITIAL_SHOWCASE_STATE,
  );
  const reducedMotion = useReducedMotion(reducedMotionOverride);
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
    if (event.key === " ") {
      event.preventDefault();
      dispatch({ type: state.isPlaying ? "pause" : "play" });
    }
  }

  return (
    <article
      aria-describedby="mission-showcase-keyboard-help"
      aria-label={`Cinematic mission showcase for ${missionProfile.missionName}`}
      className="technical-grid min-h-[80vh] overflow-hidden rounded-2xl border border-white/12 bg-surface text-foreground shadow-[0_30px_90px_rgba(0,0,0,0.34)] outline-none focus-visible:ring-2 focus-visible:ring-accent"
      data-reduced-motion={reducedMotion ? "true" : "false"}
      onKeyDown={handleKeyboard}
      tabIndex={0}
    >
      <header className="relative overflow-hidden border-b border-white/10 px-5 py-8 sm:px-8 sm:py-10">
        <div
          aria-hidden="true"
          className="absolute -top-28 right-0 h-80 w-80 rounded-full bg-accent/8 blur-3xl"
        />
        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-2 font-mono text-[0.64rem] tracking-[0.22em] text-accent uppercase">
              <Clapperboard aria-hidden="true" size={15} />
              ORBIX Mission Showcase
            </p>
            <h2 className="mt-4 max-w-4xl text-3xl font-semibold tracking-[-0.045em] sm:text-5xl">
              {missionProfile.missionName}
            </h2>
            <p className="mt-4 font-mono text-[0.65rem] tracking-[0.15em] text-muted uppercase">
              Educational simulation review
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-signal/20 bg-signal/5 px-4 py-3 text-signal">
            <ShieldCheck aria-hidden="true" size={16} />
            <span className="font-mono text-[0.61rem] tracking-[0.08em] uppercase">
              Visual sequence only
            </span>
          </div>
        </div>
      </header>

      <div className="space-y-7 p-5 sm:p-8">
        <section
          aria-label="Mission showcase controls"
          className="rounded-2xl border border-white/10 bg-surface/90 p-4"
        >
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                aria-label="Play mission showcase"
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-xs font-semibold text-accent outline-none hover:bg-accent/15 focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40 motion-reduce:transition-none"
                disabled={state.isPlaying}
                onClick={() => dispatch({ type: "play" })}
                type="button"
              >
                <Play aria-hidden="true" fill="currentColor" size={14} />
                Play showcase
              </button>
              <button
                aria-label="Pause mission showcase"
                className="text-muted-strong inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-xs font-semibold outline-none hover:border-accent/30 hover:text-accent focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40 motion-reduce:transition-none"
                disabled={!state.isPlaying}
                onClick={() => dispatch({ type: "pause" })}
                type="button"
              >
                <Pause aria-hidden="true" fill="currentColor" size={14} />
                Pause
              </button>
              <button
                aria-label="Previous showcase phase"
                className="text-muted-strong inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-xs font-semibold outline-none hover:border-accent/30 hover:text-accent focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40 motion-reduce:transition-none"
                disabled={state.currentPhaseIndex === 0}
                onClick={() => dispatch({ type: "previous" })}
                type="button"
              >
                <ChevronLeft aria-hidden="true" size={14} />
                Previous
              </button>
              <button
                aria-label="Next showcase phase"
                className="text-muted-strong inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-xs font-semibold outline-none hover:border-accent/30 hover:text-accent focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40 motion-reduce:transition-none"
                disabled={
                  state.currentPhaseIndex === SHOWCASE_PHASES.length - 1
                }
                onClick={() => dispatch({ type: "next" })}
                type="button"
              >
                Next
                <ChevronRight aria-hidden="true" size={14} />
              </button>
              <button
                aria-label="Restart mission showcase"
                className="text-muted-strong inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-xs font-semibold outline-none hover:border-accent/30 hover:text-accent focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none"
                onClick={() => dispatch({ type: "restart" })}
                type="button"
              >
                <RotateCcw aria-hidden="true" size={14} />
                Restart
              </button>
            </div>

            <div className="min-w-48">
              <div className="mb-2 flex justify-between gap-4 font-mono text-[0.57rem] tracking-[0.1em] text-muted uppercase">
                <span>Presentation sequence</span>
                <span>
                  {String(state.currentPhaseIndex + 1).padStart(2, "0")} / 06
                </span>
              </div>
              <progress
                aria-label="Mission showcase progress"
                className="h-1.5 w-full accent-[var(--color-accent)]"
                max={SHOWCASE_PHASES.length}
                value={state.currentPhaseIndex + 1}
              />
            </div>
          </div>
        </section>

        <nav aria-label="Mission showcase timeline">
          <ol className="flex gap-2 overflow-x-auto pb-2">
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
          isPlaying={state.isPlaying}
          phase={activePhase}
          reducedMotion={reducedMotion}
        />

        <div className="border-t border-white/10 pt-7">
          <ShowcaseTelemetry missionProfile={missionProfile} report={report} />
        </div>

        {reducedMotion ? (
          <p className="rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-xs text-muted">
            Reduced motion mode is active. Decorative spacecraft and star motion
            is suppressed while phase controls remain available.
          </p>
        ) : null}

        <p className="sr-only" id="mission-showcase-keyboard-help">
          Use left and right arrow keys to change phase, Space to play or pause,
          and Home to restart.
        </p>
        <p aria-live="polite" className="sr-only" role="status">
          Mission showcase phase {state.currentPhaseIndex + 1}:{" "}
          {activePhase.label}.
          {state.isPlaying ? " Showcase playing." : " Showcase paused."}
        </p>

        <footer className="border-t border-white/10 pt-6 text-xs leading-5 text-muted">
          This cinematic sequence presents existing Orbix outputs. It is not a
          trajectory propagation, flight simulation, mission clock, or readiness
          assessment.
        </footer>
      </div>
    </article>
  );
}
