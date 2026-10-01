import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Choices inside a lab form (design v3, spec 3, 6 and 9).
 *
 * A list of checkboxes or radios with descriptions is one hairline-ruled
 * list: a 1px `--rule` between rows and none around each
 * row, so the native control alone shows the state and a block of choices
 * adds no accent outlines. Put `LAB_CHOICE_LIST` on the wrapper,
 * `LAB_CHOICE_ROW` on each `<label>` and `LAB_CHOICE_INPUT` on its input.
 * The rules live in `calculator-card.module.css`.
 */
export const LAB_CHOICE_LIST = "lab-choice-list";
export const LAB_CHOICE_ROW = "lab-choice-row";
export const LAB_CHOICE_INPUT = "lab-choice-input";

interface LabSegmentedOption<T extends string> {
  readonly id: string;
  readonly label: ReactNode;
  readonly value: T;
}

interface LabSegmentedProps<T extends string> {
  /** Names the group for assistive technology. */
  label: string;
  name: string;
  onChange: (value: T) => void;
  options: readonly LabSegmentedOption<T>[];
  value: T;
  className?: string;
  describedBy?: string;
}

/**
 * A short either-or choice as a square segmented control, the same control
 * as the vehicle type switch on /compare: one 1px outline at the 2px
 * control radius (spec 3.3), hairline
 * dividers, and the chosen segment filled with the accent. Native radios
 * keep the group semantics and arrow-key behaviour.
 *
 * There is no shared segmented primitive in `src/components/ui` yet; this
 * repeats the /compare markup for the lab.
 */
export function LabSegmented<T extends string>({
  className,
  describedBy,
  label,
  name,
  onChange,
  options,
  value,
}: LabSegmentedProps<T>) {
  return (
    <div
      aria-describedby={describedBy}
      aria-label={label}
      className={cn(
        "inline-flex max-w-full rounded-[2px] border border-border-control",
        className,
      )}
      role="radiogroup"
    >
      {options.map((option, index) => (
        <label
          className={cn(
            "relative inline-flex min-h-11 cursor-pointer items-center px-4 text-sm font-medium text-text-secondary transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] select-none hover:text-foreground",
            "has-[:checked]:bg-accent has-[:checked]:text-on-accent",
            "first:rounded-l-[1px] last:rounded-r-[1px] has-[:focus-visible]:z-10 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-[var(--orbix-focus)]",
            index > 0 && "border-l border-border-control",
          )}
          key={option.value}
        >
          <input
            checked={value === option.value}
            className="absolute inset-0 m-0 cursor-pointer appearance-none opacity-0"
            id={option.id}
            name={name}
            onChange={() => onChange(option.value)}
            type="radio"
            value={option.value}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}
