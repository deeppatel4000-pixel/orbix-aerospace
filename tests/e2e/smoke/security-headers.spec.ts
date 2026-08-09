import { expect, ROUTES, test } from "../fixtures/orbix";

/**
 * Guards the security headers configured in `next.config.ts`.
 *
 * Why this exists
 * ---------------
 * These headers had NO test coverage of any kind before this file, and they
 * are uniquely dangerous to leave uncovered: a missing or altered header
 * produces no console error, no layout change, and no visual diff. The page
 * renders pixel-identically either way. A regression would pass
 * `npm run validate`, pass every smoke, accessibility, and visual test, and
 * ship to production with a materially weaker security posture that nobody
 * would notice until an external scanner flagged it.
 *
 * That matters most during a framework upgrade. Next.js has changed the
 * shape and defaults of the async `headers()` config API across major
 * versions, so this is the first thing that should be re-checked when the
 * pending Next 16 upgrade is attempted — see the dependency-audit section of
 * docs/CLAUDE_HANDOFF.md.
 *
 * These assertions intentionally mirror `next.config.ts` exactly. If a
 * deliberate policy change is made there, update it here in the same commit
 * so the pair never silently diverge.
 */

/** Mirrors `securityHeaders` in next.config.ts. */
const EXPECTED_HEADERS: ReadonlyArray<readonly [string, string]> = [
  ["x-content-type-options", "nosniff"],
  ["x-frame-options", "DENY"],
  ["referrer-policy", "strict-origin-when-cross-origin"],
  ["permissions-policy", "camera=(), microphone=(), geolocation=()"],
];

/**
 * `next.config.ts` applies these to `source: "/(.*)"`, so every route is
 * covered, including the one outside the `(site)` layout group.
 */
const ROUTES_UNDER_TEST: ReadonlyArray<readonly [string, string]> = [
  ["home", ROUTES.home],
  ["aircraft", ROUTES.aircraft],
  ["rockets", ROUTES.rockets],
  ["compare", ROUTES.compare],
  ["engineering-lab", ROUTES.engineeringLab],
  ["learn", ROUTES.learn],
  ["showcase", ROUTES.showcase],
  ["aircraft profile", "/aircraft/f-22-raptor"],
  ["rocket profile", "/rockets/falcon-9"],
  ["showcase-capture", "/showcase-capture/leo-satellite-deployment"],
];

test.describe("Security headers", () => {
  // Header behaviour is server-side and identical across viewports, so
  // running this in one project is sufficient and keeps the suite fast.
  test.skip(
    () => test.info().project.name !== "desktop",
    "Response headers do not vary by viewport.",
  );

  for (const [name, path] of ROUTES_UNDER_TEST) {
    test(`${name} (${path}) sends every configured security header`, async ({
      request,
    }) => {
      const response = await request.get(path);
      expect(response.status()).toBe(200);

      const headers = response.headers();

      for (const [header, expected] of EXPECTED_HEADERS) {
        expect(
          headers[header],
          `${path} should send "${header}: ${expected}" (configured in next.config.ts)`,
        ).toBe(expected);
      }
    });
  }

  test("X-Powered-By is not disclosed", async ({ request }) => {
    // `poweredByHeader: false` in next.config.ts. Framework disclosure is
    // low severity on its own, but it is deliberate configuration and a
    // silent revert would go unnoticed without this assertion.
    const response = await request.get(ROUTES.home);
    expect(response.headers()["x-powered-by"]).toBeUndefined();
  });
});
