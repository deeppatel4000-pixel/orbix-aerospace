import {
  AIRCRAFT_IDS,
  expect,
  ROCKET_IDS,
  ROUTES,
  test,
} from "../fixtures/orbix";

/**
 * Vehicle discovery coverage for `/aircraft` and `/rockets`.
 *
 * ## What this protects
 *
 * The indexes previously sized card media per vehicle via a `cardTreatment`
 * value while the grid handed out five different column spans. Measured at
 * 1440px that produced media aspect ratios of 1.60/1.33/2.00/2.00/2.00 and a
 * 227px spread in aircraft card heights (317px for rockets) — the ragged grid
 * the audit reported. Nothing asserted any of it, so it was invisible to CI.
 *
 * These tests pin the contract that replaced it (design v3, spec 6 and
 * 11: an open catalog, no card chrome, no feature card): one media ratio
 * per registry, a 16:10 thumbnail on every aircraft row and a 3:4 portrait
 * plate on every launch vehicle (rockets are tall; they are shown whole);
 * aircraft as ruled rows down the page, launch vehicles as one open row of
 * equal plates at 1440px; every vehicle present, every entry linking to its
 * own profile, and exactly one interactive element per entry.
 */

type Page = import("@playwright/test").Page;

interface CardGeometry {
  readonly height: number;
  /** Width over height of the visible frame, not of the image inside it. */
  readonly mediaRatio: number;
  readonly top: number;
  readonly width: number;
}

/** Each card's photo ratio and card width, once the grid has laid out. */
async function cardGeometry(page: Page): Promise<CardGeometry[]> {
  await expect
    .poll(() =>
      page
        .locator(CARD)
        .evaluateAll((cards) =>
          cards.every(
            (card) =>
              (card.querySelector("img")?.getBoundingClientRect().height ?? 0) >
              0,
          ),
        ),
    )
    .toBe(true);

  return page.locator(CARD).evaluateAll((cards) =>
    cards.map((card) => {
      // The frame, not the <img>: a launch vehicle photograph is scaled
      // inside its frame and clipped by it, so the image box would not
      // show what the visitor sees. The media well's first child is the
      // frame itself.
      const frame =
        card.firstElementChild?.firstElementChild?.getBoundingClientRect();
      const box = card.getBoundingClientRect();
      return {
        height: box.height,
        mediaRatio: frame?.height
          ? Number((frame.width / frame.height).toFixed(2))
          : 0,
        top: box.top,
        width: box.width,
      };
    }),
  );
}

const CARD = ".orbix-vehicle-card";

