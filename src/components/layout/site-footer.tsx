import Link from "next/link";

import { Container } from "@/components/layout/container";
import { SiteLogo } from "@/components/layout/site-logo";
import { navigationItems } from "@/config/navigation";
import { siteConfig } from "@/config/site";

/**
 * The footer is deliberately division-NEUTRAL — it is where ORBIX speaks as
 * one platform rather than as the section you happen to be in.
 *
 * Changes from the previous version are presentational only. Every
 * destination is preserved (the same `navigationItems.slice(1)` set), the
 * `Footer navigation` landmark label is unchanged, and no link was added or
 * removed.
 */
export function SiteFooter() {
  return (
    <footer className="orbix-site-footer relative">
      <Container className="flex flex-col gap-12 py-14 lg:flex-row lg:justify-between lg:gap-16 lg:py-16">
        <div className="max-w-sm">
          <SiteLogo />
          <p className="mt-5 text-sm leading-7 text-muted">
            {siteConfig.tagline}. Aerospace education through exploration,
            analysis, and guided practice.
          </p>
        </div>

        <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
          <nav aria-label="Footer navigation">
            {/* A labelled group rather than a bare row of links: the footer
                now states what the list is instead of repeating the header
                without context. */}
            <h2 className="orbix-footer-heading">Platform</h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              {navigationItems.slice(1).map((item) => (
                <li key={item.href}>
                  <Link className="orbix-footer-link" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="max-w-[16rem]">
            <h2 className="orbix-footer-heading">Scope</h2>
            {/* Previously set in uppercase letter-spaced monospace with a
                decorative `//` separator. It is a plain sentence, so it now
                reads as one. */}
            <p className="mt-4 text-sm leading-6 text-muted">
              An educational engineering platform. Not for operational use.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
