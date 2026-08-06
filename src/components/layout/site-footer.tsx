import Link from "next/link";

import { Container } from "@/components/layout/container";
import { SiteLogo } from "@/components/layout/site-logo";
import { navigationItems } from "@/config/navigation";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="orbix-site-footer relative overflow-hidden border-t border-accent/15">
      <div
        className="orbix-grid pointer-events-none absolute inset-0 opacity-35"
        aria-hidden="true"
      />
      <Container className="flex flex-col gap-10 py-14 sm:flex-row sm:items-end sm:justify-between lg:py-16">
        <div>
          <SiteLogo />
          <p className="mt-5 max-w-md text-sm leading-7 text-muted">
            {siteConfig.tagline}. Aerospace education through exploration,
            analysis, and guided practice.
          </p>
        </div>
        <div className="sm:text-right">
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 sm:justify-end">
              {navigationItems.slice(1).map((item) => (
                <li key={item.href}>
                  <Link
                    className="rounded-sm text-sm text-muted transition-colors hover:text-accent"
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="mt-6 font-mono text-[0.65rem] tracking-[0.11em] text-muted uppercase">
            Educational engineering platform // Not for operational use
          </p>
        </div>
      </Container>
    </footer>
  );
}
