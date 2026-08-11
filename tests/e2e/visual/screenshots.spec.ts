import type { Page } from "@playwright/test";

import { expect, expectAllImagesLoaded, ROUTES, test } from "../fixtures/orbix";

const MISSION_CONTROL_HASH = "#mission-control-dashboard";

/**
 * Populated Compare captures.
 *
 * The plain `/compare` captures below photograph the empty state — the route
 * renders no matrix until at least two vehicles are selected — so for the whole
 * of the Compare redesign the identity strip, the populated matrix and the
 * magnitude tracks had no visual coverage at all. These two queries fill that
 * gap, and each is chosen because it shows both halves of the magnitude
 * contract in one frame:
 *
 *   aircraft  The F-15 publishes 1,875 mph while the F-22 and SR-71 publish
 *             Mach numbers, so the speed row must appear with NO tracks, while
 *             range and ceiling — miles and feet throughout — must have them.
 *             A change that started encoding mixed units would be visible here
 *             as bars appearing in the speed row.
 *
 *   rockets   Height is metres and liftoff mass is kilograms for all three, but
 *             Falcon 9 and Falcon Heavy publish thrust in kN while Saturn V
 *             publishes MN, so the thrust row must stay text-only. This also
 *             captures the portrait media treatment the launch-vehicle identity
 *             strip uses.
 *
 * Both go through the ordinary query contract; nothing here is a test-only
 * entry point.
 */
const COMPARE_AIRCRAFT_QUERY =
  "?category=aircraft&vehicles=f-15-eagle,f-22-raptor,sr-71-blackbird";
const COMPARE_ROCKETS_QUERY =
  "?category=rockets&vehicles=falcon-9,falcon-heavy,saturn-v";

const DESKTOP_VIEWPORT = { width: 1440, height: 900 };
const TABLET_VIEWPORT = { width: 768, height: 1024 };
const MOBILE_VIEWPORT = { width: 390, height: 844 };

/**
 * `maxDiffPixelRatio` is checked against the whole (often text-dense,
 * full-page) screenshot. 0.01 (1% of pixels) is small enough that a real
 * regression — a missing section, a relocated card, a broken image, a
 * color/theme change of any visible size — still fails the comparison, but
 * large enough to absorb the couple of pixels of antialiasing/font-hinting
 * noise that can legitimately differ between two runs of the same page on
 * the same machine, which is exactly the kind of harmless noise this brief
 * warns against chasing with a wider tolerance.
 */
const SCREENSHOT_OPTIONS = {
  animations: "disabled",
  caret: "hide",
  fullPage: true,
  maxDiffPixelRatio: 0.01,
} as const;

/**
 * Duplicated from `dismissMissionControlStartup` in
 * tests/e2e/smoke/mission-control.spec.ts (not imported — the visual and
 * smoke suites are kept independent per the ownership split for this repo).
 * Mission Control always mounts wrapped in `MissionStartupSequence`, a
 * cinematic overlay that starts active and auto-advances on its own timer
 * (faster under this project's `reducedMotion: "reduce"` context option),
 * unmounting itself when done. Whether the timer has already finished by
 * the time this runs is a race, so this either dismisses the overlay or,
 * if it already completed on its own, no-ops — either way the overlay is
 * confirmed gone before a screenshot is taken of what's behind it.
 */
async function dismissMissionControlStartup(page: Page): Promise<void> {
  await expect(
    page.getByRole("navigation", { name: "Mission Control sections" }),
  ).toBeVisible();

  const skipButton = page.getByRole("button", {
    name: "Skip Mission Control startup",
  });

  if (await skipButton.isVisible().catch(() => false)) {
    await skipButton.click({ timeout: 5_000 }).catch(() => {});
  }

  await expect(skipButton).toBeHidden();
}

