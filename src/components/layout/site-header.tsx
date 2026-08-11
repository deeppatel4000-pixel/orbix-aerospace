import { Container } from "@/components/layout/container";
import { DesktopNavigation } from "@/components/layout/desktop-navigation";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { SiteLogo } from "@/components/layout/site-logo";

export function SiteHeader() {
  return (
    <header className="orbix-site-header sticky top-0 z-50">
      {/* `justify-between` with the nav pushed right leaves the logo and the
          navigation as the only two anchors, rather than three competing
          clusters. Height is unchanged at 5.5rem so no route's content
          offset shifts. */}
      <Container className="relative flex h-[5.5rem] items-center justify-between gap-8">
        <SiteLogo priority />
        <div className="flex items-center gap-2">
          <DesktopNavigation />
          <MobileNavigation />
        </div>
      </Container>
    </header>
  );
}
