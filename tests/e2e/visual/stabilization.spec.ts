import { expect, ROUTES, test } from "../fixtures/orbix";

/**
 * Every baseline in this directory relies on `contextOptions.reducedMotion:
 * "reduce"` in playwright.config.ts. That setting is what makes
 * `window.matchMedia("(prefers-reduced-motion: reduce)")` report `true` in
 * the browser, which is in turn what src/styles/orbix-motion.css keys off of
 * to force every `*`/`*::before`/`*::after` animation and transition
 * duration down to 0.01ms. Without it, the app's real (and otherwise
 * desirable) motion, including the Suspense fallback's spinner in
 * src/app/loading.tsx and the Transfer Explorer's user-started play, would make full-page
 * screenshots land at unpredictable animation frames and every baseline
 * above would be flaky.
 *
 * If a future change drops that config option, this test is the one place
 * that fails loudly and explains why, instead of every visual baseline
 * quietly starting to flake for a reason nobody thinks to check here first.
 */
test.describe("Reduced-motion stabilization guard", () => {
  test("the browser context and the hydrated app both report reduced motion as active", async ({
    page,
  }) => {
    await page.goto(ROUTES.engineeringLab);

    const prefersReducedMotion = await page.evaluate(
      () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    expect(prefersReducedMotion).toBe(true);

    // The Transfer Explorer reads the preference after mount
    // (`usePrefersReducedMotion` in src/features/orbits/use-scrubber.ts):
    // with it on, the explorer drops its Play button and says so. Polled by
    // the assertion, since the hook settles in an effect.
    const explorer = page.locator("#transfer-explorer");
    await expect(explorer).toContainText("Reduced motion is on");
    await expect(
      explorer.getByRole("button", { name: "Play the coast" }),
    ).toHaveCount(0);
  });
});
