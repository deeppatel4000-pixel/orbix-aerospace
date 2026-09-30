import Image from "next/image";
import Link from "next/link";

import { licenceLabel } from "@/components/ui/photo-hero";
import { siteLegal } from "@/config/site-legal";
import { getAircraftVisual, listAircraft } from "@/features/aircraft/data";
import { ContactEmailLink } from "@/features/legal/components/contact-email-link";
import {
  LegalPage,
  type LegalTocItem,
} from "@/features/legal/components/legal-page";
import { LegalSection } from "@/features/legal/components/legal-section";
import { listRockets } from "@/features/rockets/data";

const toc: readonly LegalTocItem[] = [
  { id: "what-orbix-is", title: "What ORBIX is" },
  { id: "what-orbix-is-not", title: "What ORBIX is not" },
  { id: "sources", title: "How values are sourced" },
  { id: "who", title: "Who runs it" },
  { id: "contact", title: "Contact" },
];

/** Visual "/" between credit items, not read out. */
function Separator() {
  return (
    <span aria-hidden="true" className="text-muted">
      /
    </span>
  );
}

const PLATE_AIRCRAFT_ID = "f-15-eagle";

/**
 * The page's one photograph: a framed plate at the photo's native
 * 1920:1345 ratio, so the whole aircraft shows, on the wide track with
 * the credit, licence and source underneath in B612 Mono (spec 8). It has
 * no registration marks: those are for hero plates below 48rem and
 * showcase diagrams (spec 6). Renders nothing if the visual record is
 * missing.
 */
function AboutPlate() {
  const aircraft = listAircraft().find((item) => item.id === PLATE_AIRCRAFT_ID);
  const visual = getAircraftVisual(PLATE_AIRCRAFT_ID);
  if (!aircraft || !visual) return null;

  const licence = licenceLabel(visual.license);

  return (
    <figure className="mt-6! mb-0">
      <div className="relative">
        <div className="aspect-[1920/1345] overflow-hidden rounded-md border border-border-subtle">
          <Image
            alt={visual.alt}
            className="h-full w-full object-cover saturate-[0.85]"
            height={visual.height}
            sizes="(min-width: 80rem) 54rem, (min-width: 40rem) 90vw, 100vw"
            src={visual.src}
            style={{ objectPosition: visual.objectPosition }}
            width={visual.width}
          />
        </div>
      </div>
      <figcaption className="orbix-micro mt-4 text-muted [&_a]:text-text-secondary [&_a]:decoration-border-control [&_a]:underline-offset-3 [&_a:hover]:text-text-primary">
        {aircraft.name}. Photo: {visual.credit} <Separator />{" "}
        {visual.licenseUrl ? (
          <a
            aria-label={licence.isShortened ? licence.full : undefined}
            href={visual.licenseUrl}
            rel="license"
          >
            {licence.short}
          </a>
        ) : (
          licence.full
        )}{" "}
        <Separator /> <a href={visual.sourceUrl}>Source file</a>
      </figcaption>
    </figure>
  );
}

function countLabel(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function AboutPage() {
  const aircraftCount = listAircraft().length;
  const rocketCount = listRockets().length;

  return (
    <LegalPage
      eyebrow="The project"
      lead={`ORBIX is an educational website about aircraft, launch vehicles and the engineering behind them. It is a personal project created by ${siteLegal.operatorName}, a high school student who plans to study aerospace engineering.`}
      title="About"
      titleAccent="ORBIX"
      toc={toc}
    >
      <LegalSection id="what-orbix-is" title="What ORBIX is">
        <p>
          ORBIX is a free learning resource that explains aerospace engineering
          through real vehicles. {siteLegal.operatorName} came up with the idea,
          researched the content and directed the build; his account of how he
          made it, including how he used AI coding assistants, is on{" "}
          <Link href="/build-log">How I built ORBIX</Link>. The site has five
          parts:
        </p>
        <ul>
          <li>
            <Link href="/aircraft">Aircraft</Link> and{" "}
            <Link href="/rockets">Rockets</Link>: reference records for{" "}
            {countLabel(aircraftCount, "aircraft", "aircraft")} and{" "}
            {countLabel(rocketCount, "launch vehicle", "launch vehicles")}, with
            specifications, propulsion details and engineering notes.
          </li>
          <li>
            <Link href="/compare">Compare</Link>: side-by-side tables of
            vehicles of the same type.
          </li>
          <li>
            <Link href="/engineering-lab">Engineering Lab</Link>: calculators
            for orbital mechanics, flight and atmospheric entry that run in your
            browser.
          </li>
          <li>
            <Link href="/learn">Learn</Link>: short pathways that connect the
            physics to the calculators that use it.
          </li>
          <li>
            <Link href="/showcase">Showcase</Link>: how the site itself is
            built.
          </li>
        </ul>
        <AboutPlate />
      </LegalSection>

      <LegalSection id="what-orbix-is-not" title="What ORBIX is not">
        <ul>
          <li>
            It is not an official source. For authoritative figures, use the
            manufacturer, operator or agency that publishes them.
          </li>
          <li>
            It is not an engineering tool. The calculators use simplified models
            and must not be used for operational, flight, safety or
            certification decisions. See the{" "}
            <Link href="/terms#educational-use">terms of use</Link>.
          </li>
          <li>
            It is not affiliated with or endorsed by NASA, any armed service, or
            any vehicle manufacturer.
          </li>
          <li>
            It is not a business. There is nothing to buy, no advertising and no
            account to create.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="sources" title="How values are sourced">
        <p>
          Vehicle specifications are compiled from publicly available
          information about each vehicle. Published figures often differ between
          sources, depend on the variant, or are estimates, which is why many
          values on ORBIX carry a qualifier such as &ldquo;approximate&rdquo;,
          &ldquo;nominal&rdquo; or &ldquo;minimum&rdquo;.
        </p>
        <p>
          The data files do not yet record a citation for each individual value,
          so ORBIX does not currently show a source next to every figure. Treat
          the numbers as a starting point for learning and check anything
          important against the original publisher.
        </p>
        <p>
          Engineering Lab results are calculated in your browser from the values
          you enter, using standard textbook equations. They are not looked up
          from real mission data.
        </p>
        <p>
          Photographs are credited to their authors, with their licences, on the{" "}
          <Link href="/credits">image credits page</Link>.
        </p>
        <p>
          If you find an error, please email <ContactEmailLink /> with the page,
          the value, and a source for the correct figure if you have one.
        </p>
      </LegalSection>

      <LegalSection id="who" title="Who runs it">
        <p>
          ORBIX is a personal project created and run by{" "}
          {siteLegal.operatorName}, a high school student in Massachusetts,
          United States, who plans to study aerospace engineering. The source
          code is public on <a href={siteLegal.sourceCodeUrl}>GitHub</a> under
          the MIT License.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact">
        <p>
          For questions, corrections or accessibility problems, email{" "}
          <ContactEmailLink />. See also the{" "}
          <Link href="/privacy">privacy policy</Link> and the{" "}
          <Link href="/accessibility">accessibility statement</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
