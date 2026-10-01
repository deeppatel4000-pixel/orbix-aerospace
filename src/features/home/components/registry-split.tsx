import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { Container } from "@/components/layout/container";
import {
  ButtonLink,
  DataTable,
  type DataTableColumn,
  type VisualRecord,
} from "@/components/ui";
import { creditLine, licenceLabel } from "@/components/ui/photo-hero";
import type { AccentDivision } from "@/config/divisions";
import { getAircraftVisual, listAircraft } from "@/features/aircraft/data";
import { getRocketVisual, listRockets } from "@/features/rockets/data";

/**
 * The two registries as two open catalogue columns (design v3, spec 6 and
 * 11, Home): aircraft on the left, launch vehicles on the right, the same
 * shape on both sides. Each column is a heading under a 2px rule in its
 * division colour, one sentence, a hard-edged square photo plate with a
 * catalogue caption on the ground, an open table of the registry's
 * vehicles in order of first flight (name, first flight, one size figure
 * with its unit in the header), and a text link to the registry. No card,
 * no panel, no fill.
 *
 * From 48rem the two columns share subgrid rows, so the headings, plates,
 * table rules and links sit on the same lines across the pair even when
 * one caption wraps further than the other.
 *
 * The plates are square: the Saturn V source is portrait and a square
 * shows the whole vehicle, escape tower to first stage, and the F-22
 * source is landscape and a square keeps both wingtips.
 *
 * Every figure and unit comes from the vehicle records. The table note
 * names the basis of the size figures from their qualifiers, so an
 * approximate value is never shown as if it were exact.
 */
const PICTURED_AIRCRAFT_ID = "f-22-raptor";
const PICTURED_ROCKET_ID = "saturn-v";

interface CatalogueRow {
  /** ISO date, for ordering; the table shows the year. */
  readonly firstFlightDate: string;
  readonly href: string;
  readonly id: string;
  readonly name: string;
  readonly qualifier?: string;
  readonly size: number;
  readonly sizeUnit: string;
}

interface CatalogueColumnProps {
  readonly caption: string;
  readonly division: AccentDivision;
  readonly linkHref: string;
  readonly linkLabel: string;
  /** `object-position` for the square plate. */
  readonly objectPosition: string;
  readonly rows: readonly CatalogueRow[];
  readonly sizeLabel: string;
  /** Plural of `sizeLabel` for the table note, for example "Heights". */
  readonly sizePlural: string;
  readonly summary: string;
  /** Accessible name of the table, visually hidden: the heading says it. */
  readonly tableCaption: string;
  readonly title: string;
  readonly visual?: VisualRecord;
}

function byFirstFlight(a: CatalogueRow, b: CatalogueRow) {
  return a.firstFlightDate.localeCompare(b.firstFlightDate);
}

function decimalPlaces(value: number) {
  const [, fraction = ""] = String(value).split(".");
  return fraction.length;
}

/**
 * A size figure padded so decimal points line up down a right-aligned
 * column: "51" gets an invisible ".0" after it when the column also holds
 * "62.1". The padding is hidden from assistive technology and from
 * selection, so no precision is claimed: the visible figure is the
 * recorded one.
 */
function alignedFigure(value: number, places: number): ReactNode {
  const own = decimalPlaces(value);
  const text = value.toLocaleString("en-US", {
    maximumFractionDigits: places,
  });
  if (own >= places) return text;
  const pad = `${own === 0 ? "." : ""}${"0".repeat(places - own)}`;
  return (
    <>
      {text}
      <span aria-hidden="true" className="invisible select-none">
        {pad}
      </span>
    </>
  );
}

/**
 * The unit for the size column header when every row shares one, as the
 * records do today. Mixed units are printed in each cell instead.
 */
function sharedUnit(rows: readonly CatalogueRow[]) {
  const units = new Set(rows.map((row) => row.sizeUnit));
  return units.size === 1 ? [...units][0] : undefined;
}

/**
 * "Heights are nominal values from each record, except Saturn V
 * (approximate)." Built from the qualifiers in the records. A value with
 * no qualifier is listed as an exception ("as recorded") rather than
 * counted as nominal.
 */
function basisNote(plural: string, rows: readonly CatalogueRow[]): ReactNode {
  const exceptions = rows.filter((row) => row.qualifier !== "nominal");
  const lead = `${plural} are nominal values from each record`;
  if (exceptions.length === 0) return `${lead}.`;
  const list = exceptions
    .map((row) => `${row.name} (${row.qualifier ?? "as recorded"})`)
    .join(", ");
  return `${lead}, except ${list}.`;
}

