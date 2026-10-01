import { Container } from "@/components/layout/container";
import { DesktopNavigation } from "@/components/layout/desktop-navigation";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { SiteLogo } from "@/components/layout/site-logo";

/**
 * Site header (spec 9): the opaque page ground, no blur, 64px tall, the
 * wordmark left and text links right, one 1px rule under the bar. The
 * current link is underlined in the division colour. Below 1024px the
 * links move into a full-height sheet.
 */
export function SiteHeader() {
  return (
    <header className="orbix-site-header sticky top-0 z-50">
      <Container className="orbix-site-header__bar flex items-center justify-between gap-6">
        <SiteLogo priority />
        <DesktopNavigation />
        <MobileNavigation />
      </Container>
    </header>
  );
}
