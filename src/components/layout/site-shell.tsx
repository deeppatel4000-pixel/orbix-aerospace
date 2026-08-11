"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { resolveDivision } from "@/config/divisions";

/**
 * Applies the current route's division identity to the whole shared shell.
 *
 * ## Why this element, and why a client boundary
 *
 * The audit found division theming had no effect on the product: the only
 * `data-orbix-environment` in the app sat on an `aria-hidden`, `-z-20`
 * backdrop `<div>` containing nothing but imagery, so the token overrides
 * never reached readable content.
 *
 * The fix is to put ONE attribute on the outermost shared element, above the
 * header, the page and the footer, so all three inherit the division's accent
 * roles through normal CSS custom-property cascade. Nothing else needs to
 * know which division it is in — components consume
 * `--orbix-division-accent` and get the right value wherever they sit.
 *
 * That element lives in `(site)/layout.tsx`, which is a Server Component and
 * therefore cannot know the pathname. Route-segment layouts could set the
 * attribute without any client code, but each one sits BELOW the header in
 * the tree, so the chrome would never inherit it — which is precisely the
 * bug being fixed.
 *
 * So the wrapper alone is a Client Component. `children` is still passed
 * through from the server, so the header, page content and footer remain
 * Server Components and no additional JavaScript is shipped for them.
 *
 * ## No flash, no hydration mismatch
 *
 * `usePathname()` is read during render, not in an effect, and Next resolves
 * it during server rendering and static prerender. The attribute is therefore
 * already correct in the initial HTML, so there is no first-paint flash of a
 * wrong accent and no server/client mismatch. On client navigation the hook
 * re-renders with the new pathname, so no stale accent survives a route
 * change.
 *
 * ## Legacy behaviour is untouched
 *
 * `[data-orbix-theme]` and `[data-orbix-environment]` still work exactly as
 * before, because `OrbixEnvironmentBackdrop` still sets the latter for its
 * decorative imagery. `data-orbix-division` is the future-facing contract;
 * the two coexist.
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
