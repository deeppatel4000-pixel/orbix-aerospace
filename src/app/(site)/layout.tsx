import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteShell } from "@/components/layout/site-shell";
import { SkipLink } from "@/components/layout/skip-link";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // `SiteShell` only replaces the flex wrapper that was already here, adding
    // `data-orbix-division` so the header, page and footer all inherit the
    // current route's accent. Everything below it stays a Server Component.
    <SiteShell>
      <SkipLink />
      <SiteHeader />
      <main id="main-content" className="orbix-page-transition flex-1">
        {children}
      </main>
      <SiteFooter />
    </SiteShell>
  );
}
