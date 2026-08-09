import type { Page } from "@playwright/test";

import {
  expect,
  expectNoHorizontalOverflow,
  expectNoUnexpectedConsoleErrors,
  ROUTES,
  test,
} from "../fixtures/orbix";

/**
 * Interaction coverage for Mission Replay's playback controls.
 *
 * `mission-control.spec.ts` confirms the Replay workspace renders without
 * crashing, but nothing operated its controls. Play, Pause and phase
 * selection all run through `missionReplayReducer` and a `setTimeout`-driven
 * advance effect (`mission-replay.tsx`) that no test exercised.
 *
 * Everything asserted here is derived from the implementation, not assumed:
 *
 *   - Play is `disabled` while playing; Pause is `disabled` while paused
 *     (`replay-controls.tsx`), so the buttons' own disabled state is the
 *     component's observable playback state — no internal state is touched.
 *   - Progress is reported as text, `Phase {index + 1} of {totalPhases}`.
 *   - The advance timer fires every `reducedMotionDelayMilliseconds` (3600 ms)
 *     whenever reduced motion is active — which it always is in this suite,
 *     because `playwright.config.ts` sets `contextOptions.reducedMotion:
 *     "reduce"` globally and `useReducedMotion` reads that media query. The
 *     0.5x/1x/2x speed delays are therefore NOT in play here, and the tests
 *     deliberately do not depend on them.
 *   - `advance` stops at the final phase (`isPlaying` returns to false).
 *
 * ## There is no continuous scrubber
 *
 * Requirement "scrub" is covered against what the component actually
 * implements. There is no `<input type="range">` or `role="slider"` anywhere
 * in Mission Replay — verified by grep across `mission-replay.tsx`,
 * `replay-controls.tsx` and `replay-phase-indicator.tsx`. The progress
 * readout is a non-interactive `<progress>` element.
 *
 * The real timeline control is `ReplayPhaseIndicator`: one
 * `<button aria-label="Show replay phase: …">` per phase, marked
 * `aria-current="step"` when active. Selecting a phase dispatches
 * `select-phase`, which both moves the index AND sets `isPlaying: false`.
 * That discrete phase selection is what is exercised below.
 */

/**
 * From `mission-replay.tsx`: `reducedMotionDelayMilliseconds = 3_600`. This
 * suite always runs under reduced motion, so this is the real advance
 * interval. The margin absorbs render and scheduling latency; it is derived
 * from the source constant, not picked arbitrarily.
 */
const ADVANCE_DELAY_MS = 3_600;
const ADVANCE_MARGIN_MS = 2_400;
const ADVANCE_BUDGET_MS = ADVANCE_DELAY_MS + ADVANCE_MARGIN_MS;

function playButton(page: Page) {
  return page.getByRole("button", { name: "Play mission replay" });
}

function pauseButton(page: Page) {
  return page.getByRole("button", { name: "Pause mission replay" });
}

/**
 * The replay root itself, not an ancestor wrapper. `mission-replay.tsx`
 * renders `<section aria-labelledby="mission-replay-title" ...>` and hangs
 * `data-reduced-motion` on that exact element, so match it directly rather
 * than by containment.
 */
function replaySection(page: Page) {
  return page.locator('section[aria-labelledby="mission-replay-title"]');
}

/** Reads the rendered `Phase N of M` progress readout. */
async function readPhase(
  page: Page,
): Promise<{ current: number; total: number }> {
  const text =
    (await page
      .getByText(/^Phase \d+ of \d+$/)
      .first()
      .textContent()) ?? "";
  const match = /^Phase (\d+) of (\d+)$/.exec(text.trim());
  if (match === null) throw new Error(`Unrecognised phase readout: "${text}"`);

  return { current: Number(match[1]), total: Number(match[2]) };
}

/**
 * Mission Replay lives inside Mission Control, which mounts behind the
 * `MissionStartupSequence` overlay. Same dismissal approach as
 * `mission-control.spec.ts`.
 */
async function openReplayWorkspace(page: Page): Promise<void> {
  await page.goto(`${ROUTES.engineeringLab}#mission-control-dashboard`, {
    waitUntil: "domcontentloaded",
  });

  await expect(
    page.getByRole("navigation", { name: "Mission Control sections" }),
  ).toBeVisible();

  const skip = page.getByRole("button", {
    name: "Skip Mission Control startup",
  });
  if (await skip.isVisible().catch(() => false)) {
    await skip.click({ timeout: 5_000 }).catch(() => {});
  }
  await expect(skip).toBeHidden();

  await page.getByRole("tab", { name: "Replay" }).click();
  await expect(page.locator("#mission-replay-title")).toBeVisible();
}

