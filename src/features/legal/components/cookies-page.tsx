import Link from "next/link";

import { siteLegal } from "@/config/site-legal";
import { SCENARIO_LIBRARY_STORAGE_KEY } from "@/features/engineering-lab/missions/scenario-library";
import { ContactEmailLink } from "@/features/legal/components/contact-email-link";
import {
  LegalPage,
  type LegalTocItem,
} from "@/features/legal/components/legal-page";
import { LegalSection } from "@/features/legal/components/legal-section";
import { StorageKey } from "@/features/legal/components/storage-key";
import { withoutFinalStop } from "@/features/legal/lib/without-final-stop";

const toc: readonly LegalTocItem[] = [
  { id: "no-cookies", title: "ORBIX sets no cookies" },
  { id: "hosting", title: "The hosting provider" },
  { id: "local-storage", title: "Local storage" },
  { id: "clearing", title: "How to clear stored data" },
  { id: "contact", title: "Contact" },
];

export function CookiesPage() {
  return (
    <LegalPage
      eyebrow="Policies"
      lead="ORBIX does not use cookies. This page explains the one kind of browser storage it does use, and how to clear it."
      title="Cookies and"
      titleAccent="local storage"
      toc={toc}
    >
      <LegalSection id="no-cookies" title="ORBIX sets no cookies">
        <p>
          ORBIX does not set any cookies: no analytics cookies, no advertising
          cookies, no social media cookies and no preference cookies. Because
          nothing is set that requires consent, the site does not show a cookie
          banner.
        </p>
      </LegalSection>

      <LegalSection id="hosting" title="The hosting provider">
        <p>
          ORBIX is hosted by {withoutFinalStop(siteLegal.hostName)}. Responses
          from the public ORBIX site do not include any cookies from Vercel.
          Vercel still processes standard request logs, as described in the{" "}
          <Link href="/privacy#hosting">privacy policy</Link>.
        </p>
      </LegalSection>

      <LegalSection id="local-storage" title="Local storage">
        <p>
          Local storage is a feature of your browser that lets a website keep
          data on your own device. Unlike a cookie, it is not sent to the server
          with each request.
        </p>
        <p>
          ORBIX uses it for one thing: the Mission Scenario Library in the{" "}
          <Link href="/engineering-lab#scenario-library">Engineering Lab</Link>.
          When you choose to save a mission scenario, it is stored under the key{" "}
          <StorageKey value={SCENARIO_LIBRARY_STORAGE_KEY} /> so it is still
          there next time you visit. The entry holds the scenarios&apos; names,
          descriptions, mission inputs and the times they were saved.
        </p>
        <p>
          This storage is strictly necessary for a feature you ask for. Nothing
          is written until you save a scenario, the data is not used for
          tracking, and it is never sent to ORBIX or anyone else.
        </p>
      </LegalSection>

      <LegalSection id="clearing" title="How to clear stored data">
        <ul>
          <li>
            To remove one scenario, use its Delete button in the Mission
            Scenario Library.
          </li>
          <li>
            To remove everything ORBIX has stored, clear site data for this
            website in your browser settings. In most browsers this is under
            privacy settings, as &ldquo;Cookies and site data&rdquo; or
            &ldquo;Website data&rdquo;.
          </li>
          <li>
            A private or incognito window discards local storage when you close
            it.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="contact" title="Contact">
        <p>
          Questions about cookies or storage: <ContactEmailLink />.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
