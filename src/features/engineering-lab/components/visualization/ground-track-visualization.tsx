"use client";

import { useEffect, useReducer, useState, type KeyboardEvent } from "react";
import { CircleDot, MapPinned, Orbit } from "lucide-react";

import type { MissionProfileAnalysis } from "@/features/engineering-lab/types";

import { GroundTrackControls } from "./ground-track-controls";
import { OrbitGroundPath, type GroundTrackViewMode } from "./orbit-ground-path";
import { PlanetMap } from "./planet-map";

export interface GroundTrackVisualizationProps {
  readonly analysis?: MissionProfileAnalysis | null;
  readonly reducedMotionOverride?: boolean;
}

export interface GroundTrackPresentationState {
  readonly animationPaused: boolean;
  readonly mode: GroundTrackViewMode;
  readonly zoomLevelIndex: number;
}

export type GroundTrackPresentationAction =
  | { readonly mode: GroundTrackViewMode; readonly type: "set-mode" }
  | { readonly type: "reset" }
  | { readonly type: "toggle-animation" }
  | { readonly type: "zoom-in" }
  | { readonly type: "zoom-out" };

export const GROUND_TRACK_PRESENTATION_ZOOM_LEVELS = [
  0.88, 1, 1.14, 1.28,
] as const;

export const INITIAL_GROUND_TRACK_PRESENTATION_STATE: GroundTrackPresentationState =
  {
    animationPaused: false,
    mode: "ground",
    zoomLevelIndex: 1,
  };

const groundTrackFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

