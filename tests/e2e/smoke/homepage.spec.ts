import { expect, ROUTES, test } from "../fixtures/orbix";

/**
 * Homepage coverage.
 *
 * The homepage this replaced never linked to `/aircraft`, `/rockets`,
 * `/compare` or `/learn` at all — four of its six calls to action pointed at
 * `/engineering-lab` — so the product's largest completed systems were
 * unreachable from the front door and nothing failed. These tests make that
 * class of regression loud.
 *
 * Copy is deliberately not asserted word-for-word; destinations, structure and
 * honesty of claims are the contracts.
 */

const FEATURED = [
  "/aircraft/f-22-raptor",
  "/aircraft/b-2-spirit",
  "/rockets/space-launch-system",
] as const;

/** Every primary destination the homepage must expose. */
const REQUIRED_DESTINATIONS = [
  "/aircraft",
  "/rockets",
  "/compare",
  "/engineering-lab",
  "/learn",
  "/showcase",
] as const;

test.describe("Homepage", () => {
  test.skip(
    () => test.info().project.name !== "desktop",
    "Structure is viewport-independent; overflow guards cover responsive behaviour.",
  );

  test("has exactly one h1", async ({ page }) => {
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  });

  test("reaches every primary ORBIX destination", async ({ page }) => {
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });

    const hrefs = await page
      .locator("main a[href]")
      .evaluateAll((nodes) =>
        nodes.map((n) => (n.getAttribute("href") ?? "").split("#")[0] ?? ""),
      );

    for (const destination of REQUIRED_DESTINATIONS) {
      expect(hrefs, `the homepage must link to ${destination}`).toContain(
        destination,
      );
    }
  });

  test("each section links to its own destinations", async ({ page }) => {
    // Asserting destinations exist *somewhere* on the page is too weak: a
    // section could point at the wrong route and still pass because another
    // section happens to link there. Each section owns its outbound routes.
    const sections = [
      { expected: ["/aircraft", "/engineering-lab"], id: "home-title" },
      {
        expected: [
          "/aircraft",
          "/rockets",
          "/compare",
          "/engineering-lab",
          "/learn",
          "/showcase",
        ],
        id: "home-sections-title",
      },
      {
        expected: ["/aircraft", "/rockets", ...FEATURED],
        id: "home-featured-title",
      },
      { expected: ["/about"], id: "home-sourcing-title" },
    ] as const;

    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });

    for (const { expected, id } of sections) {
      const hrefs = await page
        .locator(`section:has(#${id}) a[href]`)
        .evaluateAll((nodes) =>
          nodes.map((n) => (n.getAttribute("href") ?? "").split("#")[0] ?? ""),
        );

      for (const destination of expected) {
        expect(
          hrefs,
          `the section titled #${id} must link to ${destination}`,
        ).toContain(destination);
      }
    }
  });

  test("features a cross-section of both registries", async ({ page }) => {
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });

    const cards = page.locator(".orbix-vehicle-card");
    await expect(cards).toHaveCount(FEATURED.length);

    const hrefs = await cards.evaluateAll((nodes) =>
      nodes.map((n) => n.getAttribute("href") ?? ""),
    );

    expect(hrefs.sort()).toEqual([...FEATURED].sort());
    // Both registries are represented: two aircraft and one launch vehicle.
    expect(hrefs.filter((h) => h.startsWith("/aircraft/"))).toHaveLength(2);
    expect(hrefs.filter((h) => h.startsWith("/rockets/"))).toHaveLength(1);
  });

  test("featured vehicles use the compact discovery card", async ({ page }) => {
    // The homepage must not grow its own vehicle card; it reuses the finished
    // primitive so a visitor meets the same object here and on the registries.
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });
    await expect(
      page.locator('.orbix-vehicle-card[data-variant="compact"]'),
    ).toHaveCount(FEATURED.length);
  });

  test("every homepage link resolves", async ({ page, request }) => {
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });

    const hrefs = await page
      .locator("main a[href^='/']")
      .evaluateAll((nodes) =>
        nodes.map((n) => (n.getAttribute("href") ?? "").split("#")[0] ?? ""),
      );

    for (const href of new Set(hrefs)) {
      const response = await request.get(href);
      expect(response.status(), `${href} should resolve`).toBe(200);
    }
  });

  test("the homepage copy does not claim a scrubber, live data or simulation", async ({
    page,
  }) => {
    // Mission Replay has play/pause/restart, a speed selector and phase
    // buttons; its progress element is non-interactive, and every figure is
    // computed from textbook models. Promising a scrubber, a live feed or a
    // simulation would misrepresent the product.
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });

    // `main` alone also matches the loading fallback's
    // <main role="status">, so scope to the real content landmark.
    const copy = (await page.locator("#main-content").textContent()) ?? "";
    for (const forbidden of [
      "scrubber",
      "scrub ",
      "live telemetry",
      "real-time",
      "simulation",
    ]) {
      expect(
        copy.toLowerCase(),
        `homepage copy should not claim "${forbidden.trim()}"`,
      ).not.toContain(forbidden);
    }
  });

  test("the hero figure credits its photograph", async ({ page }) => {
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });

    const caption = page.locator("section:has(#home-title) figcaption");
    await expect(caption).toHaveText(
      "Apollo 11 Saturn V lifting off from Launch Complex 39A, 16 July 1969. Credit: NASA. Public domain (U.S. government work) (licence terms, opens in a new tab). Source: Wikimedia Commons (opens in a new tab)",
    );
  });

  test("contains no nested interactive controls", async ({ page }) => {
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });

    const nested = await page.evaluate(
      () =>
        [
          ...document.querySelectorAll("#main-content a, #main-content button"),
        ].filter((el) => el.querySelector("a, button")).length,
    );

    expect(nested).toBe(0);
  });
});
