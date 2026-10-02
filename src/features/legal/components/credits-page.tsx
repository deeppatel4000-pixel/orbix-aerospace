import Image from "next/image";
import Link from "next/link";

import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { ContactEmailLink } from "@/features/legal/components/contact-email-link";
import {
  LegalPage,
  type LegalTocItem,
} from "@/features/legal/components/legal-page";
import { LegalSection } from "@/features/legal/components/legal-section";
import {
  describeSourceSite,
  listImageCredits,
  type ImageCredit,
  type ImageCreditGroup,
} from "@/features/legal/data/image-credits";
import {
  DEFAULT_PHOTO_MODIFICATIONS,
  listPhotos,
} from "@/features/vehicles/data/gallery";
import {
  DRAWINGS_IN_USE,
  listDrawings,
  type VehicleDrawing,
} from "@/features/vehicles/data/gallery-drawings";

const toc: readonly LegalTocItem[] = [
  { id: "photographs", title: "Vehicle photographs" },
  ...(DRAWINGS_IN_USE ? [{ id: "drawings", title: "Vehicle drawings" }] : []),
  { id: "logo", title: "ORBIX logo" },
  { id: "fonts", title: "Fonts" },
  { id: "icons", title: "Icons" },
  { id: "software", title: "Software" },
  { id: "vehicle-data", title: "Vehicle data" },
  { id: "trademarks", title: "Trademarks and non-affiliation" },
];

const software = [
  {
    href: "https://github.com/vercel/next.js/blob/canary/license.md",
    license: "MIT License",
    name: "Next.js",
    use: "Web framework",
  },
  {
    href: "https://github.com/facebook/react/blob/main/LICENSE",
    license: "MIT License",
    name: "React",
    use: "User interface library",
  },
  {
    href: "https://github.com/tailwindlabs/tailwindcss/blob/main/LICENSE",
    license: "MIT License",
    name: "Tailwind CSS",
    use: "Styling",
  },
  {
    href: "https://lucide.dev/license",
    license: "ISC License",
    name: "Lucide",
    use: "Interface icons",
  },
] as const;

/** Table caption for each photograph group. */
const groupCaptions: Record<ImageCredit["group"], string> = {
  Aircraft: "Aircraft photographs",
  "Launch vehicles": "Launch vehicle photographs",
};

/** Table caption for the photographs beyond each vehicle's main photograph. */
const moreCaptions: Record<ImageCredit["group"], string> = {
  Aircraft: "More aircraft photographs",
  "Launch vehicles": "More launch vehicle photographs",
};

const AIRCRAFT_PREFIX = "/images/aircraft/";

/**
 * Every photograph a page shows that is not a vehicle's main photograph
 * (those are listed by `listImageCredits`), in the same row shape so the
 * tables share columns. Rows are named by vehicle and a short title from the
 * caption ("Saturn V, Apollo 12 leaving the VAB").
 */
function listMorePhotoCredits(
  mainSources: ReadonlySet<string>,
): readonly ImageCredit[] {
  return listPhotos({ inUseOnly: true })
    .filter((use) => !mainSources.has(use.photo.src))
    .map(({ photo, vehicleName }) => ({
      alt: photo.alt,
      cardObjectPosition: photo.objectPosition,
      credit: photo.credit,
      group: photo.src.startsWith(AIRCRAFT_PREFIX)
        ? "Aircraft"
        : "Launch vehicles",
      license: photo.license,
      licenseUrl: photo.licenseUrl,
      modifications: photo.modifications,
      sourceUrl: photo.sourceUrl,
      src: photo.src,
      vehicleId: photo.id,
      vehicleName: `${vehicleName}, ${photo.title}`,
    }));
}

const NOT_RECORDED = "Not yet recorded";

function Missing() {
  return <span className="text-muted">{NOT_RECORDED}</span>;
}

