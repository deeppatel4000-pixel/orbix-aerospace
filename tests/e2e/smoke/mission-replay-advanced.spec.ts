import type { Page } from "@playwright/test";

import { expect, ROUTES, test } from "../fixtures/orbix";

/**
 * Deeper Mission Replay coverage: speed, end-of-sequence, telemetry, and the
 * 3D scene's remount contract.
 *
 * `mission-replay.spec.ts` already covers basic playback (play, pause, phase
 * selection, restart). This file covers the four behaviours that were left
 * uncovered, and deliberately does not repeat any of them.
 *
 * ## Reduced motion is overridden for the speed tests only
 *
 * `playwright.config.ts` sets `contextOptions.reducedMotion: "reduce"`
 * globally, and `mission-replay.tsx` uses a single flat
 * `reducedMotionDelayMilliseconds` (3600 ms) whenever reduced motion is
 * active — the 0.5x/1x/2x delays are bypassed entirely. Speed is therefore
 * untestable under the suite's default context.
 *
 * The speed block below narrows that override to itself with `test.use`,
 * leaving every other test in the repository on reduced motion. This is
 * possible without touching application code because the dashboard mounts
 * `<MissionReplay>` without a `reducedMotionOverride` prop, so
 * `useReducedMotion` falls through to `matchMedia` — which Playwright
 * controls per context. Verified: the component's own
 * `data-reduced-motion` attribute reads `true` under the default context and
 * `false` under the override.
 *
 * ## Timing margins are measured, not guessed
 *
 * From `mission-replay.tsx`: `presentationDelayMilliseconds` is
 * `{ 0.5: 4800, 1: 2400, 2: 1200 }`. Measured wall-clock time from clicking
 * Play to the first phase advance, on a local production build:
 *
 *   2x   -> 1877 ms
 *   1x   -> 2901 ms
 *   0.5x -> 5345 ms
 *
 * so real overhead is roughly 500-700 ms on top of the nominal delay. The
 * budgets below sit well clear of that, and the discriminating assertion is
 * the 0.5x one: within a 3 s window, 2x demonstrably advances and 0.5x
 * demonstrably does not. That is what proves the selector changes real
 * playback timing rather than only the selected UI state.
 */

/** Nominal delays from `mission-replay.tsx`, for reference in the budgets. */
const SPEED_BUDGETS = [
  { advanceWithinMs: 4_000, nominalMs: 1_200, speed: "2" },
  { advanceWithinMs: 5_000, nominalMs: 2_400, speed: "1" },
] as const;

/**
 * A window in which 2x advances (measured 1877 ms) but 0.5x cannot, because
 * its timer alone is 4800 ms.
 */
const DISCRIMINATING_WINDOW_MS = 3_000;

/** Generous upper bound for 0.5x to still advance (nominal 4800 ms). */
const SLOW_SPEED_BUDGET_MS = 9_000;

/**
 * `reducedMotionDelayMilliseconds` from `mission-replay.tsx`, used by the
 * non-speed blocks which keep the suite's default reduced-motion context.
 */
const REDUCED_MOTION_ADVANCE_MS = 3_600;
const REDUCED_MOTION_BUDGET_MS = REDUCED_MOTION_ADVANCE_MS + 2_400;

function playButton(page: Page) {
  return page.getByRole("button", { name: "Play mission replay" });
}

function pauseButton(page: Page) {
  return page.getByRole("button", { name: "Pause mission replay" });
}

function phaseButtons(page: Page) {
  return page.getByRole("button", { name: /^Show replay phase: / });
}

/** The 3D scene's currently selected mode tab. */
function selectedSceneMode(page: Page) {
  return page.locator(
    '[role="tablist"][aria-label="3D mission mode"] [role="tab"][aria-selected="true"]',
  );
}

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

/** Reads the telemetry grid as label -> value pairs. */
async function readTelemetry(page: Page): Promise<Record<string, string>> {
  return page
    .locator('section[aria-labelledby="replay-telemetry-title"] dl')
    .evaluate((list) => {
      const terms = [...list.querySelectorAll("dt")];
      const values = [...list.querySelectorAll("dd")];

      return Object.fromEntries(
        terms.map((term, index) => [
          (term.textContent ?? "").trim(),
          (values[index]?.textContent ?? "").trim(),
        ]),
      );
    });
}

/**
 * Selects a phase by index and waits until the replay actually reports it as
 * active, so later assertions never race the state update.
 */
async function selectPhase(
  page: Page,
  index: number,
  expectedLabel: string,
): Promise<void> {
  await phaseButtons(page).nth(index).click();
  await expect
    .poll(async () => (await readTelemetry(page))["Active phase"])
    .toBe(expectedLabel);
}

