import { Check } from "lucide-react";

export type ReplaySceneMode = "orbital" | "reentry";

export type ReplayPhaseId =
  | "preparation"
  | "departure"
  | "orbital-operations"
  | "transfer"
  | "arrival"
  | "reentry-preparation"
  | "atmospheric-entry"
  | "complete";

export interface ReplayPresentationPhase {
  readonly description: string;
  readonly id: ReplayPhaseId;
  readonly label: string;
  readonly sceneMode: ReplaySceneMode;
  readonly statusLabel: string;
}

export interface ReplayPhaseIndicatorProps {
  readonly currentPhaseIndex: number;
  readonly onSelectPhase: (index: number) => void;
  readonly phases: readonly ReplayPresentationPhase[];
}

/**
 * The mission phase sequence: a discrete, stepped list. Phases can be
 * selected; there is no seekable track. State is carried by a number or a
 * check mark and a visible word, not by colour alone, and nothing animates.
 */
export function ReplayPhaseIndicator({
  currentPhaseIndex,
  onSelectPhase,
  phases,
}: ReplayPhaseIndicatorProps) {
  return (
    <section aria-labelledby="replay-phase-indicator-title">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h4
          className="orbix-h4 text-foreground"
          id="replay-phase-indicator-title"
        >
          Mission phase sequence
        </h4>
        <p className="text-sm text-muted">Select any phase to review it.</p>
      </div>

      <ol className="mt-4 flex min-w-max items-start" role="list">
        {phases.map((phase, index) => {
          const isCurrent = index === currentPhaseIndex;
          const isComplete = index < currentPhaseIndex;

          return (
            <li className="relative w-32 px-1 text-center" key={phase.id}>
              {index > 0 ? (
                <span
                  aria-hidden="true"
                  className={
                    "absolute top-5 right-1/2 h-px w-full " +
                    (isComplete || isCurrent
                      ? "bg-border-control"
                      : "bg-border")
                  }
                />
              ) : null}
              <button
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`Show replay phase: ${phase.label}`}
                className="group relative z-10 mx-auto flex w-full flex-col items-center rounded px-1 py-1"
                onClick={() => onSelectPhase(index)}
                type="button"
              >
                {/* Timeline node: a genuinely circular, non-label shape. */}
                <span
                  className={
                    "flex h-10 w-10 items-center justify-center rounded-full border text-sm transition-colors duration-150 " +
                    (isCurrent
                      ? "border-accent bg-accent font-semibold text-background"
                      : isComplete
                        ? "border-border-control bg-surface-raised text-foreground"
                        : "border-border-control bg-surface text-muted group-hover:text-foreground")
                  }
                >
                  {isComplete ? (
                    <Check aria-hidden="true" size={16} />
                  ) : (
                    <span aria-hidden="true" className="orbix-data">
                      {index + 1}
                    </span>
                  )}
                </span>
                <span
                  className={
                    "mt-2 text-sm leading-5 " +
                    (isCurrent
                      ? "font-semibold text-foreground"
                      : "text-text-secondary")
                  }
                >
                  {phase.label}
                </span>
                <span
                  className={
                    isCurrent ? "orbix-label mt-1 text-foreground" : "sr-only"
                  }
                >
                  {isCurrent ? "Current" : isComplete ? "Reviewed" : "Upcoming"}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
