"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Plane, Rocket } from "lucide-react";

import { VehicleSelector } from "@/features/compare/components/vehicle-selector";
import {
  MAX_COMPARISON_VEHICLES,
  type ComparisonCategory,
  type ComparisonOptions,
} from "@/features/compare/types";
import { cn } from "@/lib/cn";

interface ComparisonControlsProps {
  category: ComparisonCategory;
  options: ComparisonOptions;
  selectedIds: readonly string[];
}

const categoryOptions = [
  { icon: Plane, id: "aircraft", label: "Aircraft" },
  { icon: Rocket, id: "rockets", label: "Rockets" },
] as const;

export function ComparisonControls({
  category,
  options,
  selectedIds,
}: ComparisonControlsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeCategory, setActiveCategory] = useState(category);
  const [activeIds, setActiveIds] = useState<readonly string[]>(selectedIds);

  useEffect(() => {
    setActiveCategory(category);
    setActiveIds(selectedIds);
  }, [category, selectedIds]);

  function navigate(
    nextCategory: ComparisonCategory,
    nextIds: readonly string[],
  ) {
    const params = new URLSearchParams({ category: nextCategory });

    if (nextIds.length > 0) {
      params.set("vehicles", nextIds.join(","));
    }

    startTransition(() => {
      router.replace(pathname + "?" + params.toString(), { scroll: false });
    });
  }

  function selectCategory(nextCategory: ComparisonCategory) {
    if (nextCategory === activeCategory) return;

    setActiveCategory(nextCategory);
    setActiveIds([]);
    navigate(nextCategory, []);
  }

  function toggleVehicle(id: string) {
    const nextIds = activeIds.includes(id)
      ? activeIds.filter((selectedId) => selectedId !== id)
      : [...activeIds, id].slice(0, MAX_COMPARISON_VEHICLES);

    setActiveIds(nextIds);
    navigate(activeCategory, nextIds);
  }

  return (
    <div className="rounded-2xl border border-border bg-surface/70 p-5 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <fieldset>
          <legend className="font-mono text-[0.65rem] tracking-[0.14em] text-muted uppercase">
            Comparison category
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {categoryOptions.map((option) => {
              const isActive = activeCategory === option.id;

              return (
                <button
                  aria-pressed={isActive}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                    isActive
                      ? "border-accent/50 bg-accent/10 text-accent"
                      : "border-border bg-background/35 text-muted hover:border-accent/35 hover:text-foreground",
                  )}
                  key={option.id}
                  onClick={() => selectCategory(option.id)}
                  type="button"
                >
                  <option.icon aria-hidden="true" size={16} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="sm:text-right">
          <p className="font-mono text-xl text-accent">
            {activeIds.length} / {MAX_COMPARISON_VEHICLES}
          </p>
          <p className="mt-1 text-xs text-muted">profiles selected</p>
        </div>
      </div>

      <div className="mt-6">
        <VehicleSelector
          disabled={activeIds.length >= MAX_COMPARISON_VEHICLES}
          onToggle={toggleVehicle}
          options={options[activeCategory]}
          selectedIds={activeIds}
        />
      </div>

      <p aria-live="polite" className="mt-5 text-xs text-muted">
        {isPending
          ? "Updating comparison…"
          : "Select two or three vehicles. Changes are saved in the page URL."}
      </p>
    </div>
  );
}
