import { EmptyState } from "@/components/ui/empty-state";
import type { ComparisonResult } from "@/features/compare/types";
import { groupComparisonRows } from "@/features/compare/utils";

interface ComparisonEmptyStateProps {
  result: ComparisonResult;
}

/**
 * Shown in place of the spec sheet while fewer than two vehicles are
 * chosen: the shared `EmptyState` says what to do, and beside it the groups
 * of characteristics the sheet will list. From 64rem the two sit on the
 * same 16rem label column as the filled sheet, so both states share a grid.
 * The outline is solid on the surface ground, the material of the filled
 * sheet's panels, rather than the primitive's dashed drop-zone look.
 */
export function ComparisonEmptyState({ result }: ComparisonEmptyStateProps) {
  const isAircraft = result.category === "aircraft";
  const plural = isAircraft ? "aircraft" : "launch vehicles";
  const singular = isAircraft ? "aircraft" : "launch vehicle";
  const first = result.vehicles[0];
  const groups = groupComparisonRows(result);

  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-0">
      <EmptyState
        aria-live="polite"
        className="rounded-lg border-solid border-border bg-surface lg:mr-6 lg:self-start"
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
        className="border-b border-border lg:ml-4"
      >
        {groups.map((group) => (
          <li className="border-t border-border py-3" key={group.categoryId}>
            <p className="text-[1.125rem] leading-6 font-semibold text-foreground">
              {group.label}
            </p>
            <p className="text-sm leading-5 text-muted max-md:hidden">
              {group.summary}
            </p>
            <p className="orbix-caps mt-1.5 text-muted">
              {group.rows.map((row) => row.label).join(", ")}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
