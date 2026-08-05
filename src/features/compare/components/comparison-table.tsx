import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { ComparisonCell } from "@/features/compare/components/comparison-cell";
import type { ComparisonResult } from "@/features/compare/types";

interface ComparisonTableProps {
  result: ComparisonResult;
}

export function ComparisonTable({ result }: ComparisonTableProps) {
  const categoryLabel = result.category === "aircraft" ? "aircraft" : "rockets";

  return (
    <div
      aria-label="Vehicle comparison table"
      className="overflow-x-auto rounded-2xl border border-border bg-background/35 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      role="region"
      tabIndex={0}
    >
      <table className="w-full min-w-[48rem] border-separate border-spacing-0">
        <caption className="sr-only">
          Side-by-side engineering comparison of {result.vehicles.length}{" "}
          {categoryLabel}
        </caption>
        <thead>
          <tr>
            <th
              className="sticky left-0 z-20 w-56 bg-surface-elevated p-4 text-left align-bottom sm:w-64 sm:p-5"
              scope="col"
            >
              <span className="font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                Engineering characteristic
              </span>
            </th>
            {result.vehicles.map((vehicle, index) => (
              <th
                className="min-w-60 border-l border-border bg-surface-elevated p-4 text-left align-bottom sm:p-5"
                key={vehicle.id}
                scope="col"
              >
                <p className="font-mono text-[0.62rem] tracking-[0.14em] text-accent uppercase">
                  Vehicle {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-2 text-lg font-semibold tracking-tight">
                  {vehicle.name}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {vehicle.manufacturer}
                </p>
                <Link
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-accent transition-colors hover:text-foreground"
                  href={vehicle.detailHref}
                >
                  Open profile
                  <ArrowUpRight aria-hidden="true" size={13} />
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row) => (
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
      </table>
    </div>
  );
}
