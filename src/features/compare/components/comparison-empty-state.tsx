import { EmptyState } from "@/components/ui/empty-state";
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
      aria-label="Comparison status"
      className="technical-grid relative overflow-hidden rounded-2xl"
    >
      <EmptyState
        description={
          hasOneVehicle
            ? vehicles[0]?.name +
              " is ready. Add another " +
              categoryLabel +
              " profile to generate the engineering matrix."
            : "Choose at least two " +
              categoryLabel +
              " profiles above to compare their published engineering characteristics."
        }
        title={
          hasOneVehicle ? "Select one more vehicle" : "Build a comparison set"
        }
      />
    </section>
  );
}
