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
      aria-label="ORBIX demo tour navigation"
      className="border-t border-border-subtle pt-4"
    >
      <div className="flex flex-wrap gap-2">
        <Button
          arrow="back"
          disabled={currentStepIndex === 0}
          onClick={onBack}
          variant="secondary"
        >
          Back
        </Button>
        <Button arrow={isLastStep ? undefined : "right"} onClick={onNext}>
          {isLastStep ? "Complete tour" : "Next step"}
        </Button>
        <Button
          aria-label="Restart demo tour"
          onClick={onRestart}
          variant="secondary"
        >
          Restart
        </Button>
        <Button onClick={onSkip} variant="ghost">
          Skip tour
        </Button>
      </div>

      {/* No progress bar: the step row above and "Step n of 6" already
       * say where the reader is. */}
    </nav>
  );
}
