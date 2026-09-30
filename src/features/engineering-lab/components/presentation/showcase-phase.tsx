import {
  MISSION_STAGE,
  MISSION_STAGE_SEQUENCE,
  type CoreMissionStage,
} from "../mission-stages";

export type ShowcaseScene =
  "arrival" | "entry" | "launch" | "orbit" | "review" | "transfer";

export interface ShowcasePresentationPhase {
  readonly description: string;
  readonly id: string;
  readonly label: string;
  readonly scene: ShowcaseScene;
  readonly shortLabel: string;
}

const CORE_SHOWCASE_PHASES: Readonly<
  Record<CoreMissionStage, Omit<ShowcasePresentationPhase, "shortLabel">>
> = {
  [MISSION_STAGE.launch]: {
    description:
      "The mission inputs and the completed results that the rest of the walkthrough draws on.",
    id: "launch-preparation",
    label: "Launch preparation",
    scene: "launch",
  },
  [MISSION_STAGE.orbitInsertion]: {
    description:
      "The starting orbit from the completed orbital analysis. No new orbit is propagated.",
    id: "orbit-insertion",
    label: "Orbit insertion",
    scene: "orbit",
  },
  [MISSION_STAGE.transfer]: {
    description:
      "The transfer between orbits, with the delta-v and transfer time already calculated.",
    id: "orbital-transfer",
    label: "Orbital transfer",
    scene: "transfer",
  },
  [MISSION_STAGE.arrival]: {
    description:
      "Arrival at the target orbit. This phase is a label for the supplied results, not a separate calculation.",
    id: "arrival-mission-phase",
    label: "Arrival and mission phase",
    scene: "arrival",
  },
  [MISSION_STAGE.reentry]: {
    description:
      "The vehicle and heating results from the completed reentry evaluation.",
    id: "atmospheric-entry",
    label: "Reentry",
    scene: "entry",
  },
};

function toShowcasePhase(stage: CoreMissionStage): ShowcasePresentationPhase {
  return { ...CORE_SHOWCASE_PHASES[stage], shortLabel: stage };
}

/**
 * The shared mission sequence, then one separate trailing step that
 * reviews the whole mission.
 */
export const SHOWCASE_PHASES: readonly [
  ShowcasePresentationPhase,
  ...ShowcasePresentationPhase[],
] = [
  toShowcasePhase(MISSION_STAGE_SEQUENCE[0]),
  ...MISSION_STAGE_SEQUENCE.slice(1).map(toShowcasePhase),
  {
    description: "A summary of the completed results for the whole mission.",
    id: "mission-review",
    label: "Mission review",
    scene: "review",
    shortLabel: MISSION_STAGE.review,
  },
];

export interface ShowcasePhaseProps {
  readonly active: boolean;
  readonly index: number;
  readonly onSelect: (index: number) => void;
  readonly phase: ShowcasePresentationPhase;
}

/**
 * One step in the walkthrough's step row: B612 Mono number, label and a
 * 2px rule, accent under the current step. The number is a real sequence.
 */
export function ShowcasePhase({
  active,
  index,
  onSelect,
  phase,
}: ShowcasePhaseProps) {
  return (
    <li className="flex min-w-0">
      <button
        aria-current={active ? "step" : undefined}
        className={
          "flex min-h-11 w-full items-end border-b-2 py-2 text-left text-sm leading-5 transition-colors focus-visible:outline-offset-[-2px] " +
          (active
            ? "border-accent font-medium text-foreground"
            : "border-border text-text-secondary hover:border-border-control hover:text-foreground")
        }
        onClick={() => onSelect(index)}
        type="button"
      >
        <span className="[overflow-wrap:break-word]">
          <span aria-hidden="true" className="orbix-data mr-2">
            {index + 1}
          </span>
          {/* The short label keeps every step on one line; the stage
           * below titles the phase in full. */}
          {phase.shortLabel}
        </span>
      </button>
    </li>
  );
}
