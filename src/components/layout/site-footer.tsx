import Link from "next/link";

import { Container } from "@/components/layout/container";
import { SiteLogo } from "@/components/layout/site-logo";
import { legalNavigationItems, navigationItems } from "@/config/navigation";
import { siteLegal } from "@/config/site-legal";

/**
 * Site footer (spec 8), lighter than the header and never heavier than a
 * hero. Set in the sans throughout; mono is for figures and labels only.
 *
 * 1. The logo and a one-line description.
 * 2. A hairline rule, then the site sections at 14px (44px rows) and the
 *    about and legal pages at 13px in the muted colour (36px rows).
 * 3. The operator and contact line, then the copyright with the
 *    educational-use notice.
 *
 * The DOM order is the same at every width and no CSS `order` is used, so
 * the keyboard reaches the links in the order they are shown. Below 40rem
 * each nav is a two-column grid, 24px apart. From 40rem the two navs share
 * one wrapping row, site sections at the left and about and legal at the
 * right; when the row is too narrow (below about 70rem) the about and
 * legal links drop to their own line, left-aligned. From 80rem the
 * copyright sits at the right of the operator line when it fits. The
 * contact address comes from `src/config/site-legal.ts`.
 */
export function SiteFooter() {
  const siteLinks = navigationItems.slice(1);

  return (
    <footer className="orbix-site-footer">
      <Container className="py-10 sm:py-12">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-6">
          <SiteLogo />
          <p className="text-sm leading-6 text-text-secondary">
            An educational site about aircraft, launch vehicles and the
            engineering behind them.
          </p>
        </div>

        <div className="orbix-footer-navs mt-6 border-t border-border pt-4">
          <nav aria-label="Footer navigation">
            <ul className="orbix-footer-links">
              {siteLinks.map((item) => (
                <li key={item.href}>
                  <Link className="orbix-footer-link" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="About and legal">
            <ul className="orbix-footer-links orbix-footer-links--secondary">
              {legalNavigationItems.map((item) => (
                <li key={item.href}>
                  <Link
                    className="orbix-footer-link orbix-footer-link--secondary"
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="orbix-footer-base">
          <p>
            Operated by {siteLegal.operatorName}, Massachusetts, USA. Contact{" "}
            <a href={`mailto:${siteLegal.contactEmail}`}>
              {siteLegal.contactEmail}
            </a>
          </p>
          <p>
            © {new Date().getFullYear()} {siteLegal.operatorName}. Educational
            use only, not for operational or certification use.
          </p>
        </div>
      </Container>
    </footer>
  );
}
