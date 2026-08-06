import { Container } from "@/components/layout/container";
import { DesktopNavigation } from "@/components/layout/desktop-navigation";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { SiteLogo } from "@/components/layout/site-logo";

export function SiteHeader() {
  return (
    <header className="orbix-site-header sticky top-0 z-50">
      <Container className="relative flex h-[5.5rem] items-center justify-between gap-8">
        <SiteLogo />
        <DesktopNavigation />
        <MobileNavigation />
      </Container>
    </header>
  );
}