function CatalogueColumn({
  caption,
  division,
  linkHref,
  linkLabel,
  objectPosition,
  rows,
  sizeLabel,
  sizePlural,
  summary,
  tableCaption,
  title,
  visual,
}: CatalogueColumnProps) {
  const unit = sharedUnit(rows);
  const places = Math.max(0, ...rows.map((row) => decimalPlaces(row.size)));
  const columns: readonly DataTableColumn<CatalogueRow>[] = [
    {
      // Ink with a division-colour underline, the same treatment as the
      // registry link under the table, so a column has one link colour.
      cell: (row) => (
        <Link
          className="text-text-primary underline decoration-(--orbix-accent) decoration-1 underline-offset-3 transition-colors hover:text-(--orbix-accent)"
          href={row.href}
        >
          {row.name}
        </Link>
      ),
      header: "Vehicle",
      key: "name",
    },
    {
      cell: (row) => row.firstFlightDate.slice(0, 4),
      header: "First flight",
      key: "first-flight",
      numeric: true,
    },
    {
      cell: (row) =>
        unit ? (
          alignedFigure(row.size, places)
        ) : (
          <>
            {alignedFigure(row.size, places)} {row.sizeUnit}
          </>
        ),
      header: sizeLabel,
      key: "size",
      numeric: true,
      unit,
    },
  ];
  const licence = visual ? licenceLabel(visual.license) : null;

  return (
    <div
      className="min-w-0 md:row-span-5 md:grid md:grid-rows-subgrid md:gap-y-0"
      data-division={division}
    >
      <h3 className="orbix-h2 orbix-heading-rule text-[clamp(1.75rem,2.2vw,2.25rem)]!">
        {title}
      </h3>
      <p className="mt-4 max-w-[48ch] text-pretty text-text-secondary">
        {summary}
      </p>

      {visual && licence ? (
        <figure className="orbix-figure mt-8">
          <div className="relative aspect-square overflow-hidden">
            <Image
              alt={visual.alt}
              className="object-cover saturate-[0.9]"
              fill
              sizes="(min-width: 72rem) 536px, (min-width: 48rem) 45vw, 100vw"
              src={visual.src}
              style={{ objectPosition }}
            />
          </div>
          <figcaption className="orbix-caption">
            {caption}. {creditLine(visual.credit)}.{" "}
            {visual.licenseUrl ? (
              <a
                aria-label={licence.isShortened ? licence.full : undefined}
                href={visual.licenseUrl}
                rel="noopener noreferrer license"
                title={licence.isShortened ? licence.full : undefined}
              >
                {licence.short}
              </a>
            ) : (
              <span>{licence.full}</span>
            )}
            .{" "}
            <a href={visual.sourceUrl} rel="noopener noreferrer">
              Source file
            </a>
            .
          </figcaption>
        </figure>
      ) : (
        // Keeps the five subgrid rows when a record has no photograph.
        <div aria-hidden="true" />
      )}

      <DataTable
        caption={tableCaption}
        className="mt-10 [&>p:first-child]:sr-only"
        columns={columns}
        getRowKey={(row) => row.id}
        note={basisNote(sizePlural, rows)}
        rows={rows}
      />

      <div className="mt-6">
        <ButtonLink arrow="right" href={linkHref} variant="tertiary">
          {linkLabel}
        </ButtonLink>
      </div>
    </div>
  );
}

export function RegistrySplit() {
  const aircraft = listAircraft();
  const rockets = listRockets();

  const aircraftRows: CatalogueRow[] = aircraft
    .map((record) => ({
      firstFlightDate: record.firstFlight,
      href: `/aircraft/${record.id}`,
      id: record.id,
      name: record.name,
      qualifier: record.dimensions.length.qualifier,
      size: record.dimensions.length.value,
      sizeUnit: record.dimensions.length.unit,
    }))
    .sort(byFirstFlight);
  const rocketRows: CatalogueRow[] = rockets
    .map((record) => ({
      firstFlightDate: record.firstFlight,
      href: `/rockets/${record.id}`,
      id: record.id,
      name: record.name,
      qualifier: record.dimensions.height.qualifier,
      size: record.dimensions.height.value,
      sizeUnit: record.dimensions.height.unit,
    }))
    .sort(byFirstFlight);

  return (
    <section aria-labelledby="home-registries-title" className="orbix-section">
      <Container>
        <h2 className="orbix-h2 max-w-[18ch]" id="home-registries-title">
          Aircraft and launch vehicles, on the record.
        </h2>
        <p className="mt-6 max-w-[60ch] text-pretty text-text-secondary">
          Each record keeps its published figures with their units and
          qualifiers, alongside propulsion, dimensions and engineering notes.
        </p>

        <div className="mt-14 grid gap-20 md:grid-cols-2 md:gap-x-10 md:gap-y-0 lg:gap-x-16">
          <CatalogueColumn
            caption="F-22 Raptor over open water"
            division="aircraft"
            linkHref="/aircraft"
            linkLabel="Open the aircraft registry"
            objectPosition="69% 50%"
            rows={aircraftRows}
            sizeLabel="Length"
            sizePlural="Lengths"
            summary={`${aircraft.length} aircraft, with their dimensions, engines, performance and variants.`}
            tableCaption="Aircraft in the registry"
            title="Aircraft"
            visual={getAircraftVisual(PICTURED_AIRCRAFT_ID)}
          />
          <CatalogueColumn
            caption="Saturn V lifting off for Apollo 11"
            division="space"
            linkHref="/rockets"
            linkLabel="Open the launch vehicle registry"
            objectPosition="50% 45%"
            rows={rocketRows}
            sizeLabel="Height"
            sizePlural="Heights"
            summary={`${rockets.length} launch vehicles, with their stages, engines, thrust and payload.`}
            tableCaption="Launch vehicles in the registry"
            title="Launch vehicles"
            visual={getRocketVisual(PICTURED_ROCKET_ID)}
          />
        </div>
      </Container>
    </section>
  );
}
