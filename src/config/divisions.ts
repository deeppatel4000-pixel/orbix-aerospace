/**
 * ORBIX route divisions.
 *
 * `SiteShell` writes two attributes from the pathname:
 *
 * - `data-orbix-division`, the route's content division (asserted by tests,
 *   no visual effect), and
 * - `data-division`, the accent division from design v2 spec 4
 *   (`space | aircraft | lab`), which swaps `--accent` in
 *   `src/styles/orbix-tokens.css`. `accentDivisionFor` maps one to the other.
 *
 * The mapping is longest-prefix-wins on path segments:
 *
 *   /aircraft          aircraft
 *   /rockets           space
 *   /compare           engineering
 *   /engineering-lab   engineering
 *   /learn             research
 *   /verification      research
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
  ["/verification", "research"],
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

/** The three accent divisions of design v2 (spec 4). */
export type AccentDivision = "aircraft" | "lab" | "space";

const accentByDivision: Readonly<Record<OrbixDivision, AccentDivision>> = {
  aircraft: "aircraft",
  defense: "aircraft",
  engineering: "lab",
  research: "lab",
  space: "space",
};

/**
 * The accent a content division is drawn in: amber for aircraft, laboratory
 * blue for the engineering and research routes (compare, the lab, learn,
 * verification), cyan for everything else.
 */
export function accentDivisionFor(division: OrbixDivision): AccentDivision {
  return accentByDivision[division];
}
