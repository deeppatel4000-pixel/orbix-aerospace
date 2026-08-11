import Link from "next/link";
import { ArrowLeftRight, ArrowUpRight } from "lucide-react";

import { SectionNavigation } from "@/components/ui/section-navigation";
import { ComparisonCell } from "@/features/compare/components/comparison-cell";
import { ComparisonLegend } from "@/features/compare/components/comparison-legend";
import { ComparisonRowEducation } from "@/features/compare/components/comparison-row-education";
import type { ComparisonResult } from "@/features/compare/types";
import { groupComparisonRows } from "@/features/compare/utils";

interface ComparisonTableProps {
  result: ComparisonResult;
}

function groupAnchorId(categoryId: string) {
  return "compare-group-" + categoryId;
}

export function ComparisonTable({ result }: ComparisonTableProps) {
  const categoryLabel = result.category === "aircraft" ? "aircraft" : "rockets";
  const groups = groupComparisonRows(result);
  const columnCount = result.vehicles.length + 1;

  return (
    <div>
      <ComparisonLegend />

      {groups.length > 1 ? (
        <SectionNavigation
          items={groups.map((group) => ({
            id: groupAnchorId(group.categoryId),
            label: group.label,
          }))}
          label="Jump to engineering category"
        />
      ) : null}

      <p
        aria-hidden="true"
        className="orbix-label mt-3 flex items-center justify-center gap-1.5 lg:hidden"
      >
        <ArrowLeftRight aria-hidden="true" size={12} strokeWidth={1.8} />
        Scroll to see all vehicles
      </p>

      <div
        aria-label="Vehicle comparison table"
        className="mt-2 overflow-x-auto rounded-2xl border border-border bg-background/35 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent lg:mt-4"
        role="region"
        tabIndex={0}
      >
        <table className="w-full min-w-[48rem] border-separate border-spacing-0">
          <caption className="sr-only">
            Side-by-side engineering comparison of {result.vehicles.length}{" "}
            {categoryLabel}, grouped by engineering category
          </caption>
          <thead>
            <tr>
              <th
                className="sticky left-0 z-20 w-56 bg-surface-elevated p-4 text-left align-bottom sm:w-64 sm:p-5"
                scope="col"
              >
                <span className="orbix-label orbix-label--column">
                  Engineering characteristic
                </span>
              </th>
              {result.vehicles.map((vehicle) => (
                <th
                  className="min-w-60 border-l border-border bg-surface-elevated p-4 text-left align-bottom sm:p-5"
                  key={vehicle.id}
                  scope="col"
                >
                  <p className="text-lg font-semibold tracking-tight">
                    {vehicle.name}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {vehicle.manufacturer}
                  </p>
                  <Link
                    className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold text-accent transition-colors hover:text-foreground"
                    href={vehicle.detailHref}
                  >
                    Open profile
                    <ArrowUpRight aria-hidden="true" size={13} />
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          {groups.map((group) => (
            <tbody id={groupAnchorId(group.categoryId)} key={group.categoryId}>
              <tr>
                <th
                  className="border-t border-border bg-surface/80 px-4 py-3 text-left sm:px-5"
                  colSpan={columnCount}
                  scope="rowgroup"
                >
                  <span className="font-mono text-[0.65rem] tracking-[0.14em] text-accent uppercase">
                    {group.label}
                  </span>
                  <span className="mt-1 block text-xs leading-5 font-normal text-muted">
                    {group.summary}
                  </span>
                </th>
              </tr>
              {group.rows.map((row) => (
                <tr key={row.id}>
                  <th
                    className="sticky left-0 z-10 border-t border-border bg-surface-elevated p-4 text-left align-top sm:p-5"
                    scope="row"
                  >
                    <span className="text-sm font-semibold">{row.label}</span>
                    {row.description ? (
                      <p className="mt-2 text-xs leading-5 font-normal text-muted">
                        {row.description}
                      </p>
                    ) : null}
                    <ComparisonRowEducation
                      category={result.category}
                      rowId={row.id}
                    />
                  </th>
                  {row.cells.map((cell, index) => (
                    <ComparisonCell
                      cell={cell}
                      key={result.vehicles[index]?.id ?? row.id + "-" + index}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </div>
  );
}
