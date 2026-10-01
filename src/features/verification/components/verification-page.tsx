import { ButtonLink } from "@/components/ui/button-link";
import { formatFigure } from "@/components/ui/readout";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { LegalSection } from "@/features/legal/components/legal-section";
import {
  ReadingPage,
  SpecList,
  type ReadingTocItem,
} from "@/features/legal/components/reading-page";
import {
  uncheckedCalculators,
  verificationGroups,
  verificationSources,
  type VerificationCase,
  type VerificationRow,
} from "@/features/verification/data/verification-cases";
import {
  summarizeVerification,
  toDisplayRow,
} from "@/features/verification/lib/display";

/**
 * Quantity label with the last word and the unit held together, so a unit
 * never starts a line by itself. A label that ends in a parenthesis, such
 * as "Speed at apogee (500 km)", keeps the whole parenthesis with the unit.
 */
function QuantityLabel({ row }: { readonly row: VerificationRow }) {
  // No-break spaces keep a ratio ("p₀₂ / p₀₁") and a number with its unit
  // ("200 km") on one line.
  const quantity = row.quantity
    .replace(/ \/ /g, " / ")
    .replace(/(\d) (?=[a-z])/g, "$1 ");
  const split = quantity.endsWith(")")
    ? quantity.lastIndexOf(" (")
    : quantity.lastIndexOf(" ");
  const head = split === -1 ? "" : quantity.slice(0, split + 1);
  const tail = split === -1 ? quantity : quantity.slice(split + 1);

  return (
    <span className="block max-w-[9.5rem] min-w-28 md:max-w-none md:min-w-0">
      {head}
      <span className="whitespace-nowrap">
        {tail}
        {row.unit === "" ? null : (
          <span className="orbix-table-unit"> ({row.unit})</span>
        )}
      </span>
    </span>
  );
}

const resultColumns: readonly DataTableColumn<VerificationRow>[] = [
  {
    // Below 48rem only the first three columns fit, so a row outside
    // rounding repeats its verdict under the quantity (visual only; the
    // Rounding check column still states it for screen readers).
    cell: (row) => {
      const display = toDisplayRow(row);

      return (
        <>
          <QuantityLabel row={row} />
          {display.withinRounding ? null : (
            <span
              aria-hidden="true"
              className="mt-0.5 block text-[0.8125rem] leading-5 text-text-muted md:hidden"
            >
              {display.roundingLabel}
            </span>
          )}
        </>
      );
    },
    header: "Quantity",
    key: "quantity",
  },
  {
    cell: (row) => toDisplayRow(row).orbix,
    header: "ORBIX",
    key: "orbix",
    numeric: true,
  },
  {
    cell: (row) => toDisplayRow(row).reference,
    header: "Published",
    key: "published",
    numeric: true,
  },
  {
    cell: (row) => toDisplayRow(row).difference,
    header: "Difference",
    key: "difference",
    numeric: true,
  },
  {
    cell: (row) => (
      <span className="orbix-data text-text-secondary">
        <PrintedFigure value={row.reference.printed} />
      </span>
    ),
    header: "As printed",
    key: "printed",
  },
  {
    cell: (row) => {
      const display = toDisplayRow(row);

      return (
        <span
          className={display.withinRounding ? undefined : "text-status-warning"}
        >
          {display.roundingLabel}
        </span>
      );
    },
    header: "Rounding check",
    key: "rounding",
  },
];

/**
 * Column widths for the results tables. A fixed layout makes every table
 * fit the track from 48rem and lines the columns up down the page; cells
 * use 12px side padding there, except the outer edges, so the open table
 * hangs on the same column edges as the prose and caption. From 64rem: Quantity 10.75rem, ORBIX 13.5%,
 * Published 12.5%, Difference 13.5%, As printed 10.75rem, and Rounding check
 * takes the rest, its header on one line (it wrapped to two lines at
 * 133px, doubling every header row). At the 808px
 * track every figure and the longest As printed value fit their cell's
 * content box on one line; the longest quantity labels wrap once, between
 * words. From 48rem to 64rem the figures get
 * more room (19, 16, 14, 15, 17, 19) and headers may wrap between words. Phones keep the natural widths and
 * scroll sideways with the quantity column held in place; there only the
 * quantity column wraps. Figures in a row share one baseline.
 */
