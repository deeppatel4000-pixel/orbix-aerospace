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

/**
 * Design v3 (spec 6 and 11, Home): after the hero, the two registries as
 * two open catalogue columns, aircraft then launch vehicles, each with a
 * pictured vehicle (F-22 Raptor, Saturn V), a table of every vehicle in
 * the registry and a link to the registry. No card chrome.
 */
const REGISTRY_LINKS = ["/aircraft", "/rockets"] as const;
const AIRCRAFT_PROFILES = [
  "/aircraft/b-2-spirit",
  "/aircraft/f-15-eagle",
  "/aircraft/f-22-raptor",
  "/aircraft/f-35-lightning-ii",
  "/aircraft/sr-71-blackbird",
] as const;
const ROCKET_PROFILES = [
  "/rockets/falcon-9",
  "/rockets/falcon-heavy",
  "/rockets/saturn-v",
  "/rockets/space-launch-system",
  "/rockets/starship",
] as const;

/** Every primary destination the homepage must expose. */
const REQUIRED_DESTINATIONS = [
  "/aircraft",
  "/rockets",
  "/compare",
  "/engineering-lab",
  "/learn",
  "/showcase",
  "/verification",
  "/build-log",
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
      { expected: [...REGISTRY_LINKS], id: "home-registries-title" },
      {
        // The plain section list (spec 11, no numbers): Compare,
        // Engineering Lab, Learn, Verification, How I built ORBIX, Showcase.
        expected: [
          "/compare",
          "/engineering-lab",
          "/learn",
          "/verification",
          "/build-log",
          "/showcase",
        ],
        id: "home-sections-title",
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

  test("presents both registries as open catalogue columns", async ({
    page,
  }) => {
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });

    const section = page.locator("section:has(#home-registries-title)");
    await expect(
      section.getByRole("heading", { level: 3, name: "Aircraft" }),
    ).toBeVisible();
    await expect(
      section.getByRole("heading", { level: 3, name: "Launch vehicles" }),
    ).toBeVisible();

    // One pictured vehicle per column, credited on the ground.
    const plates = section.locator("figure");
    await expect(plates).toHaveCount(2);
    await expect(plates.nth(0).locator("img")).toHaveAttribute("alt", /F-22/);
    await expect(plates.nth(1).locator("img")).toHaveAttribute(
      "alt",
      /Saturn V/,
    );
    await expect(plates.nth(0).locator("figcaption")).toContainText(
      "Source file",
    );

    // Each table lists every vehicle in its registry.
    const tables = section.locator("table");
    await expect(tables).toHaveCount(2);
    const rowHrefs = (table: number) =>
      tables
        .nth(table)
        .locator("tbody a[href]")
        .evaluateAll((nodes) =>
          nodes.map((n) => n.getAttribute("href") ?? "").sort(),
        );
    expect(await rowHrefs(0)).toEqual([...AIRCRAFT_PROFILES]);
    expect(await rowHrefs(1)).toEqual([...ROCKET_PROFILES]);
  });

  test("the registry columns carry no card chrome", async ({ page }) => {
    // Spec 3.2: no bordered or filled container around content. The
    // columns are structured by type, a 2px heading rule and the tables'
    // horizontal rules only.
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });

    const columns = page.locator(
      "section:has(#home-registries-title) [data-division]",
    );
    await expect(columns).toHaveCount(2);
    const chrome = await columns.evaluateAll((nodes) =>
      nodes.map((n) => {
        const style = getComputedStyle(n);
        return {
          background: style.backgroundColor,
          border: [
            style.borderTopWidth,
            style.borderRightWidth,
            style.borderBottomWidth,
            style.borderLeftWidth,
          ].join(" "),
          radius: style.borderRadius,
        };
      }),
    );
    for (const column of chrome) {
      expect(column.background).toBe("rgba(0, 0, 0, 0)");
      expect(column.border).toBe("0px 0px 0px 0px");
      expect(column.radius).toBe("0px");
    }
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

    // The SR-71 photograph (spec 9) with its credit line: who took it, the
    // licence (linked to its terms) and the source file.
    const hero = page.locator("section:has(#home-title)");
    await expect(hero.locator("img").first()).toHaveAttribute("alt", /SR-71/);

    const caption = hero.locator("figcaption");
    await expect(caption).toContainText("Photo: NASA");
    await expect(
      caption.getByRole("link", { name: /^Public domain/ }),
    ).toHaveAttribute(
      "href",
      "https://commons.wikimedia.org/wiki/Template:PD-USGov-NASA",
    );
    await expect(
      caption.getByRole("link", { name: "Source file" }),
    ).toHaveAttribute(
      "href",
      /^https:\/\/commons\.wikimedia\.org\/wiki\/File:SR-71_/,
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
