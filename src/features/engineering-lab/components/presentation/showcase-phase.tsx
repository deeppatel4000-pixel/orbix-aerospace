import type { LucideIcon } from "lucide-react";
import {
  CircleDot,
  ClipboardCheck,
  Flame,
  Orbit,
  Rocket,
  Send,
} from "lucide-react";

export type ShowcaseScene =
  "arrival" | "entry" | "launch" | "orbit" | "review" | "transfer";

export interface ShowcasePresentationPhase {
  readonly description: string;
  readonly icon: LucideIcon;
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
      "Mission inputs and completed outputs are staged for educational review.",
    icon: Rocket,
    id: "launch-preparation",
    label: "Launch Preparation",
    scene: "launch",
    shortLabel: "Launch",
  },
  {
    description:
      "Existing orbital outputs are introduced without propagating a new orbit.",
    icon: CircleDot,
    id: "orbit-insertion",
    label: "Orbit Insertion",
    scene: "orbit",
    shortLabel: "Orbit",
  },
  {
    description:
      "The resolved transfer is presented as a mission architecture milestone.",
    icon: Send,
    id: "orbital-transfer",
    label: "Orbital Transfer",
    scene: "transfer",
    shortLabel: "Transfer",
  },
  {
    description:
      "Arrival and mission operations are storytelling labels for supplied results.",
    icon: Orbit,
    id: "arrival-mission-phase",
    label: "Arrival / Mission Phase",
    scene: "arrival",
    shortLabel: "Arrival",
  },
  {
    description:
      "Existing vehicle and thermal outputs are displayed as atmospheric-entry telemetry.",
    icon: Flame,
    id: "atmospheric-entry",
    label: "Atmospheric Entry",
    scene: "entry",
    shortLabel: "Entry",
  },
  {
    description:
      "The sequence concludes with a presentation-only review of completed mission objects.",
    icon: ClipboardCheck,
    id: "mission-review",
    label: "Mission Review",
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

export function ShowcasePhase({
  active,
  index,
  onSelect,
  phase,
}: ShowcasePhaseProps) {
  const Icon = phase.icon;

  return (
    <li className="min-w-[9rem] flex-1">
      <button
        aria-current={active ? "step" : undefined}
        aria-label={`Show phase ${index + 1}: ${phase.label}`}
        className={
          "group w-full rounded-xl border px-3 py-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none " +
          (active
            ? "border-accent/50 bg-accent/10 text-accent"
            : "hover:text-muted-strong border-white/10 bg-surface text-muted hover:border-accent/25")
        }
        onClick={() => onSelect(index)}
        type="button"
      >
        <span className="flex items-center justify-between gap-3">
          <span className="font-mono text-[0.57rem] tracking-[0.1em] uppercase">
            {String(index + 1).padStart(2, "0")}
          </span>
          <Icon aria-hidden="true" size={14} />
        </span>
        <span className="mt-2 block font-mono text-[0.64rem] font-semibold tracking-[0.08em] uppercase">
          {phase.shortLabel}
        </span>
      </button>
    </li>
  );
}
