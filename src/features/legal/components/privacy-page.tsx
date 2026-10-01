import Link from "next/link";

import { siteLegal } from "@/config/site-legal";
import { ContactEmailLink } from "@/features/legal/components/contact-email-link";
import {
  LegalPage,
  type LegalTocItem,
} from "@/features/legal/components/legal-page";
import { LegalSection } from "@/features/legal/components/legal-section";
import { StorageKey } from "@/features/legal/components/storage-key";
import { withoutFinalStop } from "@/features/legal/lib/without-final-stop";
import { SCENARIO_LIBRARY_STORAGE_KEY } from "@/features/engineering-lab/missions/scenario-library";

const toc: readonly LegalTocItem[] = [
  { id: "summary", title: "Summary" },
  { id: "operator", title: "Who runs ORBIX" },
  { id: "what-orbix-collects", title: "What ORBIX collects" },
  { id: "hosting", title: "What the host processes" },
  { id: "on-your-device", title: "Data stored on your device" },
  { id: "email", title: "Email you send" },
  { id: "no-sale", title: "No sale or sharing" },
  { id: "signals", title: "Global Privacy Control and Do Not Track" },
  { id: "children", title: "Children" },
  { id: "massachusetts", title: "Massachusetts residents" },
  { id: "security", title: "Security" },
  { id: "changes", title: "Changes to this policy" },
  { id: "contact", title: "Contact" },
];

const usesGmail = siteLegal.contactEmail.toLowerCase().endsWith("@gmail.com");

