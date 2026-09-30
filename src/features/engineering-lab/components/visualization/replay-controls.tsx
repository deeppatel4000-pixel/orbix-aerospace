import { ChevronDown, Pause, Play } from "lucide-react";

import { Button } from "@/components/ui/button";

import { TRANSPORT_ROW_CLASS } from "./transport-row";

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
 * toggle keeps focus in place when the state changes. One status line
 * reports the position; the step row below it is the only other marker.
 * Phases can be selected, time cannot be sought, so nothing here is
 * draggable.
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
    <section aria-label="Mission replay controls" className="min-w-0">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className={TRANSPORT_ROW_CLASS}>
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

      <p className="mt-4 text-sm text-muted">
        Phase <span className="orbix-data">{currentPhaseIndex + 1}</span> of{" "}
        <span className="orbix-data">{totalPhases}</span>
        {isPlaying ? ", playing: " : ", paused: "}
        <output className="font-medium text-foreground">
          {currentPhaseLabel}
        </output>
      </p>
    </section>
  );
}