const resultTableClass = [
  "[&_tbody_:is(th,td)]:align-baseline",
  "max-md:[&_td:nth-child(n+2)]:whitespace-nowrap",
  "md:[&_table]:table-fixed md:[&_table]:w-full md:[&_:is(th,td)]:px-3",
  "md:[&_:is(th,td):first-child]:pl-0 md:[&_:is(th,td):last-child]:pr-0",
  "md:[&_thead_th]:[overflow-wrap:normal] md:max-lg:[&_thead_th]:whitespace-normal",
  "lg:[&_td:nth-child(5)]:whitespace-nowrap lg:[&_thead_th:nth-child(6)]:whitespace-nowrap",
  "md:[&_thead_th:nth-child(1)]:w-[19%] lg:[&_thead_th:nth-child(1)]:w-[10.75rem]",
  "md:[&_thead_th:nth-child(2)]:w-[16%] lg:[&_thead_th:nth-child(2)]:w-[13.5%]",
  "md:[&_thead_th:nth-child(3)]:w-[14%] lg:[&_thead_th:nth-child(3)]:w-[12.5%]",
  "md:[&_thead_th:nth-child(4)]:w-[15%] lg:[&_thead_th:nth-child(4)]:w-[13.5%]",
  "md:[&_thead_th:nth-child(5)]:w-[17%] lg:[&_thead_th:nth-child(5)]:w-[10.75rem]",
  "md:[&_thead_th:nth-child(6)]:w-[19%] lg:[&_thead_th:nth-child(6)]:w-auto",
].join(" ");

/**
 * A figure exactly as the source prints it. B612 Mono gives a leading
 * decimal point (".1278") a full character cell, which reads as ". 1278";
 * pulling the digits in by a quarter cell closes that gap without changing
 * the printed text. In the standard atmosphere's notation ("8.9874 + 2 mb")
 * no-break spaces hold the exponent and the unit together, so a narrow
 * cell breaks only between the mantissa and "+ 2 mb".
 */
function PrintedFigure({ value: printed }: { readonly value: string }) {
  const value = printed.replace(/ ([+−]) (\d+) /g, " $1 $2 ");
  if (!value.startsWith(".")) return formatFigure(value);

  return (
    <>
      <span className="-me-[0.25em]">.</span>
      {formatFigure(value.slice(1))}
    </>
  );
}

/**
 * Visible table captions. Each names what its table compares, so the results
 * tables (and their scroll regions) are told apart by their names alone
 * instead of all reading "Results". A case without an entry falls back to
 * its title.
 */
const resultCaptions: Readonly<Record<string, string>> = {
  "atmosphere-1000":
    "Temperature, pressure and density at 1,000 m geopotential",
  "atmosphere-5000":
    "Temperature, pressure and density at 5,000 m geopotential",
  "atmosphere-11000":
    "Temperature, pressure and density at 11,000 m geopotential",
  "atmosphere-11000-geometric":
    "Temperature, pressure and density at 11,000 m geometric",
  "escape-200km": "Escape velocity at 200 km",
  "hohmann-leo-geo":
    "Hohmann transfer burns, low Earth orbit to geosynchronous",
  "isentropic-m2": "Isentropic ratios at Mach 2",
  "normal-shock-m2": "M₂ and normal shock ratios at Mach 2",
  "oblique-shock-m3": "Shock angle and M₂ at Mach 3",
  "plane-change-8deg": "Plane change delta-v at 8°",
  "rocket-two-stage": "Delta-v by stage, two-stage rocket",
  "total-pressure-recovery-m2": "Total pressure ratio at Mach 2",
  "vis-viva": "Orbital speeds from vis-viva",
};

function resultCaption(item: VerificationCase): string {
  return resultCaptions[item.id] ?? `Results: ${item.title}`;
}

/**
 * One comparison: what was run, where the published value comes from, the
 * results table on the wide track, and the notes under it.
 */
