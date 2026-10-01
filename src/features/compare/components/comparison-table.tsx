import { ButtonLink } from "@/components/ui/button-link";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { SectionNavigation } from "@/components/ui/section-navigation";
import {
  ComparisonCell,
  rowNeedsPerFigureQualifiers,
} from "@/features/compare/components/comparison-cell";
import {
  ComparisonGroupNotes,
  ComparisonRowEducation,
} from "@/features/compare/components/comparison-row-education";
import { ComparisonRules } from "@/features/compare/components/comparison-rules";
import { getRowEducation } from "@/features/compare/education";
import type { ComparisonResult, ComparisonRow } from "@/features/compare/types";
import {
  groupComparisonRows,
  normalizeRowMagnitudes,
} from "@/features/compare/utils";
import { getVehicleDrawing } from "@/features/vehicles/data/gallery-drawings";
import { DrawingSourceNote } from "@/features/vehicles/drawings/drawing-credits";
import {
  drawingsFor,
  sharedOutlineBox,
  VehicleOutline,
} from "@/features/vehicles/drawings/vehicle-outline";
import { cn } from "@/lib/cn";

interface ComparisonTableProps {
  result: ComparisonResult;
}

function groupAnchorId(categoryId: string) {
  return "compare-group-" + categoryId;
}

/**
 * Column geometry shared by the header band and every group table, so the
 * groups read as one sheet with one set of columns. On a phone the first
 * column is sticky: 5.75rem for two vehicles and 6.25rem for three (both
 * wide enough for "Manufacturer"); 10rem from 48rem and 16rem from 64rem.
 * Vehicle columns share the rest. Two vehicles fit side by side from
 * 21.25rem, so a 375px phone (or a 390px one with a classic scrollbar)
 * shows the whole sheet. Three vehicles need 8rem each and scroll sideways
 * below 48rem.
 */
const sheetWidth: Record<number, string> = {
  2: "min-w-[21.25rem] md:min-w-[32rem] lg:min-w-0",
  3: "min-w-[30.25rem] md:min-w-[43.5rem] lg:min-w-0",
};

/**
 * Hides the sideways-scroll hint once the sheet fits its minimum width.
 * Keyed to the width of the column the sheet sits in (a size container),
 * not the viewport, so a browser that reserves a scrollbar gutter still
 * shows the hint when the sheet overflows.
 */
const hintVisibility: Record<number, string> = {
  2: "@min-[21.25rem]/sheet:hidden",
  3: "@min-[30.25rem]/sheet:hidden",
};

const bandColumns: Record<number, string> = {
  2: "grid-cols-[5.75rem_repeat(2,minmax(0,1fr))] md:grid-cols-[10rem_repeat(2,minmax(0,1fr))] lg:grid-cols-[16rem_repeat(2,minmax(0,1fr))]",
  3: "grid-cols-[6.25rem_repeat(3,minmax(0,1fr))] md:grid-cols-[10rem_repeat(3,minmax(0,1fr))] lg:grid-cols-[16rem_repeat(3,minmax(0,1fr))]",
};

/** The phone width of the sticky first column (see `sheetWidth`). */
const firstColumn: Record<number, string> = {
  2: "[&_tr>:first-child]:w-[5.75rem]",
  3: "[&_tr>:first-child]:w-[6.25rem]",
};

const stripColumns: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
};

/**
 * Joins the per-group `DataTable`s into one open sheet (spec 6: no frame,
 * no fill, rules only), the visual column header shown once (each table
 * keeps a real header row for assistive technology, visually hidden).
 * Below 64rem each group is its own sideways scroll region, so the
 * scrollbar, the overflow cue, sits at the foot of the group being read
 * rather than at the foot of the whole sheet.
 *
 * Alignment decision (spec 6 deviation, recorded): figures stay
 * left-aligned in the vehicle columns and units stay inline with each
 * figure. Each column is one vehicle rather than one quantity, and rows
 * mix text (maker, role, stages) with figures in different published
 * units, so a right edge would scatter the text rows and a unit in the
 * header would not hold for a whole column.
 */
