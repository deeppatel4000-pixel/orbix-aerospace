import {
  expect,
  expectAllImagesLoaded,
  expectNoHorizontalOverflow,
  expectNoUnexpectedConsoleErrors,
  test,
} from "../fixtures/orbix";

/**
 * Smoke coverage for the `/showcase-capture/[id]` routes.
 *
 * `generateStaticParams` emits one page per entry in `SHOWCASE_MISSIONS`
 * (five mission presets), but only `leo-satellite-deployment` had any
 * coverage — in `public-routes.spec.ts`, `global-chrome.spec.ts`, and
 * `security-headers.spec.ts`. The other four generated pages were entirely
 * untested, so a data or rendering regression affecting only those missions
 * would have shipped unnoticed.
 *
 * The page renders `<h1>{mission.preset.name}</h1>` and calls `notFound()`
 * for an unknown id, so both are asserted against real behaviour.
 *
 * Note this route lives OUTSIDE the `(site)` layout group: it has no header,
 * footer, or `#main-content`. `global-chrome.spec.ts` already asserts that,
 * so it is not repeated here.
 */

/** The four generated capture pages that previously had no coverage. */
const UNCOVERED_CAPTURES = [
  { id: "iss-style-resupply", name: "ISS Style Resupply" },
  { id: "lunar-transfer-concept", name: "Lunar Transfer Concept" },
  { id: "reentry-demonstrator", name: "Reentry Demonstrator" },
  { id: "mars-transfer-concept", name: "Mars Transfer Concept" },
] as const;

test.describe("Showcase capture routes", () => {
  for (const capture of UNCOVERED_CAPTURES) {
    test(`${capture.id} renders its mission capture`, async ({
      consoleMessages,
      page,
    }) => {
      const response = await page.goto(`/showcase-capture/${capture.id}`, {
        waitUntil: "domcontentloaded",
      });
      expect(response?.status()).toBe(200);

      // The primary content is the mission name as the page's single h1 —
      // this is what distinguishes one capture page from another, so a
      // mis-wired id would fail here rather than merely rendering *a* page.
      const heading = page.getByRole("heading", { level: 1 });
      await expect(heading).toHaveCount(1);
      await expect(heading).toHaveText(capture.name);

      await expectAllImagesLoaded(page);
      await expectNoHorizontalOverflow(page);
      expectNoUnexpectedConsoleErrors(consoleMessages);
    });
  }

  test("an unknown capture id does not render a mission capture", async ({
    page,
  }) => {
    // Documented finding, asserted as CURRENT behaviour rather than as the
    // behaviour one might expect:
    //
    // `/aircraft/[id]` and `/rockets/[id]` both set `dynamicParams = false`,
    // so an unknown id there returns a hard 404. `/showcase-capture/[id]`
    // does NOT set it, so an unknown id is rendered on demand, hits
    // `notFound()`, and is served as a SOFT 404 — the not-found UI with a
    // 200 status (verified against production:
    // `/showcase-capture/not-a-real-mission` -> 200, while
    // `/aircraft/not-a-real` -> 404).
    //
    // That inconsistency is pre-existing and out of scope for a test-only
    // pass; changing it would alter production behaviour. What matters for
    // regression safety is that a bogus id must never render a real mission
    // capture, which is what this asserts. If `dynamicParams = false` is ever
    // added to that route, this test should be tightened to expect 404.
    const response = await page.goto("/showcase-capture/not-a-real-mission", {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status()).toBe(200);

    // No mission name is rendered, so no capture shell was produced.
    for (const capture of UNCOVERED_CAPTURES) {
      await expect(
        page.getByRole("heading", { level: 1, name: capture.name }),
      ).toHaveCount(0);
    }
    await expect(
      page.getByRole("heading", { level: 1, name: "LEO Satellite Deployment" }),
    ).toHaveCount(0);
  });
});