export function PrivacyPage() {
  return (
    <LegalPage
      lead="What information ORBIX handles, where it goes, and how to remove it. The short version: ORBIX itself collects nothing about you."
      title="Privacy policy"
      toc={toc}
    >
      <LegalSection id="summary" title="Summary">
        <ul>
          <li>
            ORBIX has no accounts, no sign-in, and no forms that send data.
          </li>
          <li>ORBIX uses no analytics, no advertising and no tracking.</li>
          <li>ORBIX sets no cookies.</li>
          <li>
            The hosting provider keeps standard request logs, such as IP
            addresses, to deliver and protect the site.
          </li>
          <li>
            Mission scenarios you choose to save in the Engineering Lab stay in
            your own browser and are never sent to ORBIX.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="operator" title="Who runs ORBIX">
        <p>
          ORBIX is a free educational website run by {siteLegal.operatorName},
          an individual based in Massachusetts, United States. It is not run by
          a company. In this policy, &ldquo;ORBIX&rdquo;, &ldquo;I&rdquo; and
          &ldquo;me&rdquo; mean {siteLegal.operatorName}. You can reach me at{" "}
          <ContactEmailLink />.
        </p>
      </LegalSection>

      <LegalSection id="what-orbix-collects" title="What ORBIX collects">
        <p>
          Nothing. The site&apos;s own code does not collect, store or receive
          personal information:
        </p>
        <ul>
          <li>There are no user accounts, logins or profiles.</li>
          <li>
            No analytics or usage-measurement software is installed, and no
            advertising or social media scripts are loaded.
          </li>
          <li>ORBIX does not set cookies.</li>
          <li>
            The calculators and comparison tools run entirely in your browser.
            The numbers you type are not sent to any server.
          </li>
          <li>
            Fonts (IBM Plex Sans and B612 Mono) and images are served from the
            ORBIX site itself, so loading a page does not contact a font or
            image service run by someone else.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="hosting" title="What the host processes">
        <p>
          ORBIX is hosted by {withoutFinalStop(siteLegal.hostName)}. Like any
          web server, Vercel automatically receives technical information with
          each request your browser makes, including your IP address, browser
          and operating system (the user agent), the page requested, the
          referring page, and the date and time. Vercel uses this to deliver
          pages, cache them, and protect the site against abuse and attacks.
        </p>
        <p>
          ORBIX does not add anything to these logs and does not use them to
          identify or profile visitors. Vercel handles this information under
          its own policy:{" "}
          <a href={siteLegal.hostPrivacyUrl}>Vercel privacy policy</a>.
        </p>
      </LegalSection>

      <LegalSection id="on-your-device" title="Data stored on your device">
        <p>
          The Mission Scenario Library in the{" "}
          <Link href="/engineering-lab#scenario-library">Engineering Lab</Link>{" "}
          lets you save mission scenarios for later. When you press save, the
          scenario is written to your browser&apos;s local storage under the key{" "}
          <StorageKey value={SCENARIO_LIBRARY_STORAGE_KEY} />. Each saved
          scenario holds:
        </p>
        <ul>
          <li>the scenario name and description you entered;</li>
          <li>its mission category;</li>
          <li>
            the mission profile inputs (orbits, vehicle and reentry values);
          </li>
          <li>a random identifier and the times it was created and updated.</li>
        </ul>
        <p>
          This data never leaves your device and ORBIX cannot see it. Nothing is
          saved unless you choose to save a scenario. No other local storage,
          session storage or similar browser storage is used.
        </p>
        <p>To remove saved scenarios, either:</p>
        <ul>
          <li>
            use the Delete button next to each scenario in the Mission Scenario
            Library; or
          </li>
          <li>
            clear site data for this website in your browser settings (often
            listed as &ldquo;Cookies and site data&rdquo;), which removes every
            saved scenario at once.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="email" title="Email you send">
        <p>
          If you email <ContactEmailLink />, I receive your email address, your
          name if your email shows it, and whatever you write. I use this only
          to read and reply to your message. I do not add you to a mailing list,
          and I do not share or sell your message or address.{" "}
        </p>
        {usesGmail ? (
          <p>
            The contact address is a Gmail account, so messages are also handled
            by Google under{" "}
            <a href="https://policies.google.com/privacy">
              Google&apos;s privacy policy
            </a>
            .
          </p>
        ) : null}
      </LegalSection>

      <LegalSection
        id="no-sale"
        title="No sale or sharing of personal information"
      >
        <p>
          ORBIX does not sell personal information and does not share it for
          cross-context behavioral advertising, as those terms are used in the
          California Consumer Privacy Act as amended by the California Privacy
          Rights Act (CCPA/CPRA). ORBIX does not collect personal information
          for any of those purposes, so there is nothing to opt out of. If you
          live in California or another state with a similar law and want to ask
          about information held about you, which will normally be limited to an
          email you sent, write to <ContactEmailLink />.
        </p>
      </LegalSection>

      <LegalSection
        id="signals"
        title="Global Privacy Control and Do Not Track"
      >
        <p>
          Your browser may send a Global Privacy Control or Do Not Track signal.
          ORBIX does no tracking and sells or shares no personal information, so
          there is nothing for these signals to switch off. The site behaves the
          same whether or not they are sent.
        </p>
      </LegalSection>

      <LegalSection id="children" title="Children">
        <p>
          ORBIX is an educational site for a general audience and is not
          directed at children under 13. It does not knowingly collect personal
          information from anyone, including children under 13, as defined by
          the Children&apos;s Online Privacy Protection Act (COPPA). If a child
          under 13 has emailed me, a parent or guardian can ask me to delete
          that message at <ContactEmailLink />.
        </p>
      </LegalSection>

      <LegalSection id="massachusetts" title="Massachusetts residents">
        <p>
          ORBIX does not collect or store the kinds of personal information
          covered by the Massachusetts data security regulation, 201 CMR 17.00
          (a name combined with a Social Security number, driver&apos;s license
          or state ID number, or a financial account or card number).
        </p>
      </LegalSection>

      <LegalSection id="security" title="Security">
        <p>
          The site is served only over HTTPS. It sends security headers that
          stop other sites from framing its pages and that block access to your
          camera, microphone and location. Because ORBIX holds no personal
          information about visitors, there is no visitor database to lose. No
          system is perfectly secure; if you find a security problem, please
          email <ContactEmailLink />.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="Changes to this policy">
        <p>
          If what ORBIX collects changes, for example if analytics were ever
          added, this page will be updated before the change goes live, and the
          &ldquo;Last updated&rdquo; date at the top will change.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact">
        <p>
          Questions about this policy: <ContactEmailLink />.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
