import Image from "next/image";
import Link from "next/link";

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

const NOT_RECORDED = "Not yet recorded";

function Missing() {
  return <span className="text-muted">{NOT_RECORDED}</span>;
}

function CreditRow({ item }: { readonly item: ImageCredit }) {
  return (
    <tr>
      <th scope="row">
        <div className="flex min-w-40 flex-col gap-2">
          <Image
            alt={item.alt}
            className="aspect-video h-auto w-24 rounded-sm border border-border object-cover"
            height={54}
            sizes="96px"
            src={item.src}
            width={96}
          />
          <span>{item.vehicleName}</span>
        </div>
      </th>
      <td className="min-w-40">{item.credit ?? <Missing />}</td>
      <td className="min-w-32">
        {item.license === null ? (
          <Missing />
        ) : item.licenseUrl === null ? (
          item.license
        ) : (
          <a href={item.licenseUrl}>
            {item.license}
            <span className="sr-only"> (licence text)</span>
          </a>
        )}
      </td>
      <td className="min-w-40">
        {item.sourceUrl === null ? (
          <Missing />
        ) : (
          <a href={item.sourceUrl}>
            {describeSourceSite(item.sourceUrl)}
            <span className="sr-only">
              {" "}
              (source of the {item.vehicleName} photograph)
            </span>
          </a>
        )}
        <p className="mt-1 text-muted">
          Changes: {item.modifications ?? NOT_RECORDED}
        </p>
      </td>
    </tr>
  );
}

function CreditTable({
  group,
  items,
}: {
  readonly group: ImageCreditGroup;
  readonly items: readonly ImageCredit[];
}) {
  const label = `${group} photograph credits`;

  return (
    <div
      aria-label={label}
      className="orbix-table-wrap relative"
      role="region"
      tabIndex={0}
    >
      <table className="orbix-table">
        <caption className="sr-only">{label}</caption>
        <thead>
          <tr>
            <th scope="col">Vehicle</th>
            <th scope="col">Credit</th>
            <th scope="col">Licence</th>
            <th scope="col">Source</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <CreditRow item={item} key={item.vehicleId} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

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
      crumb="Image credits"
      lead="Who made the photographs, fonts, icons and software that ORBIX uses, and the licence each one is used under."
      title="Image credits and licences"
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
            <div className="space-y-3" key={group}>
              <h3>{group}</h3>
              <CreditTable group={group} items={items} />
            </div>
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
          Text is set in IBM Plex Sans and IBM Plex Mono, designed for IBM and
          licensed under the{" "}
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
        <div
          aria-label="Open-source software used by ORBIX"
          className="orbix-table-wrap relative"
          role="region"
          tabIndex={0}
        >
          <table className="orbix-table">
            <caption className="sr-only">
              Open-source software used by ORBIX
            </caption>
            <thead>
              <tr>
                <th scope="col">Project</th>
                <th scope="col">Used for</th>
                <th scope="col">Licence</th>
              </tr>
            </thead>
            <tbody>
              {software.map((item) => (
                <tr key={item.name}>
                  <th scope="row">{item.name}</th>
                  <td>{item.use}</td>
                  <td>
                    <a href={item.href}>
                      {item.license}
                      <span className="sr-only"> for {item.name}</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