/** Same dismissal approach as `mission-replay.spec.ts`, kept independent. */
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

/** Milliseconds from clicking Play until the phase index first increases. */
async function timeToFirstAdvance(
  page: Page,
  budgetMs: number,
): Promise<number | null> {
  const start = await readPhase(page);
  const startedAt = Date.now();

  await playButton(page).click();

  const deadline = startedAt + budgetMs;
  while (Date.now() < deadline) {
    if ((await readPhase(page)).current > start.current) {
      return Date.now() - startedAt;
    }
  }

  return null;
}

test.describe("Mission Replay speed", () => {
  // Reduced motion collapses every speed to one flat 3600 ms interval, so it
  // is disabled HERE ONLY. Every other test keeps the suite-wide default.
  test.use({ contextOptions: { reducedMotion: "no-preference" } });

  test.skip(
    () => test.info().project.name !== "desktop",
    "Playback timing is viewport-independent; exercised once to keep real timers affordable.",
  );

  test("the override is active, so speed is actually in play", async ({
    page,
  }) => {
    // Guard: if this block ever silently reverted to reduced motion, the
    // speed assertions below would be measuring the flat 3600 ms interval and
    // would quietly stop testing speed at all.
    await openReplayWorkspace(page);

    await expect(
      page.locator('section[aria-labelledby="mission-replay-title"]'),
      "speed tests require reduced motion to be OFF",
    ).toHaveAttribute("data-reduced-motion", "false");
  });

  for (const { advanceWithinMs, nominalMs, speed } of SPEED_BUDGETS) {
    test(`${speed}x advances within its ${nominalMs}ms interval`, async ({
      page,
    }) => {
      await openReplayWorkspace(page);
      await page.getByLabel("Mission replay speed").selectOption(speed);

      const elapsed = await timeToFirstAdvance(page, advanceWithinMs);

      expect(
        elapsed,
        `at ${speed}x the replay should advance within ${advanceWithinMs}ms (nominal ${nominalMs}ms)`,
      ).not.toBeNull();
    });
  }

  test("0.5x is genuinely slower, not just a changed label", async ({
    page,
  }) => {
    await openReplayWorkspace(page);
    await page.getByLabel("Mission replay speed").selectOption("0.5");

    // 2x advances inside this window (measured 1877ms); 0.5x cannot, because
    // its timer alone is 4800ms. This is the assertion that proves the
    // selector changes real playback timing.
    const withinShortWindow = await timeToFirstAdvance(
      page,
      DISCRIMINATING_WINDOW_MS,
    );
    expect(
      withinShortWindow,
      `0.5x must NOT advance within ${DISCRIMINATING_WINDOW_MS}ms, which 2x does`,
    ).toBeNull();

    // ...but it must still advance eventually, so a broken timer cannot pass
    // this test by never advancing at all.
    await expect
      .poll(async () => (await readPhase(page)).current, {
        timeout: SLOW_SPEED_BUDGET_MS,
      })
      .toBeGreaterThan(1);
  });
});

test.describe("Mission Replay end of sequence", () => {
  test.skip(
    () => test.info().project.name !== "desktop",
    "Playback timing is viewport-independent.",
  );

  test("playback stops on the final phase and does not overrun", async ({
    page,
  }) => {
    await openReplayWorkspace(page);
    const { total } = await readPhase(page);

    // Jump to the penultimate phase so exactly one advance remains. This also
    // keeps the test to a single real interval rather than replaying all 8.
    await phaseButtons(page)
      .nth(total - 2)
      .click();
    await expect
      .poll(async () => (await readPhase(page)).current)
      .toBe(total - 1);

    await playButton(page).click();
    await expect(pauseButton(page)).toBeEnabled();

    // Reaches the last phase...
    await expect
      .poll(async () => (await readPhase(page)).current, {
        timeout: REDUCED_MOTION_BUDGET_MS,
      })
      .toBe(total);

    // ...and the reducer's guard stops playback there.
    await expect(pauseButton(page)).toBeDisabled();
    await expect(playButton(page)).toBeEnabled();

    // Hold for longer than a further interval: the phase must not overrun the
    // final index, and playback must not resume on its own.
    await page.waitForTimeout(REDUCED_MOTION_BUDGET_MS);

    const settled = await readPhase(page);
    expect(settled.current, "must not advance past the final phase").toBe(
      total,
    );
    await expect(pauseButton(page)).toBeDisabled();
  });
});

