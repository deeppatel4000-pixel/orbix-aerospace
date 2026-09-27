"use client";

import { useReducer, type KeyboardEvent } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import type { MissionProfileAnalysis } from "@/features/engineering-lab/types";

import { GroundTrackControls } from "./ground-track-controls";
import { OrbitGroundPath, type GroundTrackViewMode } from "./orbit-ground-path";
import { PlanetMap } from "./planet-map";

export interface GroundTrackVisualizationProps {
  readonly analysis?: MissionProfileAnalysis | null;
}

export interface GroundTrackPresentationState {
  readonly mode: GroundTrackViewMode;
  readonly zoomLevelIndex: number;
}

export type GroundTrackPresentationAction =
  | { readonly mode: GroundTrackViewMode; readonly type: "set-mode" }
  | { readonly type: "reset" }
  | { readonly type: "zoom-in" }
  | { readonly type: "zoom-out" };

export const GROUND_TRACK_PRESENTATION_ZOOM_LEVELS = [
  0.88, 1, 1.14, 1.28,
] as const;

export const INITIAL_GROUND_TRACK_PRESENTATION_STATE: GroundTrackPresentationState =
  {
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

/**
 * An illustrative ground track: hand-drawn continents and a conceptual path
 * beside the real orbit values. Static; nothing moves on its own.
 */
export function GroundTrackVisualization({
  analysis,
}: GroundTrackVisualizationProps) {
  const [state, dispatch] = useReducer(
    groundTrackPresentationReducer,
    INITIAL_GROUND_TRACK_PRESENTATION_STATE,
  );
  const transfer =
    analysis?.sourceAnalyses.deltaVBudget?.sourceAnalyses.hohmannTransfer;
  const planeChange =
    analysis?.sourceAnalyses.deltaVBudget?.sourceAnalyses.orbitalPlaneChange;
  const hasOrbitalData = Boolean(transfer || planeChange);
  const zoomScale =
    GROUND_TRACK_PRESENTATION_ZOOM_LEVELS[state.zoomLevelIndex] ?? 1;
  const missionName = analysis?.missionName ?? "Not reported";
  const orbitSummary = transfer
    ? `${groundTrackFormatter.format(transfer.initialOrbit.altitudeMetres)} m to ${groundTrackFormatter.format(transfer.finalOrbit.altitudeMetres)} m`
    : planeChange
      ? "Circular orbit supplied by plane-change analysis"
      : "Not reported";

  function handleKeyboard(event: KeyboardEvent<HTMLElement>) {
    const target = event.target as HTMLElement;
    if (target.closest("button, input, select, textarea, a")) return;

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
  }

  if (!hasOrbitalData) {
    return (
      <EmptyState
        description="A completed orbital transfer or orbital plane-change analysis is required to provide orbit context. No replacement trajectory has been generated."
        title="Ground-track visualization unavailable"
      />
    );
  }

  return (
    <section
      aria-describedby="ground-track-keyboard-help ground-track-disclaimer"
      aria-labelledby="ground-track-title"
      className="min-w-0 text-foreground"
      data-ground-track-mode={state.mode}
      onKeyDown={handleKeyboard}
    >
      <header className="border-b border-border-subtle pb-4">
        <h3 className="orbix-h3 text-foreground" id="ground-track-title">
          Orbital ground track
        </h3>
        <p className="mt-1 text-sm text-muted">
          Illustrative orbital ground track, not a flight prediction.
        </p>

        <div className="mt-4">
          <GroundTrackControls
            canZoomIn={
              state.zoomLevelIndex <
              GROUND_TRACK_PRESENTATION_ZOOM_LEVELS.length - 1
            }
            canZoomOut={state.zoomLevelIndex > 0}
            mode={state.mode}
            onModeChange={(mode) => dispatch({ mode, type: "set-mode" })}
            onReset={() => dispatch({ type: "reset" })}
            onZoomIn={() => dispatch({ type: "zoom-in" })}
            onZoomOut={() => dispatch({ type: "zoom-out" })}
          />
        </div>
      </header>

      <div
        aria-labelledby={`ground-track-${state.mode}-tab`}
        className="mt-4 min-w-0 overflow-x-auto"
        id="ground-track-visual-panel"
        role="tabpanel"
        tabIndex={0}
      >
        <PlanetMap mode={state.mode} zoomScale={zoomScale}>
          <OrbitGroundPath mode={state.mode} />
        </PlanetMap>
      </div>

      <div
        aria-label="Ground-track mission information"
        className="mt-4 border-t border-border-subtle pt-2"
        role="group"
      >
        <dl className="grid gap-x-8 text-sm sm:grid-cols-3">
          <div className="border-t border-border-subtle py-2 first:border-t-0 sm:border-t-0">
            <dt className="text-muted">Mission</dt>
            <dd className="mt-1 text-foreground">{missionName}</dd>
          </div>
          <div className="border-t border-border-subtle py-2 sm:border-t-0">
            <dt className="text-muted">Orbit altitude</dt>
            <dd className="mt-1 text-foreground">
              <output>
                {transfer ? (
                  <>
                    <span className="orbix-data">{`${groundTrackFormatter.format(transfer.initialOrbit.altitudeMetres)} m`}</span>{" "}
                    to{" "}
                    <span className="orbix-data">{`${groundTrackFormatter.format(transfer.finalOrbit.altitudeMetres)} m`}</span>
                  </>
                ) : (
                  orbitSummary
                )}
              </output>
            </dd>
          </div>
          <div className="border-t border-border-subtle py-2 sm:border-t-0">
            <dt className="text-muted">Plane change (supplied maneuver)</dt>
            <dd
              className={
                planeChange
                  ? "orbix-data mt-1 text-foreground"
                  : "mt-1 text-muted"
              }
            >
              <output>
                {planeChange
                  ? `${groundTrackFormatter.format(planeChange.inclinationChangeDegrees)}°`
                  : "Not reported"}
              </output>
            </dd>
          </div>
        </dl>
        <p className="mt-2 border-t border-border-subtle pt-3 text-sm leading-6 text-muted">
          Continent outlines, the path and the marker are drawn by hand to
          explain the idea. They are not propagated orbital coordinates.
        </p>
      </div>

      <footer
        className="mt-3 border-t border-border-subtle pt-3 text-sm leading-6 text-muted"
        id="ground-track-disclaimer"
      >
        This visualization illustrates orbital concepts and does not represent
        real spacecraft navigation data.
      </footer>

      <p className="sr-only" id="ground-track-keyboard-help">
        With focus inside this visualization, press G for ground view, O for
        orbit view, plus or minus to zoom, or R to reset.
      </p>
      <p aria-live="polite" className="sr-only" role="status">
        Ground-track view: {state.mode}. Zoom level {state.zoomLevelIndex + 1}{" "}
        of {GROUND_TRACK_PRESENTATION_ZOOM_LEVELS.length}.
      </p>
    </section>
  );
}
