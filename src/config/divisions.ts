/**
 * ORBIX division identity — the single authority for which division a route
 * belongs to.
 *
 * A division is a controlled accent within ONE design system. It may change
 * `--orbix-division-accent` and its related roles and nothing else;
 * backgrounds, surfaces, borders, text, typography, spacing, radii and
 * interaction are global. See the DIVISION SYSTEM block in
 * `src/styles/orbix-tokens.css`.
 *
 * ## Why the mapping lives here and only here
 *
 * Before this, theming was decided ad hoc: `data-orbix-environment` was set
 * per-component on decorative backdrops, so nothing readable inherited it.
 * Duplicating pathname checks across the header, the nav and each route would
 * reproduce that problem. One table, consumed by one shell wrapper, means a
 * future route gets its identity by adding a line here.
 *
 * ## Assignments are derived from how each route already describes itself
 *
 *   /aircraft          "Aircraft Explorer", nav label "Aircraft"  -> aircraft
 *   /rockets           launch vehicles, orbital missions          -> space
 *   /compare           kicker: "Engineering workspace // Compar…"  -> engineering
 *   /engineering-lab   "Engineering Laboratory"                   -> engineering
 *   /learn             "Learn the physics behind ORBIX"           -> research
 *   /showcase          kicker: "ORBIX // Portfolio showcase"      -> space (generic)
 *   /                  generic ORBIX identity                     -> space (default)
 *
 * `defense` is defined in the token layer but deliberately has NO route. The
 * aircraft registry is a product division ("Aircraft"), not a defense
 * division, and forcing military airframes into a Defense accent purely to
 * use all five would misrepresent the product. It stays available for a
 * future route that genuinely warrants it.
 */

export type OrbixDivision =
  "aircraft" | "defense" | "engineering" | "research" | "space";

/** The division applied when no rule matches. */
export const DEFAULT_DIVISION: OrbixDivision = "space";

/**
 * Longest-prefix-wins route rules.
 *
 * Order does not matter: `resolveDivision` selects the longest matching
 * prefix, so `/aircraft/f-22-raptor` resolves through `/aircraft` without a
 * separate entry, and a future `/aircraft/compare` could override it by
 * simply being longer.
 */
const divisionRoutes: ReadonlyArray<readonly [string, OrbixDivision]> = [
  ["/aircraft", "aircraft"],
  ["/rockets", "space"],
  ["/compare", "engineering"],
  ["/engineering-lab", "engineering"],
  ["/learn", "research"],
  ["/showcase", "space"],
];

/**
 * Resolves a pathname to its division.
 *
 * Matching is prefix-based on path SEGMENTS, so `/learn` matches `/learn` and
 * `/learn/anything` but never a hypothetical `/learning`.
 */
export function resolveDivision(pathname: string): OrbixDivision {
  let match: (typeof divisionRoutes)[number] | undefined;

  for (const rule of divisionRoutes) {
    const [prefix] = rule;
    const isSegmentMatch =
      pathname === prefix || pathname.startsWith(`${prefix}/`);
    if (!isSegmentMatch) continue;
    if (match === undefined || prefix.length > match[0].length) match = rule;
  }

  return match?.[1] ?? DEFAULT_DIVISION;
}
