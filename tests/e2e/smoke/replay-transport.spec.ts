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
 * every test walks that path: open the module, then activate the Replay tab.
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

  await expect(
    page.getByRole("navigation", { name: "Mission control sections" }),
  ).toBeVisible();

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

  test("one play/pause toggle expresses the current state and keeps focus", async ({
    page,
  }) => {
    await openReplay(page);

    const play = page.getByRole("button", { name: "Play mission replay" });
    const pause = page.getByRole("button", { name: "Pause mission replay" });

    // Stopped: the toggle offers Play, and nothing offers Pause.
    await expect(play).toBeEnabled();
    await expect(pause).toHaveCount(0);

    await play.focus();
    await page.keyboard.press("Enter");

    // Playing: the same button now offers Pause, so the state is readable
    // from the transport itself. It is one element whose name flips, so
    // keyboard focus stays on it instead of dropping to <body> (which is what
    // disabling a focused Play button used to do).
    await expect(pause).toBeEnabled();
    await expect(play).toHaveCount(0);
    await expect(pause).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(play).toBeEnabled();
    await expect(pause).toHaveCount(0);
    await expect(play).toBeFocused();
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
      "Replay speed",
    ]) {
      await expect(
        page.getByRole("button", { name }).or(page.getByLabel(name)).first(),
      ).toBeVisible();
    }

    // Controls must clear the design system's 40px control height (spec
    // section 10, `.orbix-button` min-height 2.5rem), well above the WCAG 2.2
    // 2.5.8 minimum of 24px, at the width where that matters most.
    const short = await page.evaluate(
      () =>
        [
          ...document.querySelectorAll(
            'section[aria-label="Mission replay controls"] button, section[aria-label="Mission replay controls"] select',
          ),
        ].filter((node) => node.getBoundingClientRect().height < 40).length,
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

  /**
   * The 3D scene is the replay's visual anchor, so its presence is a contract.
   *
   * Deliberately NOT asserted: that the scene node survives a phase change.
   * `mission-replay.tsx` renders it with `key={activePhase.id}`, so it remounts
   * per phase by design. The contract is that exactly one scene root exists at
   * any moment — never zero, never two.
   */
  test("exactly one mission scene is present, through play, pause and phase change", async ({
    page,
  }) => {
    await openReplay(page);

    const scene = page.locator(
      'section[aria-labelledby^="mission-scene-"][aria-labelledby$="-title"]',
    );
    await expect(scene).toHaveCount(1);

    await page.getByRole("button", { name: "Play mission replay" }).click();
    await expect(scene).toHaveCount(1);

    await page.getByRole("button", { name: "Pause mission replay" }).click();
    await expect(scene).toHaveCount(1);

    await page
      .getByRole("button", { name: /^Show replay phase:/ })
      .nth(1)
      .click();
    await expect(scene).toHaveCount(1);
    await expect(scene).toBeVisible();
  });

  test("the transport comes first, ahead of the scene it drives", async ({
    page,
  }) => {
    // The 2026 redesign composes the replay top to bottom as: transport,
    // phase sequence, active phase, scene, values. Play/Pause is the first
    // thing a keyboard or screen-reader user reaches, and the scene follows
    // the phase it illustrates. Asserted as an ordering relationship rather
    // than a pixel offset.
    await openReplay(page);

    const order = await page.evaluate(() => {
      const panel = document.querySelector(
        '[aria-labelledby="mission-replay-title"]',
      );
      const scene = document.querySelector(
        'section[aria-labelledby^="mission-scene-"][aria-labelledby$="-title"]',
      );
      const controls = document.querySelector(
        'section[aria-label="Mission replay controls"]',
      );
      if (!panel || !scene || !controls) return null;
      const top = panel.getBoundingClientRect().top;
      return {
        controls: controls.getBoundingClientRect().top - top,
        scene: scene.getBoundingClientRect().top - top,
      };
    });

    expect(order).not.toBeNull();
    expect(order?.controls).toBeLessThan(order?.scene ?? 0);
  });

  test("the mission values are one grouped region, not five cards", async ({
    page,
  }) => {
    // The five readings each had their own bordered card, which put them at the
    // same visual weight as the scene and the transport. They now share one
    // surface with internal dividers. Asserted structurally: the region carries
    // a single bordered container, and still lists all five entries.
    await openReplay(page);

    const region = page.locator(
      'section[aria-labelledby="replay-telemetry-title"]',
    );
    await expect(region).toHaveCount(1);

    const shape = await page.evaluate(() => {
      const section = document.querySelector(
        'section[aria-labelledby="replay-telemetry-title"]',
      );
      if (!section) return null;
      const bordered = [...section.querySelectorAll("*")].filter((node) => {
        const style = getComputedStyle(node);
        return (
          Number.parseFloat(style.borderTopWidth) > 0 &&
          Number.parseFloat(style.borderLeftWidth) > 0 &&
          Number.parseFloat(style.borderRightWidth) > 0
        );
      }).length;
      return {
        bordered,
        entries: section.querySelectorAll("dt").length,
      };
    });

    expect(shape?.entries, "all five readings remain").toBe(5);
    expect(
      shape?.bordered,
      "the readings should share one surface, not carry one each",
    ).toBeLessThanOrEqual(1);
  });
});
