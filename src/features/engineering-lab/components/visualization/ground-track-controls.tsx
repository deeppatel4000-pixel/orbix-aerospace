import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { GroundTrackViewMode } from "./orbit-ground-path";

export interface GroundTrackControlsProps {
  readonly canZoomIn: boolean;
  readonly canZoomOut: boolean;
  readonly mode: GroundTrackViewMode;
  readonly onModeChange: (mode: GroundTrackViewMode) => void;
  readonly onReset: () => void;
  readonly onZoomIn: () => void;
  readonly onZoomOut: () => void;
}

const views = [
  { id: "orbit", label: "Orbit view" },
  { id: "ground", label: "Ground view" },
] as const;

export function GroundTrackControls({
  canZoomIn,
  canZoomOut,
  mode,
  onModeChange,
  onReset,
  onZoomIn,
  onZoomOut,
}: GroundTrackControlsProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div
        aria-label="Planet visualization mode"
        className="orbix-tabs overflow-visible"
        role="tablist"
      >
        {views.map((view, index) => (
          <button
            aria-controls="ground-track-visual-panel"
            aria-selected={mode === view.id}
            className="orbix-tab"
            id={`ground-track-${view.id}-tab`}
            key={view.id}
            onClick={() => onModeChange(view.id)}
            onKeyDown={(event) => {
              if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
                return;
              }
              event.preventDefault();
              const next = views[(index + 1) % views.length];
              if (next) {
                onModeChange(next.id);
                document.getElementById(`ground-track-${next.id}-tab`)?.focus();
              }
            }}
            role="tab"
            tabIndex={mode === view.id ? 0 : -1}
            type="button"
          >
            {view.label}
          </button>
        ))}
      </div>

      <div
        aria-label="Ground-track visualization controls"
        className="flex flex-wrap gap-2"
        role="toolbar"
      >
        <Button
          aria-label="Zoom out planetary visualization"
          disabled={!canZoomOut}
          onClick={onZoomOut}
          variant="secondary"
        >
          <ZoomOut aria-hidden="true" size={16} />
          Zoom out
        </Button>
        <Button
          aria-label="Zoom in planetary visualization"
          disabled={!canZoomIn}
          onClick={onZoomIn}
          variant="secondary"
        >
          <ZoomIn aria-hidden="true" size={16} />
          Zoom in
        </Button>
        <Button onClick={onReset} variant="ghost">
          <RotateCcw aria-hidden="true" size={16} />
          Reset view
        </Button>
      </div>
    </div>
  );
}
