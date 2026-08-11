import { ArrowLeft, ArrowRight, RotateCcw, SkipForward } from "lucide-react";

export interface DemoNavigationProps {
  readonly currentStepIndex: number;
  readonly onBack: () => void;
  readonly onNext: () => void;
  readonly onRestart: () => void;
  readonly onSkip: () => void;
  readonly totalSteps: number;
}

const navigationButtonClassName =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none";

export function DemoNavigation({
  currentStepIndex,
  onBack,
  onNext,
  onRestart,
  onSkip,
  totalSteps,
}: DemoNavigationProps) {
  const isLastStep = currentStepIndex === totalSteps - 1;

  return (
    <nav
      aria-label="Orbix demo tour navigation"
      className="rounded-2xl border border-white/10 bg-surface/95 p-4"
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            aria-label="Previous demo step"
            className={`${navigationButtonClassName} text-muted-strong border-white/12 bg-white/5 hover:border-accent/30 hover:text-accent`}
            disabled={currentStepIndex === 0}
            onClick={onBack}
            type="button"
          >
            <ArrowLeft aria-hidden="true" size={14} />
            Back
          </button>
          <button
            aria-label={isLastStep ? "Complete demo tour" : "Next demo step"}
            className={`${navigationButtonClassName} border-accent/35 bg-accent/12 text-accent hover:bg-accent/18`}
            onClick={onNext}
            type="button"
          >
            {isLastStep ? "Complete tour" : "Next step"}
            <ArrowRight aria-hidden="true" size={14} />
          </button>
          <button
            aria-label="Restart demo tour"
            className={`${navigationButtonClassName} border-white/12 bg-white/5 text-muted hover:border-accent/30 hover:text-accent`}
            onClick={onRestart}
            type="button"
          >
            <RotateCcw aria-hidden="true" size={14} />
            Restart
          </button>
          <button
            aria-label="Skip Orbix demo tour"
            className={`${navigationButtonClassName} border-white/12 bg-transparent text-muted hover:border-signal/30 hover:text-signal`}
            onClick={onSkip}
            type="button"
          >
            <SkipForward aria-hidden="true" size={14} />
            Skip tour
          </button>
        </div>

        <div className="min-w-52">
          <div className="mb-2 flex items-center justify-between gap-4 font-mono text-[0.57rem] tracking-[0.1em] text-muted uppercase">
            <span>Tour progress</span>
            <span>
              {String(currentStepIndex + 1).padStart(2, "0")} /{" "}
              {String(totalSteps).padStart(2, "0")}
            </span>
          </div>
          <progress
            aria-label="Orbix demo tour progress"
            className="h-1.5 w-full accent-[var(--color-accent)]"
            max={totalSteps}
            value={currentStepIndex + 1}
          />
        </div>
      </div>
    </nav>
  );
}
