import Link from "next/link";

import { siteLegal } from "@/config/site-legal";
import { ContactEmailLink } from "@/features/legal/components/contact-email-link";
import {
  LegalPage,
  type LegalTocItem,
} from "@/features/legal/components/legal-page";
import { LegalSection } from "@/features/legal/components/legal-section";
import { withoutFinalStop } from "@/features/legal/lib/without-final-stop";

const toc: readonly LegalTocItem[] = [
  { id: "no-cookies", title: "ORBIX sets no cookies" },
  { id: "hosting", title: "The hosting provider" },
  { id: "local-storage", title: "Local storage" },
  { id: "contact", title: "Contact" },
];

export function CookiesPage() {
  return (
    <LegalPage
      lead="ORBIX does not use cookies or any other browser storage."
      title="Cookies and local storage"
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
          ORBIX does not use it. Nothing is written to local storage, session
          storage or any other browser storage, so there is nothing to clear.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact">
        <p>
          Questions about cookies or storage: <ContactEmailLink />.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