const creditColumns: readonly DataTableColumn<ImageCredit>[] = [
  {
    cell: (item) => (
      <span className="flex min-w-20 flex-col gap-2 sm:min-w-32 md:min-w-0 lg:flex-row lg:items-start lg:gap-3">
        <span className="lg:order-last">{item.vehicleName}</span>
        {/* One fixed 112x70 box for every thumbnail (64x40 below 40rem,
            so the pinned column leaves room for Credit, License and
            Source), filled with object-fit: cover at each photograph's
            card crop, so aircraft and launch vehicle rows share one
            thumbnail column and one left edge for the names.
            loading="eager": these are small thumbnails (1 to 3 KB each),
            so fetching them with the page costs little. */}
        <Image
          alt={item.alt}
          className="h-10 w-16 shrink-0 object-cover sm:h-[70px] sm:w-[112px]"
          height={70}
          loading="eager"
          sizes="(min-width: 40rem) 112px, 64px"
          src={item.src}
          style={{ objectPosition: item.cardObjectPosition }}
          width={112}
        />
      </span>
    ),
    header: "Vehicle",
    key: "vehicle",
  },
  {
    cell: (item) => (
      <span className="block min-w-36 md:min-w-0">
        {item.credit ?? <Missing />}
      </span>
    ),
    header: "Credit",
    key: "credit",
  },
  {
    cell: (item) => (
      <span className="relative block min-w-32 md:min-w-0">
        {item.license === null ? (
          <Missing />
        ) : item.licenseUrl === null ? (
          item.license
        ) : (
          <a className="orbix-link" href={item.licenseUrl}>
            {item.license}
            <span className="sr-only"> (license text)</span>
          </a>
        )}
      </span>
    ),
    // On a phone license and source are set under the credit.
    foldInto: "credit",
    header: "License",
    key: "licence",
  },
  {
    cell: (item) => (
      <span className="relative block min-w-36 md:min-w-0">
        {item.sourceUrl === null ? (
          <Missing />
        ) : (
          <a className="orbix-link" href={item.sourceUrl}>
            {describeSourceSite(item.sourceUrl)}
            <span className="sr-only">
              {" "}
              (source of the {item.vehicleName} photograph)
            </span>
          </a>
        )}
        {/* The usual change is stated once above the tables. */}
        {item.modifications === DEFAULT_PHOTO_MODIFICATIONS ? null : (
          <span className="mt-1 block text-muted">
            Changes: {item.modifications ?? NOT_RECORDED}
          </span>
        )}
      </span>
    ),
    foldInto: "credit",
    header: "Source",
    key: "source",
  },
];

const drawingColumns: readonly DataTableColumn<
  VehicleDrawing & { readonly vehicleName: string }
>[] = [
  {
    cell: (item) => (
      <span className="block min-w-20 sm:min-w-32 md:min-w-0">
        {item.vehicleName}
        <span className="mt-1 block text-muted">
          {item.view === "top" ? "Top view" : "Side view"}
        </span>
      </span>
    ),
    header: "Vehicle",
    key: "vehicle",
  },
  {
    cell: (item) => (
      <span className="block min-w-36 md:min-w-0">{item.credit}</span>
    ),
    header: "Credit",
    key: "credit",
  },
  {
    cell: (item) => (
      <span className="relative block min-w-32 md:min-w-0">
        <a className="orbix-link" href={item.licenseUrl}>
          {item.license}
          <span className="sr-only"> (license text)</span>
        </a>
      </span>
    ),
    foldInto: "credit",
    header: "License",
    key: "licence",
  },
  {
    cell: (item) => (
      <span className="relative block min-w-36 md:min-w-0">
        <a className="orbix-link" href={item.sourceUrl}>
          {describeSourceSite(item.sourceUrl)}
          <span className="sr-only">
            {" "}
            (source drawing for the {item.vehicleName} outline)
          </span>
        </a>
        <span className="mt-1 block text-muted">
          Changes: {item.modifications}
        </span>
      </span>
    ),
    foldInto: "credit",
    header: "Source",
    key: "source",
  },
];

/**
 * Shared column widths from 48rem (Vehicle 30%, Credit 26%, License 21%,
 * Source 23%), so the aircraft and launch vehicle tables line up when
 * stacked, like the pages of one catalog.
 */
const creditTableClass = [
  "mt-4",
  "md:[&_table]:table-fixed md:[&_table]:w-full",
  "md:[&_thead_th:nth-child(1)]:w-[30%]",
  "md:[&_thead_th:nth-child(2)]:w-[26%]",
  "md:[&_thead_th:nth-child(3)]:w-[21%]",
  "md:[&_thead_th:nth-child(4)]:w-[23%]",
].join(" ");

type SoftwareItem = (typeof software)[number];

const softwareColumns: readonly DataTableColumn<SoftwareItem>[] = [
  { cell: (item) => item.name, header: "Project", key: "project" },
  { cell: (item) => item.use, header: "Used for", key: "use" },
  {
    cell: (item) => (
      <a className="orbix-link relative" href={item.href}>
        {item.license}
        <span className="sr-only"> for {item.name}</span>
      </a>
    ),
    header: "License",
    key: "licence",
  },
];