function CaseSection({ item }: { readonly item: VerificationCase }) {
  const source = verificationSources[item.sourceId];
  const headingId = `case-${item.id}`;

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-5 pt-10 [h2+&]:pt-4"
    >
      <h3 className="mt-0! max-sm:text-[1.25rem]!" id={headingId}>
        {item.title}
      </h3>
      <SpecList
        items={[
          {
            label: "Function",
            value: <code>{item.calculator}</code>,
          },
          {
            label: "Inputs",
            value: (
              <ul className="list-none! space-y-1 pl-0!">
                {item.inputs.map((input) => (
                  <li className="mt-0!" key={input}>
                    {input}
                  </li>
                ))}
              </ul>
            ),
          },
          {
            label: "Source",
            value: (
              <>
                <a href={source.url}>{source.title}</a>, {source.publisher}.{" "}
                {item.location}.
              </>
            ),
          },
        ]}
      />
      <DataTable
        caption={resultCaption(item)}
        className={resultTableClass}
        columns={resultColumns}
        getRowKey={(row) => row.id}
        rows={item.rows}
      />
      {item.notes.length > 0 ? (
        <ul className="space-y-2 text-sm leading-6 text-text-secondary">
          {item.notes.map((note) => (
            <li className="mt-0!" key={note}>
              {note}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

/** Short names for the three-line summary, keyed by source id. */
const SOURCE_SHORT_NAMES: Readonly<
  Record<keyof typeof verificationSources, string>
> = {
  braeunig: "Robert A. Braeunig's example problems",
  brennen: "Brennen's Internet Book on Fluid Dynamics",
  naca1135: "NACA Report 1135",
  ussa1976: "the U.S. Standard Atmosphere, 1976",
};

/** "a, b, c and d". */
function listPhrase(items: readonly string[]): string {
  if (items.length < 2) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

/**
 * The case that reads its altitude as geometric on purpose, to show the size
 * of that error. Its rows are expected to fall outside rounding.
 */
const DELIBERATE_ERROR_CASE_ID = "atmosphere-11000-geometric";

interface OutsideRoundingCounts {
  /** Outside rows from the deliberate geometric-altitude case. */
  readonly deliberate: number;
  /** Every other outside row. */
  readonly other: number;
  /** True when every other outside row's case has at least one note. */
  readonly otherAllNoted: boolean;
}

/** Splits the rows outside rounding by where their explanation lives. */
function countOutsideRounding(): OutsideRoundingCounts {
  let deliberate = 0;
  let other = 0;
  let otherAllNoted = true;

  for (const group of verificationGroups) {
    for (const item of group.cases) {
      const count = item.rows.filter(
        (row) => !toDisplayRow(row).withinRounding,
      ).length;
      if (count === 0) continue;
      if (item.id === DELIBERATE_ERROR_CASE_ID) {
        deliberate += count;
      } else {
        other += count;
        if (item.notes.length === 0) otherAllNoted = false;
      }
    }
  }

  return { deliberate, other, otherAllNoted };
}

/** The summary's second sentence, from the computed counts. */
function outsidePhrase({
  deliberate,
  other,
  otherAllNoted,
}: OutsideRoundingCounts): string {
  const total = deliberate + other;
  if (total === 0) return "";
  const noted = otherAllNoted
    ? " each have a note under their table"
    : " are shown with their tables";
  if (deliberate === 0) return `The other ${total}${noted}.`;
  const reads = `${deliberate} come from a case that reads the altitude the wrong way on purpose`;
  if (other === 0)
    return `The other ${total} all come from a case that reads the altitude the wrong way on purpose.`;
  return `Of the other ${total}, ${reads}, and the other ${other}${noted}.`;
}

const toc: readonly ReadingTocItem[] = [
  { id: "method", title: "How the comparison works" },
  ...verificationGroups.map((group) => ({
    id: `group-${group.id}`,
    title: group.title,
  })),
  { id: "limits", title: "What this page does not show" },
];

/**
 * /verification (spec 9): the editorial reading layout with each case as a
 * spec sheet. Tables take the full reading track and fit it from 64rem; on
 * narrower screens they scroll sideways (DataTable).
 */
export function VerificationPage() {
  const summary = summarizeVerification(verificationGroups);
  const outside = countOutsideRounding();
  const sourceNames = Object.values(verificationSources).map(
    (source) => SOURCE_SHORT_NAMES[source.id],
  );

  return (
    <ReadingPage
      intro={
        <ButtonLink
          arrow="right"
          className="mt-6"
          href="/engineering-lab"
          variant="tertiary"
        >
          Open the Engineering Lab
        </ButtonLink>
      }
      lead={
        <div className="flex flex-col gap-3">
          <p>
            {summary.withinRounding} of {summary.total} compared values pass the
            rounding check. {outsidePhrase(outside)}
          </p>
          <p>
            The published values come from {sourceNames.length} sources:{" "}
            {listPhrase(sourceNames)}.
          </p>
          <p>
            The checks show that each function works out its textbook equation
            correctly for these inputs. They do not show that a simplified model
            suits a real vehicle or can be used for design, operational or
            safety decisions.
          </p>
        </div>
      }
      title="Checking ORBIX against published values"
      toc={toc}
    >
      <LegalSection id="method" major title="How the comparison works">
        <p>
          The page fills the ORBIX column by calling the Engineering Lab&apos;s
          own functions with each case&apos;s inputs. Published values are
          converted only where units differ. Difference is ORBIX minus
          published, as a percentage of published. A row passes the rounding
          check when ORBIX is within half a unit of the last digit the source
          prints: 4.500 allows 4.4995 to 4.5005.
        </p>
      </LegalSection>

      {verificationGroups.map((group) => (
        <LegalSection
          id={`group-${group.id}`}
          key={group.id}
          major
          title={group.title}
        >
          {group.intro ? <p>{group.intro}</p> : null}
          {group.cases.map((item) => (
            <CaseSection item={item} key={item.id} />
          ))}
        </LegalSection>
      ))}

      <LegalSection id="limits" major title="What this page does not show">
        <p>
          The functions checked here are deliberately simple: the atmosphere
          covers only the troposphere, the flow functions assume a calorically
          perfect gas with a ratio of specific heats of 1.4, and the orbital
          functions assume two bodies and instantaneous burns.
        </p>
        <p>
          No published worked example with identical inputs has been checked yet
          for the following functions, so they are not compared here:
        </p>
        <ul>
          {uncheckedCalculators.map((name) => (
            <li key={name}>
              <code>{name}</code>
            </li>
          ))}
        </ul>
        <p>
          Engineering Lab tools that combine several of these functions are not
          compared separately.
        </p>
      </LegalSection>
    </ReadingPage>
  );
}
