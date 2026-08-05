import Link from "next/link";

import { Container } from "@/components/layout/container";
import { SiteLogo } from "@/components/layout/site-logo";
import { navigationItems } from "@/config/navigation";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 bg-background/70">
      <Container className="flex flex-col gap-8 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <SiteLogo />
          <p className="mt-4 max-w-md text-sm leading-6 text-muted">
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
                    className="text-sm text-muted transition-colors hover:text-accent"
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="mt-5 font-mono text-xs text-muted">
            Built for learning, not operational use.
          </p>
        </div>
      </Container>
    </footer>
  );
}
