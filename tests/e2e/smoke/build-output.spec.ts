import { readFileSync } from "node:fs";
import path from "node:path";

import { AIRCRAFT_IDS, expect, ROCKET_IDS, test } from "../fixtures/orbix";

/**
 * Build-output regression check: the set of pages Next.js actually generates.
 *
 * ## Why this lives in the Playwright suite
 *
 * This is a build-artifact assertion, not a browser assertion — but it has to
 * run somewhere that guarantees a fresh build. It cannot go in Vitest:
 * `npm run validate` is `format:check && lint && typecheck && test && build`,
 * so `test` runs BEFORE `build`, and on a clean CI checkout there is no
 * `.next/` to read at that point.
 *
 * Playwright is the right host because its `webServer` runs
 * `npm run build && npm run start`, and in CI `reuseExistingServer` is false,
 * so the manifest read below is always produced by a fresh build of the
 * commit under test. No new npm script or tooling is introduced.
 *
 * ## What is asserted, and why it is not a raw number
 *
 * The project documentation historically recorded "28 generated page
 * instances". That was a Next.js 15-era figure and does not describe the
 * current build: Next 16 reports differently and adds `/_global-error`. The
 * docs have since been corrected to the structured counts below, and
 * `.next/prerender-manifest.json` is the source of truth — so this test
 * derives its invariant from the manifest rather than from any number
 * written in prose.
 *
 * Measured from `.next/prerender-manifest.json`:
 *
 *   26 prerendered routes total
 *    5 framework outputs: /_global-error, /_not-found, /favicon.ico,
 *      /icon.png, /manifest.webmanifest
 *   21 user-facing pages  <- the meaningful invariant
 *    3 dynamic templates: /aircraft/[id], /rockets/[id], /showcase-capture/[id]
 *
 * `/compare` is intentionally dynamic — it reads `searchParams` — and is
 * therefore not part of the prerendered set at all.
 *
 * The framework internals are deliberately EXCLUDED. They are Next's own
 * output, they already changed once across a major version, and asserting
 * them would make this test fail on a framework upgrade that lost nothing of
 * ORBIX's. The 21 user-facing pages are what actually represent the product.
 *
 * The expected set is built from the same fixture lists the rest of the suite
 * uses, so adding a vehicle extends this assertion automatically rather than
 * silently leaving the new page unprotected.
 */

/** Mission preset ids that back `/showcase-capture/[id]`. */
const SHOWCASE_MISSION_IDS = [
  "leo-satellite-deployment",
  "iss-style-resupply",
  "lunar-transfer-concept",
  "reentry-demonstrator",
  "mars-transfer-concept",
] as const;

/** Statically prerendered routes that are not generated from a data list. */
const STATIC_PAGE_ROUTES = [
  "/",
  "/aircraft",
  "/rockets",
  "/engineering-lab",
  "/learn",
  "/showcase",
] as const;

/**
 * Routes Next emits for its own machinery rather than for ORBIX content.
 * Excluded from the assertion on purpose — see the file comment.
 */
function isFrameworkInternal(route: string): boolean {
  return route.startsWith("/_") || /\.(ico|png|webmanifest)$/.test(route);
}

interface PrerenderManifest {
  readonly dynamicRoutes: Record<string, unknown>;
  readonly routes: Record<string, unknown>;
}

/**
 * Reads the manifest relative to the Playwright project root rather than an
 * absolute path, so this works on any machine and in CI.
 */
function readPrerenderManifest(): PrerenderManifest {
  const manifestPath = path.join(
    process.cwd(),
    ".next",
    "prerender-manifest.json",
  );

  let raw: string;
  try {
    raw = readFileSync(manifestPath, "utf8");
  } catch {
    throw new Error(
      `Could not read ${manifestPath}. This test asserts build output and expects ` +
        `a production build to exist. Playwright's webServer normally produces one ` +
        `via "npm run build && npm run start".`,
    );
  }

  return JSON.parse(raw) as PrerenderManifest;
}

const EXPECTED_PAGE_ROUTES = [
  ...STATIC_PAGE_ROUTES,
  ...AIRCRAFT_IDS.map((id) => `/aircraft/${id}`),
  ...ROCKET_IDS.map((id) => `/rockets/${id}`),
  ...SHOWCASE_MISSION_IDS.map((id) => `/showcase-capture/${id}`),
].sort();

test.describe("Build output", () => {
  // Build artifacts are identical regardless of viewport.
  test.skip(
    () => test.info().project.name !== "desktop",
    "Build output does not vary by viewport.",
  );

  test("generates exactly the expected set of user-facing pages", () => {
    const manifest = readPrerenderManifest();

    const generated = Object.keys(manifest.routes)
      .filter((route) => !isFrameworkInternal(route))
      .sort();

    const missing = EXPECTED_PAGE_ROUTES.filter(
      (route) => !generated.includes(route),
    );
    const unexpected = generated.filter(
      (route) => !EXPECTED_PAGE_ROUTES.includes(route),
    );

    // Asserting the SET, not just a count, so a failure names the route that
    // disappeared rather than only reporting a number that moved.
    expect(
      missing,
      `expected pages are missing from the build: ${missing.join(", ")}`,
    ).toEqual([]);
    expect(
      unexpected,
      `build produced unexpected pages: ${unexpected.join(", ")}`,
    ).toEqual([]);

    expect(generated).toEqual(EXPECTED_PAGE_ROUTES);
  });

  test("generates one page per vehicle and per mission preset", () => {
    const manifest = readPrerenderManifest();
    const generated = Object.keys(manifest.routes);

    const count = (prefix: string) =>
      generated.filter((route) => route.startsWith(prefix) && route !== prefix)
        .length;

    // Guards the data-driven half of the build: if generateStaticParams ever
    // returned a short list, the totals here move even if every remaining
    // page still renders correctly.
    expect(count("/aircraft/"), "one page per aircraft").toBe(
      AIRCRAFT_IDS.length,
    );
    expect(count("/rockets/"), "one page per rocket").toBe(ROCKET_IDS.length);
    expect(
      count("/showcase-capture/"),
      "one capture page per mission preset",
    ).toBe(SHOWCASE_MISSION_IDS.length);
  });

  test("keeps /compare dynamic rather than prerendering it", () => {
    const manifest = readPrerenderManifest();

    // `/compare` reads searchParams, so it must stay server-rendered on
    // demand. If it were ever prerendered, the URL-driven comparison state
    // would break in a way the route-level smoke tests would not catch.
    expect(
      Object.keys(manifest.routes),
      "/compare must not be prerendered",
    ).not.toContain("/compare");
  });

  test("keeps the three dynamic route templates", () => {
    const manifest = readPrerenderManifest();

    expect(Object.keys(manifest.dynamicRoutes).sort()).toEqual([
      "/aircraft/[id]",
      "/rockets/[id]",
      "/showcase-capture/[id]",
    ]);
  });
});
