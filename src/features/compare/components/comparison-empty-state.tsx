import { EmptyState } from "@/components/ui/empty-state";
import type { ComparisonResult } from "@/features/compare/types";
import { groupComparisonRows } from "@/features/compare/utils";

interface ComparisonEmptyStateProps {
  result: ComparisonResult;
}

/**
 * Shown in place of the spec sheet while fewer than two vehicles are
 * chosen: plain text on the ground saying what to do, and beside it the
 * groups of characteristics the sheet will list. From 64rem the two sit on
 * the same 16rem label column as the filled sheet, so both states share a
 * grid.
 */
export function ComparisonEmptyState({ result }: ComparisonEmptyStateProps) {
  const isAircraft = result.category === "aircraft";
  const plural = isAircraft ? "aircraft" : "launch vehicles";
  const singular = isAircraft ? "aircraft" : "launch vehicle";
  const first = result.vehicles[0];
  const groups = groupComparisonRows(result);

  return (
    <div className="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-0">
      <EmptyState
        aria-live="polite"
        className="lg:pr-8"
        description={
          first
            ? "With " +
              first.name +
              " selected, choose a second " +
              singular +
              " above and select Compare selected vehicles."
            : "Choose two " +
              plural +
              " above, then select Compare selected vehicles. The sheet lists these groups."
        }
        title={first ? "Select one more vehicle" : "No vehicles compared yet"}
      />

      <ul
        aria-label="Groups in the spec sheet"
        className="grid gap-x-10 gap-y-6 sm:grid-cols-2"
      >
        {groups.map((group) => (
          <li key={group.categoryId}>
            <p className="text-[1.125rem] leading-6 font-semibold text-foreground">
              {group.label}
            </p>
            <p className="mt-1 text-sm leading-5 text-muted max-md:hidden">
              {group.summary}
            </p>
            {/* One muted sentence, so the row names read as a note on the
                group, not as a row of tags. */}
            <p className="mt-1.5 text-[0.8125rem] leading-5 text-muted">
              {group.rows.map((row) => row.label).join(", ")}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
