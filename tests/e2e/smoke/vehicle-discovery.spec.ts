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
 * These tests pin the contract that replaced it: one media ratio per domain,
 * every vehicle present, every card linking to its own profile, and exactly
 * one interactive element per card.
 */

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

  test("aircraft cards share one landscape media ratio", async ({ page }) => {
    await page.goto(ROUTES.aircraft, { waitUntil: "domcontentloaded" });
    await page.locator(CARD).first().waitFor();

    const ratios = await page.locator(CARD).evaluateAll((cards) =>
      cards.map((card) => {
        const image = card.querySelector("img");
        if (!image) return 0;
        const rect = image.getBoundingClientRect();
        return Number((rect.width / rect.height).toFixed(2));
      }),
    );

    // 16:10. Every card, not merely the first.
    expect(new Set(ratios).size, `ratios were ${ratios.join(", ")}`).toBe(1);
    expect(ratios[0]).toBeCloseTo(1.6, 1);
  });

  test("launch-vehicle cards share one portrait media ratio", async ({
    page,
  }) => {
    await page.goto(ROUTES.rockets, { waitUntil: "domcontentloaded" });
    await page.locator(CARD).first().waitFor();

    const ratios = await page.locator(CARD).evaluateAll((cards) =>
      cards.map((card) => {
        const image = card.querySelector("img");
        if (!image) return 0;
        const rect = image.getBoundingClientRect();
        return Number((rect.width / rect.height).toFixed(2));
      }),
    );

    // 4:5 — launch vehicles are vertical subjects, so the portrait variant
    // is what stops `object-cover` slicing them through the middle.
    expect(new Set(ratios).size, `ratios were ${ratios.join(", ")}`).toBe(1);
    expect(ratios[0]).toBeCloseTo(0.8, 1);
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
    // a rocket's stage count are not interchangeable rows.
    await page.goto(ROUTES.aircraft, { waitUntil: "domcontentloaded" });
    const aircraftLabels = await page
      .locator(`${CARD} dt`)
      .evaluateAll((nodes) => [
        ...new Set(nodes.map((n) => (n.textContent ?? "").trim())),
      ]);
    expect(aircraftLabels.sort()).toEqual(["Maximum speed", "Service ceiling"]);

    await page.goto(ROUTES.rockets, { waitUntil: "domcontentloaded" });
    const rocketLabels = await page
      .locator(`${CARD} dt`)
      .evaluateAll((nodes) => [
        ...new Set(nodes.map((n) => (n.textContent ?? "").trim())),
      ]);
    expect(rocketLabels.sort()).toEqual(["Liftoff thrust", "Stages"]);
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
        expect(value).not.toMatch(/^(0|—|-|N\/A|Not recorded)$/i);
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
