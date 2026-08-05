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

export function ReplayPhaseIndicator({
  currentPhaseIndex,
  onSelectPhase,
  phases,
}: ReplayPhaseIndicatorProps) {
  return (
    <section aria-labelledby="replay-phase-indicator-title">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[0.6rem] tracking-[0.15em] text-accent uppercase">
            Replay timeline // Available mission outputs
          </p>
          <h4
            className="mt-1 text-lg font-semibold"
            id="replay-phase-indicator-title"
          >
            Mission Phase Sequence
          </h4>
        </div>
        <p className="text-xs text-[#73898e]">
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
                    (isComplete || isCurrent ? "bg-accent/55" : "bg-white/10")
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
                      ? "border-accent bg-accent/15 text-accent shadow-[0_0_16px_rgba(91,205,190,0.2)] motion-safe:animate-pulse"
                      : isComplete
                        ? "border-accent/35 bg-accent/5 text-accent"
                        : "border-white/12 bg-[#081419] text-[#6f8489] group-hover:border-accent/30 group-hover:text-accent")
                  }
                >
                  <Icon aria-hidden="true" size={15} />
                </span>
                <span
                  className={
                    "mt-2 text-[0.68rem] leading-4 font-semibold " +
                    (isCurrent ? "text-[#e1eaeb]" : "text-[#7d9297]")
                  }
                >
                  {phase.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
