export type ShowcaseScene =
  "arrival" | "entry" | "launch" | "orbit" | "review" | "transfer";

export interface ShowcasePresentationPhase {
  readonly description: string;
  readonly id: string;
  readonly label: string;
  readonly scene: ShowcaseScene;
  readonly shortLabel: string;
}

export const SHOWCASE_PHASES: readonly [
  ShowcasePresentationPhase,
  ...ShowcasePresentationPhase[],
] = [
  {
    description:
      "The mission inputs and the completed results that the rest of the walkthrough draws on.",
    id: "launch-preparation",
    label: "Launch preparation",
    scene: "launch",
    shortLabel: "Launch",
  },
  {
    description:
      "The starting orbit from the completed orbital analysis. No new orbit is propagated.",
    id: "orbit-insertion",
    label: "Orbit insertion",
    scene: "orbit",
    shortLabel: "Orbit",
  },
  {
    description:
      "The transfer between orbits, with the delta-v and transfer time already calculated.",
    id: "orbital-transfer",
    label: "Orbital transfer",
    scene: "transfer",
    shortLabel: "Transfer",
  },
  {
    description:
      "Arrival at the target orbit. This phase is a label for the supplied results, not a separate calculation.",
    id: "arrival-mission-phase",
    label: "Arrival and mission phase",
    scene: "arrival",
    shortLabel: "Arrival",
  },
  {
    description:
      "The vehicle and heating results from the completed reentry evaluation.",
    id: "atmospheric-entry",
    label: "Atmospheric entry",
    scene: "entry",
    shortLabel: "Entry",
  },
  {
    description: "A summary of the completed results for the whole mission.",
    id: "mission-review",
    label: "Mission review",
    scene: "review",
    shortLabel: "Review",
  },
];

export interface ShowcasePhaseProps {
  readonly active: boolean;
  readonly index: number;
  readonly onSelect: (index: number) => void;
  readonly phase: ShowcasePresentationPhase;
}

/** One step in the walkthrough's phase list. The number is a real sequence. */
export function ShowcasePhase({
  active,
  index,
  onSelect,
  phase,
}: ShowcasePhaseProps) {
  return (
    <li className="min-w-0">
      <button
        aria-current={active ? "step" : undefined}
        aria-label={`Show phase ${index + 1}: ${phase.label}`}
        className={
          active
            ? "flex min-h-10 w-full items-center gap-2 border-l-2 border-accent bg-accent/12 px-3 py-2 text-left text-sm font-medium text-foreground"
            : "flex min-h-10 w-full items-center gap-2 border-l-2 border-transparent px-3 py-2 text-left text-sm text-text-secondary transition-colors duration-150 hover:border-border-strong hover:text-foreground"
        }
        onClick={() => onSelect(index)}
        type="button"
      >
        <span aria-hidden="true" className="orbix-data text-muted">
          {index + 1}
        </span>
        {phase.label}
      </button>
    </li>
  );
}
