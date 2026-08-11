import { expect, ROUTES, test } from "../fixtures/orbix";

/**
 * Compare workspace (Phase 3A) coverage.
 *
 * The shipped Compare route rendered exactly ONE image — the hero backdrop —
 * so a comparison of physical vehicles showed a picture of none of them, and
 * the matrix identified its columns by text alone. This phase added a column
 * identity strip.
 *
 * These tests cover the new UI contract only. Query semantics are unchanged
 * and remain covered by `compare-query.spec.ts`; nothing here re-tests them.
 *
 * Magnitude encoding is covered separately by `compare-magnitude.spec.ts`;
 * nothing here asserts anything about it.
 */

const IDENTITY = ".orbix-compare-identity > li";

const AIRCRAFT_QUERY = `${ROUTES.compare}?category=aircraft&vehicles=f-22-raptor,sr-71-blackbird,b-2-spirit`;
const ROCKET_QUERY = `${ROUTES.compare}?category=rockets&vehicles=falcon-9,saturn-v,starship`;

test.describe("Compare workspace", () => {
  test.skip(
    () => test.info().project.name !== "desktop",
    "Structure is viewport-independent; the mobile containment test below sets its own viewport.",
  );

  test("identity strip matches the query-selected vehicles, in order", async ({
    page,
  }) => {
    await page.goto(AIRCRAFT_QUERY, { waitUntil: "domcontentloaded" });

    const names = await page
      .locator(`${IDENTITY} .orbix-compare-identity__name`)
      .allTextContents();

    expect(names.map((name) => name.trim())).toEqual([
      "F-22 Raptor",
      "SR-71 Blackbird",
      "B-2 Spirit",
    ]);
  });

  test("each identity links to its own vehicle profile", async ({ page }) => {
    await page.goto(ROCKET_QUERY, { waitUntil: "domcontentloaded" });

    const hrefs = await page
      .locator(`${IDENTITY} a[href^="/rockets/"]`)
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("href") ?? ""));

    expect(hrefs).toEqual([
      "/rockets/falcon-9",
      "/rockets/saturn-v",
      "/rockets/starship",
    ]);
  });

  test("an aircraft comparison shows aircraft imagery", async ({ page }) => {
    await page.goto(AIRCRAFT_QUERY, { waitUntil: "domcontentloaded" });

    const sources = await page.locator(`${IDENTITY} img`).evaluateAll((nodes) =>
      nodes.map((n) => {
        const src = n.getAttribute("src") ?? "";
        return new URL(src, "http://127.0.0.1").searchParams.get("url") ?? "";
      }),
    );

    expect(sources).toHaveLength(3);
    for (const source of sources) {
      expect(source).toMatch(/^\/images\/aircraft\//);
    }
  });

  test("a launch-vehicle comparison shows rocket imagery", async ({ page }) => {
    await page.goto(ROCKET_QUERY, { waitUntil: "domcontentloaded" });

    const sources = await page.locator(`${IDENTITY} img`).evaluateAll((nodes) =>
      nodes.map((n) => {
        const src = n.getAttribute("src") ?? "";
        return new URL(src, "http://127.0.0.1").searchParams.get("url") ?? "";
      }),
    );

    expect(sources).toHaveLength(3);
    for (const source of sources) {
      expect(source).toMatch(/^\/images\/rockets\//);
    }
  });

  test("the identity count follows the selection", async ({ page }) => {
    await page.goto(
      `${ROUTES.compare}?category=aircraft&vehicles=f-22-raptor,sr-71-blackbird`,
      { waitUntil: "domcontentloaded" },
    );
    await expect(page.locator(IDENTITY)).toHaveCount(2);

    await page.goto(AIRCRAFT_QUERY, { waitUntil: "domcontentloaded" });
    await expect(page.locator(IDENTITY)).toHaveCount(3);
  });

  test("fewer than two vehicles renders no matrix and no identity strip", async ({
    page,
  }) => {
    // The `vehicles.length >= 2` gate is existing behaviour; the identity
    // strip must respect it rather than rendering a lone column.
    await page.goto(
      `${ROUTES.compare}?category=aircraft&vehicles=f-22-raptor`,
      {
        waitUntil: "domcontentloaded",
      },
    );

    await expect(page.getByRole("table")).toHaveCount(0);
    await expect(page.locator(IDENTITY)).toHaveCount(0);
  });

  test("category groups remain present in the matrix", async ({ page }) => {
    await page.goto(ROCKET_QUERY, { waitUntil: "domcontentloaded" });

    const groups = await page
      .locator('[id^="compare-group-"]')
      .evaluateAll((nodes) => nodes.length);

    expect(groups).toBeGreaterThan(1);
  });

  test("the identity strip contains no nested interactive controls", async ({
    page,
  }) => {
    await page.goto(AIRCRAFT_QUERY, { waitUntil: "domcontentloaded" });

    const nested = await page.evaluate(
      () =>
        [
          ...document.querySelectorAll(
            ".orbix-compare-identity a, .orbix-compare-identity button",
          ),
        ].filter((el) => el.querySelector("a, button")).length,
    );

    expect(nested).toBe(0);
  });
});

test.describe("Compare workspace at mobile width", () => {
  test.use({ viewport: { height: 844, width: 390 } });
  test.skip(
    () => test.info().project.name !== "desktop",
    "Runs once with an explicit mobile viewport.",
  );

  test("the matrix scrolls inside its own region without body overflow", async ({
    page,
  }) => {
    await page.goto(AIRCRAFT_QUERY, { waitUntil: "domcontentloaded" });

    // Polled: the region's scrollWidth depends on the matrix and its images
    // having laid out, which races under parallel workers.
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const region = document.querySelector<HTMLElement>(
            '[aria-label="Vehicle comparison table"]',
          );
          return region ? region.scrollWidth : 0;
        }),
      )
      .toBeGreaterThan(0);

    const measured = await page.evaluate(() => {
      const region = document.querySelector<HTMLElement>(
        '[aria-label="Vehicle comparison table"]',
      );
      return {
        bodyOverflow:
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
        regionScrolls: region ? region.scrollWidth > region.clientWidth : false,
      };
    });

    // The contained horizontal scroller is existing, working behaviour: the
    // matrix scrolls, the page does not.
    expect(measured.bodyOverflow).toBe(0);
    expect(measured.regionScrolls).toBe(true);
  });
});
