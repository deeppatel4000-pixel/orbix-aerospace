import { ChevronDown, Pause, Play, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export type ReplaySpeed = 0.5 | 1 | 2;

export interface ReplayControlsProps {
  readonly currentPhaseIndex: number;
  readonly currentPhaseLabel: string;
  readonly isPlaying: boolean;
  readonly onPause: () => void;
  readonly onPlay: () => void;
  readonly onRestart: () => void;
  readonly onSpeedChange: (speed: ReplaySpeed) => void;
  readonly speed: ReplaySpeed;
  readonly totalPhases: number;
}

/**
 * The replay transport. Replay starts paused (spec 11); a single Play/Pause
 * toggle keeps focus in place when the state changes. The
 * `<progress>` reports position only: phases can be selected, time cannot be
 * sought, so nothing here is draggable.
 */
export function ReplayControls({
  currentPhaseIndex,
  currentPhaseLabel,
  isPlaying,
  onPause,
  onPlay,
  onRestart,
  onSpeedChange,
  speed,
  totalPhases,
}: ReplayControlsProps) {
  return (
    <section
      aria-label="Mission replay controls"
      className="rounded-md border border-border p-4"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* One toggle rather than a Play/Pause pair: disabling the button
           * that has focus would drop keyboard focus to <body>. */}
          <Button
            aria-label={
              isPlaying ? "Pause mission replay" : "Play mission replay"
            }
            onClick={isPlaying ? onPause : onPlay}
          >
            {isPlaying ? (
              <Pause aria-hidden="true" size={16} />
            ) : (
              <Play aria-hidden="true" size={16} />
            )}
            {isPlaying ? "Pause" : "Play"}
          </Button>
          <Button
            aria-label="Restart mission replay"
            onClick={onRestart}
            variant="ghost"
          >
            <RotateCcw aria-hidden="true" size={16} />
            Restart
          </Button>
        </div>

        <div className="orbix-field w-full sm:w-40">
          <label className="orbix-field__label" htmlFor="mission-replay-speed">
            Replay speed
          </label>
          <div className="orbix-field__control">
            <select
              className="orbix-select"
              id="mission-replay-speed"
              onChange={(event) =>
                onSpeedChange(Number(event.target.value) as ReplaySpeed)
              }
              value={speed}
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={2}>2x</option>
            </select>
            <ChevronDown
              aria-hidden="true"
              className="orbix-field__icon orbix-field__icon--end"
              size={16}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 border-t border-border-subtle pt-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="orbix-label">
            Phase {currentPhaseIndex + 1} of {totalPhases}
            {isPlaying ? ", playing" : ", paused"}
          </p>
          <output className="text-sm font-semibold text-foreground">
            {currentPhaseLabel}
          </output>
        </div>
        <progress
          aria-label="Mission replay progress"
          className="orbix-progress mt-3"
          max={totalPhases}
          value={currentPhaseIndex + 1}
        />
      </div>
    </section>
  );
}
