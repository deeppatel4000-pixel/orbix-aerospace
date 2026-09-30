import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/button-link";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { SectionNavigation } from "@/components/ui/section-navigation";
import { getAircraftVisual } from "@/features/aircraft/data/aircraft-visuals";
import {
  ComparisonCell,
  rowNeedsPerFigureQualifiers,
} from "@/features/compare/components/comparison-cell";
import { ComparisonRowEducation } from "@/features/compare/components/comparison-row-education";
import { ComparisonRules } from "@/features/compare/components/comparison-rules";
import { groupedCredits } from "@/features/compare/components/photo-credit";
import { getRowEducation } from "@/features/compare/education";
import type {
  ComparisonCategory,
  ComparisonResult,
  ComparisonRow,
} from "@/features/compare/types";
import {
  groupComparisonRows,
  normalizeRowMagnitudes,
} from "@/features/compare/utils";
import { cn } from "@/lib/cn";
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
 * Column geometry shared by the header band and every group table, so the
 * groups read as one sheet with one set of columns. The first column is
 * 6.25rem on a phone (sticky there, wide enough for "Manufacturer"), 10rem
 * from 48rem and 16rem from 64rem; vehicle columns share the rest. Below
 * 48rem every vehicle column is at least 8rem: 112px of content inside 8px
 * padding, measured to hold the widest unbroken designation
 * ("2 × F119-PW-100", about 109px at 13px medium), the longest figure with
 * its unit, and single words such as "Reconnaissance". Two vehicles fit
 * side by side from 24.375rem (a 390px phone); narrower than that, and for
 * three vehicles, the sheet scrolls sideways instead.
 */
const sheetWidth: Record<number, string> = {
  2: "min-w-[22.25rem] md:min-w-[32rem] lg:min-w-0",
  3: "min-w-[30.25rem] md:min-w-[43.5rem] lg:min-w-0",
};

/**
 * Hides the sideways-scroll hint once the sheet fits: its minimum width
 * plus the 1px outline on each side. Keyed to the width of the column the
 * sheet sits in (a size container), not the viewport, so a browser that
 * reserves a scrollbar gutter still shows the hint when the sheet overflows.
 */
const hintVisibility: Record<number, string> = {
  2: "@min-[22.375rem]/sheet:hidden",
  3: "@min-[30.375rem]/sheet:hidden",
};

const bandColumns: Record<number, string> = {
  2: "grid-cols-[6.25rem_repeat(2,minmax(0,1fr))] md:grid-cols-[10rem_repeat(2,minmax(0,1fr))] lg:grid-cols-[16rem_repeat(2,minmax(0,1fr))]",
  3: "grid-cols-[6.25rem_repeat(3,minmax(0,1fr))] md:grid-cols-[10rem_repeat(3,minmax(0,1fr))] lg:grid-cols-[16rem_repeat(3,minmax(0,1fr))]",
};

const stripColumns: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
};

/**
 * Joins the per-group `DataTable`s into one sheet: no inner outlines or
 * radii, one outline around the sheet, the visual column header shown once
 * (each table keeps a real header row for assistive technology, visually
 * hidden), and one sideways scroll region below 64rem so every group moves
 * together.
 */
const joinedTables = cn(
  "[&_table]:w-full [&_table]:table-fixed",
  "[&_tr>:first-child]:w-[6.25rem] md:[&_tr>:first-child]:w-40 lg:[&_tr>:first-child]:w-64",
  // Each table keeps its real header row for assistive technology, and the
  // fixed layout takes its column widths from it, so it stays in the table
  // at zero height instead of being taken out of flow (sr-only would drop
  // the widths). The visible header is the band above the first group.
  "[&_thead_th]:h-0 [&_thead_th]:border-0 [&_thead_th]:p-0 [&_thead_th]:text-[0px] [&_thead_th]:leading-[0]",
  // No hyphenation: the column widths above fit whole words, and
  // break-word only guards against an unforeseen long token.
  "max-md:[&_th]:px-2.5 max-md:[&_td]:px-2 [&_tbody_:is(th,td)]:[overflow-wrap:break-word]",
  // The caption and the scroll-cue frame are the root's two children; the
  // scroll region sits in the frame.
  "[&>*>[role=region]]:overflow-visible [&>*>[role=region]]:rounded-none [&>*>[role=region]]:border-0",
  "[&>p:first-child]:mb-0 [&>p:first-child]:px-3 [&>p:first-child]:pt-6 [&>p:first-child]:pb-3 md:[&>p:first-child]:px-4",
  "max-md:[&>p:first-child]:sticky max-md:[&>p:first-child]:left-0 max-md:[&>p:first-child]:max-w-[100cqw]",
);

