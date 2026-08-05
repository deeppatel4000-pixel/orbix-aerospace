import {
  Map,
  Orbit,
  Pause,
  Play,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import type { GroundTrackViewMode } from "./orbit-ground-path";

export interface GroundTrackControlsProps {
  readonly animationPaused: boolean;
  readonly canZoomIn: boolean;
  readonly canZoomOut: boolean;
  readonly mode: GroundTrackViewMode;
  readonly onModeChange: (mode: GroundTrackViewMode) => void;
  readonly onReset: () => void;
  readonly onToggleAnimation: () => void;
  readonly onZoomIn: () => void;
  readonly onZoomOut: () => void;
}

export function GroundTrackControls({
  animationPaused,
  canZoomIn,
  canZoomOut,
  mode,
  onModeChange,
  onReset,
  onToggleAnimation,
  onZoomIn,
  onZoomOut,
}: GroundTrackControlsProps) {
  return (
    <div
      aria-label="Ground-track visualization controls"
      className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
      role="toolbar"
    >
      <div
        aria-label="Planet visualization mode"
        className="grid grid-cols-2 gap-1.5 rounded-xl border border-white/10 bg-[#061116] p-1.5"
        role="tablist"
      >
        <button
          aria-controls="ground-track-visual-panel"
          aria-selected={mode === "orbit"}
          className={
            "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none " +
            (mode === "orbit"
              ? "bg-accent/12 text-accent"
              : "text-[#81969b] hover:bg-white/5 hover:text-white")
          }
          id="ground-track-orbit-tab"
          onClick={() => onModeChange("orbit")}
          role="tab"
          type="button"
        >
          <Orbit aria-hidden="true" size={14} />
          Orbit view
        </button>
        <button
          aria-controls="ground-track-visual-panel"
          aria-selected={mode === "ground"}
          className={
            "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none " +
            (mode === "ground"
              ? "bg-accent/12 text-accent"
              : "text-[#81969b] hover:bg-white/5 hover:text-white")
          }
          id="ground-track-ground-tab"
          onClick={() => onModeChange("ground")}
          role="tab"
          type="button"
        >
          <Map aria-hidden="true" size={14} />
          Ground view
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          aria-label="Zoom out planetary visualization"
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-xs text-[#9aadb1] outline-none hover:border-white/20 hover:text-white focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none"
          disabled={!canZoomOut}
          onClick={onZoomOut}
          type="button"
        >
          <ZoomOut aria-hidden="true" size={14} />
          Zoom out
        </button>
        <button
          aria-label="Zoom in planetary visualization"
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-xs text-[#9aadb1] outline-none hover:border-white/20 hover:text-white focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none"
          disabled={!canZoomIn}
          onClick={onZoomIn}
          type="button"
        >
          <ZoomIn aria-hidden="true" size={14} />
          Zoom in
        </button>
        <button
          aria-label="Reset planetary visualization"
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-xs text-[#9aadb1] outline-none hover:border-white/20 hover:text-white focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none"
          onClick={onReset}
          type="button"
        >
          <RotateCcw aria-hidden="true" size={14} />
          Reset view
        </button>
        <button
          aria-label={
            animationPaused
              ? "Resume decorative ground-track animation"
              : "Pause decorative ground-track animation"
          }
          aria-pressed={animationPaused}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-xs text-[#9aadb1] outline-none hover:border-white/20 hover:text-white focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none"
          onClick={onToggleAnimation}
          type="button"
        >
          {animationPaused ? (
            <Play aria-hidden="true" size={14} />
          ) : (
            <Pause aria-hidden="true" size={14} />
          )}
          {animationPaused ? "Resume motion" : "Pause motion"}
        </button>
      </div>
    </div>
  );
}
