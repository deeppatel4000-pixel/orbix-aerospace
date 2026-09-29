import {
  expect,
  expectNoHorizontalOverflow,
  ROUTES,
  test,
} from "../fixtures/orbix";

/**
 * Showcase mission presets.
 *
 * The showcase used to open with a gallery of five mission photographs. Those
 * files had no recorded source and were treated as AI-generated, so the 2026
 * redesign removed them and their files (see docs/assets/image-provenance.md).
 * The presets are now described in text, with an SVG diagram drawn from the
 * mission data where one applies, and each links to its presentation view.
 *
 * These tests pin that replacement: five presets in order, each linking to its
 * own capture route, and no raster imagery anywhere in the page body.
 */

const PRESETS = [
  { id: "leo-satellite-deployment", name: "LEO Satellite Deployment" },
  { id: "iss-style-resupply", name: "ISS Style Resupply" },
  { id: "lunar-transfer-concept", name: "Lunar Transfer Concept" },
  { id: "reentry-demonstrator", name: "Reentry Demonstrator" },
  { id: "mars-transfer-concept", name: "Mars Transfer Concept" },
] as const;

test.describe("Showcase mission presets", () => {
  test("the page is titled for what it is", async ({ page }) => {
    await page.goto(ROUTES.showcase, { waitUntil: "domcontentloaded" });

    await expect(page).toHaveTitle("Inside ORBIX | ORBIX");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Inside ORBIX",
    );
  });

  test("five presets each link to their own presentation view, in order", async ({
    page,
  }) => {
    await page.goto(ROUTES.showcase, { waitUntil: "domcontentloaded" });

    const cards = page.locator("#mission-presets article");
    await expect(cards).toHaveCount(PRESETS.length);

    for (const [index, preset] of PRESETS.entries()) {
      const link = cards.nth(index).getByRole("link", {
        name: `Open the ${preset.name} presentation view`,
        exact: true,
      });
      await expect(link).toHaveAttribute(
        "href",
        `/showcase-capture/${preset.id}`,
      );
    }
  });

  test("every presentation view link resolves", async ({ page, request }) => {
    await page.goto(ROUTES.showcase, { waitUntil: "domcontentloaded" });

    const hrefs = await page
      .locator('#mission-presets a[href^="/showcase-capture/"]')
      .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
    expect(hrefs).toHaveLength(PRESETS.length);

    for (const href of hrefs) {
      const response = await request.get(href ?? "");
      expect(response.status(), `${href} should resolve`).toBe(200);
    }
  });

  test("any mission diagram is an SVG with an accessible name", async ({
    page,
  }) => {
    await page.goto(ROUTES.showcase, { waitUntil: "domcontentloaded" });

    const diagrams = page.locator("#mission-presets svg[role='img']");
    expect(await diagrams.count()).toBeGreaterThan(0);
    for (const diagram of await diagrams.all()) {
      await expect(diagram).toHaveAccessibleName(/\S/);
    }
  });

  test("the page body shows no raster imagery and no mission gallery", async ({
    page,
  }) => {
    await page.goto(ROUTES.showcase, { waitUntil: "domcontentloaded" });
    await expect(page.locator("main#main-content")).toBeVisible();

    await expect(page.locator("#mission-gallery")).toHaveCount(0);
    await expect(page.locator("main#main-content img")).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
  });
});
