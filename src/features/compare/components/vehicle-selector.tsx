import { Check } from "lucide-react";

import type { ComparisonOption } from "@/features/compare/types";
import { cn } from "@/lib/cn";

interface VehicleSelectorProps {
  disabled: boolean;
  onToggle: (id: string) => void;
  options: readonly ComparisonOption[];
  selectedIds: readonly string[];
}

export function VehicleSelector({
  disabled,
  onToggle,
  options,
  selectedIds,
}: VehicleSelectorProps) {
  return (
    <fieldset>
      <legend className="font-mono text-[0.65rem] tracking-[0.14em] text-muted uppercase">
        Vehicle profiles
      </legend>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {options.map((option) => {
          const isSelected = selectedIds.includes(option.id);
          const isDisabled = disabled && !isSelected;

          return (
            <label
              className={cn(
                "relative flex min-h-24 cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                isSelected
                  ? "border-accent/55 bg-accent/10"
                  : "border-border bg-background/35 hover:border-accent/35",
                isDisabled && "cursor-not-allowed opacity-45",
              )}
              key={option.id}
            >
              <input
                checked={isSelected}
                className="peer sr-only"
                disabled={isDisabled}
                name="vehicles"
                onChange={() => onToggle(option.id)}
                type="checkbox"
                value={option.id}
              />
              <span
                aria-hidden="true"
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent",
                  isSelected
                    ? "border-accent bg-accent text-background"
                    : "border-border bg-surface",
                )}
              >
                {isSelected ? <Check size={13} strokeWidth={2.5} /> : null}
              </span>
              <span>
                <span className="block text-sm font-semibold">
                  {option.name}
                </span>
                <span className="mt-1 block text-xs leading-5 text-muted">
                  {option.manufacturer}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