test.describe("Mission Replay telemetry", () => {
  test.skip(
    () => test.info().project.name !== "desktop",
    "Telemetry values are viewport-independent.",
  );

  test("Active phase telemetry follows the selected phase", async ({
    page,
  }) => {
    await openReplayWorkspace(page);
    const { total } = await readPhase(page);

    // "Active phase" is the only phase-dependent telemetry value; it should
    // always match the phase the replay is actually showing.
    for (const index of [0, 2, total - 1]) {
      const button = phaseButtons(page).nth(index);
      const label = (await button.getAttribute("aria-label")) ?? "";
      const expected = label.replace("Show replay phase: ", "");

      await button.click();
      await expect
        .poll(async () => (await readTelemetry(page))["Active phase"])
        .toBe(expected);
    }
  });

  test("mission-level telemetry is populated and stable across phases", async ({
    page,
  }) => {
    await openReplayWorkspace(page);
    const { total } = await readPhase(page);

    const missionLevel = [
      "Total delta-v",
      "Transfer duration",
      "Vehicle",
      "Peak heating",
    ];

    const before = await readTelemetry(page);

    // Populated: the loaded mission supplies each value, so none falls back
    // to the component's "Not reported" placeholder. Actual numbers are NOT
    // asserted — they are engineering outputs, and duplicating them here
    // would restate calculator results in a presentation test.
    for (const label of missionLevel) {
      expect(before[label], `${label} should be present`).toBeDefined();
      expect(before[label], `${label} should not be unreported`).not.toContain(
        "Not reported",
      );
      expect((before[label] ?? "").length).toBeGreaterThan(0);
    }

    // Stable: these describe the mission, not the phase, so moving through
    // the sequence must not change them.
    await phaseButtons(page)
      .nth(total - 1)
      .click();
    await expect
      .poll(async () => (await readTelemetry(page))["Active phase"])
      .not.toBe(before["Active phase"]);

    const after = await readTelemetry(page);
    for (const label of missionLevel) {
      expect(
        after[label],
        `${label} is mission-level and must not change with the phase`,
      ).toBe(before[label]);
    }
  });
});

test.describe("Mission Replay 3D scene", () => {
  test.skip(
    () => test.info().project.name !== "desktop",
    "Scene remount behaviour is viewport-independent.",
  );

  test("the scene mode follows the selected phase, both ways", async ({
    page,
  }) => {
    // This is the remount contract, asserted purely through what a user can
    // see. `Mission3DScene` seeds `activeMode` from `initialMode` with
    // `useState` and has no effect that re-syncs it, so `initialMode` is read
    // ONCE per mount. The only reason the displayed mode can ever change as
    // the phase changes is `key={activePhase.id}` in `mission-replay.tsx`,
    // which forces a fresh mount per phase.
    //
    // Remove that `key` and React reuses the component, `activeMode` stays
    // frozen at whatever the first phase set, and the round trip below fails.
    await openReplayWorkspace(page);

    // Phase 1 (Mission Preparation) is an orbital-scene phase.
    await expect(selectedSceneMode(page)).toHaveText(/Orbital/);

    // Index 5 = Reentry Preparation, a reentry-scene phase.
    await selectPhase(page, 5, "Reentry Preparation");
    await expect(
      selectedSceneMode(page),
      "moving to a reentry phase must switch the scene to reentry",
    ).toHaveText(/Reentry/);

    // ...and back, so this cannot pass by the mode merely being stuck on
    // whichever value it drifted to.
    await selectPhase(page, 2, "Orbital Operations");
    await expect(
      selectedSceneMode(page),
      "returning to an orbital phase must switch the scene back",
    ).toHaveText(/Orbital/);
  });

  test("only the phase's own scene mode is offered", async ({ page }) => {
    // Derived, not assumed: `mission-replay.tsx` passes
    // `missionProfileAnalysis` only on orbital phases and
    // `vehicleReentryEvaluation` only on reentry phases, and
    // `Mission3DScene` disables a mode tab whose data is absent. So the
    // inactive mode is genuinely unavailable rather than merely unselected —
    // the scene is scoped to the phase.
    await openReplayWorkspace(page);

    const orbitalTab = page.getByRole("tab", { name: /Orbital Mission/ });
    const reentryTab = page.getByRole("tab", { name: /Reentry Mission/ });

    // On an orbital phase, reentry has no data behind it.
    await expect(orbitalTab).toBeEnabled();
    await expect(reentryTab).toBeDisabled();

    // On a reentry phase the availability inverts.
    await selectPhase(page, 5, "Reentry Preparation");
    await expect(reentryTab).toBeEnabled();
    await expect(orbitalTab).toBeDisabled();
  });
});
