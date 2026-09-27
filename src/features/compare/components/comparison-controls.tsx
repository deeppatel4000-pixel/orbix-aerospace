"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, CircleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  MAX_COMPARISON_VEHICLES,
  type ComparisonCategory,
  type ComparisonOptions,
} from "@/features/compare/types";

interface ComparisonControlsProps {
  category: ComparisonCategory;
  options: ComparisonOptions;
  selectedIds: readonly string[];
}

const categoryOptions: readonly {
  id: ComparisonCategory;
  label: string;
}[] = [
  { id: "aircraft", label: "Aircraft" },
  { id: "rockets", label: "Launch vehicles" },
];

const slotLabels = [
  "First vehicle",
  "Second vehicle",
  "Third vehicle (optional)",
] as const;

type Slots = readonly string[];
type SlotErrors = readonly (string | null)[];

const noErrors: SlotErrors = slotLabels.map(() => null);

function toSlots(ids: readonly string[]): Slots {
  return slotLabels.map((_, index) => ids[index] ?? "");
}

function validate(slots: Slots): SlotErrors {
  return slots.map((id, index) => {
    if (!id) {
      if (index === 0) return "Choose the first vehicle to compare.";
      if (index === 1)
        return "Choose a second vehicle. A comparison needs at least two.";
      return null;
    }

    return slots.indexOf(id) < index
      ? "This vehicle is already selected. Choose a different one."
      : null;
  });
}

/**
 * Selection form for `/compare` (spec 14): vehicle type as radio buttons in
 * a fieldset, then two to three labelled selects, then one primary action.
 * Nothing navigates until the form is submitted, so the table never changes
 * under a keyboard or screen reader user while they are still choosing.
 */
export function ComparisonControls({
  category,
  options,
  selectedIds,
}: ComparisonControlsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const selectRefs = useRef<(HTMLSelectElement | null)[]>([]);

  const [activeCategory, setActiveCategory] = useState(category);
  const [slots, setSlots] = useState<Slots>(() => toSlots(selectedIds));
  const [errors, setErrors] = useState<SlotErrors>(noErrors);
  // Only whether a comparison was requested from this form is kept locally.
  // The status wording itself is derived from the URL-backed props, so it
  // always names the vehicles the table shows, including after browser back.
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Re-sync local state when the URL-derived props change for a reason other
  // than this form (browser back and forward, a link from a profile page).
  // Adjusting state during render is React's recommended alternative to an
  // effect for this.
  const syncKey = category + ":" + selectedIds.join(",");
  const [lastSyncKey, setLastSyncKey] = useState(syncKey);
  if (syncKey !== lastSyncKey) {
    setLastSyncKey(syncKey);
    setActiveCategory(category);
    setSlots(toSlots(selectedIds));
    setErrors(noErrors);
  }

  const shownNames = selectedIds
    .map((id) => options[category].find((option) => option.id === id)?.name)
    .filter(Boolean);
  const status =
    hasSubmitted && activeCategory === category && shownNames.length >= 2
      ? "Showing the comparison of " + shownNames.join(", ") + "."
      : "";

  const vehicleOptions = options[activeCategory];
  const singular =
    activeCategory === "aircraft" ? "an aircraft" : "a launch vehicle";
  const plural = activeCategory === "aircraft" ? "aircraft" : "launch vehicles";

  function selectCategory(nextCategory: ComparisonCategory) {
    if (nextCategory === activeCategory) return;

    setActiveCategory(nextCategory);
    setSlots(toSlots([]));
    setErrors(noErrors);
    setHasSubmitted(false);
  }

  function selectVehicle(index: number, id: string) {
    setSlots((current) =>
      current.map((value, slot) => (slot === index ? id : value)),
    );
    setErrors((current) =>
      current.map((error, slot) => (slot === index ? null : error)),
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(slots);
    const firstInvalid = nextErrors.findIndex((error) => error !== null);
    setErrors(nextErrors);

    if (firstInvalid !== -1) {
      setHasSubmitted(false);
      selectRefs.current[firstInvalid]?.focus();
      return;
    }

    const ids = slots
      .filter((id) => id !== "")
      .slice(0, MAX_COMPARISON_VEHICLES);
    // Ids are URL-safe slugs; the commas stay literal so the address reads
    // the same as the comparison links elsewhere on the site.
    const query =
      "?category=" +
      activeCategory +
      "&vehicles=" +
      ids.map((id) => encodeURIComponent(id)).join(",");

    setHasSubmitted(true);
    startTransition(() => {
      router.push(pathname + query, { scroll: false });
    });
  }

  return (
    <form
      aria-labelledby="compare-selection-title"
      className="orbix-panel mt-6 p-4 sm:p-6"
      noValidate
      onSubmit={handleSubmit}
    >
      <fieldset className="orbix-fieldset">
        <legend>Vehicle type</legend>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {categoryOptions.map((option) => {
            const isActive = activeCategory === option.id;

            return (
              // Native radio, label to the right, whole row clickable (spec
              // 9). No box or accent border at rest (spec 7.2): the radio's
              // accent-color shows the checked state, and the global
              // :focus-visible rule draws the only focus ring, on the input.
              <label
                className="inline-flex min-h-10 cursor-pointer items-center gap-2 text-sm font-medium text-foreground"
                key={option.id}
              >
                <input
                  checked={isActive}
                  className="h-4 w-4 shrink-0 cursor-pointer accent-accent"
                  name="category"
                  onChange={() => selectCategory(option.id)}
                  type="radio"
                  value={option.id}
                />
                {option.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6 border-t border-border-subtle pt-6">
        <fieldset className="orbix-fieldset">
          <legend>Vehicles</legend>
          <p className="-mt-2 mb-4 text-sm text-muted" id="compare-help">
            Choose two {plural}. A third is optional.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {slotLabels.map((label, index) => {
              const selectId = "compare-vehicle-" + (index + 1);
              const errorId = selectId + "-error";
              const error = errors[index];

              return (
                <div className="orbix-field" key={label}>
                  <label className="orbix-field__label" htmlFor={selectId}>
                    {label}
                  </label>
                  <div className="orbix-field__control">
                    <select
                      aria-describedby={
                        error ? "compare-help " + errorId : "compare-help"
                      }
                      aria-invalid={error ? true : undefined}
                      className="orbix-select"
                      id={selectId}
                      onChange={(event) =>
                        selectVehicle(index, event.target.value)
                      }
                      ref={(node) => {
                        selectRefs.current[index] = node;
                      }}
                      value={slots[index] ?? ""}
                    >
                      <option value="">
                        {index < 2 ? "Choose " + singular : "None"}
                      </option>
                      {vehicleOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      aria-hidden="true"
                      className="orbix-field__icon orbix-field__icon--end"
                      size={16}
                    />
                  </div>
                  {error ? (
                    <p className="orbix-field__error" id={errorId}>
                      <CircleAlert
                        aria-hidden="true"
                        className="shrink-0"
                        size={14}
                      />
                      {error}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </fieldset>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-border-subtle pt-6 sm:flex-row sm:items-center">
        <Button className="w-full sm:w-auto" type="submit">
          Compare selected vehicles
        </Button>
        <p className="text-sm text-muted" id="compare-status" role="status">
          {isPending ? "Loading the comparison." : status}
        </p>
      </div>
    </form>
  );
}