export function CreditsPage() {
  const credits = listImageCredits();
  const moreCredits = listMorePhotoCredits(
    new Set(credits.map((item) => item.src)),
  );
  const names = new Map(
    credits.map((item) => [item.vehicleId, item.vehicleName]),
  );
  const drawings = listDrawings().map((drawing) => ({
    ...drawing,
    vehicleName: names.get(drawing.vehicleId) ?? drawing.vehicleId,
  }));
  const groups: readonly ImageCreditGroup[] = ["Aircraft", "Launch vehicles"];
  const hasGaps = credits.some(
    (item) =>
      item.credit === null ||
      item.license === null ||
      item.sourceUrl === null ||
      item.modifications === null,
  );

  return (
    <LegalPage
      lead={
        DRAWINGS_IN_USE
          ? "Who made the photographs, drawings, fonts, icons and software that ORBIX uses, and the license each one is used under."
          : "Who made the photographs, fonts, icons and software that ORBIX uses, and the license each one is used under."
      }
      title="Image credits and licenses"
      toc={toc}
    >
      <LegalSection id="photographs" title="Vehicle photographs">
        <p>
          Each vehicle photograph belongs to its author or agency and stays
          under its own license. The MIT License that covers the ORBIX code does
          not apply to these images.
        </p>
        {hasGaps ? (
          <p>
            Where a field reads &ldquo;{NOT_RECORDED}&rdquo;, the credit or
            license for that image has not yet been verified against the
            original file. If you know the correct credit, or you hold rights in
            an image and want it credited differently or removed, email{" "}
            <ContactEmailLink />.
          </p>
        ) : (
          <p>
            If you hold rights in an image and want it credited differently or
            removed, email <ContactEmailLink />.
          </p>
        )}
        <p>
          Unless a row lists other changes, each photograph was resized and
          converted to WebP.
        </p>
        {groups.map((group) => {
          const items = credits.filter((item) => item.group === group);
          if (items.length === 0) return null;

          return (
            <DataTable
              caption={groupCaptions[group]}
              className={creditTableClass}
              columns={creditColumns}
              getRowKey={(item) => item.vehicleId}
              key={group}
              rows={items}
            />
          );
        })}
        {groups.map((group) => {
          const items = moreCredits.filter((item) => item.group === group);
          if (items.length === 0) return null;

          return (
            <DataTable
              caption={moreCaptions[group]}
              className={creditTableClass}
              columns={creditColumns}
              getRowKey={(item) => item.vehicleId}
              key={`more-${group}`}
              rows={items}
            />
          );
        })}
        {credits.length === 0 ? (
          <p>No vehicle photographs are currently shown on ORBIX.</p>
        ) : null}
      </LegalSection>

      {DRAWINGS_IN_USE ? (
        <LegalSection id="drawings" title="Vehicle drawings">
          <p>
            The vehicle outlines in the to-scale drawings were traced from the
            drawings below and then scaled to the length, wingspan or height
            recorded for each vehicle. Outlines traced from a CC BY-SA 4.0
            drawing are released under CC BY-SA 4.0.
          </p>
          <DataTable
            caption="Sources of the vehicle outlines"
            className={creditTableClass}
            columns={drawingColumns}
            getRowKey={(item) => item.vehicleId}
            rows={drawings}
          />
        </LegalSection>
      ) : null}

      <LegalSection id="logo" title="ORBIX logo">
        <p>
          The ORBIX logo and wordmark were created by Deep Patel with the help
          of AI image generation tools. They identify this project and are not
          licensed for reuse.{" "}
          {DRAWINGS_IN_USE
            ? "Every photograph and vehicle drawing on ORBIX is credited above."
            : "Every photograph on ORBIX is credited above."}
        </p>
      </LegalSection>

      <LegalSection id="fonts" title="Fonts">
        <p>
          Text and labels are set in IBM Plex Sans, designed for IBM. Figures,
          units, equations and code names are set in B612 Mono, designed by
          Intactile Design with Airbus for cockpit displays. Both are licensed
          under the{" "}
          <a href="https://openfontlicense.org/open-font-license-official-text/">
            SIL Open Font License 1.1
          </a>
          . The font files are served from the ORBIX site itself.
        </p>
      </LegalSection>

      <LegalSection id="icons" title="Icons">
        <p>
          Interface icons come from <a href="https://lucide.dev">Lucide</a>,
          licensed under the{" "}
          <a href="https://lucide.dev/license">ISC License</a>.
        </p>
      </LegalSection>

      <LegalSection id="software" title="Software">
        <p>
          ORBIX is built with the following open-source software. The ORBIX code
          itself is released under the MIT License.
        </p>
        <DataTable
          caption="Open-source software used by ORBIX"
          columns={softwareColumns}
          getRowKey={(item) => item.name}
          rows={software}
        />
      </LegalSection>

      <LegalSection id="vehicle-data" title="Vehicle data">
        <p>
          Vehicle specifications are compiled from publicly available
          information. The ORBIX data files do not yet record a citation for
          each individual value. See{" "}
          <Link href="/about#sources">how values are sourced</Link> for more
          detail.
        </p>
      </LegalSection>

      <LegalSection id="trademarks" title="Trademarks and non-affiliation">
        <p>
          Vehicle and company names are trademarks of their respective owners
          and are used only to identify the vehicles described.
        </p>
        <p>
          ORBIX is not affiliated with or endorsed by NASA, the U.S. Air Force,
          SpaceX, Lockheed Martin, Boeing, Northrop Grumman or any other
          manufacturer, operator or agency. The use of NASA or U.S. military
          imagery does not imply endorsement.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
