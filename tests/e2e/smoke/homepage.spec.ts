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
 * Design v2 (spec 9, Home): after the hero, the two registries as an
 * asymmetric split of two cards, one per registry, each picturing a vehicle
 * (F-22 Raptor, Saturn V) and opening its registry.
 */
const REGISTRY_CARDS = ["/aircraft", "/rockets"] as const;

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
      { expected: [...REGISTRY_CARDS], id: "home-registries-title" },
      {
        // The numbered section index (spec 9): Compare, Engineering Lab,
        // Learn, Verification, How I built ORBIX, Showcase.
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

  test("presents both registries as one card each", async ({ page }) => {
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });

    const cards = page.locator(
      "section:has(#home-registries-title) .orbix-vehicle-card",
    );
    await expect(cards).toHaveCount(REGISTRY_CARDS.length);

    const hrefs = await cards.evaluateAll((nodes) =>
      nodes.map((n) => n.getAttribute("href") ?? ""),
    );
    expect(hrefs).toEqual([...REGISTRY_CARDS]);

    // Each card names the vehicle it pictures.
    await expect(cards.nth(0)).toContainText("F-22 Raptor");
    await expect(cards.nth(1)).toContainText("Saturn V");
  });

  test("the registry split is asymmetric, not two equal cards", async ({
    page,
  }) => {
    // Spec 9 and 3: a large aircraft card beside a tall launch-vehicle card,
    // at different sizes. Uses the shared discovery card, not a local one.
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });

    const cards = page.locator(
      "section:has(#home-registries-title) .orbix-vehicle-card",
    );
    await expect(cards).toHaveCount(2);
    // Polled: the boxes are only meaningful once the stylesheet and the
    // photographs have laid the section out.
    const shape = () =>
      cards.evaluateAll((nodes) => {
        const [aircraft, rocket] = nodes.map((n) => n.getBoundingClientRect());
        if (!aircraft || !rocket) return "missing";
        return [
          aircraft.width > rocket.width
            ? "aircraft wider"
            : "aircraft narrower",
          rocket.height > aircraft.height ? "rocket taller" : "rocket shorter",
        ].join(", ");
      });

    await expect.poll(shape).toBe("aircraft wider, rocket taller");
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
