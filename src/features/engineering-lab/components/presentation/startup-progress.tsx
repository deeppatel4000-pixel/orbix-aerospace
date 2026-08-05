export const MISSION_STARTUP_STEPS = [
  {
    id: "system-initialization",
    label: "System Initialization",
  },
  {
    id: "mission-data-synchronization",
    label: "Mission Data Synchronization",
  },
  {
    id: "command-center-ready",
    label: "Command Center Ready",
  },
] as const;

export interface StartupProgressProps {
  readonly currentStepIndex: number;
}

export function StartupProgress({ currentStepIndex }: StartupProgressProps) {
  return (
    <div aria-label="Mission Control initialization progress" className="mt-7">
      <progress
        className="sr-only"
        max={MISSION_STARTUP_STEPS.length}
        value={currentStepIndex + 1}
      >
        Step {currentStepIndex + 1} of {MISSION_STARTUP_STEPS.length}
      </progress>
      <ol className="grid grid-cols-3 gap-2">
        {MISSION_STARTUP_STEPS.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isComplete = index < currentStepIndex;

          return (
            <li
              aria-current={isActive ? "step" : undefined}
              className="min-w-0"
              data-step-status={
                isActive ? "active" : isComplete ? "complete" : "pending"
              }
              key={step.id}
            >
              <span
                aria-hidden="true"
                className={
                  "block h-1 rounded-full transition-colors duration-500 motion-reduce:transition-none " +
                  (isActive || isComplete ? "bg-accent" : "bg-white/10")
                }
              />
              <span
                className={
                  "mt-2 block truncate font-mono text-[0.5rem] tracking-[0.08em] uppercase " +
                  (isActive
                    ? "text-accent"
                    : isComplete
                      ? "text-[#9eb0b4]"
                      : "text-[#526a70]")
                }
              >
                {String(index + 1).padStart(2, "0")} · {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