export function groundTrackPresentationReducer(
  state: GroundTrackPresentationState,
  action: GroundTrackPresentationAction,
): GroundTrackPresentationState {
  if (action.type === "reset") return INITIAL_GROUND_TRACK_PRESENTATION_STATE;
  if (action.type === "set-mode") return { ...state, mode: action.mode };
  if (action.type === "toggle-animation") {
    return { ...state, animationPaused: !state.animationPaused };
  }
  if (action.type === "zoom-in") {
    return {
      ...state,
      zoomLevelIndex: Math.min(
        state.zoomLevelIndex + 1,
        GROUND_TRACK_PRESENTATION_ZOOM_LEVELS.length - 1,
      ),
    };
  }

  return {
    ...state,
    zoomLevelIndex: Math.max(state.zoomLevelIndex - 1, 0),
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

export function GroundTrackVisualization({
  analysis,
  reducedMotionOverride,
}: GroundTrackVisualizationProps) {
  const [state, dispatch] = useReducer(
    groundTrackPresentationReducer,
    INITIAL_GROUND_TRACK_PRESENTATION_STATE,
  );
  const reducedMotion = useReducedMotion(reducedMotionOverride);
  const transfer =
    analysis?.sourceAnalyses.deltaVBudget?.sourceAnalyses.hohmannTransfer;
  const planeChange =
    analysis?.sourceAnalyses.deltaVBudget?.sourceAnalyses.orbitalPlaneChange;
  const hasOrbitalData = Boolean(transfer || planeChange);
  const effectiveAnimationPaused = state.animationPaused || reducedMotion;
  const zoomScale =
    GROUND_TRACK_PRESENTATION_ZOOM_LEVELS[state.zoomLevelIndex] ?? 1;
  const missionName = analysis?.missionName ?? "Not Reported";
  const orbitSummary = transfer
    ? `${groundTrackFormatter.format(transfer.initialOrbit.altitudeMetres)} m → ${groundTrackFormatter.format(transfer.finalOrbit.altitudeMetres)} m`
    : planeChange
      ? "Circular orbit supplied by plane-change analysis"
      : "Not Reported";

  function handleKeyboard(event: KeyboardEvent<HTMLElement>) {
    if (event.target !== event.currentTarget) return;

    if (event.key.toLowerCase() === "g") {
      event.preventDefault();
      dispatch({ mode: "ground", type: "set-mode" });
    }
    if (event.key.toLowerCase() === "o") {
      event.preventDefault();
      dispatch({ mode: "orbit", type: "set-mode" });
    }
    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      dispatch({ type: "zoom-in" });
    }
    if (event.key === "-") {
      event.preventDefault();
      dispatch({ type: "zoom-out" });
    }
    if (event.key.toLowerCase() === "r") {
      event.preventDefault();
      dispatch({ type: "reset" });
    }
    if (event.key === " ") {
      event.preventDefault();
      dispatch({ type: "toggle-animation" });
    }
  }

  if (!hasOrbitalData) {
    return (
      <section
        aria-label="Orbital ground-track visualization"
        className="rounded-2xl border border-white/10 bg-[#040b0f] p-6"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-accent">
            <MapPinned aria-hidden="true" size={18} />
          </span>
          <div>
            <p className="font-mono text-[0.61rem] tracking-[0.15em] text-accent uppercase">
              Planetary projection // Illustrative
            </p>
            <h3 className="mt-1 text-lg font-semibold">
              Ground-track visualization unavailable
            </h3>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-[#83989d]">
          A completed orbital transfer or orbital plane-change analysis is
          required to provide existing orbit context. No replacement trajectory
          has been generated.
        </p>
        <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-5 text-[#71868c]">
          This visualization illustrates orbital concepts and does not represent
          real spacecraft navigation data.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-describedby="ground-track-keyboard-help ground-track-disclaimer"
      aria-labelledby="ground-track-title"
      className="overflow-hidden rounded-2xl border border-white/12 bg-[#02080c] text-[#e1eaeb] outline-none focus-visible:ring-2 focus-visible:ring-accent"
      data-ground-track-mode={state.mode}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      onKeyDown={handleKeyboard}
      tabIndex={0}
    >
      <header className="border-b border-white/10 bg-[#061116]/95 p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="flex items-center gap-2 font-mono text-[0.61rem] tracking-[0.16em] text-accent uppercase">
              <Orbit aria-hidden="true" size={14} />
              Planetary operations // Concept visualization
            </p>
            <h3 className="mt-1 text-xl font-semibold" id="ground-track-title">
              Orbital Ground Track
            </h3>
            <p className="mt-2 text-sm text-[#82979c]">
              Illustrative orbital ground track — not a flight prediction
            </p>
          </div>
          <span className="inline-flex items-center gap-2 self-start rounded-full border border-signal/20 bg-signal/5 px-3 py-2 font-mono text-[0.54rem] tracking-[0.09em] text-signal uppercase">
            <CircleDot
              aria-hidden="true"
              className={
                effectiveAnimationPaused
                  ? ""
                  : "motion-safe:animate-pulse motion-reduce:animate-none"
              }
              size={12}
            />
            Illustrative mode
          </span>
        </div>

        <div className="mt-5 border-t border-white/10 pt-5">
          <GroundTrackControls
            animationPaused={effectiveAnimationPaused}
            canZoomIn={
              state.zoomLevelIndex <
              GROUND_TRACK_PRESENTATION_ZOOM_LEVELS.length - 1
            }
            canZoomOut={state.zoomLevelIndex > 0}
            mode={state.mode}
            onModeChange={(mode) => dispatch({ mode, type: "set-mode" })}
            onReset={() => dispatch({ type: "reset" })}
            onToggleAnimation={() => dispatch({ type: "toggle-animation" })}
            onZoomIn={() => dispatch({ type: "zoom-in" })}
            onZoomOut={() => dispatch({ type: "zoom-out" })}
          />
        </div>
      </header>

      <div className="grid min-w-0 xl:grid-cols-[minmax(0,1fr)_17rem]">
        <div
          aria-labelledby={`ground-track-${state.mode}-tab`}
          className="min-w-0 overflow-x-auto bg-[#02070a]"
          id="ground-track-visual-panel"
          role="tabpanel"
          tabIndex={0}
        >
          <PlanetMap mode={state.mode} zoomScale={zoomScale}>
            <OrbitGroundPath
              animationPaused={effectiveAnimationPaused}
              mode={state.mode}
            />
          </PlanetMap>
        </div>

        <aside
          aria-label="Ground-track mission information"
          className="border-t border-white/10 bg-[#061116]/75 p-5 xl:border-t-0 xl:border-l"
        >
          <p className="font-mono text-[0.56rem] tracking-[0.14em] text-accent uppercase">
            Information panel
          </p>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="font-mono text-[0.53rem] tracking-[0.1em] text-[#71868c] uppercase">
                Mission
              </dt>
              <dd className="mt-1 text-sm font-semibold text-[#d0dcde]">
                {missionName}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[0.53rem] tracking-[0.1em] text-[#71868c] uppercase">
                Orbit
              </dt>
              <dd className="mt-1 font-mono text-xs text-[#c0cfd2]">
                <output>{orbitSummary}</output>
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[0.53rem] tracking-[0.1em] text-[#71868c] uppercase">
                Plane change
              </dt>
              <dd className="mt-1 font-mono text-xs text-[#c0cfd2]">
                <output>
                  {planeChange
                    ? `${groundTrackFormatter.format(planeChange.inclinationChangeDegrees)}° supplied maneuver`
                    : "Not Reported"}
                </output>
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[0.53rem] tracking-[0.1em] text-[#71868c] uppercase">
                Visualization mode
              </dt>
              <dd className="mt-1 text-sm font-semibold text-signal">
                Illustrative
              </dd>
            </div>
          </dl>
          <div className="mt-5 border-t border-white/10 pt-4 text-xs leading-5 text-[#70868b]">
            Planet outlines, projection path, and spacecraft marker are
            conceptual presentation geometry. They are not propagated orbital
            coordinates.
          </div>
        </aside>
      </div>

      <footer
        className="border-t border-white/10 bg-[#040c10] px-5 py-4 text-xs leading-5 text-[#71868c]"
        id="ground-track-disclaimer"
      >
        This visualization illustrates orbital concepts and does not represent
        real spacecraft navigation data.
      </footer>

      <p className="sr-only" id="ground-track-keyboard-help">
        Focus this visualization and press G for ground view, O for orbit view,
        plus or minus to zoom, R to reset, or Space to pause decorative motion.
      </p>
      <p aria-live="polite" className="sr-only" role="status">
        Ground-track view: {state.mode}. Decorative animation is{" "}
        {effectiveAnimationPaused ? "paused" : "active"}.
      </p>
    </section>
  );
}
