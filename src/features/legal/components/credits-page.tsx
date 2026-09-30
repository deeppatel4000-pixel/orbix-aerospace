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
import { cn } from "@/lib/cn";

const toc: readonly LegalTocItem[] = [
  { id: "photographs", title: "Vehicle photographs" },
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

const NOT_RECORDED = "Not yet recorded";

function Missing() {
  return <span className="text-muted">{NOT_RECORDED}</span>;
}

const creditColumns: readonly DataTableColumn<ImageCredit>[] = [
  {
    cell: (item) => {
      const portrait = item.group === "Launch vehicles";

      return (
        <span className="flex min-w-20 flex-col gap-2 sm:min-w-32 md:min-w-0 lg:flex-row lg:items-start lg:gap-3">
          <span className="lg:order-last">{item.vehicleName}</span>
          {/* One 112px slot for every thumbnail from 64rem, so aircraft and
              launch vehicle names share one left edge across both tables.
              Aircraft frames fill the slot; portrait launch vehicle frames sit
              centred in it so they line up optically under the aircraft
              frames. Below 40rem the frames shrink (64x40, 45x60) so the
              pinned column leaves room for Credit, Licence and Source.
              loading="eager": these are small thumbnails (1 to 3 KB each),
              so fetching them with the page costs little. */}
          <span
            className={cn(
              "flex shrink-0 justify-start lg:w-[112px]",
              portrait && "lg:justify-center",
            )}
          >
            <Image
              alt={item.alt}
              loading="eager"
              className={cn(
                "shrink-0 rounded-sm border border-border",
                portrait
                  ? "h-[60px] w-[45px] bg-page object-contain object-bottom sm:h-[72px] sm:w-[54px]"
                  : "h-10 w-16 object-cover sm:h-[70px] sm:w-[112px]",
              )}
              height={portrait ? 72 : 70}
              sizes={
                portrait
                  ? "(min-width: 40rem) 54px, 45px"
                  : "(min-width: 40rem) 112px, 64px"
              }
              src={item.src}
              style={
                portrait
                  ? undefined
                  : { objectPosition: item.cardObjectPosition }
              }
              width={portrait ? 54 : 112}
            />
          </span>
        </span>
      );
    },
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
            <span className="sr-only"> (licence text)</span>
          </a>
        )}
      </span>
    ),
    header: "Licence",
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
        <span className="mt-1 block text-muted">
          Changes: {item.modifications ?? NOT_RECORDED}
        </span>
      </span>
    ),
    header: "Source",
    key: "source",
  },
];

/**
 * Shared column widths from 48rem (Vehicle 30%, Credit 26%, Licence 21%,
 * Source 23%), so the aircraft and launch vehicle tables line up when
 * stacked, like the pages of one catalogue.
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
    header: "Licence",
    key: "licence",
  },
];

export function CreditsPage() {
  const credits = listImageCredits();
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
      eyebrow="The project"
      lead="Who made the photographs, fonts, icons and software that ORBIX uses, and the licence each one is used under."
      title="Image credits"
      titleAccent="and licences"
      toc={toc}
    >
      <LegalSection id="photographs" title="Vehicle photographs">
        <p>
          Each vehicle photograph belongs to its author or agency and stays
          under its own licence. The MIT License that covers the ORBIX code does
          not apply to these images.
        </p>
        {hasGaps ? (
          <p>
            Where a field reads &ldquo;{NOT_RECORDED}&rdquo;, the credit or
            licence for that image has not yet been verified against the
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
        {credits.length === 0 ? (
          <p>No vehicle photographs are currently shown on ORBIX.</p>
        ) : null}
      </LegalSection>

      <LegalSection id="logo" title="ORBIX logo">
        <p>
          The ORBIX logo and wordmark were created by Deep Patel with the help
          of AI image generation tools. They identify this project and are not
          licensed for reuse. Every other image on ORBIX is a credited
          photograph listed above.
        </p>
      </LegalSection>

      <LegalSection id="fonts" title="Fonts">
        <p>
          Text is set in IBM Plex Sans, designed for IBM. Figures and labels are
          set in B612 Mono, designed by Intactile Design with Airbus for cockpit
          displays. Both are licensed under the{" "}
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
