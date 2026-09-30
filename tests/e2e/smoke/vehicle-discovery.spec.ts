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
 * These tests pin the contract that replaced it (design v2, spec 8): one
 * media ratio per registry, 16:10 for aircraft and 3:4 portrait for launch
 * vehicles (rockets are tall; they are shown whole), with the first card of
 * each registry a feature that spans two columns and sets its photograph
 * beside the text at the full height of the card; every vehicle present,
 * every card linking to its own profile, and exactly one interactive
 * element per card.
 */

type Page = import("@playwright/test").Page;

interface CardGeometry {
  readonly height: number;
  /** Height of the photograph's visible frame (the image may overflow it). */
  readonly mediaHeight: number;
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
      // The frame, not the <img>: in a row the feature makes taller, the
      // image is deliberately larger than its frame and clipped by it, so
      // the image box would not show what the visitor sees.
      // The media well's first child is the frame itself; the well adds a
      // 1px bottom rule that is not part of the photograph.
      const frame =
        card.firstElementChild?.firstElementChild?.getBoundingClientRect();
      const box = card.getBoundingClientRect();
      return {
        height: box.height,
        mediaHeight: frame?.height ?? 0,
        mediaRatio: frame?.height
          ? Number((frame.width / frame.height).toFixed(2))
          : 0,
        top: box.top,
        width: box.width,
      };
    }),
  );
}

/**
 * Standard cards in a row below the feature's. A card beside the feature
 * gives the row's spare height to its photograph (spec 8), so its frame is
 * taller than the registry ratio by design; the ratio is pinned on the rows
 * below, and the cards beside the feature must only ever grow.
 */
function splitByFeatureRow(geometry: readonly CardGeometry[]) {
  const [feature, ...rest] = geometry;
  const featureBottom = (feature?.top ?? 0) + (feature?.height ?? 0);
  return {
    below: rest.filter((card) => card.top >= featureBottom - 1),
    beside: rest.filter((card) => card.top < featureBottom - 1),
    feature,
  };
}

/** The first card is the registry's feature: it spans two columns. */
function expectFeatureFirst(geometry: readonly CardGeometry[]) {
  const [feature, ...rest] = geometry;
  for (const card of rest) {
    expect(feature?.width ?? 0).toBeGreaterThan(card.width * 1.5);
  }
}

const CARD = ".orbix-vehicle-card";

test.describe("Vehicle discovery", () => {
  test.skip(
    () => test.info().project.name !== "desktop",
    "Card geometry is asserted once; responsive behaviour is covered by the overflow guards.",
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

  test("aircraft cards share one 16:10 media ratio", async ({ page }) => {
    await page.goto(ROUTES.aircraft, { waitUntil: "domcontentloaded" });

    const geometry = await cardGeometry(page);
    const { below, beside, feature } = splitByFeatureRow(geometry);
    const ratios = below.map((card) => card.mediaRatio);

    // 16:10, the visible frame of every standard card below the feature row.
    expect(below.length).toBeGreaterThan(0);
    expect(new Set(ratios).size, `ratios were ${ratios.join(", ")}`).toBe(1);
    expect(ratios[0]).toBeCloseTo(16 / 10, 2);
    // Beside the feature a frame may only grow taller than 16:10.
    for (const card of beside) {
      expect(card.mediaRatio).toBeLessThanOrEqual(16 / 10 + 0.01);
    }

    // The two-column feature runs its photo across the whole card (less
    // its 1px outline) at 2:1, with the text in two columns under it: a
    // landscape airframe reads best wide, unlike the portrait rockets.
    const featureMedia = await page
      .locator(CARD)
      .first()
      .evaluate(
        (card) =>
          card.firstElementChild?.firstElementChild?.getBoundingClientRect()
            .width ?? 0,
      );
    expect(featureMedia).toBeGreaterThanOrEqual((feature?.width ?? 0) - 2);
    expect(feature?.mediaRatio ?? 0).toBeCloseTo(2, 1);
    expect(feature?.mediaHeight ?? 0).toBeLessThan(feature?.height ?? 0);
    expectFeatureFirst(geometry);
  });

  test("launch-vehicle cards share one 3:4 portrait media ratio", async ({
    page,
  }) => {
    await page.goto(ROUTES.rockets, { waitUntil: "domcontentloaded" });

    const geometry = await cardGeometry(page);
    const { below, beside, feature } = splitByFeatureRow(geometry);
    const ratios = below.map((card) => card.mediaRatio);

    // The visible frame of every standard card below the feature row is
    // 3:4, so the whole vehicle stays in frame.
    expect(below.length).toBeGreaterThan(0);
    expect(new Set(ratios).size, `ratios were ${ratios.join(", ")}`).toBe(1);
    expect(ratios[0]).toBeCloseTo(3 / 4, 2);
    // Beside the feature a frame may only grow taller than 3:4.
    for (const card of beside) {
      expect(card.mediaRatio).toBeLessThanOrEqual(3 / 4 + 0.01);
    }

    // The two-column feature sets its photo beside the text at full card
    // height: still a portrait frame, never a landscape crop.
    expect(feature?.mediaRatio ?? 1).toBeLessThan(1);
    expectFeatureFirst(geometry);
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
    // a rocket's thrust are not interchangeable rows. Spec 8: two per card;
    // the feature card adds more after the same two. On /aircraft the card
    // beside the feature also shows range and first flight, so the feature
    // row ends on one baseline. ("Ceiling" is short for service ceiling,
    // which wraps in a 1024px card; the profiles give the full term.)
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
    const [aircraftFeature, aircraftBeside, ...aircraftCards] =
      await labelsPerCard(page);
    const fourAircraftFigures = [
      "Maximum speed",
      "Ceiling",
      "Range",
      "First flight",
    ];
    expect(aircraftFeature).toEqual(fourAircraftFigures);
    expect(aircraftBeside).toEqual(fourAircraftFigures);
    expect(aircraftCards.length).toBeGreaterThan(0);
    for (const labels of aircraftCards) {
      expect(labels).toEqual(["Maximum speed", "Ceiling"]);
    }

    await page.goto(ROUTES.rockets, { waitUntil: "domcontentloaded" });
    const [rocketFeature, ...rocketCards] = await labelsPerCard(page);
    // The Falcon 9 feature: thrust, height, payload to LEO and GTO,
    // liftoff mass and first flight (an even count, so no empty cell).
    expect(rocketFeature).toEqual([
      "Liftoff thrust",
      "Height",
      "Payload to LEO",
      "Payload to GTO",
      "Liftoff mass",
      "First flight",
    ]);
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
