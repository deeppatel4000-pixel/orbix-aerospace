import Link from "next/link";

import { siteLegal } from "@/config/site-legal";
import { ContactEmailLink } from "@/features/legal/components/contact-email-link";
import {
  LegalPage,
  type LegalTocItem,
} from "@/features/legal/components/legal-page";
import { LegalSection } from "@/features/legal/components/legal-section";

const toc: readonly LegalTocItem[] = [
  { id: "about-these-terms", title: "About these terms" },
  { id: "the-service", title: "A free educational service" },
  { id: "educational-use", title: "Educational use only" },
  { id: "no-warranty", title: "No warranty" },
  { id: "liability", title: "Limitation of liability" },
  { id: "acceptable-use", title: "Acceptable use" },
  { id: "intellectual-property", title: "Intellectual property" },
  { id: "trademarks", title: "Trademarks and non-affiliation" },
  { id: "accuracy", title: "Accuracy of data" },
  { id: "external-links", title: "External links" },
  { id: "governing-law", title: "Governing law" },
  { id: "changes", title: "Changes to these terms" },
  { id: "contact", title: "Contact" },
];

export function TermsPage() {
  return (
    <LegalPage
      lead="The conditions for using ORBIX, including what the calculators are and are not for."
      title="Terms of use"
      toc={toc}
    >
      <LegalSection id="about-these-terms" title="About these terms">
        <p>
          ORBIX is run by {siteLegal.operatorName}, an individual in
          Massachusetts, United States. By using the site you agree to these
          terms. If you do not agree, please do not use the site. The{" "}
          <Link href="/privacy">privacy policy</Link> explains what information
          is handled when you visit.
        </p>
      </LegalSection>

      <LegalSection id="the-service" title="A free educational service">
        <p>
          ORBIX is free to use. There are no fees, subscriptions, purchases or
          accounts. Nothing is sold on the site. The site may change, pause or
          stop at any time without notice.
        </p>
      </LegalSection>

      <LegalSection id="educational-use" title="Educational use only">
        <p>
          ORBIX is for learning. The Engineering Lab calculators use simplified
          physical models, for example idealized two-body orbits, a standard
          atmosphere and textbook flow relations. Their results can differ a
          great deal from the behavior of real vehicles.
        </p>
        <p>
          Do not use ORBIX for operational, flight, mission planning, safety,
          design or certification decisions, or for any purpose where an error
          could cause injury, loss or damage. Use qualified engineers, approved
          tools and official documentation for those.
        </p>
      </LegalSection>

      <LegalSection id="no-warranty" title="No warranty">
        <p>
          ORBIX is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;,
          without warranties of any kind, express or implied, including
          warranties of accuracy, completeness, merchantability, fitness for a
          particular purpose and non-infringement. There is no promise that the
          site will be available, error-free or free of harmful components.
        </p>
      </LegalSection>

      <LegalSection id="liability" title="Limitation of liability">
        <p>
          To the fullest extent permitted by law, {siteLegal.operatorName} is
          not liable for any direct, indirect, incidental, consequential,
          special or punitive damages, or any loss of data, profits or
          opportunity, arising from your use of ORBIX or your reliance on
          anything on it, even if told such loss was possible. Some
          jurisdictions do not allow some of these limits, so they apply to you
          only as far as the law allows.
        </p>
      </LegalSection>

      <LegalSection id="acceptable-use" title="Acceptable use">
        <p>When using ORBIX, please do not:</p>
        <ul>
          <li>
            attempt to break into, overload or disrupt the site or its host;
          </li>
          <li>
            scrape the site at a rate that degrades it for other people, or
            probe it for vulnerabilities without first reporting what you find;
          </li>
          <li>
            present ORBIX results as certified, official or professionally
            reviewed engineering data;
          </li>
          <li>use the site in a way that breaks the law.</li>
        </ul>
      </LegalSection>

      <LegalSection id="intellectual-property" title="Intellectual property">
        <p>
          The ORBIX source code is released under the MIT License. The code and
          the licence text are published at{" "}
          <a href={siteLegal.sourceCodeUrl}>the ORBIX repository on GitHub</a>.
        </p>
        <p>
          Vehicle photographs are not covered by the MIT License. Each remains
          under its own terms, set by its author or agency, as listed on the{" "}
          <Link href="/credits">image credits page</Link>. Fonts, icons and
          software libraries are also used under their own licences, listed on
          the same page.
        </p>
        <p>
          The ORBIX name, logo and wordmark identify this project and are not
          licensed for reuse, including under the MIT License. Please do not use
          them in a way that suggests your work is ORBIX or is endorsed by it.
        </p>
      </LegalSection>

      <LegalSection id="trademarks" title="Trademarks and non-affiliation">
        <p>
          Aircraft, launch vehicle and spacecraft names, and the names of
          manufacturers and agencies, including NASA, the U.S. Air Force,
          SpaceX, Lockheed Martin, Boeing and Northrop Grumman, are trademarks
          or names of their respective owners. They are used only to identify
          the vehicles and organizations described.
        </p>
        <p>
          ORBIX is an independent educational project. It is not affiliated
          with, sponsored by or endorsed by any of these organizations, or by
          any other manufacturer, operator or government agency.
        </p>
      </LegalSection>

      <LegalSection id="accuracy" title="Accuracy of data">
        <p>
          Vehicle specifications are compiled from publicly available
          information. Published figures vary between sources and change over
          time, and the data on ORBIX may contain errors or be out of date. If
          you find a mistake, please email <ContactEmailLink /> with the page,
          the value, and a source for the correct figure if you have one.
        </p>
      </LegalSection>

      <LegalSection id="external-links" title="External links">
        <p>
          ORBIX links to other websites, such as image source pages and licence
          texts. Those sites are run by others. ORBIX does not control them and
          is not responsible for their content, availability or privacy
          practices.
        </p>
      </LegalSection>

      <LegalSection id="governing-law" title="Governing law">
        <p>
          These terms are governed by the laws of the {siteLegal.jurisdiction},
          without regard to conflict-of-law rules. Any dispute that cannot be
          settled informally will be handled by the state or federal courts
          located in Massachusetts, unless the law of the place where you live
          gives you the right to bring it elsewhere.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="Changes to these terms">
        <p>
          These terms may be updated. The &ldquo;Last updated&rdquo; date at the
          top of the page shows when they last changed. Continuing to use the
          site after a change means you accept the updated terms.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact">
        <p>
          Questions about these terms: <ContactEmailLink />.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
