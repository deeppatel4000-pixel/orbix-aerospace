import { Container } from "@/components/layout/container";
import { DesktopNavigation } from "@/components/layout/desktop-navigation";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { SiteLogo } from "@/components/layout/site-logo";

/**
 * Plain header (spec 10): solid page ground, one bottom hairline, 3.5rem
 * tall. The mobile menu sheet is positioned against this sticky element, so
 * it spans the full viewport width directly below the header.
 */
export function SiteHeader() {
  return (
    <header className="orbix-site-header sticky top-0 z-50">
      <Container className="flex h-14 items-center justify-between gap-6">
        <SiteLogo priority />
        <DesktopNavigation />
        <MobileNavigation />
      </Container>
    </header>
  );
}
