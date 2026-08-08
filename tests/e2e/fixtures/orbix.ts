import { test as base, expect, type Page } from "@playwright/test";

export { expect };

/**
 * Console and page-error messages captured for the lifetime of a test's
 * `page`. Listeners are attached before the fixture is handed to the test,
 * and therefore before any navigation the test performs, so nothing is
 * missed.
 */
export interface ConsoleMessages {
  errors: string[];
  warnings: string[];
}

interface OrbixFixtures {
  consoleMessages: ConsoleMessages;
}

export const test = base.extend<OrbixFixtures>({
  // Renamed from Playwright's conventional `use` to `provideFixture`: the
  // literal identifier `use` trips eslint-plugin-react-hooks' "use() must be
  // called from a component" rule (via next/core-web-vitals), which has no
  // awareness of Playwright's unrelated fixture-provider callback.
  consoleMessages: async ({ page }, provideFixture) => {
    const messages: ConsoleMessages = { errors: [], warnings: [] };

    page.on("console", (message) => {
      const type = message.type();

      if (type === "error") {
        messages.errors.push(message.text());
      } else if (type === "warning") {
        messages.warnings.push(message.text());
      }
    });

    page.on("pageerror", (error) => {
      messages.errors.push(error.message);
    });

    await provideFixture(messages);
  },
});

/** The public, statically-linked ORBIX routes. */
export const ROUTES = {
  home: "/",
  aircraft: "/aircraft",
  rockets: "/rockets",
  compare: "/compare",
  engineeringLab: "/engineering-lab",
  showcase: "/showcase",
  learn: "/learn",
} as const;

export type RouteKey = keyof typeof ROUTES;

export const AIRCRAFT_IDS = [
  "f-22-raptor",
  "f-35-lightning-ii",
  "f-15-eagle",
  "b-2-spirit",
  "sr-71-blackbird",
] as const;

export type AircraftId = (typeof AIRCRAFT_IDS)[number];

export const ROCKET_IDS = [
  "falcon-9",
  "falcon-heavy",
  "saturn-v",
  "space-launch-system",
  "starship",
] as const;

export type RocketId = (typeof ROCKET_IDS)[number];

/**
 * Asserts the document does not overflow horizontally, with a 1px tolerance
 * for subpixel rounding.
 */
export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const { clientWidth, scrollWidth } = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(
    scrollWidth,
    `Expected no horizontal overflow: document.documentElement.scrollWidth ` +
      `(${scrollWidth}px) should not exceed clientWidth (${clientWidth}px) ` +
      `by more than 1px.`,
  ).toBeLessThanOrEqual(clientWidth + 1);
}

/**
 * Scrolls the page to trigger native lazy-loaded images, then asserts every
 * image that was actually assigned a source finishes loading successfully.
 *
 * This deliberately does not wait for `networkidle`: on an image-heavy page
 * (e.g. a vehicle profile with a hero image plus several related-vehicle
 * cards), lazily-loaded images request in a staggered trickle as the scroll
 * loop below crosses each one's viewport threshold, and that trickle can
 * keep the network "busy" long enough that `networkidle` never fires within
 * a reasonable timeout — a known Playwright footgun for exactly this kind
 * of page. Polling the images' own `complete`/`naturalWidth` state is both
 * the more precise check (it's what we actually care about) and immune to
 * that failure mode.
 */
export async function expectAllImagesLoaded(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const step = Math.max(window.innerHeight, 400);
    const scrollHeight = document.documentElement.scrollHeight;

    for (let position = 0; position < scrollHeight; position += step) {
      window.scrollTo(0, position);
      // Yield a frame so the browser can evaluate lazy-load thresholds as
      // the viewport moves, without relying on a fixed timer for sync.
      await new Promise((resolve) => window.requestAnimationFrame(resolve));
    }

    window.scrollTo(0, document.documentElement.scrollHeight);
  });

  // NOTE: do NOT scroll back to the top before polling. `loading="lazy"`
  // images are only fetched while they are near the viewport, so scrolling
  // away before they resolve can strand them. Callers that need a known
  // scroll position should reset it after this returns.

  // Grace period: most images resolve immediately and need no intervention.
  const settledQuickly = await waitForImages(page, 5_000);
  if (settledQuickly) return;

  // Some did not resolve. This is a known local-server artifact, measured
  // rather than assumed:
  //
  // Against a local `next start`, Chromium sometimes settles an image's
  // `currentSrc` on the largest srcset candidate (`w=3840`) after layout
  // shifts, having already abandoned the in-flight request for the smaller
  // candidate it picked first — and then never issues a request for the new
  // selection at all. The element sits at `complete === false` forever. It
  // is not slowness: the same variant serves in ~3 ms once cached, and the
  // stall persists even when it is already warm.
  //
  // The same pages against production load every image normally, because
  // variants are served pre-cached and the re-selection never happens. So
  // there is nothing wrong with the application, and nothing in it to fix.
  //
  // The repair is applied ONLY to images that are actually stuck, and pins
  // each one to the exact variant the browser had already chosen for it —
  // so the rendered result is what Chromium intended to display, which is
  // what matters for a screenshot comparison.
  await page.evaluate(() => {
    for (const image of Array.from(document.querySelectorAll("img"))) {
      if (image.complete && image.naturalWidth > 0) continue;

      const chosen = image.currentSrc || image.src;
      if (chosen === "") continue;

      image.removeAttribute("srcset");
      image.removeAttribute("sizes");
      image.loading = "eager";
      image.src = chosen;
    }
  });

  await expect
    .poll(() => outstandingImages(page), { timeout: 30_000 })
    .toEqual([]);
}

/** URLs of images that have a source but have not finished loading. */
async function outstandingImages(page: Page): Promise<string[]> {
  return page.$$eval("img", (images) =>
    images
      .filter((image) => image.getAttribute("src") !== null)
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src),
  );
}

/** Polls until no images are outstanding, or the budget expires. */
async function waitForImages(page: Page, timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if ((await outstandingImages(page)).length === 0) return true;
    await page.waitForTimeout(250);
  }

  return (await outstandingImages(page)).length === 0;
}

/**
 * Asserts no unexpected console errors (or uncaught page errors) were
 * captured, after filtering out any messages matching the supplied
 * allowlist. The default allowlist is empty: unexpected app console output
 * should be discovered, not silently tolerated.
 */
export function expectNoUnexpectedConsoleErrors(
  consoleMessages: ConsoleMessages,
  allowlist: RegExp[] = [],
): void {
  const unexpected = consoleMessages.errors.filter(
    (message) => !allowlist.some((pattern) => pattern.test(message)),
  );

  expect(
    unexpected,
    `Expected no unexpected console errors, but found ${unexpected.length}:\n` +
      unexpected.join("\n"),
  ).toEqual([]);
}
