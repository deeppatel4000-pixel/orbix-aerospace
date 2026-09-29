import { Container } from "@/components/layout/container";
import { DesktopNavigation } from "@/components/layout/desktop-navigation";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { SiteLogo } from "@/components/layout/site-logo";

/**
 * Site header (spec 8, amended): the opaque page ground, no blur, 64px
 * tall, logo left, text links right. A 1px division-accent hairline at 45
 * percent runs under the bar and the current link carries a 2px accent
 * rule. Below 1024px the links move into a full-height sheet.
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
