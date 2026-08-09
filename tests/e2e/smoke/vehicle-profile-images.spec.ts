import {
  AIRCRAFT_IDS,
  expect,
  expectAllImagesLoaded,
  expectNoHorizontalOverflow,
  expectNoUnexpectedConsoleErrors,
  ROCKET_IDS,
  ROUTES,
  test,
} from "../fixtures/orbix";

/**
 * Full image coverage for every vehicle profile.
 *
 * Before this file, only 2 of the 10 generated vehicle profiles received the
 * real image-load assertion: F-22 Raptor (`aircraft.spec.ts`) and Falcon 9
 * (`rockets.spec.ts`). The other 8 were only checked for status and heading
 * by the deep-link loops, so a profile whose imagery silently failed to load
 * — a bad visual mapping, a missing asset, an optimizer rejection — would
 * have shipped unnoticed on 8 of 10 pages.
 *
 * `expectAllImagesLoaded` (fixtures/orbix.ts) is reused rather than
 * reimplemented: it scrolls to trigger lazy loading, then polls every `<img>`
 * for `complete && naturalWidth > 0`, so it verifies images genuinely
 * decoded rather than merely that `<img>` elements exist.
 *
 * The vehicle lists come from `AIRCRAFT_IDS` / `ROCKET_IDS` in the shared
 * fixture, which mirror `src/features/vehicles/data`. They are not
 * re-declared here, so adding a vehicle to the data extends this coverage
 * automatically rather than silently leaving it untested.
 */

const VEHICLE_PROFILES = [
  ...AIRCRAFT_IDS.map((id) => ({ category: "aircraft" as const, id })),
  ...ROCKET_IDS.map((id) => ({ category: "rockets" as const, id })),
];

function profilePath(category: "aircraft" | "rockets", id: string): string {
  return `${category === "aircraft" ? ROUTES.aircraft : ROUTES.rockets}/${id}`;
}

test.describe("Vehicle profile imagery", () => {
  test("covers every generated vehicle profile", () => {
    // Guards against the loop below silently shrinking if a fixture list is
    // trimmed: ORBIX ships 5 aircraft and 5 rockets.
    expect(AIRCRAFT_IDS).toHaveLength(5);
    expect(ROCKET_IDS).toHaveLength(5);
    expect(VEHICLE_PROFILES).toHaveLength(10);
  });

  for (const { category, id } of VEHICLE_PROFILES) {
    test(`${category}/${id} loads all of its imagery`, async ({
      consoleMessages,
      page,
    }) => {
      const path = profilePath(category, id);
      const response = await page.goto(path, {
        waitUntil: "domcontentloaded",
      });

      expect(response?.status(), `${path} should resolve`).toBe(200);

      // Vehicle identity: exactly one h1, and it is not empty. The specific
      // name per vehicle is already asserted by the aircraft/rockets deep
      // link loops; this file's job is the imagery, so it verifies identity
      // without duplicating those name assertions.
      const heading = page.getByRole("heading", { level: 1 });
      await expect(heading).toHaveCount(1);
      await expect(heading).not.toBeEmpty();

      // Every profile renders at least one optimized image; if a visual
      // mapping regressed to zero images this would fail rather than
      // vacuously pass.
      const optimized = page.locator('img[src*="/_next/image"]');
      expect(
        await optimized.count(),
        `${path} should render optimized imagery`,
      ).toBeGreaterThan(0);

      // The real check: every image actually decoded.
      await expectAllImagesLoaded(page);

      await expectNoHorizontalOverflow(page);
      expectNoUnexpectedConsoleErrors(consoleMessages);
    });
  }
});
