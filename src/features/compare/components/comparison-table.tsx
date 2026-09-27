import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SectionNavigation } from "@/components/ui/section-navigation";
import { getAircraftVisual } from "@/features/aircraft/data/aircraft-visuals";
import { ComparisonCell } from "@/features/compare/components/comparison-cell";
import { ComparisonRowEducation } from "@/features/compare/components/comparison-row-education";
import type {
  ComparisonCategory,
  ComparisonResult,
} from "@/features/compare/types";
import {
  groupComparisonRows,
  normalizeRowMagnitudes,
} from "@/features/compare/utils";
import { getRocketVisual } from "@/features/rockets/data/rocket-visuals";

interface ComparisonTableProps {
  result: ComparisonResult;
}

function groupAnchorId(categoryId: string) {
  return "compare-group-" + categoryId;
}

function getVisual(category: ComparisonCategory, id: string) {
  return category === "aircraft" ? getAircraftVisual(id) : getRocketVisual(id);
}

/**
 * First column: sticky from 640px so the row names stay in view while the
 * vehicle columns scroll. Below 640px it scrolls with the rest, because a
 * pinned column would take half of a 320px screen.
 */
const rowHeaderClass =
  "w-40 min-w-40 border-t border-r border-border-subtle bg-surface p-3 text-left align-top sm:sticky sm:left-0 sm:z-10 sm:w-56 sm:min-w-56";

/**
 * The comparison table (spec 10 and 14). The identity of each vehicle lives
 * in the column header row: a small thumbnail, the name and the
 * manufacturer. The thumbnail has empty alt text there because the name
 * beside it already identifies the column, and header content is repeated
 * by screen readers for every cell in that column.
 */
export function ComparisonTable({ result }: ComparisonTableProps) {
  const groups = groupComparisonRows(result);
  const columnCount = result.vehicles.length + 1;
  const isAircraft = result.category === "aircraft";
  const visuals = result.vehicles.map((vehicle) =>
    getVisual(result.category, vehicle.id),
  );

  return (
    <div>
      {groups.length > 1 ? (
        <SectionNavigation
          items={groups.map((group) => ({
            id: groupAnchorId(group.categoryId),
            label: group.label,
          }))}
          label="Jump to a category in the comparison table"
        />
      ) : null}

      <p className="orbix-label mt-4 sm:hidden" id="compare-scroll-hint">
        The table is wider than the screen. Scroll it sideways to see every
        vehicle.
      </p>

      <div
        aria-describedby="compare-scroll-hint"
        aria-label="Vehicle comparison table"
        className="orbix-table-wrap mt-3 bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        role="region"
        tabIndex={0}
      >
        <table className="orbix-table w-full">
          {/* The caption does not repeat the vehicle names: the column headers
              already carry them, and screen readers announce those with
              every cell. */}
          <caption className="sr-only">
            Published values for the {result.vehicles.length} selected{" "}
            {isAircraft ? "aircraft" : "launch vehicles"}, grouped by category.
            Each row names one characteristic; each column is one vehicle.
          </caption>
          <thead>
            <tr>
              <th
                className="w-40 min-w-40 border-r border-border-subtle bg-surface-raised p-3 align-bottom sm:sticky sm:left-0 sm:z-20 sm:w-56 sm:min-w-56"
                scope="col"
              >
                Characteristic
              </th>
              {result.vehicles.map((vehicle, index) => {
                const visual = visuals[index];

                return (
                  <th
                    className="min-w-48 border-l border-border-subtle bg-surface-raised p-3 align-bottom tracking-normal normal-case sm:min-w-56"
                    key={vehicle.id}
                    scope="col"
                  >
                    {visual ? (
                      <span
                        className={
                          "relative mb-3 block overflow-hidden rounded-sm bg-surface " +
                          (isAircraft
                            ? "aspect-[16/10] w-32"
                            : "aspect-[4/5] w-20")
                        }
                      >
                        <Image
                          alt=""
                          className="object-cover"
                          fill
                          sizes="8rem"
                          src={visual.src}
                          style={{ objectPosition: visual.objectPosition }}
                        />
                      </span>
                    ) : null}
                    <span className="orbix-h4 block text-foreground">
                      {vehicle.name}
                    </span>
                    <span className="mt-1 block text-sm font-normal text-muted">
                      {vehicle.manufacturer}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            <tr>
              <th className={rowHeaderClass} scope="row">
                Vehicle profile
              </th>
              {result.vehicles.map((vehicle, index) => {
                const visual = visuals[index];

                return (
                  <td
                    className="min-w-48 border-t border-l border-border-subtle p-3 align-top sm:min-w-56"
                    key={vehicle.id}
                  >
                    {/* Visible text stays short because the column header
                        names the vehicle; the accessible name repeats it so
                        the link still makes sense in a links list. It starts
                        with the visible text (WCAG 2.5.3). */}
                    <Link
                      aria-label={"Read the full profile: " + vehicle.name}
                      className="orbix-link"
                      href={vehicle.detailHref}
                    >
                      Read the full profile
                      <ArrowRight
                        aria-hidden="true"
                        className="ml-1 inline align-[-2px]"
                        size={14}
                      />
                    </Link>
                    {visual?.credit ? (
                      <p className="mt-2 text-[length:var(--text-label)] leading-5 text-muted">
                        Photo: {visual.credit}
                        {visual.license ? ", " + visual.license : ""}.
                      </p>
                    ) : null}
                  </td>
                );
              })}
            </tr>
          </tbody>

          {groups.map((group) => (
            <tbody id={groupAnchorId(group.categoryId)} key={group.categoryId}>
              <tr>
                <th
                  className="border-t border-border bg-surface-raised p-3 text-left"
                  colSpan={columnCount}
                  scope="rowgroup"
                >
                  {/* Sticky inside the full-width cell so the category name
                      stays readable while the table scrolls sideways. */}
                  <span className="sticky left-3 inline-block max-w-[calc(100vw-4rem)]">
                    <span className="block text-sm font-semibold text-foreground">
                      {group.label}
                    </span>
                    <span className="mt-1 block text-[length:var(--text-label)] leading-5 font-normal text-muted">
                      {group.summary}
                    </span>
                  </span>
                </th>
              </tr>
              {group.rows.map((row) => {
                // Resolved per row, because comparability is a property of
                // the whole row: a single incompatible unit or one present
                // value without magnitude metadata keeps the row text only.
                const magnitudes = normalizeRowMagnitudes(row.cells);

                return (
                  // The row id lets tests name the row whose magnitude
                  // coverage they check.
                  <tr data-row-id={row.id} key={row.id}>
                    <th className={rowHeaderClass} scope="row">
                      <span className="block text-sm font-semibold text-foreground">
                        {row.label}
                      </span>
                      {row.description ? (
                        <span className="mt-1 block text-[length:var(--text-label)] leading-5 font-normal text-muted">
                          {row.description}
                        </span>
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
                        magnitude={magnitudes?.[index] ?? null}
                      />
                    ))}
                  </tr>
                );
              })}
            </tbody>
          ))}
        </table>
      </div>

      <p className="mt-4 text-sm leading-6 text-muted">
        Photo sources and licences are listed on the{" "}
        <Link className="orbix-link" href="/credits">
          image credits page
        </Link>
        .
      </p>
    </div>
  );
}
