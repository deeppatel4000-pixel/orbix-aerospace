import Link from "next/link";
import { Orbit } from "lucide-react";

import { siteConfig } from "@/config/site";

export function SiteLogo() {
  return (
    <Link
      aria-label={`${siteConfig.name} home`}
      className="inline-flex shrink-0 items-center gap-3 rounded-md"
      href="/"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
        <Orbit aria-hidden="true" size={20} strokeWidth={1.8} />
      </span>
      <span className="text-lg font-semibold tracking-[-0.03em]">
        {siteConfig.name}
      </span>
    </Link>
  );
}
