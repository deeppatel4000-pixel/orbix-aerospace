import {
  AIRCRAFT_IDS,
  expect,
  PROJECT_ROUTES,
  ROCKET_IDS,
  ROUTES,
  test,
} from "../fixtures/orbix";

/**
 * Homepage coverage (v4 plan section 4).
 *
 * The home page is built for a five-minute read: a hero with the thesis,
 * the author and his grade and the live Transfer Explorer; the verification
 * score with one sample row; three featured tools; one vehicle photo plate;
 * and three sentences on authorship. These tests pin what each section
 * links to and that every number it shows agrees with the page it comes
 * from.
 *
 * Copy is deliberately not asserted word-for-word; destinations, structure,
 * counts and honesty of claims are the contracts.
 */

/** Every destination the homepage must expose in its content. */
const REQUIRED_DESTINATIONS = [
  ROUTES.engineeringLab,
  ROUTES.aircraft,
  ROUTES.rockets,
  ROUTES.compare,
  PROJECT_ROUTES.verification,
  PROJECT_ROUTES.buildLog,
] as const;

/** The comparison the vehicles section opens (v4 plan section 3). */
const PRELOADED_COMPARISON = ["SR-71 Blackbird", "F-22 Raptor", "B-2 Spirit"];

type Page = import("@playwright/test").Page;

/** The section a heading titles: its nearest `<section>` ancestor. */
function sectionOf(page: Page, titleId: string) {
  return page.locator(`#${titleId}`).locator("xpath=ancestor::section[1]");
}