test.describe("Vehicle discovery", () => {
  test.skip(
    () => test.info().project.name !== "desktop",
    "Card geometry is asserted once; responsive behavior is covered by the overflow guards.",
  );

  test("every aircraft appears on the registry", async ({ page }) => {
    await page.goto(ROUTES.aircraft, { waitUntil: "domcontentloaded" });
    await expect(page.locator(CARD)).toHaveCount(AIRCRAFT_IDS.length);

    for (const id of AIRCRAFT_IDS) {
      await expect(
        page.locator(`${CARD}[href="/aircraft/${id}"]`),
        `${id} should have exactly one card linking to its profile`,
      ).toHaveCount(1);
    }
  });

  test("every launch vehicle appears on the registry", async ({ page }) => {
    await page.goto(ROUTES.rockets, { waitUntil: "domcontentloaded" });
    await expect(page.locator(CARD)).toHaveCount(ROCKET_IDS.length);

    for (const id of ROCKET_IDS) {
      await expect(
        page.locator(`${CARD}[href="/rockets/${id}"]`),
        `${id} should have exactly one card linking to its profile`,
      ).toHaveCount(1);
    }
  });

  test("aircraft rows share one 16:10 thumbnail and stack as rows", async ({
    page,
  }) => {
    await page.goto(ROUTES.aircraft, { waitUntil: "domcontentloaded" });

    const geometry = await cardGeometry(page);
    const ratios = geometry.map((card) => card.mediaRatio);

    expect(geometry).toHaveLength(AIRCRAFT_IDS.length);
    expect(new Set(ratios).size, `ratios were ${ratios.join(", ")}`).toBe(1);
    expect(ratios[0]).toBeCloseTo(16 / 10, 2);

    // A catalog list: one entry per row, every row the same width, each
    // below the one before. No feature row, no two-column span.
    const widths = new Set(geometry.map((card) => Math.round(card.width)));
    expect(widths.size, `row widths were ${[...widths].join(", ")}`).toBe(1);
    for (let index = 1; index < geometry.length; index += 1) {
      const previous = geometry[index - 1];
      expect(geometry[index]?.top ?? 0).toBeGreaterThanOrEqual(
        (previous?.top ?? 0) + (previous?.height ?? 0) - 1,
      );
    }
  });

  test("launch-vehicle plates share one 3:4 portrait ratio in one row", async ({
    page,
  }) => {
    await page.goto(ROUTES.rockets, { waitUntil: "domcontentloaded" });

    const geometry = await cardGeometry(page);
    const ratios = geometry.map((card) => card.mediaRatio);

    // The whole vehicle stays in frame on every plate.
    expect(geometry).toHaveLength(ROCKET_IDS.length);
    expect(new Set(ratios).size, `ratios were ${ratios.join(", ")}`).toBe(1);
    expect(ratios[0]).toBeCloseTo(3 / 4, 2);

    // An open grid, five across from 80rem: one row of equal plates.
    const tops = new Set(geometry.map((card) => Math.round(card.top)));
    const widths = new Set(geometry.map((card) => Math.round(card.width)));
    expect(tops.size).toBe(1);
    expect(widths.size).toBe(1);
  });

  test("registry entries carry no card chrome", async ({ page }) => {
    // Spec 3.2: the photograph is the only rectangle. No fill, outline or
    // radius on an entry, and nothing lifts on hover.
    for (const route of [ROUTES.aircraft, ROUTES.rockets]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });

      const chrome = await page.locator(CARD).evaluateAll((cards) =>
        cards.map((card) => {
          const style = getComputedStyle(card);
          return [
            style.backgroundColor,
            style.borderTopWidth,
            style.borderRightWidth,
            style.borderBottomWidth,
            style.borderLeftWidth,
            style.borderRadius,
            style.boxShadow,
          ].join(" ");
        }),
      );

      expect(chrome.length).toBeGreaterThan(0);
      for (const entry of chrome) {
        expect(entry, `${route} entry chrome`).toBe(
          "rgba(0, 0, 0, 0) 0px 0px 0px 0px 0px none",
        );
      }
    }
  });

  test("cards expose exactly one interactive element each", async ({
    page,
  }) => {
    // The whole card is a link, so a nested button or anchor would create a
    // second tab stop and a duplicate screen-reader announcement.
    for (const route of [ROUTES.aircraft, ROUTES.rockets]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });

      const nested = await page
        .locator(CARD)
        .evaluateAll((cards) =>
          cards.map(
            (card) => card.querySelectorAll("a, button, [tabindex]").length,
          ),
        );

      expect(nested, `${route} cards must contain no nested controls`).toEqual(
        nested.map(() => 0),
      );
    }
  });

  test("aircraft and rocket cards carry domain-appropriate specifications", async ({
    page,
  }) => {
    // A shared schema is deliberately NOT imposed: an aircraft's ceiling and
    // a rocket's thrust are not interchangeable rows. Spec 6: two key
    // figures on every catalog entry, the same two across a registry.
    const labelsPerCard = (page: Page) =>
      page
        .locator(CARD)
        .evaluateAll((cards) =>
          cards.map((card) =>
            [...card.querySelectorAll("dt")].map((dt) =>
              (dt.textContent ?? "").trim(),
            ),
          ),
        );

    await page.goto(ROUTES.aircraft, { waitUntil: "domcontentloaded" });
    const aircraftCards = await labelsPerCard(page);
    expect(aircraftCards).toHaveLength(AIRCRAFT_IDS.length);
    for (const labels of aircraftCards) {
      expect(labels).toEqual(["Maximum speed", "Service ceiling"]);
    }

    await page.goto(ROUTES.rockets, { waitUntil: "domcontentloaded" });
    const rocketCards = await labelsPerCard(page);
    expect(rocketCards).toHaveLength(ROCKET_IDS.length);
    for (const labels of rocketCards) {
      expect(labels).toEqual(["Liftoff thrust", "Height"]);
    }
  });

  test("no specification renders as an empty or zero placeholder", async ({
    page,
  }) => {
    // ORBIX never shows unavailable data as zero. Every value on a card comes
    // from a required field, so any blank here means a formatting regression.
    for (const route of [ROUTES.aircraft, ROUTES.rockets]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const values = await page
        .locator(`${CARD} dd`)
        .evaluateAll((nodes) => nodes.map((n) => (n.textContent ?? "").trim()));

      expect(values.length).toBeGreaterThan(0);
      for (const value of values) {
        expect(value, `${route} produced an empty specification`).not.toBe("");
        expect(value).not.toMatch(/^(0|\u2014|-|N\/A|Not recorded)$/i);
      }
    }
  });

  test("each registry keeps its division identity", async ({ page }) => {
    await page.goto(ROUTES.aircraft, { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-orbix-division]")).toHaveAttribute(
      "data-orbix-division",
      "aircraft",
    );

    await page.goto(ROUTES.rockets, { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-orbix-division]")).toHaveAttribute(
      "data-orbix-division",
      "space",
    );
  });
});
