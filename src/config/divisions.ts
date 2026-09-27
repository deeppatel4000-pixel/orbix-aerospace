/**
 * ORBIX route divisions.
 *
 * Since the 2026 redesign there is ONE accent sitewide, and no CSS keys off
 * `data-orbix-division` (see `docs/design-system/orbix-redesign-2026.md`,
 * section 4.3). `SiteShell` still writes the attribute because tests assert
 * it; it has no visual effect.
 *
 * The mapping is longest-prefix-wins on path segments:
 *
 *   /aircraft          aircraft
 *   /rockets           space
 *   /compare           engineering
 *   /engineering-lab   engineering
 *   /learn             research
 *   /showcase          space
 *   anything else      space (default)
 *
 * `defense` is a valid value with no route.
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
