import {
  AIRCRAFT_IDS,
  expect,
  ROCKET_IDS,
  ROUTES,
  test,
} from "../fixtures/orbix";

/**
 * Profile body coverage: the section navigation, ids and related vehicles.
 * These tests pin the contracts that keep them from silently regressing:
 *
 *   - every anchor in the section nav resolves to a real id
 *   - no duplicate ids (two sections claiming one anchor breaks deep links)
 *   - related cards use the shared compact discovery card
 *   - a profile shows three related vehicles from its own registry, and never
 *     links back to the vehicle you are already on
 *
 * Section order and headings are covered by `vehicle-profile.spec.ts`.
 */

const COMPACT_CARD = '.orbix-vehicle-card[data-variant="compact"]';

/** Each profile closes with this many related vehicles. */
const RELATED_COUNT = 3;

test.describe("Vehicle profile body", () => {
  test.skip(
    () => test.info().project.name !== "desktop",
    "Profile structure is viewport-independent; overflow guards cover responsive behaviour.",
  );

  test("every section-navigation anchor resolves to a real section", async ({
    page,
  }) => {
    for (const route of [
      `${ROUTES.aircraft}/f-22-raptor`,
      `${ROUTES.rockets}/falcon-9`,
    ]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });

      const broken = await page.evaluate(() =>
        [...document.querySelectorAll('nav a[href^="#"]')]
          .map((anchor) => (anchor.getAttribute("href") ?? "").slice(1))
          .filter((id) => id !== "" && !document.getElementById(id)),
      );

      expect(broken, `${route} has nav links to missing sections`).toEqual([]);
    }
  });

  test("profiles contain no duplicate element ids", async ({ page }) => {
    // Two elements sharing an id makes a deep link ambiguous and silently
    // sends the reader to whichever came first.
    for (const route of [
      `${ROUTES.aircraft}/f-22-raptor`,
      `${ROUTES.rockets}/falcon-9`,
    ]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });

      const duplicates = await page.evaluate(() => {
        const ids = [...document.querySelectorAll("[id]")].map((n) => n.id);
        return [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
      });

      expect(duplicates, `${route} has duplicate ids`).toEqual([]);
    }
  });

  for (const id of AIRCRAFT_IDS) {
    test(`${id} related aircraft link correctly and exclude itself`, async ({
      page,
    }) => {
      await page.goto(`${ROUTES.aircraft}/${id}`, {
        waitUntil: "domcontentloaded",
      });

      const cards = page.locator(`#related-aircraft ${COMPACT_CARD}`);
      await expect(cards).toHaveCount(RELATED_COUNT);
      await expect(page.locator(COMPACT_CARD)).toHaveCount(RELATED_COUNT);

      const hrefs = await cards.evaluateAll((nodes) =>
        nodes.map((n) => n.getAttribute("href") ?? ""),
      );

      expect(
        hrefs.some((href) => href.endsWith(`/${id}`)),
        "a related card must never link back to the current vehicle",
      ).toBe(false);
      for (const href of hrefs) {
        expect(href).toMatch(/^\/aircraft\/[a-z0-9-]+$/);
      }
    });
  }

  for (const id of ROCKET_IDS) {
    test(`${id} related launch vehicles link correctly and exclude itself`, async ({
      page,
    }) => {
      await page.goto(`${ROUTES.rockets}/${id}`, {
        waitUntil: "domcontentloaded",
      });

      const cards = page.locator(`#related-rockets ${COMPACT_CARD}`);
      await expect(cards).toHaveCount(RELATED_COUNT);
      await expect(page.locator(COMPACT_CARD)).toHaveCount(RELATED_COUNT);

      const hrefs = await cards.evaluateAll((nodes) =>
        nodes.map((n) => n.getAttribute("href") ?? ""),
      );

      expect(
        hrefs.some((href) => href.endsWith(`/${id}`)),
        "a related card must never link back to the current vehicle",
      ).toBe(false);
      for (const href of hrefs) {
        expect(href).toMatch(/^\/rockets\/[a-z0-9-]+$/);
      }
    });
  }

  test("discovery index cards keep the default variant", async ({ page }) => {
    // The compact variant must not leak into the finished discovery indexes.
    for (const route of [ROUTES.aircraft, ROUTES.rockets]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });

      await expect(
        page.locator(COMPACT_CARD),
        `${route} must not render compact cards`,
      ).toHaveCount(0);
      await expect(
        page.locator('.orbix-vehicle-card[data-variant="default"]'),
      ).toHaveCount(5);
    }
  });

  test("no profile section renders an empty heading", async ({ page }) => {
    for (const route of [
      `${ROUTES.aircraft}/f-22-raptor`,
      `${ROUTES.rockets}/falcon-9`,
    ]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });

      const empty = await page
        .locator("#main-content section[id] h2")
        .evaluateAll((nodes) =>
          nodes
            .filter((n) => (n.textContent ?? "").trim() === "")
            .map((n) => n.id),
        );

      expect(empty, `${route} has an empty section heading`).toEqual([]);
    }
  });
});