async function waitForHeading(page: Page): Promise<void> {
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

/**
 * Common pre-screenshot settle sequence: wait for the route's real content
 * (`readyCheck`, defaulting to waiting for the route's `<h1>` — every route
 * under test renders exactly one, confirmed by
 * tests/e2e/smoke/public-routes.spec.ts, so its visibility is a reliable
 * signal that the Suspense fallback in src/app/loading.tsx — the app's one
 * infinite CSS animation — has been replaced by the real page; Mission
 * Control passes `dismissMissionControlStartup` instead, since that already
 * waits for its own real content and additionally clears its startup
 * overlay), let lazy images resolve so screenshots never race a
 * still-loading image, then reset scroll to the top so every screenshot
 * starts from the same origin. `fullPage` capture in Chromium is independent
 * of current scroll position, but a consistent starting point keeps this
 * suite easy to reason about.
 *
 * No retry/reload loop is needed here. The image-heavy routes used to hang,
 * and the cause was measured rather than guessed: against a local
 * `next start`, Chromium can settle an image's `currentSrc` on the largest
 * srcset candidate after layout shifts, having abandoned the request for the
 * candidate it chose first — and then never request the new selection at
 * all. `expectAllImagesLoaded` detects and repairs exactly that case; see
 * its comment in tests/e2e/fixtures/orbix.ts for the full measurement. The
 * same pages load every image normally against production, so there is
 * nothing wrong with the application.
 *
 * Navigation uses `waitUntil: "domcontentloaded"` for the same reason: the
 * `load` event never fires while an image request is stranded, so waiting
 * for it would time out before the repair could run.
 */
async function settle(
  page: Page,
  readyCheck: (page: Page) => Promise<void> = waitForHeading,
): Promise<void> {
  await readyCheck(page);
  await expectAllImagesLoaded(page);
  await page.evaluate(() => window.scrollTo(0, 0));
}

test.describe("Visual regression / desktop 1440x900", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
  });

  test("home", async ({ page }) => {
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });
    await settle(page);
    await expect(page).toHaveScreenshot("home-desktop.png", SCREENSHOT_OPTIONS);
  });

  test("showcase", async ({ page }) => {
    await page.goto(ROUTES.showcase, { waitUntil: "domcontentloaded" });
    await settle(page);
    await expect(page).toHaveScreenshot(
      "showcase-desktop.png",
      SCREENSHOT_OPTIONS,
    );
  });

  test("aircraft explorer", async ({ page }) => {
    await page.goto(ROUTES.aircraft, { waitUntil: "domcontentloaded" });
    await settle(page);
    await expect(page).toHaveScreenshot(
      "aircraft-desktop.png",
      SCREENSHOT_OPTIONS,
    );
  });

  test("aircraft profile - F-22 Raptor", async ({ page }) => {
    await page.goto(`${ROUTES.aircraft}/f-22-raptor`, {
      waitUntil: "domcontentloaded",
    });
    await settle(page);
    await expect(page).toHaveScreenshot(
      "aircraft-f-22-raptor-desktop.png",
      SCREENSHOT_OPTIONS,
    );
  });

  test("rockets explorer", async ({ page }) => {
    await page.goto(ROUTES.rockets, { waitUntil: "domcontentloaded" });
    await settle(page);
    await expect(page).toHaveScreenshot(
      "rockets-desktop.png",
      SCREENSHOT_OPTIONS,
    );
  });

  test("rocket profile - Falcon 9", async ({ page }) => {
    await page.goto(`${ROUTES.rockets}/falcon-9`, {
      waitUntil: "domcontentloaded",
    });
    await settle(page);
    await expect(page).toHaveScreenshot(
      "rockets-falcon-9-desktop.png",
      SCREENSHOT_OPTIONS,
    );
  });

  test("mission control", async ({ page }) => {
    await page.goto(`${ROUTES.engineeringLab}${MISSION_CONTROL_HASH}`, {
      waitUntil: "domcontentloaded",
    });
    await settle(page, dismissMissionControlStartup);
    await expect(page).toHaveScreenshot(
      "mission-control-desktop.png",
      SCREENSHOT_OPTIONS,
    );
  });

  test("engineering laboratory", async ({ page }) => {
    await page.goto(ROUTES.engineeringLab, { waitUntil: "domcontentloaded" });
    await settle(page);
    await expect(page).toHaveScreenshot(
      "engineering-lab-desktop.png",
      SCREENSHOT_OPTIONS,
    );
  });

  test("compare", async ({ page }) => {
    await page.goto(ROUTES.compare, { waitUntil: "domcontentloaded" });
    await settle(page);
    await expect(page).toHaveScreenshot(
      "compare-desktop.png",
      SCREENSHOT_OPTIONS,
    );
  });

  test("compare / populated aircraft comparison", async ({ page }) => {
    await page.goto(ROUTES.compare + COMPARE_AIRCRAFT_QUERY, {
      waitUntil: "domcontentloaded",
    });
    await settle(page);
    await expect(page).toHaveScreenshot(
      "compare-aircraft-desktop.png",
      SCREENSHOT_OPTIONS,
    );
  });

  test("compare / populated rocket comparison", async ({ page }) => {
    await page.goto(ROUTES.compare + COMPARE_ROCKETS_QUERY, {
      waitUntil: "domcontentloaded",
    });
    await settle(page);
    await expect(page).toHaveScreenshot(
      "compare-rockets-desktop.png",
      SCREENSHOT_OPTIONS,
    );
  });

  test("learn", async ({ page }) => {
    await page.goto(ROUTES.learn, { waitUntil: "domcontentloaded" });
    await settle(page);
    await expect(page).toHaveScreenshot(
      "learn-desktop.png",
      SCREENSHOT_OPTIONS,
    );
  });
});

