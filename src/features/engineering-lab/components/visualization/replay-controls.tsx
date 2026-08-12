import { Pause, Play, RotateCcw } from "lucide-react";

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
 * The replay transport.
 *
 * Every control, its accessible name and its disabled rule are unchanged —
 * Play is disabled while playing, Pause while stopped, Restart is always
 * available, and the speed select still offers 0.5x, 1x and 2x. The state
 * machine in `mission-replay.tsx` is untouched.
 *
 * What changed is the reading order. Transport, position and current phase
 * were three equally-weighted rows inside one panel, each with its own
 * monospace micro-label, so nothing said which was the primary action. Now the
 * transport leads, the position readout follows as a subordinate line, and the
 * speed select sits apart from the transport because it configures playback
 * rather than driving it.
 *
 * The `<progress>` element is deliberately kept and deliberately NOT made
 * interactive. Mission Replay supports selecting a phase, not seeking to an
 * arbitrary time; a draggable thumb would promise a capability the product
 * does not have. It reports position only, and `replay-transport.spec.ts`
 * asserts no slider ever appears here.
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
      className="rounded-lg border border-border bg-surface/45 p-4 sm:p-5"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Play and Pause read as one transport: the active one carries the
           * accent, the unavailable one dims. State is therefore legible from
           * the pair, not from a single control's styling. */}
          <button
            aria-label="Play mission replay"
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-accent/45 bg-accent/12 px-4 text-sm font-semibold text-accent transition-colors outline-none hover:bg-accent/20 focus-visible:ring-2 focus-visible:ring-accent disabled:border-border disabled:bg-transparent disabled:text-muted motion-reduce:transition-none"
            disabled={isPlaying}
            onClick={onPlay}
            type="button"
          >
            <Play aria-hidden="true" fill="currentColor" size={15} />
            Play
          </button>
          <button
            aria-label="Pause mission replay"
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-accent/45 bg-accent/12 px-4 text-sm font-semibold text-accent transition-colors outline-none hover:bg-accent/20 focus-visible:ring-2 focus-visible:ring-accent disabled:border-border disabled:bg-transparent disabled:text-muted motion-reduce:transition-none"
            disabled={!isPlaying}
            onClick={onPause}
            type="button"
          >
            <Pause aria-hidden="true" fill="currentColor" size={15} />
            Pause
          </button>
          {/* Restart is separated by a rule: it discards position rather than
           * continuing it, and sat indistinguishable beside Pause before. */}
          <span aria-hidden="true" className="mx-1 h-6 w-px bg-border" />
          <button
            aria-label="Restart mission replay"
            className="text-muted-strong inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-4 text-sm font-semibold transition-colors outline-none hover:border-accent/45 hover:text-accent focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none"
            onClick={onRestart}
            type="button"
          >
            <RotateCcw aria-hidden="true" size={15} />
            Restart
          </button>
        </div>

        <label className="flex items-center gap-2 text-sm text-muted">
          Replay speed
          <select
            aria-label="Mission replay speed"
            className="min-h-11 rounded-md border border-border bg-background px-3 font-mono text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent"
            onChange={(event) =>
              onSpeedChange(Number(event.target.value) as ReplaySpeed)
            }
            value={speed}
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
          </select>
        </label>
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="orbix-label">
            Phase {currentPhaseIndex + 1} of {totalPhases}
          </p>
          <output className="font-mono text-sm font-semibold text-foreground">
            {currentPhaseLabel}
          </output>
        </div>
        <progress
          aria-label="Mission replay progress"
          className="mt-3 h-1 w-full overflow-hidden rounded-full accent-[var(--color-accent)]"
          max={totalPhases}
          value={currentPhaseIndex + 1}
        />
      </div>
    </section>
  );
}
