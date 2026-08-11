import { expect, ROUTES, test } from "../fixtures/orbix";

/**
 * Mission Replay transport and phase sequence (Phase 5A).
 *
 * The redesign changed how the transport and the phase sequence are presented
 * and changed nothing about what they do, so these tests pin the presentation
 * contracts that a styling change could plausibly break — which control is
 * available in which state, that the sequence marks its current step, and that
 * the panel never grows a seek control.
 *
 * Playback timing, phase ordering and the reducer itself stay covered by
 * `mission-replay.spec.ts` and `mission-replay-advanced.spec.ts`; nothing here
 * duplicates them.
 *
 * Mission Replay is not a route. It is a workspace tab inside the Mission
 * Control dashboard, which is one module of the Engineering Laboratory, so
 * every test walks that path: open the module, clear the startup overlay,
 * activate the Replay tab.
 */

/**
 * Scoped to the replay sequence on purpose: `aria-current="step"` is also used
 * by the demo mode, showcase phase, startup progress and mission status panel
 * components, four of which are mounted on this page at once.
 */
const PHASE_SEQUENCE =
  'section[aria-labelledby="replay-phase-indicator-title"]';

async function openReplay(page: import("@playwright/test").Page) {
  await page.goto(`${ROUTES.engineeringLab}#mission-control-dashboard`, {
    waitUntil: "domcontentloaded",
  });

  const skip = page.getByRole("button", {
    name: "Skip Mission Control startup",
  });
  if (await skip.isVisible({ timeout: 15_000 }).catch(() => false)) {
    await skip.click().catch(() => {});
  }
  await expect(skip).toBeHidden();

  await page.getByRole("tab", { name: "Replay" }).click();
  await expect(
    page.getByRole("button", { name: "Play mission replay" }),
  ).toBeVisible();
}

test.describe("Mission replay transport", () => {
  test.skip(
    () => test.info().project.name !== "desktop",
    "Transport structure is viewport-independent; the reachability check below sets its own viewport.",
  );

  test("play and pause express the current state through availability", async ({
    page,
  }) => {
    await openReplay(page);

    const play = page.getByRole("button", { name: "Play mission replay" });
    const pause = page.getByRole("button", { name: "Pause mission replay" });

    // Stopped: play is the only thing you can do.
    await expect(play).toBeEnabled();
    await expect(pause).toBeDisabled();

    await play.click();

    // Playing: the pair swaps, so the state is readable from the transport
    // itself rather than from a separate status line.
    await expect(pause).toBeEnabled();
    await expect(play).toBeDisabled();

    await pause.click();
    await expect(play).toBeEnabled();
    await expect(pause).toBeDisabled();
  });

  test("restart is present, distinct, and returns the sequence to its first phase", async ({
    page,
  }) => {
    await openReplay(page);

    const steps = page.locator(`${PHASE_SEQUENCE} [aria-current="step"]`);
    const firstPhase = await steps.first().innerText();

    // Move off the first phase, then restart.
    await page
      .getByRole("button", { name: /^Show replay phase:/ })
      .nth(2)
      .click();
    await expect
      .poll(async () => steps.first().innerText())
      .not.toBe(firstPhase);

    await page.getByRole("button", { name: "Restart mission replay" }).click();

    await expect.poll(async () => steps.first().innerText()).toBe(firstPhase);
    // Restart stops playback as well as resetting position.
    await expect(
      page.getByRole("button", { name: "Play mission replay" }),
    ).toBeEnabled();
  });

  test("the phase sequence marks exactly one current step", async ({
    page,
  }) => {
    await openReplay(page);

    const steps = page.locator(`${PHASE_SEQUENCE} [aria-current="step"]`);
    await expect(steps).toHaveCount(1);

    const phaseButtons = page.getByRole("button", {
      name: /^Show replay phase:/,
    });
    expect(await phaseButtons.count()).toBeGreaterThan(1);

    await phaseButtons.nth(1).click();
    await expect(steps).toHaveCount(1);
  });

  test("the marked step is the phase the transport reports", async ({
    page,
  }) => {
    // The sequence and the transport render the current phase independently,
    // so an off-by-one in either would leave both internally consistent while
    // showing the reader two different phases. Tying them together is what
    // makes a wrong-phase regression visible.
    await openReplay(page);

    const readout = page.locator(
      'section[aria-label="Mission replay controls"] output',
    );
    const marked = page.locator(`${PHASE_SEQUENCE} [aria-current="step"]`);

    await expect
      .poll(async () =>
        (await marked.innerText()).includes(await readout.innerText()),
      )
      .toBe(true);

    await page
      .getByRole("button", { name: /^Show replay phase:/ })
      .nth(2)
      .click();

    await expect
      .poll(async () =>
        (await marked.innerText()).includes(await readout.innerText()),
      )
      .toBe(true);
  });

  test("phase state is not carried by colour alone", async ({ page }) => {
    await openReplay(page);

    // Every step reports its standing in words. Only the current one shows
    // that word visually; the rest keep it for assistive technology.
    const labels = await page
      .locator(`${PHASE_SEQUENCE} li`)
      .evaluateAll((nodes) =>
        nodes.map((node) => (node.textContent ?? "").trim()),
      );

    expect(labels.length).toBeGreaterThan(1);
    for (const label of labels) {
      expect(label).toMatch(/Current|Reviewed|Upcoming/);
    }
  });

  test("the replay panel never offers a continuous seek control", async ({
    page,
  }) => {
    // Mission Replay supports selecting a phase, not seeking to a time. A
    // slider would advertise a capability the product does not implement, so
    // this is a product-honesty contract rather than a styling one. The
    // `<progress>` element reports position and is not interactive.
    await openReplay(page);

    const seekControls = await page.evaluate(
      () =>
        document.querySelectorAll(
          'input[type="range"], [role="slider"], [draggable="true"]',
        ).length,
    );
    expect(seekControls, "no scrubber may exist in Mission Replay").toBe(0);

    await expect(
      page.getByRole("progressbar", { name: "Mission replay progress" }),
    ).toBeVisible();
  });

  test("the transport stays reachable on a phone without body overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await openReplay(page);

    for (const name of [
      "Play mission replay",
      "Restart mission replay",
      "Mission replay speed",
    ]) {
      await expect(
        page.getByRole("button", { name }).or(page.getByLabel(name)).first(),
      ).toBeVisible();
    }

    // Controls must clear a 44px target at the width where that matters most.
    const short = await page.evaluate(
      () =>
        [
          ...document.querySelectorAll(
            'section[aria-label="Mission replay controls"] button, section[aria-label="Mission replay controls"] select',
          ),
        ].filter((node) => node.getBoundingClientRect().height < 44).length,
    );
    expect(short).toBe(0);

    await expect
      .poll(async () =>
        page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth + 1,
        ),
      )
      .toBe(false);
  });
});
