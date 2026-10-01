import Link from "next/link";

import { OrbixWordmark } from "@/components/brand/orbix-wordmark";
import { siteConfig } from "@/config/site";

interface SiteLogoProps {
  priority?: boolean;
}

/**
 * Owner-supplied wordmark at its natural 1055:400 aspect, 36px tall at
 * every breakpoint. The PNG has 23/1055 of empty space before the
 * first letter, so a -2px start margin puts the ink on the text edge. No
 * glow, no scale, nothing violet added around it.
 */
export function SiteLogo({ priority = false }: SiteLogoProps) {
  return (
    <Link
      aria-label={`${siteConfig.name} home`}
      className="-ms-0.5 inline-flex shrink-0 items-center rounded-[2px] py-1"
      href="/"
    >
      <OrbixWordmark
        className="h-9 w-[5.934rem]"
        priority={priority}
        sizes="95px"
        source="/brand/orbix-wordmark-transparent.png?surface=site-chrome"
      />
      <span className="sr-only">{siteConfig.wordmark}</span>
    </Link>
  );
}
