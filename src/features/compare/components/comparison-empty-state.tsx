import { MousePointerClick, Scale } from "lucide-react";

import type {
  ComparisonCategory,
  ComparisonVehicle,
} from "@/features/compare/types";

interface ComparisonEmptyStateProps {
  category: ComparisonCategory;
  vehicles: readonly ComparisonVehicle[];
}

export function ComparisonEmptyState({
  category,
  vehicles,
}: ComparisonEmptyStateProps) {
  const categoryLabel =
    category === "aircraft" ? "aircraft" : "launch vehicles";
  const hasOneVehicle = vehicles.length === 1;

  return (
    <section
      aria-labelledby="comparison-empty-title"
      className="technical-grid relative overflow-hidden rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-14 text-center sm:px-10 sm:py-20"
    >
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent">
        {hasOneVehicle ? (
          <MousePointerClick aria-hidden="true" size={25} strokeWidth={1.7} />
        ) : (
          <Scale aria-hidden="true" size={25} strokeWidth={1.7} />
        )}
      </span>
      <h2
        className="mt-6 text-2xl font-semibold tracking-[-0.025em]"
        id="comparison-empty-title"
      >
        {hasOneVehicle ? "Select one more vehicle" : "Build a comparison set"}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">
        {hasOneVehicle
          ? vehicles[0]?.name +
            " is ready. Add another " +
            categoryLabel +
            " profile to generate the engineering matrix."
          : "Choose at least two " +
            categoryLabel +
            " profiles above to compare their published engineering characteristics."}
      </p>
    </section>
  );
}
