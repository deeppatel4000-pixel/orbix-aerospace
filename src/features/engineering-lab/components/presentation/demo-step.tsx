import type { ReactNode, Ref } from "react";

export interface DemoStepDefinition {
  readonly description: string;
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
      "The mission objective and the scenario the rest of the tour uses.",
    id: "mission-concept",
    label: "Mission concept",
    shortLabel: "Concept",
  },
  {
    description:
      "The systems included in the mission, the orbital design and the vehicle configuration.",
    id: "mission-architecture",
    label: "Mission architecture",
    shortLabel: "Architecture",
  },
  {
    description:
      "The completed orbital, vehicle and thermal results. Nothing is recalculated.",
    id: "engineering-analysis",
    label: "Engineering analysis",
    shortLabel: "Analysis",
  },
  {
    description: "The orbit and reentry diagrams drawn from those results.",
    id: "mission-visualization",
    label: "Mission diagrams",
    shortLabel: "Diagrams",
  },
  {
    description:
      "Plain-language insights, the vehicle comparison, and the model assumptions and limits.",
    id: "engineering-review",
    label: "Engineering review",
    shortLabel: "Review",
  },
  {
    description: "The mission briefing and the phase-by-phase walkthrough.",
    id: "mission-presentation",
    label: "Mission presentation",
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
  return (
    <section
      aria-labelledby={`demo-step-${step.id}-title`}
      className="outline-none"
      data-demo-step={step.id}
      ref={focusRef}
      tabIndex={-1}
    >
      <header className="border-b border-border-subtle pb-4">
        <p className="orbix-label">
          Step {stepIndex + 1} of {DEMO_STEPS.length}
        </p>
        <h4
          className="orbix-h3 mt-1 text-foreground"
          id={`demo-step-${step.id}-title`}
        >
          {step.label}
        </h4>
        <p className="mt-2 max-w-[68ch] text-sm leading-6 text-muted">
          {step.description}
        </p>
      </header>

      <div className="mt-6">{children}</div>
    </section>
  );
}
