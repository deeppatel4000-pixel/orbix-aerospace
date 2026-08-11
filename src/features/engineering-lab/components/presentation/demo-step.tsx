import type { LucideIcon } from "lucide-react";
import {
  ClipboardCheck,
  Clapperboard,
  Gauge,
  GitBranch,
  Lightbulb,
  Monitor,
} from "lucide-react";
import type { ReactNode, Ref } from "react";

export interface DemoStepDefinition {
  readonly description: string;
  readonly icon: LucideIcon;
  readonly id: string;
  readonly label: string;
  readonly shortLabel: string;
}

export const DEMO_STEPS: readonly [
  DemoStepDefinition,
  ...DemoStepDefinition[],
] = [
  {
    description:
      "Begin with the educational mission objective and the supplied scenario context.",
    icon: Lightbulb,
    id: "mission-concept",
    label: "Mission Concept",
    shortLabel: "Concept",
  },
  {
    description:
      "Review the selected mission systems, orbital design, and vehicle configuration.",
    icon: GitBranch,
    id: "mission-architecture",
    label: "Mission Architecture",
    shortLabel: "Architecture",
  },
  {
    description:
      "Inspect completed orbital, vehicle, and thermal outputs without rerunning analysis.",
    icon: Gauge,
    id: "engineering-analysis",
    label: "Engineering Analysis",
    shortLabel: "Analysis",
  },
  {
    description:
      "Explore the existing Mission Control, orbit, and reentry presentation surfaces.",
    icon: Monitor,
    id: "mission-visualization",
    label: "Mission Visualization",
    shortLabel: "Visualize",
  },
  {
    description:
      "Review deterministic insights, trade-study context, assumptions, and limitations.",
    icon: ClipboardCheck,
    id: "engineering-review",
    label: "Engineering Review",
    shortLabel: "Review",
  },
  {
    description:
      "Conclude with the existing Mission Briefing and cinematic Mission Showcase.",
    icon: Clapperboard,
    id: "mission-presentation",
    label: "Mission Presentation",
    shortLabel: "Present",
  },
];

export interface DemoStepProps {
  readonly children: ReactNode;
  readonly focusRef?: Ref<HTMLElement>;
  readonly step: DemoStepDefinition;
  readonly stepIndex: number;
}

export function DemoStep({
  children,
  focusRef,
  step,
  stepIndex,
}: DemoStepProps) {
  const Icon = step.icon;

  return (
    <section
      aria-labelledby={`demo-step-${step.id}-title`}
      className="rounded-2xl border border-white/12 bg-surface/95 p-5 outline-none focus-visible:ring-2 focus-visible:ring-accent sm:p-7"
      data-demo-step={step.id}
      ref={focusRef}
      tabIndex={-1}
    >
      <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-start">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent shadow-[0_0_28px_rgba(74,198,190,0.12)]">
          <Icon aria-hidden="true" size={21} />
        </span>
        <div>
          <p className="font-mono text-[0.59rem] tracking-[0.16em] text-accent uppercase">
            Guided sequence // Step {String(stepIndex + 1).padStart(2, "0")}
          </p>
          <h3
            className="mt-1 text-2xl font-semibold tracking-[-0.03em]"
            id={`demo-step-${step.id}-title`}
          >
            {step.label}
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            {step.description}
          </p>
        </div>
      </header>

      <div className="mt-6 motion-safe:animate-[pulse_700ms_ease-out_1] motion-reduce:animate-none">
        {children}
      </div>
    </section>
  );
}
