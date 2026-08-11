import {
  Check,
  CircleDot,
  Flame,
  Orbit,
  Rocket,
  Shield,
  type LucideIcon,
} from "lucide-react";

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

const phaseIcons: Readonly<Record<ReplayPhaseId, LucideIcon>> = {
  arrival: CircleDot,
  "atmospheric-entry": Flame,
  complete: Check,
  departure: Rocket,
  "orbital-operations": Orbit,
  preparation: Shield,
  "reentry-preparation": Shield,
  transfer: Orbit,
};

/**
 * The mission phase sequence.
 *
 * This is the product's only timeline control, and it is discrete: phases can
 * be selected, time cannot be sought. The presentation is therefore a stepped
 * sequence rather than a track with a position handle — nothing here is
 * draggable, and there is no thumb to suggest otherwise.
 *
 * Selection behaviour, ordering and `aria-current="step"` are unchanged.
 *
 * Two things did change. The current phase no longer pulses: an indefinitely
 * animating marker reads as "working" rather than "you are here", and it was
 * the only motion in the panel. And state no longer rests on colour alone —
 * completed phases show a check, the current phase is filled and carries a
 * visible "Current" label, so the sequence is readable without relying on the
 * accent hue.
 */
export function ReplayPhaseIndicator({
  currentPhaseIndex,
  onSelectPhase,
  phases,
}: ReplayPhaseIndicatorProps) {
  return (
    <section aria-labelledby="replay-phase-indicator-title">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="orbix-label text-accent">Replay timeline</p>
          <h4
            className="mt-1 text-lg font-semibold"
            id="replay-phase-indicator-title"
          >
            Mission Phase Sequence
          </h4>
        </div>
        <p className="text-sm text-muted">
          Select any available phase to review it.
        </p>
      </div>

      <ol className="mt-5 flex min-w-max items-start" role="list">
        {phases.map((phase, index) => {
          const Icon = phaseIcons[phase.id];
          const isCurrent = index === currentPhaseIndex;
          const isComplete = index < currentPhaseIndex;

          return (
            <li className="relative w-36 px-2 text-center" key={phase.id}>
              {index > 0 ? (
                <span
                  aria-hidden="true"
                  className={
                    "absolute top-5 right-1/2 h-px w-full " +
                    (isComplete || isCurrent ? "bg-accent/55" : "bg-border")
                  }
                />
              ) : null}
              <button
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`Show replay phase: ${phase.label}`}
                className="group relative z-10 mx-auto flex w-full flex-col items-center rounded-xl px-1 py-1 outline-none focus-visible:ring-2 focus-visible:ring-accent"
                onClick={() => onSelectPhase(index)}
                type="button"
              >
                <span
                  className={
                    "flex h-10 w-10 items-center justify-center rounded-full border transition-colors motion-reduce:transition-none " +
                    (isCurrent
                      ? "border-accent bg-accent text-background"
                      : isComplete
                        ? "border-accent/35 bg-accent/8 text-accent"
                        : "border-border bg-surface/60 text-muted group-hover:border-accent/40 group-hover:text-accent")
                  }
                >
                  {isComplete ? (
                    <Check aria-hidden="true" size={15} />
                  ) : (
                    <Icon aria-hidden="true" size={15} />
                  )}
                </span>
                <span
                  className={
                    "mt-2 text-sm leading-5 font-semibold " +
                    (isCurrent ? "text-foreground" : "text-muted")
                  }
                >
                  {phase.label}
                </span>
                {/* A word, not just a colour: the active step stays identifiable
                 * when hue is unavailable to the reader. */}
                <span
                  className={
                    "orbix-label mt-1 " +
                    (isCurrent ? "text-accent" : "sr-only")
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
