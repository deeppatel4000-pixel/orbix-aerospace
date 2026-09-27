"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { resolveDivision } from "@/config/divisions";

/**
 * Outermost shared wrapper for the header, page and footer.
 *
 * It still writes `data-orbix-division` for the current route because unit
 * and end-to-end tests assert it, but since the 2026 redesign no CSS keys off
 * the attribute: there is one accent sitewide (spec 4.3). `usePathname()` is
 * read during render, so the attribute is correct in the server HTML.
 */
export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div
      className="flex min-h-dvh flex-col"
      data-orbix-division={resolveDivision(pathname ?? "/")}
    >
      {children}
    </div>
  );
}
