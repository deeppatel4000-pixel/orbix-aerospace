import { expect, ROUTES, test } from "../fixtures/orbix";

/**
 * Compare workspace coverage.
 *
 * A comparison of physical vehicles once showed a picture of none of them,
 * and the matrix identified its columns by text alone. Design v2 puts an
 * identity strip above the spec sheet (the "Selected aircraft" or "Selected
 * launch vehicles" list): one item per compared vehicle, in column order,
 * with its photograph, name, maker and a "Full profile" link. The sheet
 * itself is one table per engineering group, each with a (visually hidden)
 * column header per vehicle under a decorative name band.
 *
 * These tests cover that UI contract only. Query semantics are unchanged
 * and remain covered by `compare-query.spec.ts`; nothing here re-tests them.
 *
 * Magnitude encoding is covered separately by `compare-magnitude.spec.ts`;
 * nothing here asserts anything about it.
 */

type Page = import("@playwright/test").Page;

/** One identity-strip item per compared vehicle, in column order. */
function identity(page: Page) {
  return page.getByRole("list", { name: /^Selected / }).getByRole("listitem");
}

/** The vehicle column headers of the first group table (the first column labels rows). */
function vehicleColumnHeaders(page: Page) {
  return page
    .getByRole("table")
    .first()
    .locator("thead th[scope=col]:not(:first-child)");
}

/** The optimised image sources in the identity strip, as their original paths. */
async function identityImageSources(page: Page) {
  return identity(page)
    .locator("img")
    .evaluateAll((nodes) =>
      nodes.map((n) => {
        const src = n.getAttribute("src") ?? "";
        return new URL(src, "http://127.0.0.1").searchParams.get("url") ?? "";
      }),
    );
}

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

    const expected = ["F-22 Raptor", "SR-71 Blackbird", "B-2 Spirit"];

    // What a sighted reader sees: the identity strip, in column order.
    await expect(identity(page)).toHaveCount(3);
    for (const [index, name] of expected.entries()) {
      await expect(identity(page).nth(index)).toContainText(name);
    }

    // What assistive technology reads: the sheet's column headers.
    const headers = await vehicleColumnHeaders(page).allTextContents();
    expect(headers.map((name) => name.trim())).toEqual(expected);
  });

  test("each column links to its own vehicle profile", async ({ page }) => {
    await page.goto(ROCKET_QUERY, { waitUntil: "domcontentloaded" });

    // One "Full profile" link per identity item, named for its vehicle.
    const links = identity(page).getByRole("link", { name: /^Full profile: / });
    await expect(links).toHaveCount(3);

    const hrefs = await links.evaluateAll((nodes) =>
      nodes.map((n) => n.getAttribute("href") ?? ""),
    );

    expect(hrefs).toEqual([
      "/rockets/falcon-9",
      "/rockets/saturn-v",
      "/rockets/starship",
    ]);
    await expect(
      identity(page).getByRole("link", { name: "Full profile: Saturn V" }),
    ).toHaveAttribute("href", "/rockets/saturn-v");
  });

  test("an aircraft comparison shows aircraft imagery", async ({ page }) => {
    await page.goto(AIRCRAFT_QUERY, { waitUntil: "domcontentloaded" });

    await expect(identity(page)).toHaveCount(3);
    const sources = await identityImageSources(page);

    expect(sources).toHaveLength(3);
    for (const source of sources) {
      expect(source).toMatch(/^\/images\/aircraft\//);
    }
  });

  test("a launch-vehicle comparison shows rocket imagery", async ({ page }) => {
    await page.goto(ROCKET_QUERY, { waitUntil: "domcontentloaded" });

    await expect(identity(page)).toHaveCount(3);
    const sources = await identityImageSources(page);

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
    await expect(identity(page)).toHaveCount(2);
    await expect(vehicleColumnHeaders(page)).toHaveCount(2);

    await page.goto(AIRCRAFT_QUERY, { waitUntil: "domcontentloaded" });
    await expect(identity(page)).toHaveCount(3);
    await expect(vehicleColumnHeaders(page)).toHaveCount(3);
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

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("table")).toHaveCount(0);
    await expect(identity(page)).toHaveCount(0);
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

    // The sheet's scroller is the nearest ancestor of the group tables that
    // scrolls sideways. Polled: its scrollWidth depends on the matrix and
    // its images having laid out, which races under parallel workers.
    const measure = () =>
      page.evaluate(() => {
        let region = document.querySelector("table")?.parentElement ?? null;
        while (region && region !== document.body) {
          const overflow = getComputedStyle(region).overflowX;
          if (overflow === "auto" || overflow === "scroll") break;
          region = region.parentElement;
        }
        const scroller = region === document.body ? null : region;
        return {
          bodyOverflow: Math.max(
            0,
            document.documentElement.scrollWidth -
              document.documentElement.clientWidth,
          ),
          regionScrolls: scroller
            ? scroller.scrollWidth > scroller.clientWidth
            : false,
          regionWidth: scroller ? scroller.scrollWidth : 0,
        };
      });

    await expect
      .poll(async () => (await measure()).regionWidth)
      .toBeGreaterThan(0);
    const measured = await measure();

    // The contained horizontal scroller is existing, working behaviour: the
    // matrix scrolls, the page does not.
    expect(measured.bodyOverflow).toBe(0);
    expect(measured.regionScrolls).toBe(true);
  });
});