/**
 * Responsive subset: rather than re-shooting all ten desktop surfaces at
 * every breakpoint, this targets the pages most likely to actually break at
 * narrow widths — the ones with the densest layout composition (multi-column
 * grids, side-by-side panels, sticky navigation) — plus the two flows the
 * project brief calls out by name (Mission Control, Engineering Lab). Simple
 * single-column/placeholder pages (Showcase, a vehicle profile, Rockets,
 * Compare's own table, Learn) are lower-risk for responsive regressions and
 * are left to `expectNoHorizontalOverflow` coverage in the existing smoke
 * suite rather than doubling their pixel-diff surface here.
 *
 * Mobile (390x844, the brief's narrowest, highest-risk breakpoint) gets the
 * full five-page subset; tablet (768x1024, a gentler squeeze) is limited to
 * the two pages with the most complex grid/nav composition (home, aircraft
 * explorer) since that's where a mid-width layout regression is most likely
 * to first appear.
 */
test.describe("Visual regression / mobile 390x844", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
  });

  test("home", async ({ page }) => {
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });
    await settle(page);
    await expect(page).toHaveScreenshot("home-mobile.png", SCREENSHOT_OPTIONS);
  });

  test("aircraft explorer", async ({ page }) => {
    await page.goto(ROUTES.aircraft, { waitUntil: "domcontentloaded" });
    await settle(page);
    await expect(page).toHaveScreenshot(
      "aircraft-mobile.png",
      SCREENSHOT_OPTIONS,
    );
  });

  test("compare", async ({ page }) => {
    await page.goto(ROUTES.compare, { waitUntil: "domcontentloaded" });
    await settle(page);
    await expect(page).toHaveScreenshot(
      "compare-mobile.png",
      SCREENSHOT_OPTIONS,
    );
  });

  // One populated mobile capture, not two: the matrix is a contained
  // horizontal scroller at this width, so what a screenshot can actually show
  // is the identity strip plus the first column of the matrix. The aircraft
  // selection is used because its leading column carries an encoded row and an
  // intentionally unencoded one, which is the behaviour worth photographing.
  test("compare / populated aircraft comparison", async ({ page }) => {
    await page.goto(ROUTES.compare + COMPARE_AIRCRAFT_QUERY, {
      waitUntil: "domcontentloaded",
    });
    await settle(page);
    await expect(page).toHaveScreenshot(
      "compare-aircraft-mobile.png",
      SCREENSHOT_OPTIONS,
    );
  });

  test("engineering laboratory", async ({ page }) => {
    await page.goto(ROUTES.engineeringLab, { waitUntil: "domcontentloaded" });
    await settle(page);
    await expect(page).toHaveScreenshot(
      "engineering-lab-mobile.png",
      SCREENSHOT_OPTIONS,
    );
  });

  test("mission control", async ({ page }) => {
    await page.goto(`${ROUTES.engineeringLab}${MISSION_CONTROL_HASH}`, {
      waitUntil: "domcontentloaded",
    });
    await settle(page, dismissMissionControlStartup);
    await expect(page).toHaveScreenshot(
      "mission-control-mobile.png",
      SCREENSHOT_OPTIONS,
    );
  });
});

test.describe("Visual regression / tablet 768x1024", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(TABLET_VIEWPORT);
  });

  test("home", async ({ page }) => {
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });
    await settle(page);
    await expect(page).toHaveScreenshot("home-tablet.png", SCREENSHOT_OPTIONS);
  });

  test("aircraft explorer", async ({ page }) => {
    await page.goto(ROUTES.aircraft, { waitUntil: "domcontentloaded" });
    await settle(page);
    await expect(page).toHaveScreenshot(
      "aircraft-tablet.png",
      SCREENSHOT_OPTIONS,
    );
  });
});