test.describe("Mission Replay controls", () => {
  // The playback assertions wait on a real 3.6s advance timer, so they run in
  // one project rather than three. The workspace itself is already covered at
  // every viewport by mission-control.spec.ts, and the health check below
  // preserves the responsive convention.
  test.describe("playback", () => {
    test.skip(
      () => test.info().project.name !== "desktop",
      "Playback timing is viewport-independent; exercised once to keep the real 3.6s advance affordable.",
    );

    test("starts paused on the first phase", async ({ page }) => {
      await openReplayWorkspace(page);

      const phase = await readPhase(page);
      expect(phase.current, "replay should start on the first phase").toBe(1);
      expect(phase.total).toBeGreaterThan(1);

      // Paused: Play offered, Pause unavailable.
      await expect(playButton(page)).toBeEnabled();
      await expect(pauseButton(page)).toBeDisabled();
    });

    test("Play advances the replay to the next phase", async ({ page }) => {
      await openReplayWorkspace(page);
      const start = await readPhase(page);

      await playButton(page).click();

      // Playback state flips immediately, observed through the controls.
      await expect(playButton(page)).toBeDisabled();
      await expect(pauseButton(page)).toBeEnabled();

      // The replay genuinely advances, not merely "a button was clicked".
      await expect
        .poll(async () => (await readPhase(page)).current, {
          timeout: ADVANCE_BUDGET_MS,
        })
        .toBe(start.current + 1);

      // The phase label and live region follow the advance.
      await expect(
        replaySection(page).getByText(/^Phase 2 of \d+$/),
      ).toBeVisible();
    });

    test("Pause stops the replay advancing", async ({ page }) => {
      await openReplayWorkspace(page);
      await playButton(page).click();

      // Let one real advance happen so we know the timer is running.
      await expect
        .poll(async () => (await readPhase(page)).current, {
          timeout: ADVANCE_BUDGET_MS,
        })
        .toBe(2);

      await pauseButton(page).click();

      // Observable paused state, straight from the controls.
      await expect(pauseButton(page)).toBeDisabled();
      await expect(playButton(page)).toBeEnabled();

      const paused = await readPhase(page);

      // Hold for longer than one full advance interval. This duration is the
      // source constant plus margin, not an arbitrary sleep: if the timer were
      // still running the phase would necessarily have moved on within it.
      await page.waitForTimeout(ADVANCE_BUDGET_MS);

      const after = await readPhase(page);
      expect(
        after.current,
        "phase must not advance while the replay is paused",
      ).toBe(paused.current);
      await expect(pauseButton(page)).toBeDisabled();
    });

    test("selecting a phase moves the replay and pauses it", async ({
      page,
    }) => {
      await openReplayWorkspace(page);
      const { total } = await readPhase(page);

      // Start playing so the pause-on-select behaviour is observable.
      await playButton(page).click();
      await expect(pauseButton(page)).toBeEnabled();

      // The timeline control is the phase indicator, not a slider.
      const phaseButtons = page.getByRole("button", {
        name: /^Show replay phase: /,
      });
      expect(
        await phaseButtons.count(),
        "one phase button per phase in the sequence",
      ).toBe(total);

      // Deliberately target a MID-sequence phase, never the last one. The
      // `advance` reducer case already sets `isPlaying: false` once
      // `currentPhaseIndex >= totalPhases - 1`, so selecting the final phase
      // would pause the replay via the end-of-sequence guard regardless of
      // whether `select-phase` pauses. Verified by injecting that exact
      // regression: with the last phase targeted the test still passed, and
      // only a mid-sequence target actually detects it.
      const targetIndex = Math.max(1, Math.min(2, total - 2));
      const target = phaseButtons.nth(targetIndex);
      await target.click();

      // The replay jumps to the selected phase...
      await expect
        .poll(async () => (await readPhase(page)).current)
        .toBe(targetIndex + 1);
      await expect(target).toHaveAttribute("aria-current", "step");
      await expect(
        page
          .getByRole("button", { name: /^Show replay phase: / })
          .and(page.locator('[aria-current="step"]')),
      ).toHaveCount(1);

      // ...and `select-phase` also stops playback.
      await expect(pauseButton(page)).toBeDisabled();
      await expect(playButton(page)).toBeEnabled();
    });

    test("Restart returns the replay to the first phase", async ({ page }) => {
      await openReplayWorkspace(page);
      const { total } = await readPhase(page);

      await page
        .getByRole("button", { name: /^Show replay phase: / })
        .nth(total - 1)
        .click();
      await expect
        .poll(async () => (await readPhase(page)).current)
        .toBe(total);

      await page
        .getByRole("button", { name: "Restart mission replay" })
        .click();

      await expect.poll(async () => (await readPhase(page)).current).toBe(1);
      await expect(pauseButton(page)).toBeDisabled();
    });
  });

  test("the replay workspace is healthy at every viewport", async ({
    consoleMessages,
    page,
  }) => {
    await openReplayWorkspace(page);

    // Reduced motion is active, which is what makes the advance interval
    // deterministic for the playback tests above.
    await expect(replaySection(page)).toHaveAttribute(
      "data-reduced-motion",
      "true",
    );

    const broken = await page.$$eval("img", (images) =>
      images
        .filter((image) => image.getAttribute("src") !== null)
        .filter((image) => image.complete && image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.src),
    );
    expect(broken, "no broken images in the replay workspace").toEqual([]);

    await expectNoHorizontalOverflow(page);
    expectNoUnexpectedConsoleErrors(consoleMessages);
  });
});
