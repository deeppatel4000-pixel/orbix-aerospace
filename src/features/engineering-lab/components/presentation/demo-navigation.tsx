import { Button } from "@/components/ui/button";

import { TRANSPORT_ROW_CLASS } from "../visualization/transport-row";

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
    <nav aria-label="ORBIX demo tour navigation">
      {/* The shared transport order: the primary action first, then the
       * underlined text controls, as in the replay and the walkthrough. */}
      <div className={TRANSPORT_ROW_CLASS}>
        <Button arrow={isLastStep ? undefined : "right"} onClick={onNext}>
          {isLastStep ? "Complete tour" : "Next step"}
        </Button>
        <Button
          arrow="back"
          disabled={currentStepIndex === 0}
          onClick={onBack}
          variant="tertiary"
        >
          Back
        </Button>
        <Button
          aria-label="Restart demo tour"
          onClick={onRestart}
          variant="tertiary"
        >
          Restart
        </Button>
        <Button arrow="right" onClick={onSkip} variant="tertiary">
          Skip tour
        </Button>
      </div>

      {/* No progress bar: the step row below and "Step n of 6" already
       * say where the reader is. */}
    </nav>
  );
}
