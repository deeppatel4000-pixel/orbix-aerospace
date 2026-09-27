import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface DemoNavigationProps {
  readonly currentStepIndex: number;
  readonly onBack: () => void;
  readonly onNext: () => void;
  readonly onRestart: () => void;
  readonly onSkip: () => void;
  readonly totalSteps: number;
}

export function DemoNavigation({
  currentStepIndex,
  onBack,
  onNext,
  onRestart,
  onSkip,
  totalSteps,
}: DemoNavigationProps) {
  const isLastStep = currentStepIndex === totalSteps - 1;

  return (
    <nav
      aria-label="Orbix demo tour navigation"
      className="flex flex-col gap-4 border-t border-border-subtle pt-4 lg:flex-row lg:items-center lg:justify-between"
    >
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={currentStepIndex === 0}
          onClick={onBack}
          variant="secondary"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          Back
        </Button>
        <Button onClick={onNext}>
          {isLastStep ? "Complete tour" : "Next step"}
          <ArrowRight aria-hidden="true" size={16} />
        </Button>
        <Button
          aria-label="Restart demo tour"
          onClick={onRestart}
          variant="ghost"
        >
          <RotateCcw aria-hidden="true" size={16} />
          Restart
        </Button>
        <Button onClick={onSkip} variant="ghost">
          Skip tour
        </Button>
      </div>

      <div className="min-w-0 lg:w-52">
        <div className="orbix-label mb-2 flex items-center justify-between gap-4">
          <span>Tour progress</span>
          <span>
            <span className="orbix-data">{currentStepIndex + 1}</span> of{" "}
            <span className="orbix-data">{totalSteps}</span>
          </span>
        </div>
        <progress
          aria-label="Orbix demo tour progress"
          className="orbix-progress"
          max={totalSteps}
          value={currentStepIndex + 1}
        />
      </div>
    </nav>
  );
}
