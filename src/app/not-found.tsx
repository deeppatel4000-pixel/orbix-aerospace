import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteShell } from "@/components/layout/site-shell";
import { SkipLink } from "@/components/layout/skip-link";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = {
  title: "Page not found",
};

// `app/not-found.tsx` sits outside the (site) layout, so it renders the site
// chrome itself to keep the header, main and footer on every page.
export default function NotFound() {
  return (
    <SiteShell>
      <SkipLink />
      <SiteHeader />
      <main
        className="flex-1 border-b border-border pt-12 pb-8"
        id="main-content"
      >
        <Container>
          <h1 className="orbix-h1">Page not found</h1>
          <p className="orbix-lead mt-4">
            The page you asked for does not exist or has moved.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/" variant="primary">
              Go to the home page
            </ButtonLink>
            <ButtonLink href="/aircraft" variant="secondary">
              Browse the aircraft registry
              <ArrowRight aria-hidden="true" size={16} />
            </ButtonLink>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </SiteShell>
  );
}
