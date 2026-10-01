import Link from "next/link";

import { Container } from "@/components/layout/container";
import {
  footerNavigationItems,
  legalNavigationItems,
} from "@/config/navigation";
import { siteLegal } from "@/config/site-legal";

/**
 * Site footer (spec 9): the page ground, one rule above, plain text links,
 * then the operator and contact line. Set in the sans throughout.
 *
 * 1. The operator line: what ORBIX is, who runs it and how to reach
 *    them. The header already carries the logo, so the footer does not
 *    repeat it.
 * 2. The pages outside the header (Compare, Learn, About, Image credits)
 *    at 14px (44px rows) and the legal pages at 13px in the muted ink
 *    (36px rows), separated from the operator line by space, not a second
 *    rule (v4 plan section 3).
 * 3. One line on how vehicle values are sourced (the home page's sourcing
 *    paragraph, cut to a line by v4 plan section 4), then the copyright
 *    with the educational-use notice.
 *
 * The DOM order is the same at every width and no CSS `order` is used, so
 * the keyboard reaches the links in the order they are shown. Below 40rem
 * each nav is a two-column grid, 24px apart. From 40rem the two navs share
 * one wrapping row, site sections at the left and about and legal at the
 * right. The contact address comes from `src/config/site-legal.ts`.
 */
export function SiteFooter() {
  return (
    <footer className="orbix-site-footer">
      <Container className="py-10 sm:py-12">
        <p className="orbix-footer-lead">
          <span className="orbix-footer-lead__name">ORBIX</span> is an
          educational site about aircraft, launch vehicles and the engineering
          behind them, operated by {siteLegal.operatorName}, Massachusetts, USA.
          Contact{" "}
          <a href={`mailto:${siteLegal.contactEmail}`}>
            {siteLegal.contactEmail}
          </a>
        </p>

        <div className="orbix-footer-navs mt-8">
          <nav aria-label="Footer navigation">
            <ul className="orbix-footer-links">
              {footerNavigationItems.map((item) => (
                <li key={item.href}>
                  <Link className="orbix-footer-link" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Legal">
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
            Vehicle figures come from publicly available specifications.{" "}
            <Link href="/about#sources">How values are sourced</Link>
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
