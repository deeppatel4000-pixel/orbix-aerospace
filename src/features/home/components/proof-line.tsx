import { Container } from "@/components/layout/container";
import { ButtonLink, DataTable } from "@/components/ui";
import { EARTH_MEAN_RADIUS_METRES } from "@/features/engineering-lab/calculators";
import {
  verificationGroups,
  verificationInputs,
  verificationSources,
  type VerificationCase,
  type VerificationRow,
} from "@/features/verification/data/verification-cases";
import {
  summarizeVerification,
  toDisplayRow,
} from "@/features/verification/lib/display";

/**
 * The sample case and row (v4 plan section 4.2): Hohmann, LEO to GEO, first
 * burn. The second burn and the total of this case fall outside the
 * published rounding for a reason that takes a paragraph to explain (the
 * source rounds speeds before subtracting); the Verification page prints
 * that note beside them, and the count above includes them.
 */
const SAMPLE_CASE_ID = "hohmann-leo-geo";
const SAMPLE_ROW_ID = "hohmann-leo-geo-first-burn";
/** The sample case starts from a 200 km parking orbit (its inputs say so). */
const SAMPLE_START_ALTITUDE_METRES = 200_000;

const km = (metres: number, decimals: number) =>
  (metres / 1_000).toLocaleString("en-US", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });

/**
 * The worked example and the Transfer Explorer above it measure altitude
 * from different Earth radii, so the same 200 km to GEO case prints
 * slightly different burns. Both radii come from the code.
 */
const radiusNote = `The worked example measures altitude from a ${km(
  verificationInputs.hohmann.initialOrbitRadiusMetres -
    SAMPLE_START_ALTITUDE_METRES,
  2,
)} km Earth radius. The Transfer Explorer above uses the ${km(
  EARTH_MEAN_RADIUS_METRES,
  0,
)} km mean radius, so its figures for the same orbits differ slightly.`;

function findSample():
  | { readonly item: VerificationCase; readonly row: VerificationRow }
  | undefined {
  for (const group of verificationGroups) {
    for (const item of group.cases) {
      if (item.id !== SAMPLE_CASE_ID) continue;
      const row = item.rows.find((candidate) => candidate.id === SAMPLE_ROW_ID);
      return row ? { item, row } : undefined;
    }
  }
  return undefined;
}

interface SampleRow {
  readonly orbix: string;
  readonly published: string;
  readonly quantity: string;
  readonly result: string;
}

/**
 * The proof line (v4 plan section 4.2): the verification score, counted
 * from the same cases and the same comparison the Verification page
 * prints, then one sample row from that page. Nothing here is typed in:
 * the ORBIX value is the calculator's output, and whether it falls within
 * the published rounding is decided by `toDisplayRow`.
 */
export function ProofLine() {
  const summary = summarizeVerification(verificationGroups);
  const sample = findSample();
  const display = sample ? toDisplayRow(sample.row) : undefined;
  const source = sample ? verificationSources[sample.item.sourceId] : undefined;
  const caption =
    sample && source
      ? `${sample.item.title}. ${source.publisher}, ${sample.item.location.split(",")[0]}.`
      : "";

  return (
    <section
      aria-labelledby="home-proof-title"
      className="border-t border-border-subtle"
    >
      <Container className="grid gap-8 py-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-x-14">
        <div className="min-w-0">
          <h2 className="orbix-h2" id="home-proof-title">
            Checked against published values
          </h2>
          <p className="mt-5 max-w-[48ch] text-pretty text-text-secondary">
            <span className="orbix-data text-foreground">
              {summary.withinRounding}
            </span>{" "}
            of{" "}
            <span className="orbix-data text-foreground">{summary.total}</span>{" "}
            compared values fall within the rounding of the published figure,
            and the other{" "}
            <span className="orbix-data text-foreground">
              {summary.outsideRounding}
            </span>{" "}
            are listed with a reason for each.
          </p>
          <ButtonLink
            arrow="right"
            className="mt-5"
            href="/verification"
            variant="tertiary"
          >
            See every comparison
          </ButtonLink>
        </div>

        {sample && display && source ? (
          <div className="min-w-0 lg:pt-2">
            {/* Below 48rem a four-column table pushes the Result column off
                screen, so the same row is set as a short list there. */}
            <figure className="m-0 md:hidden">
              <figcaption className="orbix-caption mt-0">{caption}</figcaption>
              <p className="mt-3 font-medium text-foreground">
                {sample.row.quantity}
              </p>
              <dl className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-1 border-t border-border-subtle pt-2">
                <dt className="text-text-secondary">ORBIX</dt>
                <dd className="orbix-data m-0 text-foreground">
                  {display.orbix} {sample.row.unit}
                </dd>
                <dt className="text-text-secondary">Published</dt>
                <dd className="orbix-data m-0 text-foreground">
                  {display.reference} {sample.row.unit}
                </dd>
                <dt className="text-text-secondary">Result</dt>
                <dd className="m-0 text-foreground">{display.roundingLabel}</dd>
              </dl>
            </figure>
            <div className="hidden md:block">
              <DataTable<SampleRow>
                caption={caption}
                columns={[
                  {
                    cell: (row) => row.quantity,
                    header: "Quantity",
                    key: "quantity",
                  },
                  {
                    cell: (row) => row.orbix,
                    header: "ORBIX",
                    key: "orbix",
                    numeric: true,
                    unit: sample.row.unit,
                  },
                  {
                    cell: (row) => row.published,
                    header: "Published",
                    key: "published",
                    numeric: true,
                    unit: sample.row.unit,
                  },
                  {
                    cell: (row) => row.result,
                    header: "Result",
                    key: "result",
                  },
                ]}
                getRowKey={(row) => row.quantity}
                rows={[
                  {
                    orbix: display.orbix,
                    published: display.reference,
                    quantity: sample.row.quantity,
                    result: display.roundingLabel,
                  },
                ]}
              />
            </div>
            <p className="mt-4 max-w-[60ch] text-sm text-pretty text-muted">
              {radiusNote}
            </p>
          </div>
        ) : null}
      </Container>
    </section>
  );
}