const joinedTables = cn(
  "[&_table]:w-full [&_table]:table-fixed",
  "md:[&_tr>:first-child]:w-40 lg:[&_tr>:first-child]:w-64",
  // Each table keeps its real header row for assistive technology, and the
  // fixed layout takes its column widths from it, so it stays in the table
  // at zero height instead of being taken out of flow (sr-only would drop
  // the widths). The visible header is the band above the first group.
  "[&_thead_th]:h-0 [&_thead_th]:border-0 [&_thead_th]:p-0 [&_thead_th]:text-[0px] [&_thead_th]:leading-[0]",
  // No hyphenation: the column widths above fit whole words, and
  // break-word only guards against an unforeseen long token.
  "max-md:[&_tbody_th]:pr-2.5 max-md:[&_td]:px-2 [&_tbody_:is(th,td)]:[overflow-wrap:break-word]",
  // The caption and the scroll region are the root's two children. The
  // region never scrolls here: the group's outer box does, so the region
  // must not clip (overflow-x would make it the sticky column's containing
  // block and the column would scroll away with it). Its focus ring is
  // drawn on the outer box instead, which is what the arrow keys scroll
  // (important: the global focus ring rule is unlayered).
  "[&>[role=region]]:overflow-visible [&>[role=region]]:rounded-none [&>[role=region]]:border-0 [&>[role=region]:focus-visible]:outline-none!",
  "[&>p:first-child]:mb-0 [&>p:first-child]:pt-6 [&>p:first-child]:pb-3",
  "max-md:[&>p:first-child]:sticky max-md:[&>p:first-child]:left-0 max-md:[&>p:first-child]:max-w-[100cqw]",
);

