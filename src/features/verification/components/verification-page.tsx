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
    cell: (row) => <QuantityLabel row={row} />,
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
 * use 12px side padding there. From 64rem: Quantity 10.75rem, ORBIX 13.5%,
 * Published 12.5%, Difference 13.5%, As printed 10.75rem, and Rounding check
 * takes the rest, its header on one line (it wrapped to two lines at
 * 133px, doubling every header row). At the 808px
 * track every figure and the longest As printed value fit their cell's
 * content box on one line; the longest quantity labels wrap once, between
 * words. From 48rem to 64rem the figures get
 * more room (19, 16, 14, 15, 17, 19), the header tracking tightens and
 * headers may wrap between words. Phones keep the natural widths and
 * scroll sideways with the quantity column held in place; there only the
 * quantity column wraps. Figures in a row share one baseline.
 */
const resultTableClass = [
  "[&_tbody_:is(th,td)]:align-baseline",
  "max-md:[&_td:nth-child(n+2)]:whitespace-nowrap",
  "md:[&_table]:table-fixed md:[&_table]:w-full md:[&_:is(th,td)]:px-3",
  "md:[&_thead_th]:[overflow-wrap:normal] md:max-lg:[&_thead_th]:whitespace-normal md:max-lg:[&_thead_th]:tracking-[0.06em]",
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
      className="flex flex-col gap-5 border-t border-border-subtle pt-8 [h2+&]:border-t-0 [h2+&]:pt-4"
    >
      <h3 className="mt-0! max-sm:text-[1.25rem]!" id={headingId}>
        {item.title}
      </h3>
      <SpecList
        items={[
          {
            label: "Function",
            value: <span className="orbix-data">{item.calculator}</span>,
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

  return (
    <ReadingPage
      eyebrow="Engineering Lab"
      intro={
        <>
          <p className="mt-6 max-w-[38.25rem] text-sm leading-6 text-muted">
            For education only. Agreement with a textbook case does not make a
            simplified model suitable for design, operational or safety
            decisions.
          </p>
          <ButtonLink
            arrow="right"
            className="mt-6"
            href="/engineering-lab"
            variant="tertiary"
          >
            Return to the Engineering Lab
          </ButtonLink>
        </>
      }
      lead={
        <p>
          Selected Engineering Lab calculations run with the same inputs as a
          published table or worked example, with the published value beside
          each result.
        </p>
      }
      title="Checking ORBIX against"
      titleAccent="published values"
      toc={toc}
    >
      <LegalSection id="method" major title="How the comparison works">
        <p>
          The ORBIX column is not typed in. When this page is built, it calls
          the same calculation functions the Engineering Lab uses, with the
          inputs listed for each case, and prints what they return. The
          published column is the value printed in the cited source, converted
          only where the unit differs (for example millibars to pascals).
        </p>
        <p>
          Difference is (ORBIX minus published) divided by published, as a
          percentage. A row passes the rounding check when ORBIX is within half
          a unit of the last digit the source prints: a value printed as 4.500
          allows 4.4995 to 4.5005. Rows that fall outside are left as they are,
          and the note under the table gives the reason where it is known.
        </p>
        <p>
          {summary.withinRounding} of {summary.total} compared values pass the
          rounding check. {summary.outsideRounding} do not; each has a note
          below its table.
        </p>
      </LegalSection>

      {verificationGroups.map((group) => (
        <LegalSection
          id={`group-${group.id}`}
          key={group.id}
          major
          title={group.title}
        >
          {group.cases.map((item) => (
            <CaseSection item={item} key={item.id} />
          ))}
        </LegalSection>
      ))}

      <LegalSection id="limits" major title="What this page does not show">
        <p>
          These checks confirm that each function evaluates its textbook
          equation correctly for one or a few inputs. They do not show that the
          equation suits a real vehicle. The functions checked here are
          deliberately simple: the atmosphere covers only the troposphere, the
          flow functions assume a calorically perfect gas with a ratio of
          specific heats of 1.4, and the orbital functions assume two bodies and
          instantaneous burns.
        </p>
        <p>
          No published worked example with identical inputs has been checked yet
          for the following functions, so they are not compared here:
        </p>
        <ul>
          {uncheckedCalculators.map((name) => (
            <li className="orbix-data" key={name}>
              {name}
            </li>
          ))}
        </ul>
        <p>
          The Engineering Lab analyzers built on these functions (entry, thermal
          protection and mission tools) are not compared separately.
        </p>
      </LegalSection>
    </ReadingPage>
  );
}
