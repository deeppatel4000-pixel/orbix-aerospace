"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { accentDivisionFor, resolveDivision } from "@/config/divisions";

/**
 * Outermost shared wrapper for the header, page and footer.
 *
 * It writes the route's division twice: `data-orbix-division` (the content
 * division that tests assert) and `data-division`, the design accent
 * (`space | aircraft | lab`) that swaps `--accent` for everything inside,
 * the header hairline and active nav rule included (spec 4). A page may set
 * `data-division` again on an inner wrapper to override it for a section.
 *
 * `usePathname()` is read during render, so both attributes are in the
 * server HTML and there is no first-paint flash of the wrong accent.
 */
export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const division = resolveDivision(pathname ?? "/");

  return (
    <div
      className="flex min-h-dvh flex-col"
      data-division={accentDivisionFor(division)}
      data-orbix-division={division}
    >
      {children}
    </div>
  );
}