function sectionHrefs(page: Page, titleId: string) {
  return sectionOf(page, titleId)
    .locator("a[href]")
    .evaluateAll((nodes) =>
      nodes.map((n) => (n.getAttribute("href") ?? "").split(/[?#]/)[0] ?? ""),
    );
}

test.describe("Homepage", () => {
  test.skip(
    () => test.info().project.name !== "desktop",
    "Structure is viewport-independent; overflow guards cover responsive behavior.",
  );

  test("has exactly one h1", async ({ page }) => {
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  });

  test("reaches every primary ORBIX destination", async ({ page }) => {
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });

    const hrefs = await page
      .locator("#main-content a[href]")
      .evaluateAll((nodes) =>
        nodes.map((n) => (n.getAttribute("href") ?? "").split(/[?#]/)[0] ?? ""),
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
      {
        expected: [
          ROUTES.engineeringLab,
          PROJECT_ROUTES.verification,
          PROJECT_ROUTES.buildLog,
        ],
        id: "home-title",
      },
      { expected: [PROJECT_ROUTES.verification], id: "home-proof-title" },
      { expected: [ROUTES.engineeringLab], id: "home-tools-title" },
      {
        expected: [ROUTES.aircraft, ROUTES.rockets, ROUTES.compare],
        id: "home-vehicles-title",
      },
      { expected: [PROJECT_ROUTES.buildLog], id: "home-authorship-title" },
    ] as const;

    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });

    for (const { expected, id } of sections) {
      const hrefs = await sectionHrefs(page, id);
      for (const destination of expected) {
        expect(
          hrefs,
          `the section titled #${id} must link to ${destination}`,
        ).toContain(destination);
      }
    }
  });

  test("the hero names the author and his grade, with no photograph", async ({
    page,
  }) => {
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });

    const hero = sectionOf(page, "home-title");
    await expect(hero).toContainText("Deep Patel");
    await expect(hero).toContainText("high school senior");
    // Authorship framing (v4 plan section 2): never "I coded".
    await expect(hero).toContainText("AI coding assistants wrote the code");
    await expect(hero.locator("img")).toHaveCount(0);
  });

  test("the hero shows the live Transfer Explorer", async ({ page }) => {
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });

    const explorer = sectionOf(page, "home-explorer-title");
    await expect(
      explorer.getByRole("img", { name: /^Hohmann transfer from 200 km/ }),
    ).toBeVisible();
    await expect(
      explorer.getByRole("slider", { name: "Target orbit altitude" }),
    ).toBeVisible();
    await expect(explorer.getByText("Total delta-v")).toBeVisible();
    // Its own lab link shows from 1024px only: below that the byline and
    // "Open the Engineering Lab" follow the explorer directly.
    const labLink = explorer.getByRole("link", {
      name: "Open in the Engineering Lab",
    });
    if (test.info().project.name === "desktop") {
      await expect(labLink).toHaveAttribute(
        "href",
        "/engineering-lab#hohmann-transfer-analyzer",
      );
    } else {
      await expect(labLink).toHaveCount(0);
      await expect(
        page.getByRole("link", { name: "Open the Engineering Lab" }),
      ).toBeVisible();
    }
  });

  test("the proof line states the same counts as the Verification page", async ({
    page,
  }) => {
    await page.goto(PROJECT_ROUTES.verification, {
      waitUntil: "domcontentloaded",
    });
    const lead = (await page.locator("#main-content").textContent()) ?? "";
    const match = /(\d+) of (\d+) compared values pass/.exec(lead);
    expect(match, "the Verification page states its score").not.toBeNull();
    const [, within, total] = match ?? [];

    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });
    const proof = sectionOf(page, "home-proof-title");
    const text = ((await proof.textContent()) ?? "").replace(/\s+/g, " ");
    expect(text).toContain(
      `${within} of ${total} compared values fall within the rounding`,
    );
    expect(text).toContain(
      `the other ${Number(total) - Number(within)} are listed`,
    );
    // The sample row and the explorer above it use different Earth radii,
    // and the page says so, so their two answers do not read as a conflict.
    expect(text).toContain("from a 6,378.14 km Earth radius");
    expect(text).toContain("uses the 6,371 km mean radius");
  });

  test("the three featured tools open real lab tools", async ({ page }) => {
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });

    const links = sectionOf(page, "home-tools-title").locator(
      'a[href^="/engineering-lab#"]',
    );
    await expect(links).toHaveCount(3);
    const anchors = await links.evaluateAll((nodes) =>
      nodes.map((n) => (n.getAttribute("href") ?? "").split("#")[1] ?? ""),
    );

    await page.goto(ROUTES.engineeringLab, { waitUntil: "domcontentloaded" });
    for (const anchor of anchors) {
      await expect(
        page.locator(`[data-laboratory-tool="${anchor}"]`),
        `#${anchor} is a tool on the lab page`,
      ).toHaveCount(1);
    }
  });

  test("the vehicles plate is credited and its counts match the registries", async ({
    page,
  }) => {
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });

    const section = sectionOf(page, "home-vehicles-title");
    const plate = section.locator("figure");
    await expect(plate).toHaveCount(1);
    await expect(plate.locator("img")).toHaveAttribute("alt", /.+/);
    await expect(
      plate.getByRole("link", { name: "Source file" }),
    ).toHaveAttribute(
      "href",
      /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/,
    );

    await expect(section).toContainText(
      `records of ${AIRCRAFT_IDS.length} aircraft and ${ROCKET_IDS.length} launch vehicles`,
    );
  });

  test("the comparison link opens the three aircraft it names", async ({
    page,
  }) => {
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });

    const link = sectionOf(page, "home-vehicles-title").locator(
      'a[href^="/compare"]',
    );
    await expect(link).toHaveCount(1);
    for (const name of PRELOADED_COMPARISON) {
      await expect(link).toContainText(name);
    }

    await link.click();
    await expect(page).toHaveURL(/\/compare\?/);
    // The sheet's vehicle column headers (visually hidden under the name
    // band; compare-workspace.spec.ts covers what a sighted reader sees).
    const headers = page
      .getByRole("table")
      .first()
      .locator("thead th[scope=col]:not(:first-child)");
    await expect(headers).toHaveText(PRELOADED_COMPARISON);
  });

  test("every homepage link resolves", async ({ page, request }) => {
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });

    const hrefs = await page
      .locator("#main-content a[href^='/']")
      .evaluateAll((nodes) =>
        nodes.map((n) => (n.getAttribute("href") ?? "").split("#")[0] ?? ""),
      );

    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of new Set(hrefs)) {
      const response = await request.get(href);
      expect(response.status(), `${href} should resolve`).toBe(200);
    }
  });

  test("the homepage copy does not claim live data, a simulation or validation", async ({
    page,
  }) => {
    // Every figure is computed from textbook models when the reader moves a
    // control. Promising a live feed, a simulation or validated results
    // would misrepresent the product (v4 plan section 8: "selected results
    // checked", never "validated").
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });

    // `main` alone also matches the loading fallback's
    // <main role="status">, so scope to the real content landmark.
    const copy = (await page.locator("#main-content").textContent()) ?? "";
    for (const forbidden of [
      "live telemetry",
      "real-time",
      "simulation",
      "validated",
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
