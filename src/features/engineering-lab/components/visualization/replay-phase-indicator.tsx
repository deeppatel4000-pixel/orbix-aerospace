import { Check } from "lucide-react";

import { LabHeading } from "./lab-heading";

export type ReplaySceneMode = "orbital" | "reentry";

export type ReplayPhaseId =
  "launch" | "orbit-insertion" | "transfer" | "arrival" | "reentry" | "review";

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
 * selected; there is no seekable track. State is never carried by colour
 * alone: a number or a check mark shows it visually, and each step carries
 * the word Current, Reviewed or Upcoming for assistive technology. Nothing
 * animates.
 */
export function ReplayPhaseIndicator({
  currentPhaseIndex,
  onSelectPhase,
  phases,
}: ReplayPhaseIndicatorProps) {
  return (
    <section aria-labelledby="replay-phase-indicator-title">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <LabHeading id="replay-phase-indicator-title" offset={1} variant="sub">
          Replay phases
        </LabHeading>
        <p className="text-sm text-muted">
          The mission phases, then the end of the replay. Select any step to
          review it.
        </p>
      </div>

      {/* The guided demo's step row: B612 Mono number (a check once
       * reviewed), label, 2px rule under each step, accent under the
       * current one. 2, 3 or 6 across by the column's width. */}
      <ol
        className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 @md:grid-cols-3 @3xl:grid-cols-6"
        role="list"
      >
        {phases.map((phase, index) => {
          const isCurrent = index === currentPhaseIndex;
          const isComplete = index < currentPhaseIndex;
          const state = isCurrent
            ? "Current"
            : isComplete
              ? "Reviewed"
              : "Upcoming";

          return (
            <li className="flex" key={phase.id}>
              <button
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`Show replay phase: ${phase.label}, ${state}`}
                className={
                  "flex min-h-11 w-full items-end border-b-2 py-2 text-left text-sm leading-5 transition-colors focus-visible:outline-offset-[-2px] " +
                  (isCurrent
                    ? "border-accent font-medium text-foreground"
                    : isComplete
                      ? "border-border-control text-text-secondary hover:text-foreground"
                      : "border-border text-muted hover:border-border-control hover:text-foreground")
                }
                onClick={() => onSelectPhase(index)}
                type="button"
              >
                <span className="[overflow-wrap:break-word]">
                  {isComplete ? (
                    <Check
                      aria-hidden="true"
                      className="mr-2 inline-block align-[-0.125em]"
                      size={14}
                    />
                  ) : (
                    <span aria-hidden="true" className="orbix-data mr-2">
                      {index + 1}
                    </span>
                  )}
                  {phase.label}
                </span>
                <span className="sr-only">{state}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
