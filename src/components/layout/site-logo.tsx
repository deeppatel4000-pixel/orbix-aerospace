import Link from "next/link";

import { OrbixWordmark } from "@/components/brand/orbix-wordmark";
import { siteConfig } from "@/config/site";

interface SiteLogoProps {
  priority?: boolean;
}

/** Owner-supplied wordmark at 1.25rem tall (spec 10). No glow, no scale. */
export function SiteLogo({ priority = false }: SiteLogoProps) {
  return (
    <Link
      aria-label={`${siteConfig.name} home`}
      className="inline-flex shrink-0 items-center rounded py-1"
      href="/"
    >
      <OrbixWordmark
        className="h-5 w-[3.3rem]"
        priority={priority}
        sizes="53px"
        source="/brand/orbix-wordmark-transparent.png?surface=site-chrome"
      />
      <span className="sr-only">{siteConfig.wordmark}</span>
    </Link>
  );
}
