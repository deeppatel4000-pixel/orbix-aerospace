import { EmptyState } from "@/components/ui/empty-state";
import type {
  ComparisonCategory,
  ComparisonVehicle,
} from "@/features/compare/types";

interface ComparisonEmptyStateProps {
  category: ComparisonCategory;
  vehicles: readonly ComparisonVehicle[];
}

/** Shown in place of the table while fewer than two vehicles are chosen. */
export function ComparisonEmptyState({
  category,
  vehicles,
}: ComparisonEmptyStateProps) {
  const plural = category === "aircraft" ? "aircraft" : "launch vehicles";
  const singular = category === "aircraft" ? "aircraft" : "launch vehicle";
  const first = vehicles[0];

  return (
    <EmptyState
      aria-live="polite"
      description={
        first
          ? "With " +
            first.name +
            " selected, choose a second " +
            singular +
            " above and select Compare selected vehicles."
          : "Choose two " +
            plural +
            " above, or three if you like, then select Compare selected vehicles."
      }
      title={first ? "Select one more vehicle" : "No vehicles selected yet"}
    />
  );
}
