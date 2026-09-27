import Link from "next/link";

import { Container } from "@/components/layout/container";
import { SiteLogo } from "@/components/layout/site-logo";
import { legalNavigationItems, navigationItems } from "@/config/navigation";
import { siteLegal } from "@/config/site-legal";

/**
 * Plain footer (spec 10). Row one: wordmark, one-sentence description, and
 * the "Platform" and "About" link groups. Row two: the operator and contact
 * line, then the copyright and educational-use notice.
 *
 * The contact address comes from `src/config/site-legal.ts` so it can be
 * replaced in one place.
 */
export function SiteFooter() {
  return (
    <footer className="orbix-site-footer">
      <Container className="py-12">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-6">
            <SiteLogo />
            <p className="mt-4 max-w-[50ch] text-sm leading-6 text-text-secondary">
              An educational site about aircraft, launch vehicles and the
              engineering behind them.
            </p>
          </div>

          <nav aria-label="Footer navigation" className="lg:col-span-3">
            <h2 className="orbix-footer-heading">Platform</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {navigationItems.slice(1).map((item) => (
                <li key={item.href}>
                  <Link className="orbix-footer-link" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="About and legal" className="lg:col-span-3">
            <h2 className="orbix-footer-heading">About</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {legalNavigationItems.map((item) => (
                <li key={item.href}>
                  <Link className="orbix-footer-link" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-sm leading-6 text-muted">
          <p>
            Operated by {siteLegal.operatorName} · Massachusetts, USA · Contact:{" "}
            <a
              className="orbix-footer-link underline underline-offset-2"
              href={`mailto:${siteLegal.contactEmail}`}
            >
              {siteLegal.contactEmail}
            </a>
          </p>
          <p>
            © {new Date().getFullYear()} {siteLegal.operatorName}. Educational
            use only. Not for operational or certification use.
          </p>
        </div>
      </Container>
    </footer>
  );
}