/**
 * The comparison as a spec sheet (design v3, spec 6 and 11). An identity
 * strip names each column with its traced outline (all at one scale),
 * maker and profile link, next
 * to the rules the sheet follows; then the groups of characteristics as one
 * sheet, the characteristic as the row header and one column per vehicle,
 * with a thin accent scale line where a row shares one unit. An open table:
 * the header band sits on a strong rule, rows on hairlines, no frame.
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

  // The selected vehicles' outlines share one box, so the strip reads to
  // one scale.
  const outlineBox = sharedOutlineBox(
    drawingsFor(result.vehicles.map((vehicle) => vehicle.id)),
  );

  const columns: DataTableColumn<ComparisonRow>[] = [
    {
      key: "characteristic",
      header: "Characteristic",
      cell: (row) => {
        // Below 48rem the 6.25rem sticky column is too narrow for a
        // paragraph, so a row's description and its note move to the
        // full-width list under the group there. A row without a note
        // keeps its description in the cell. From 48rem the label of a
        // row with a note is the note's toggle.
        const hasEducation =
          getRowEducation(result.category, row.id) !== undefined;
        return (
          <span className="flex flex-col items-start">
            <span
              className={cn(
                "text-[0.8125rem] font-medium text-muted max-md:tracking-[-0.01em] md:text-sm",
                hasEducation && "md:hidden",
              )}
            >
              {row.label}
            </span>
            <ComparisonRowEducation
              category={result.category}
              className="max-md:hidden"
              label={row.label}
              rowId={row.id}
            />
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
        "grid items-center border-b border-border-control bg-background",
        bandColumns[count],
        className,
      )}
    >
      {/* Stretched so the sticky cell covers the band on a phone (page
          ground, the colour behind every cell); its text is centred like
          the names beside it, so they share one optical line. */}
      <span className="orbix-label sticky left-0 z-10 flex items-center self-stretch bg-background py-3 pr-2.5 md:static">
        {/* Too wide for the 6.25rem phone column. */}
        <span className="max-md:hidden">Characteristic</span>
      </span>
      {result.vehicles.map((vehicle) => (
        <span
          className="font-display px-2 py-3 text-[1.0625rem] leading-5 tracking-[-0.02em] text-foreground md:px-4"
          key={vehicle.id}
        >
          {vehicle.name}
        </span>
      ))}
    </div>
  );

  return (
    <div>
      {/* The group index leads the sheet, so the identity strip runs
          straight into the column band. */}
      {groups.length > 1 ? (
        <div className="mb-10">
          <SectionNavigation
            items={groups.map((group) => ({
              id: groupAnchorId(group.categoryId),
              label: group.label,
            }))}
            label="Jump to a group in the spec sheet"
          />
        </div>
      ) : null}

      {/* Identity strip. From 64rem the rules fill the 16rem cell over the
          characteristic column and the vehicles sit over their columns;
          below that the rules follow the sheet, so a phone reaches the
          figures sooner. Only one copy is ever displayed. */}
      <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-0">
        <ComparisonRules className="max-lg:hidden lg:self-start lg:pr-8" />

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
              const drawing = getVehicleDrawing(vehicle.id);

              return (
                <li
                  className="flex min-w-0 items-start gap-4 sm:block lg:row-span-4 lg:grid lg:grid-rows-subgrid lg:gap-0 lg:px-4"
                  key={vehicle.id}
                >
                  {drawing ? (
                    /* The outline in the selection's shared box: a
                       thumbnail on a phone, the column width above. */
                    <span
                      className={cn(
                        "relative block max-w-full shrink-0",
                        isAircraft
                          ? "aspect-[16/10] h-[4.375rem] sm:h-auto sm:w-full"
                          : "aspect-[3/4] h-24 sm:aspect-[4/5] sm:h-auto sm:max-h-[22rem] sm:w-full",
                      )}
                    >
                      <VehicleOutline
                        box={outlineBox}
                        className="absolute inset-0 h-full w-full text-ink-muted"
                        drawing={drawing}
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

          <p className="orbix-caption mt-6">
            All to one scale. <DrawingSourceNote vehicles={result.vehicles} />
          </p>
        </div>
      </div>

      {count > 1 ? (
        <div className="@container/sheet md:hidden">
          <p className={cn("orbix-label mt-6", hintVisibility[count])}>
            If the sheet is wider than the screen, scroll it sideways; the
            characteristic column stays in view.
          </p>
        </div>
      ) : null}

      <div className="mt-6 lg:mt-10">
        {nameBand("hidden lg:sticky lg:top-16 lg:z-20 lg:grid")}

        {groups.map((group) => (
          <div
            className="scroll-mt-24 lg:scroll-mt-40"
            id={groupAnchorId(group.categoryId)}
            key={group.categoryId}
          >
            {/* A size container, so the caption and the notes can match the
                visible width of the group (100cqw) while it scrolls
                sideways, whatever the scrollbar takes. The scrollbar is the
                overflow cue (spec 3.1). */}
            <div
              className={cn(
                "orbix-data-table__scroll @container overflow-x-auto lg:overflow-visible",
                "has-[[role=region]:focus-visible]:outline-2 has-[[role=region]:focus-visible]:outline-offset-2 has-[[role=region]:focus-visible]:outline-[var(--orbix-focus)]",
              )}
            >
              <div
                className={cn(
                  "flex flex-col",
                  sheetWidth[count],
                  // The table root joins this column, so the repeated name
                  // band can sit between the caption and the table. The
                  // band is aria-hidden and holds no focusable element, so
                  // the visual order never differs from the focus order.
                  "[&>.orbix-data-table]:contents [&>.orbix-data-table>div]:order-3 [&>.orbix-data-table>p:first-child]:order-1",
                )}
              >
                <DataTable
                  caption={
                    <>
                      {/* One caption line per group, so the groups read as
                          parts of one sheet. Below 48rem the summary moves
                          into the group's "About these rows" note. */}
                      <span
                        aria-level={3}
                        className="font-display block text-[1.25rem] leading-none tracking-[-0.03em] text-foreground"
                        role="heading"
                      >
                        {group.label}
                      </span>
                      <span className="mt-1.5 block text-[0.8125rem] leading-5 font-normal text-muted max-md:hidden">
                        {group.summary}
                      </span>
                    </>
                  }
                  className={cn(joinedTables, firstColumn[count])}
                  columns={columns}
                  getRowKey={(row) => row.id}
                  rows={group.rows}
                />
                {nameBand("order-2 lg:hidden")}
              </div>
            </div>
            {/* Below 48rem the rows' notes follow the group as one
                disclosure, outside the sideways scroller. */}
            <ComparisonGroupNotes
              category={result.category}
              className="pt-2 md:hidden"
              groupLabel={group.label}
              rows={group.rows}
              summary={group.summary}
            />
          </div>
        ))}
      </div>

      <ComparisonRules className="mt-10 sm:grid sm:grid-cols-2 sm:gap-x-6 lg:hidden" />
    </div>
  );
}
