import { expect, ROUTES, test } from "../fixtures/orbix";

/**
 * Every baseline in this directory relies on `contextOptions.reducedMotion:
 * "reduce"` in playwright.config.ts. That setting is what makes
 * `window.matchMedia("(prefers-reduced-motion: reduce)")` report `true` in
 * the browser, which is in turn what src/styles/orbix-motion.css keys off of
 * to force every `*`/`*::before`/`*::after` animation and transition
 * duration down to 0.01ms. Without it, the app's real (and otherwise
 * desirable) motion, including the Suspense fallback's spinner in
 * src/app/loading.tsx and user-started replay tweening, would make full-page
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
    // Mission Replay is the component that stamps the app's own
    // reduced-motion state on its root. It mounts when its workspace tab is
    // selected inside Mission Control, so open that tab first.
    await page.goto(`${ROUTES.engineeringLab}#mission-control-dashboard`);
    await expect(
      page.getByRole("navigation", { name: "Mission control sections" }),
    ).toBeVisible();
    await page.getByRole("tab", { name: "Replay" }).click();

    const prefersReducedMotion = await page.evaluate(
      () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    expect(prefersReducedMotion).toBe(true);

    // The app's own `data-reduced-motion` attribute (stamped by
    // `useReducedMotion` in mission-replay.tsx) is seeded `"false"` and only
    // flipped to `"true"` from a `useEffect` after mount, so this must poll
    // rather than read it immediately; `toHaveAttribute` does that.
    const reducedMotionElement = page.locator(
      'section[aria-labelledby="mission-replay-title"][data-reduced-motion]',
    );
    await expect(reducedMotionElement).toHaveAttribute(
      "data-reduced-motion",
      "true",
    );
  });
});
