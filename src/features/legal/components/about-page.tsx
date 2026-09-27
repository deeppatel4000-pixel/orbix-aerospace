import Link from "next/link";

import { siteLegal } from "@/config/site-legal";
import { listAircraft } from "@/features/aircraft/data";
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

function countLabel(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function AboutPage() {
  const aircraftCount = listAircraft().length;
  const rocketCount = listRockets().length;

  return (
    <LegalPage
      crumb="About"
      lead="ORBIX is an educational website about aircraft, launch vehicles and the engineering behind them, built as a student project."
      title="About ORBIX"
      toc={toc}
    >
      <LegalSection id="what-orbix-is" title="What ORBIX is">
        <p>
          ORBIX is a free learning resource. It is written and built by{" "}
          {siteLegal.operatorName}, a student, to explain aerospace engineering
          through real vehicles. The site has five parts:
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
          ORBIX is run by {siteLegal.operatorName}, an individual in
          Massachusetts, United States. The source code is public on{" "}
          <a href={siteLegal.sourceCodeUrl}>GitHub</a> under the MIT License.
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
