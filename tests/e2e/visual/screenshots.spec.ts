import type { Page } from "@playwright/test";

import {
  expect,
  expectAllImagesLoaded,
  PROJECT_ROUTES,
  ROUTES,
  test,
} from "../fixtures/orbix";

const MISSION_PLANNER_HASH = "#mission-planner";

/**
 * Populated Compare captures.
 *
 * The plain `/compare` captures below photograph the default comparison the
 * route opens on (v4: SR-71, F-22 and B-2 preloaded). These two queries add
 * comparisons chosen because each shows both halves of the magnitude
 * contract in one frame:
 *
 *   aircraft  The F-15 publishes 1,875 mph while the F-22 and SR-71 publish
 *             Mach numbers, so the speed row must appear with NO tracks, while
 *             range and ceiling — miles and feet throughout — must have them.
 *             A change that started encoding mixed units would be visible here
 *             as bars appearing in the speed row.
 *
 *   rockets   Height is meters and liftoff mass is kilograms for all three, but
 *             Falcon 9 and Falcon Heavy publish thrust in kN while Saturn V
 *             publishes MN, so the thrust row must stay text-only. This also
 *             captures the launch-vehicle photographs in the column headers.
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
 * Waits for a lab tool named by the hash. `LaboratoryShell` reveals it from
 * a hash-driven effect after hydration, so the server render shows the
 * first tool until then; capturing before this could photograph the wrong
 * tool.
 */
function waitForLabTool(id: string): (page: Page) => Promise<void> {
  return async (page) => {
    await waitForHeading(page);
    await expect(page.locator(`[data-laboratory-tool="${id}"]`)).toBeVisible();
  };
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
 * infinite CSS animation — has been replaced by the real page; a lab tool
 * opened by hash passes `waitForLabTool`, which also waits for that tool),
 * let lazy images resolve so screenshots never race a
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
  await resetScroll(page);
}

/**
 * Returns to the top and holds there. The Engineering Lab scrolls a hash
 * target into view one animation frame after it reveals it, and a tab click
 * scrolls the tab into view, so a single `scrollTo` can be undone a frame
 * later. A full-page capture taken while scrolled paints the sticky header and
 * the off-screen skip link mid-page, so this waits until the top position
 * survives two frames.
 */
async function resetScroll(page: Page): Promise<void> {
  await expect
    .poll(() =>
      page.evaluate(async () => {
        window.scrollTo(0, 0);
        await new Promise((resolve) =>
          window.requestAnimationFrame(() =>
            window.requestAnimationFrame(resolve),
          ),
        );
        return window.scrollY;
      }),
    )
    .toBe(0);
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

  test("engineering laboratory / mission planner", async ({ page }) => {
    await page.goto(`${ROUTES.engineeringLab}${MISSION_PLANNER_HASH}`, {
      waitUntil: "domcontentloaded",
    });
    await settle(page, waitForLabTool("mission-planner"));
    await expect(page).toHaveScreenshot(
      "engineering-lab-mission-planner-desktop.png",
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

  test("verification", async ({ page }) => {
    await page.goto(PROJECT_ROUTES.verification, {
      waitUntil: "domcontentloaded",
    });
    await settle(page);
    await expect(page).toHaveScreenshot(
      "verification-desktop.png",
      SCREENSHOT_OPTIONS,
    );
  });

  test("build log", async ({ page }) => {
    await page.goto(PROJECT_ROUTES.buildLog, {
      waitUntil: "domcontentloaded",
    });
    await settle(page);
    await expect(page).toHaveScreenshot(
      "build-log-desktop.png",
      SCREENSHOT_OPTIONS,
    );
  });

  test("not found", async ({ page }) => {
    await page.goto("/no-such-page-visual", {
      waitUntil: "domcontentloaded",
    });
    await settle(page);
    await expect(page).toHaveScreenshot(
      "not-found-desktop.png",
      SCREENSHOT_OPTIONS,
    );
  });
});

/**
 * Responsive subset: rather than re-shooting all ten desktop surfaces at
 * every breakpoint, this targets the pages most likely to actually break at
 * narrow widths — the ones with the densest layout composition (multi-column
 * grids, side-by-side panels, sticky navigation) — plus the Engineering Lab
 * and its mission planner. Simple single-column pages (a vehicle profile,
 * Rockets, Learn) are lower-risk for responsive regressions and
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
  // intentionally unencoded one, which is the behavior worth photographing.
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

  // The planner's delta-v ledger as a table, opened: the widest table in
  // the lab, contained in its own horizontal scroller at this width. The
  // geometry test in engineering-lab-modules.spec.ts is the real regression
  // coverage; this keeps the scroll affordance itself under review.
  test("engineering laboratory / contained ledger table", async ({ page }) => {
    await page.goto(`${ROUTES.engineeringLab}${MISSION_PLANNER_HASH}`, {
      waitUntil: "domcontentloaded",
    });
    await settle(page, waitForLabTool("mission-planner"));
    await page
      .locator('[data-laboratory-tool="mission-planner"]')
      .getByText("Show the numbers as a table", { exact: true })
      .click();
    await expect(
      page.getByRole("table", { name: "Delta-v by mission and step" }),
    ).toBeVisible();
    await resetScroll(page);
    await expect(page).toHaveScreenshot(
      "engineering-lab-table-mobile.png",
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

  test("engineering laboratory / mission planner", async ({ page }) => {
    await page.goto(`${ROUTES.engineeringLab}${MISSION_PLANNER_HASH}`, {
      waitUntil: "domcontentloaded",
    });
    await settle(page, waitForLabTool("mission-planner"));
    await expect(page).toHaveScreenshot(
      "engineering-lab-mission-planner-mobile.png",
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
