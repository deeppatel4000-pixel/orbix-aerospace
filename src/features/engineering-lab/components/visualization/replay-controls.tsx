import { Gauge, Pause, Play, RotateCcw } from "lucide-react";

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
      className="rounded-2xl border border-white/10 bg-[#071116] p-4"
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            aria-label="Play mission replay"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-xs font-semibold text-accent transition-colors outline-none hover:bg-accent/15 focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none"
            disabled={isPlaying}
            onClick={onPlay}
            type="button"
          >
            <Play aria-hidden="true" size={15} fill="currentColor" />
            Play
          </button>
          <button
            aria-label="Pause mission replay"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-xs font-semibold text-[#c6d4d6] transition-colors outline-none hover:border-accent/30 hover:text-accent focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40 motion-reduce:transition-none"
            disabled={!isPlaying}
            onClick={onPause}
            type="button"
          >
            <Pause aria-hidden="true" size={15} fill="currentColor" />
            Pause
          </button>
          <button
            aria-label="Restart mission replay"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-xs font-semibold text-[#c6d4d6] transition-colors outline-none hover:border-accent/30 hover:text-accent focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none"
            onClick={onRestart}
            type="button"
          >
            <RotateCcw aria-hidden="true" size={15} />
            Restart
          </button>
        </div>

        <label className="flex items-center gap-3 text-xs text-[#92a6ab]">
          <Gauge aria-hidden="true" className="text-accent" size={15} />
          Replay speed
          <select
            aria-label="Mission replay speed"
            className="min-h-10 rounded-lg border border-white/12 bg-[#061015] px-3 font-mono text-xs text-[#d6e1e2] outline-none focus-visible:ring-2 focus-visible:ring-accent"
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

      <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div>
          <div className="mb-2 flex items-center justify-between gap-3 font-mono text-[0.58rem] tracking-[0.08em] text-[#7e9398] uppercase">
            <span>Replay progress</span>
            <span>
              Phase {currentPhaseIndex + 1} of {totalPhases}
            </span>
          </div>
          <progress
            aria-label="Mission replay progress"
            className="h-1.5 w-full overflow-hidden rounded-full accent-[var(--color-accent)]"
            max={totalPhases}
            value={currentPhaseIndex + 1}
          />
        </div>
        <output className="rounded-lg border border-white/10 bg-black/15 px-3 py-2 font-mono text-xs text-accent">
          {currentPhaseLabel}
        </output>
      </div>
    </section>
  );
}
