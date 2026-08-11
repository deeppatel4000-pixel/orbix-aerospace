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
  "/aircraft/sr-71-blackbird",
  "/rockets/falcon-9",
  "/rockets/saturn-v",
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
      { expected: ["/aircraft", "/rockets"], id: "vehicle-systems-title" },
      {
        expected: ["/compare", "/engineering-lab"],
        id: "analysis-preview-title",
      },
      {
        expected: ["/engineering-lab", "/showcase"],
        id: "mission-preview-title",
      },
      { expected: ["/learn"], id: "research-preview-title" },
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
    // Two from each registry: one modern, one historic.
    expect(hrefs.filter((h) => h.startsWith("/aircraft/"))).toHaveLength(2);
    expect(hrefs.filter((h) => h.startsWith("/rockets/"))).toHaveLength(2);
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

  test("the mission preview does not claim a timeline scrubber", async ({
    page,
  }) => {
    // Mission Replay has play/pause/restart, a speed selector and phase
    // buttons — its progress element is non-interactive. Promising a scrubber
    // or a live feed would misrepresent the product.
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
