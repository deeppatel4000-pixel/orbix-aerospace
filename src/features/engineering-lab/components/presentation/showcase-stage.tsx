import type { ShowcasePresentationPhase } from "./showcase-phase";

export interface ShowcaseStageProps {
  readonly insight?: string;
  readonly phase: ShowcasePresentationPhase;
  readonly phaseNumber: number;
  readonly phaseTotal: number;
}

/** The current walkthrough phase: its name, what it covers, and a note. */
export function ShowcaseStage({
  insight,
  phase,
  phaseNumber,
  phaseTotal,
}: ShowcaseStageProps) {
  return (
    <section
      aria-labelledby="showcase-current-phase-title"
      className="min-w-0 border-t border-border-subtle pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6"
      data-showcase-phase={phase.id}
    >
      <p className="orbix-label">
        Phase {phaseNumber} of {phaseTotal}
      </p>
      <h4
        className="orbix-h3 mt-1 text-foreground"
        id="showcase-current-phase-title"
      >
        {phase.label}
      </h4>
      <p className="mt-2 max-w-[68ch] text-sm leading-6 text-text-secondary">
        {phase.description}
      </p>
      {insight ? (
        <p className="mt-3 max-w-[68ch] border-t border-border-subtle pt-3 text-sm leading-6 text-muted">
          {insight}
        </p>
      ) : null}
    </section>
  );
}
