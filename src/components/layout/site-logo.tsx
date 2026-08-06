import Link from "next/link";

import { OrbixWordmark } from "@/components/brand/orbix-wordmark";
import { siteConfig } from "@/config/site";

export function SiteLogo() {
  return (
    <Link
      aria-label={`${siteConfig.name} home`}
      className="group relative inline-flex shrink-0 items-center rounded-md"
      href="/"
    >
      <OrbixWordmark
        className="h-10 w-36 transition-[filter,transform] duration-300 group-hover:drop-shadow-[0_0_18px_rgb(88_220_255/0.2)] motion-safe:group-hover:scale-[1.02] sm:h-11 sm:w-40"
        priority
      />
      <span className="sr-only">{siteConfig.wordmark}</span>
    </Link>
  );
}