/**
 * The comparison as a spec sheet (design v2, spec 8 and 9). An identity
 * strip names each column with its photograph, maker and profile link, next
 * to the rules the sheet follows; then the groups of characteristics as one
 * sheet, the characteristic as the row header and one column per vehicle,
 * with accent magnitude bars where a row shares one unit.
 */
export function ComparisonTable({ result }: ComparisonTableProps) {
  const groups = groupComparisonRows(result);
  const count = result.vehicles.length;
  const isAircraft = result.category === "aircraft";

  // Resolved once per row, because comparability is a property of the
  // whole row: a single incompatible unit or one present value without
  // magnitude metadata keeps the row text only.
  const magnitudesByRow = new Map(
    result.rows.map((row) => [row.id, normalizeRowMagnitudes(row.cells)]),
  );
  // Qualifier placement is also decided per row: if one cell needs a
  // qualifier under each figure, every cell in the row gets them.
  const perFigureRows = new Set(
    result.rows
      .filter((row) => rowNeedsPerFigureQualifiers(row.cells))
      .map((row) => row.id),
  );

  const credits = groupedCredits(
    result.vehicles.flatMap((vehicle) => {
      const visual = getVisual(result.category, vehicle.id);
      return visual
        ? [
            {
              credit: visual.credit,
              license: visual.license,
              licenseUrl: visual.licenseUrl,
              name: vehicle.name,
            },
          ]
        : [];
    }),
  );

  const columns: DataTableColumn<ComparisonRow>[] = [
    {
      key: "characteristic",
      header: "Characteristic",
      cell: (row) => {
        // Below 48rem the 6.25rem sticky column is too narrow for a
        // paragraph, so a row's description and its "About"
        // note move to the full-width list under the group there. A row
        // without a note keeps its description in the cell.
        const hasEducation =
          getRowEducation(result.category, row.id) !== undefined;
        return (
          /* The label, its description, then the "About"
             disclosure on its own line, so the labels in the column share
             one left edge and read as a list. */
          <span className="flex flex-col items-start">
            <span className="text-[0.8125rem] font-medium text-foreground max-md:tracking-[-0.01em] md:text-sm">
              {row.label}
            </span>
            {row.description ? (
              <span
                className={cn(
                  "mt-1 block text-[0.6875rem] leading-4 font-normal text-muted md:text-xs md:leading-[1.125rem]",
                  hasEducation && "max-md:hidden",
                )}
              >
                {row.description}
              </span>
            ) : null}
            <ComparisonRowEducation
              category={result.category}
              className="mt-1 max-md:hidden"
              label={row.label}
              rowId={row.id}
            />
          </span>
        );
      },
    },
    ...result.vehicles.map(
      (vehicle, index): DataTableColumn<ComparisonRow> => ({
        key: vehicle.id,
        header: vehicle.name,
        cell: (row) => {
          const magnitudes = magnitudesByRow.get(row.id);
          const cell = row.cells[index];
          return cell ? (
            <ComparisonCell
              cell={cell}
              magnitude={magnitudes?.[index] ?? null}
              perFigure={perFigureRows.has(row.id)}
            />
          ) : null;
        },
      }),
    ),
  ];

  /* The vehicle names over their columns. Decorative: each group table
   * carries its own real header row for assistive technology. From 64rem
   * one band sits above the sheet, sticky under the site header; below
   * that a sticky element inside the sideways scroller cannot follow the
   * page, so each group repeats the band under its caption. */
  const nameBand = (className: string) => (
    <div
      aria-hidden="true"
      className={cn(
        "grid items-center border-b border-border bg-surface",
        bandColumns[count],
        className,
      )}
    >
      {/* Stretched so the sticky cell fills the band on a phone; its text
          is centred like the names beside it, so the label and the names
          share one optical line. */}
      <span className="orbix-caps sticky left-0 z-10 flex items-center self-stretch border-r border-border bg-surface px-2.5 py-3 leading-5 text-muted md:static md:border-r-0 md:px-4">
        {/* Too wide for the 6.25rem phone column. */}
        <span className="max-md:hidden">Characteristic</span>
      </span>
      {result.vehicles.map((vehicle) => (
        <span
          className="font-display px-2 py-3 text-base leading-5 tracking-[-0.02em] text-foreground md:px-4"
          key={vehicle.id}
        >
          {vehicle.name}
        </span>
      ))}
    </div>
  );

  return (
    <div>
      {/* Identity strip. From 64rem the rules fill the 16rem cell over the
          characteristic column and the vehicles sit over their columns;
          below that the rules follow the sheet, so a phone reaches the
          figures sooner. Only one copy is ever displayed. */}
      <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-0">
        <ComparisonRules className="hidden lg:block lg:self-start lg:pr-6" />

        <div className="min-w-0">
          <ul
            aria-label={
              "Selected " + (isAircraft ? "aircraft" : "launch vehicles")
            }
            className={cn("grid gap-5 sm:gap-4 lg:gap-0", stripColumns[count])}
            /* From 64rem each item spans four shared rows (photo, name,
               maker, link), so a name that wraps to two lines moves the
               maker and link lines of every column together. */
          >
            {result.vehicles.map((vehicle) => {
              const visual = getVisual(result.category, vehicle.id);

              return (
                <li
                  className="flex min-w-0 items-start gap-4 sm:block lg:row-span-4 lg:grid lg:grid-rows-subgrid lg:gap-0 lg:px-4"
                  key={vehicle.id}
                >
                  {visual ? (
                    <span
                      className={cn(
                        "relative block max-w-full shrink-0 overflow-hidden rounded-md bg-surface",
                        isAircraft
                          ? "aspect-[16/10] h-[4.375rem] sm:h-auto sm:w-full"
                          : "aspect-[3/4] h-24 sm:h-auto sm:w-[10.5rem]",
                      )}
                    >
                      <Image
                        alt={visual.alt}
                        className="object-cover contrast-[1.05] saturate-[0.85]"
                        fill
                        sizes={
                          isAircraft
                            ? "(min-width: 64rem) 24rem, (min-width: 40rem) 33vw, 7rem"
                            : "(min-width: 40rem) 10.5rem, 4.5rem"
                        }
                        src={visual.src}
                        style={{ objectPosition: visual.objectPosition }}
                      />
                    </span>
                  ) : null}
                  <div className="min-w-0 lg:contents">
                    <p className="font-display text-[1.375rem] leading-[1.02] tracking-[-0.03em] text-foreground sm:mt-3 lg:text-[1.75rem]">
                      {vehicle.name}
                    </p>
                    <p className="mt-1 text-[0.8125rem] leading-5 text-muted">
                      {vehicle.manufacturer}
                    </p>
                    {/* Visible text stays short; the accessible name starts
                        with it and adds the vehicle (WCAG 2.5.3). */}
                    <ButtonLink
                      aria-label={"Full profile: " + vehicle.name}
                      arrow="right"
                      className="justify-start whitespace-nowrap lg:self-start lg:justify-self-start"
                      href={vehicle.detailHref}
                      variant="tertiary"
                    >
                      Full profile
                    </ButtonLink>
                  </div>
                </li>
              );
            })}
          </ul>

          {credits.length > 0 ? (
            <p className="orbix-micro mt-4 text-[0.6875rem] text-muted lg:px-4">
              Photographs:{" "}
              {credits.map((group, index) => (
                <Fragment key={group.license}>
                  {index > 0 ? "; " : null}
                  {group.sources + ", "}
                  {group.licenseUrl ? (
                    <a
                      className="orbix-link"
                      href={group.licenseUrl}
                      rel="license noreferrer"
                      target="_blank"
                    >
                      {group.license}
                    </a>
                  ) : (
                    group.license
                  )}
                </Fragment>
              ))}
              .{" "}
              <Link className="orbix-link" href="/credits">
                Full credits
              </Link>
            </p>
          ) : null}
        </div>
      </div>

      {groups.length > 1 ? (
        /* SectionNavigation has no quiet variant, so its band is thinned
           here: no fill and no top rule, only the bottom hairline. Below
           64rem it keeps the primitive single row, which scrolls sideways
           with unbroken labels. */
        <div className="mt-10 lg:mb-4 [&_.orbix-anchor-nav]:border-t-0 [&_.orbix-anchor-nav]:bg-transparent [&_.orbix-anchor-nav]:px-0">
          <SectionNavigation
            items={groups.map((group) => ({
              id: groupAnchorId(group.categoryId),
              label: group.label,
            }))}
            label="Jump to a group in the spec sheet"
          />
        </div>
      ) : null}

      {count > 1 ? (
        <div className="@container/sheet md:hidden">
          <p className={cn("orbix-label mt-6", hintVisibility[count])}>
            If the sheet is wider than the screen, scroll it sideways; the
            characteristic column stays in view.
          </p>
        </div>
      ) : null}

      <div className="mt-6 rounded-lg border border-border bg-surface lg:mt-0">
        {/* A size container, so the caption and the notes list can match
            the visible width of the sheet (100cqw) while it scrolls
            sideways, whatever the scrollbar takes. */}
        <div className="@container overflow-x-auto rounded-[7px] lg:overflow-visible">
          <div className={sheetWidth[count]}>
            {nameBand(
              "hidden lg:sticky lg:top-16 lg:z-20 lg:grid lg:rounded-t-[7px]",
            )}

            {groups.map((group, index) => (
              <div
                className={cn(
                  "flex scroll-mt-24 flex-col lg:scroll-mt-40",
                  index > 0 && "border-t border-border",
                  // The table root joins this column, so the repeated name
                  // band can sit between the caption and the table. The
                  // band is aria-hidden and holds no focusable element, so
                  // the visual order never differs from the focus order.
                  "[&>.orbix-data-table]:contents [&>.orbix-data-table>div]:order-3 [&>.orbix-data-table>p:first-child]:order-1",
                )}
                id={groupAnchorId(group.categoryId)}
                key={group.categoryId}
              >
                <DataTable
                  caption={
                    <>
                      <span
                        aria-level={3}
                        className="font-display block text-[1.625rem] leading-none tracking-[-0.03em] text-foreground"
                        role="heading"
                      >
                        {group.label}
                      </span>
                      <span className="mt-2 block text-sm font-normal text-muted">
                        {group.summary}
                      </span>
                    </>
                  }
                  className={joinedTables}
                  columns={columns}
                  getRowKey={(row) => row.id}
                  rows={group.rows}
                />
                {nameBand("order-2 border-t lg:hidden")}
                {/* Below 48rem the rows' notes follow the group at the
                    visible width of the sheet, held in view like the
                    caption while the sheet scrolls sideways. */}
                {group.rows.some((row) =>
                  getRowEducation(result.category, row.id),
                ) ? (
                  <ul
                    aria-label={"About the rows in " + group.label}
                    className="sticky left-0 order-4 max-w-[100cqw] border-t border-border px-3 py-1 md:hidden"
                  >
                    {group.rows
                      .filter((row) => getRowEducation(result.category, row.id))
                      .map((row) => (
                        <li
                          className="border-border-subtle not-first:border-t"
                          key={row.id}
                        >
                          <ComparisonRowEducation
                            category={result.category}
                            description={row.description}
                            label={row.label}
                            rowId={row.id}
                            variant="list"
                          />
                        </li>
                      ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      <ComparisonRules className="mt-10 sm:grid sm:grid-cols-2 sm:gap-x-6 lg:hidden" />
    </div>
  );
}
