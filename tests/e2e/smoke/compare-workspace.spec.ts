import { expect, ROUTES, test } from "../fixtures/orbix";

/**
 * Compare workspace coverage.
 *
 * A comparison of physical vehicles once showed a picture of none of them,
 * and the matrix identified its columns by text alone. Each vehicle column
 * header now carries the vehicle's photograph, name and maker, and a
 * "Vehicle profile" row links each column to its full profile. (The separate
 * identity strip above the table was folded into the header row by the 2026
 * redesign.)
 *
 * These tests cover the new UI contract only. Query semantics are unchanged
 * and remain covered by `compare-query.spec.ts`; nothing here re-tests them.
 *
 * Magnitude encoding is covered separately by `compare-magnitude.spec.ts`;
 * nothing here asserts anything about it.
 */

/** One header cell per compared vehicle (the first column labels rows). */
const IDENTITY = "thead th[scope=col]:not(:first-child)";

const AIRCRAFT_QUERY = `${ROUTES.compare}?category=aircraft&vehicles=f-22-raptor,sr-71-blackbird,b-2-spirit`;
const ROCKET_QUERY = `${ROUTES.compare}?category=rockets&vehicles=falcon-9,saturn-v,starship`;

test.describe("Compare workspace", () => {
  test.skip(
    () => test.info().project.name !== "desktop",
    "Structure is viewport-independent; the mobile containment test below sets its own viewport.",
  );

  test("vehicle columns match the query-selected vehicles, in order", async ({
    page,
  }) => {
    await page.goto(AIRCRAFT_QUERY, { waitUntil: "domcontentloaded" });

    const names = await page.locator(`${IDENTITY} .orbix-h4`).allTextContents();

    expect(names.map((name) => name.trim())).toEqual([
      "F-22 Raptor",
      "SR-71 Blackbird",
      "B-2 Spirit",
    ]);
  });

  test("each column links to its own vehicle profile", async ({ page }) => {
    await page.goto(ROCKET_QUERY, { waitUntil: "domcontentloaded" });

    // The links live in the "Vehicle profile" row, one cell per column.
    const profileRow = page.locator("tbody tr", {
      has: page.locator("th", { hasText: /^Vehicle profile$/ }),
    });
    await expect(profileRow).toHaveCount(1);

    const hrefs = await profileRow
      .locator('a[href^="/rockets/"]')
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

  test("the column count follows the selection", async ({ page }) => {
    await page.goto(
      `${ROUTES.compare}?category=aircraft&vehicles=f-22-raptor,sr-71-blackbird`,
      { waitUntil: "domcontentloaded" },
    );
    await expect(page.locator(IDENTITY)).toHaveCount(2);

    await page.goto(AIRCRAFT_QUERY, { waitUntil: "domcontentloaded" });
    await expect(page.locator(IDENTITY)).toHaveCount(3);
  });

  test("fewer than two vehicles renders no matrix and no vehicle columns", async ({
    page,
  }) => {
    // The `vehicles.length >= 2` gate is existing behaviour; the columns
    // must respect it rather than rendering a lone vehicle.
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

  test("the comparison contains no nested interactive controls", async ({
    page,
  }) => {
    await page.goto(AIRCRAFT_QUERY, { waitUntil: "domcontentloaded" });

    const nested = await page.evaluate(
      () =>
        [...document.querySelectorAll("table a, table button")].filter((el) =>
          el.querySelector("a, button"),
        ).length,
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
