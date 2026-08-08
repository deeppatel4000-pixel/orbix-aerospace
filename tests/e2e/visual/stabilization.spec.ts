import { expect, ROUTES, test } from "../fixtures/orbix";

/**
 * Every baseline in this directory relies on `contextOptions.reducedMotion:
 * "reduce"` in playwright.config.ts. That setting is what makes
 * `window.matchMedia("(prefers-reduced-motion: reduce)")` report `true` in
 * the browser, which is in turn what src/styles/orbix-motion.css keys off of
 * to force every `*`/`*::before`/`*::after` animation and transition
 * duration down to 0.01ms. Without it, the app's real (and otherwise
 * desirable) motion — including the Suspense fallback's looping pulse
 * animation in src/app/loading.tsx and Mission Control's cinematic startup
 * sequence — would make full-page screenshots land at unpredictable
 * animation frames and every baseline above would be flaky.
 *
 * If a future change drops that config option, this test is the one place
 * that fails loudly and explains why, instead of every visual baseline
 * quietly starting to flake for a reason nobody thinks to check here first.
 */
test.describe("Reduced-motion stabilization guard", () => {
  test("the browser context and the hydrated app both report reduced motion as active", async ({
    page,
  }) => {
    // The Engineering Laboratory always mounts Mission Control (and its
    // several components that read the app's own reduced-motion state —
    // e.g. MissionStartupSequence, GroundTrackVisualization, MissionReplay)
    // in the DOM: `LaboratoryShell` renders every workflow group up front
    // and only toggles the inactive ones `hidden`, it does not unmount
    // them. So the app-level assertion below works from a plain visit to
    // this route with no hash and no startup-overlay handling needed.
    await page.goto(ROUTES.engineeringLab);

    const prefersReducedMotion = await page.evaluate(
      () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    expect(prefersReducedMotion).toBe(true);

    // The app's own `data-reduced-motion` attribute (stamped by a local
    // `useReducedMotion` hook duplicated across a handful of Engineering Lab
    // components, e.g. mission-startup-sequence.tsx) is seeded `"false"` on
    // the server render and only flipped to `"true"` from a `useEffect`
    // after hydration, so this must poll rather than read it immediately
    // after navigation — `toHaveAttribute` does that automatically.
    const reducedMotionElement = page.locator("[data-reduced-motion]").first();
    await expect(reducedMotionElement).toHaveAttribute(
      "data-reduced-motion",
      "true",
    );
  });
});
