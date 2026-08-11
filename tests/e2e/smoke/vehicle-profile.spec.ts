import {
  AIRCRAFT_IDS,
  expect,
  ROCKET_IDS,
  ROUTES,
  test,
} from "../fixtures/orbix";

/**
 * Phase 2A profile framework coverage.
 *
 * Profiles previously rendered every one of their ~12 sections through a
 * per-domain wrapper with an identical shape, so narrative, specifications,
 * performance data and imagery all read as one repeated container. This phase
 * introduced a shared section primitive with explicit modes plus a redesigned
 * hero. These tests pin the contracts that replaced it.
 *
 * Deliberately NOT asserted: pixel geometry, class names or class ordering.
 * The contracts here are structural — which modes exist, that the hero record
 * is populated from real data, and that existing deep links still resolve.
 */

const HERO_RECORD = ".orbix-profile-hero__record";
const SECTION = "[data-profile-mode]";

/** Anchors that existed before this phase and must keep working. */
const AIRCRAFT_ANCHORS = [
  "mission-overview",
  "aircraft-image",
  "technical-dashboard",
  "powerplant",
] as const;

const ROCKET_ANCHORS = [
  "overview",
  "vehicle-image",
  "architecture",
  "technical-dashboard",
] as const;

test.describe("Vehicle profile framework", () => {
  test.skip(
    () => test.info().project.name !== "desktop",
    "Profile structure is viewport-independent; responsive behaviour is covered by the overflow guards.",
  );

  for (const id of AIRCRAFT_IDS) {
    test(`${id} profile hero renders a populated technical record`, async ({
      page,
    }) => {
      await page.goto(`${ROUTES.aircraft}/${id}`, {
        waitUntil: "domcontentloaded",
      });

      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);

      const values = page.locator(`${HERO_RECORD} dd`);
      await expect(values).toHaveCount(3);

      // Every hero metric comes from a required field, so a blank or zero
      // here is a formatting regression, not missing data.
      for (const value of await values.allTextContents()) {
        expect(value.trim()).not.toBe("");
        expect(value.trim()).not.toMatch(/^(0|—|-|N\/A|Not recorded)$/i);
      }
    });
  }

  for (const id of ROCKET_IDS) {
    test(`${id} profile hero renders a populated technical record`, async ({
      page,
    }) => {
      await page.goto(`${ROUTES.rockets}/${id}`, {
        waitUntil: "domcontentloaded",
      });

      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);

      const values = page.locator(`${HERO_RECORD} dd`);
      await expect(values).toHaveCount(3);

      for (const value of await values.allTextContents()) {
        expect(value.trim()).not.toBe("");
        expect(value.trim()).not.toMatch(/^(0|—|-|N\/A|Not recorded)$/i);
      }
    });
  }

  test("both domains exercise every section mode", async ({ page }) => {
    // The point of the framework is that different information types look
    // different. If a domain collapses back to a single mode, the repetition
    // this phase set out to fix has returned.
    const expected = ["configuration", "data", "editorial", "media", "record"];

    for (const route of [
      `${ROUTES.aircraft}/f-22-raptor`,
      `${ROUTES.rockets}/falcon-9`,
    ]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });

      const modes = await page
        .locator(SECTION)
        .evaluateAll((nodes) => [
          ...new Set(
            nodes.map((n) => n.getAttribute("data-profile-mode") ?? ""),
          ),
        ]);

      expect(modes.sort(), `${route} should use all five modes`).toEqual(
        expected,
      );
    }
  });

  test("aircraft and rocket heroes use their own media layout", async ({
    page,
  }) => {
    // Aircraft are wide subjects and rockets are vertical; forcing one frame
    // on both is what cropped launch vehicles through the middle on the
    // index cards before the discovery phase.
    //
    // Asserted through geometry rather than class names: a backdrop hero
    // spans the viewport, a column hero is bounded well inside it. Both are
    // scoped to `.orbix-profile-hero`, because `header` also matches the
    // site header.
    // Polled rather than read once: `fill` images report a zero-width box
    // until layout settles, which races under parallel workers.
    const heroImageRatio = () =>
      expect
        .poll(async () =>
          page.evaluate(() => {
            const hero = document.querySelector(".orbix-profile-hero");
            const image = hero?.querySelector("img");
            if (!hero || !image) return 0;
            return image.getBoundingClientRect().width / window.innerWidth;
          }),
        )
        .toBeGreaterThan(0);

    await page.goto(`${ROUTES.aircraft}/f-22-raptor`, {
      waitUntil: "domcontentloaded",
    });
    await heroImageRatio();
    const aircraftRatio = await page.evaluate(() => {
      const image = document.querySelector(".orbix-profile-hero img");
      return image
        ? image.getBoundingClientRect().width / window.innerWidth
        : 0;
    });
    expect(
      aircraftRatio,
      "the aircraft hero media should span the viewport as a backdrop",
    ).toBeGreaterThan(0.9);

    await page.goto(`${ROUTES.rockets}/falcon-9`, {
      waitUntil: "domcontentloaded",
    });
    await heroImageRatio();
    const rocketRatio = await page.evaluate(() => {
      const image = document.querySelector(".orbix-profile-hero img");
      return image
        ? image.getBoundingClientRect().width / window.innerWidth
        : 0;
    });
    expect(
      rocketRatio,
      "the rocket hero media should be a bounded vertical column",
    ).toBeLessThan(0.5);
  });

  test("existing profile anchors still resolve to real sections", async ({
    page,
  }) => {
    // These ids predate this phase and may be bookmarked, so the framework
    // must not have renamed them.
    await page.goto(`${ROUTES.aircraft}/f-22-raptor`, {
      waitUntil: "domcontentloaded",
    });
    for (const id of AIRCRAFT_ANCHORS) {
      await expect(page.locator(`#${id}`), `#${id} should exist`).toHaveCount(
        1,
      );
    }

    await page.goto(`${ROUTES.rockets}/falcon-9`, {
      waitUntil: "domcontentloaded",
    });
    for (const id of ROCKET_ANCHORS) {
      await expect(page.locator(`#${id}`), `#${id} should exist`).toHaveCount(
        1,
      );
    }
  });

  test("profile heroes carry their route's division", async ({ page }) => {
    await page.goto(`${ROUTES.aircraft}/b-2-spirit`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.locator("[data-orbix-division]")).toHaveAttribute(
      "data-orbix-division",
      "aircraft",
    );

    await page.goto(`${ROUTES.rockets}/saturn-v`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.locator("[data-orbix-division]")).toHaveAttribute(
      "data-orbix-division",
      "space",
    );
  });

  test("sections not yet migrated still render through the default mode", async ({
    page,
  }) => {
    // Backward compatibility is the whole reason the adapters exist: Phase 2B
    // migrates the rest, and until then those sections must keep rendering.
    await page.goto(`${ROUTES.aircraft}/f-22-raptor`, {
      waitUntil: "domcontentloaded",
    });

    const recordSections = page.locator('[data-profile-mode="record"]');
    await expect(recordSections.first()).toBeVisible();
    expect(await recordSections.count()).toBeGreaterThan(1);
  });
});
