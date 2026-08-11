import { expect, ROUTES, test } from "../fixtures/orbix";

/**
 * Engineering Laboratory module workspace.
 *
 * The laboratory already chose one workflow at a time, but every module inside
 * the active workflow rendered stacked in a single column. That made the
 * default view 10,745px tall on a desktop and 18,873px for atmospheric entry,
 * and it meant the page could not answer "which model am I using?" — only
 * scrolling could. This phase added a module index so one module is active.
 *
 * The contracts that matter are therefore:
 *
 *   - exactly one module is ever visible
 *   - the module the URL asks for is the one you get
 *   - the index label matches the module it reveals
 *
 * The third exists because the index is authored as data beside the cards
 * rather than derived from them, so it could drift; this test is what makes
 * that duplication safe.
 *
 * Every id below is a real deep-link target. Learn links to 28 of them,
 * Compare's row education to 8, and the homepage and showcase to the mission
 * control dashboard, so a module that stopped resolving would break navigation
 * from three other completed systems.
 */

const MODULE_IDS = [
  "rocket-equation",
  "thrust-to-weight",
  "lift-equation",
  "drag-equation",
  "standard-atmosphere",
  "flight-condition-analyzer",
  "stagnation-condition-analyzer",
  "shock-condition-analyzer",
  "oblique-shock-condition-analyzer",
  "shock-pressure-loss-analyzer",
  "multi-shock-recovery-analyzer",
  "inlet-compression-analyzer",
  "hypersonic-heating-analyzer",
  "reentry-deceleration-analyzer",
  "reentry-trajectory-analyzer",
  "material-tps-sizing-analyzer",
  "tps-material-comparison-analyzer",
  "vehicle-reentry-evaluation-analyzer",
  "vehicle-reentry-comparison-analyzer",
  "hohmann-transfer-analyzer",
  "orbital-plane-change-analyzer",
  "mission-profile-analyzer",
  "mission-preset-launcher",
  "mission-report-viewer",
  "mission-visualization",
  "interactive-mission-viewer",
  "mission-control-dashboard",
  "mission-scenario-builder",
  "scenario-library",
  "mission-briefing",
  "mission-trade-study",
  "mission-showcase",
  "demo-mode",
] as const;

/** Modules that are present and not inside anything hidden. */
async function shownModuleIds(
  page: import("@playwright/test").Page,
): Promise<string[]> {
  return page.evaluate(() =>
    [...document.querySelectorAll("[data-laboratory-tool]")]
      .filter((node) => !node.closest("[hidden]"))
      .map((node) => node.getAttribute("data-laboratory-tool") ?? ""),
  );
}

test.describe("Engineering Laboratory modules", () => {
  test.skip(
    () => test.info().project.name !== "desktop",
    "Module gating is viewport-independent; the mobile checks below set their own viewport.",
  );

  test("every module resolves from its own deep link and is the only one shown", async ({
    page,
  }) => {
    for (const id of MODULE_IDS) {
      await page.goto(`${ROUTES.engineeringLab}#${id}`, {
        waitUntil: "domcontentloaded",
      });

      // Polled rather than read once: the workspace resolves the hash after
      // hydration, so a single read can catch the server-rendered default.
      await expect
        .poll(async () => (await shownModuleIds(page)).join(","), {
          timeout: 15_000,
        })
        .toBe(id);
    }
  });

  test("the index label matches the module it reveals", async ({ page }) => {
    // The index is authored beside the cards rather than derived from them.
    // If the two lists ever slip out of order, a reader would select one model
    // and be shown another — the worst failure this design can produce.
    for (const id of MODULE_IDS) {
      await page.goto(`${ROUTES.engineeringLab}#${id}`, {
        waitUntil: "domcontentloaded",
      });
      await expect
        .poll(async () => (await shownModuleIds(page)).join(","), {
          timeout: 15_000,
        })
        .toBe(id);

      // Read in one pass from the visible module's own section: every
      // workflow keeps its own active module, including the five that are
      // hidden, so a document-wide `aria-current` match would pick up a
      // neighbouring workflow's label.
      const pair = await page.evaluate(() => {
        const shown = [
          ...document.querySelectorAll("[data-laboratory-tool]"),
        ].find((node) => !node.closest("[hidden]"));
        const section = shown?.closest("section[id]");
        const label = section
          ?.querySelector(
            '.orbix-lab-tool[aria-current="true"] .orbix-lab-tool__title',
          )
          ?.textContent?.trim();
        const heading = shown?.querySelector("h2, h3")?.textContent?.trim();

        return { heading, label };
      });

      expect(pair.heading, `index and module disagree for ${id}`).toBe(
        pair.label,
      );
    }
  });

  test("selecting a module from the index swaps the workspace and the hash", async ({
    page,
  }) => {
    await page.goto(ROUTES.engineeringLab, { waitUntil: "domcontentloaded" });
    await expect.poll(async () => (await shownModuleIds(page)).length).toBe(1);

    await page
      .locator("#foundations-workflow .orbix-lab-tool")
      .filter({ hasText: "Drag Equation" })
      .click();

    await expect
      .poll(async () => (await shownModuleIds(page)).join(","))
      .toBe("drag-equation");
    expect(new URL(page.url()).hash).toBe("#drag-equation");
  });

  test("the active module is announced and marked, not left to colour alone", async ({
    page,
  }) => {
    await page.goto(`${ROUTES.engineeringLab}#lift-equation`, {
      waitUntil: "domcontentloaded",
    });
    await expect
      .poll(async () => (await shownModuleIds(page)).join(","))
      .toBe("lift-equation");

    const current = page.locator(
      '#foundations-workflow .orbix-lab-tool[aria-current="true"]',
    );
    await expect(current).toHaveCount(1);
    await expect(current).toContainText("Lift Equation");

    await expect(
      page.locator("#foundations-workflow").getByText("Current module:", {
        exact: false,
      }),
    ).toContainText("Lift Equation");
  });

  test("index controls are real buttons with a usable target", async ({
    page,
  }) => {
    await page.goto(ROUTES.engineeringLab, { waitUntil: "domcontentloaded" });

    const nested = await page.evaluate(
      () =>
        [...document.querySelectorAll(".orbix-lab-tool")].filter(
          (node) =>
            node.tagName !== "BUTTON" ||
            node.querySelector("a, button, input, select") !== null,
        ).length,
    );
    expect(nested, "no nested interactive controls in the index").toBe(0);

    // Polled: the controls are server-rendered, so they exist in the DOM
    // before the stylesheet that gives them their height has applied.
    await expect
      .poll(async () =>
        page.evaluate(
          () =>
            [
              ...document.querySelectorAll(
                "#foundations-workflow .orbix-lab-tool",
              ),
            ]
              .map((node) => node.getBoundingClientRect().height)
              .filter((height) => height < 44).length,
        ),
      )
      .toBe(0);
  });

  test("the workspace fits a phone without horizontal overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto(`${ROUTES.engineeringLab}#standard-atmosphere`, {
      waitUntil: "domcontentloaded",
    });
    await expect
      .poll(async () => (await shownModuleIds(page)).join(","), {
        timeout: 15_000,
      })
      .toBe("standard-atmosphere");

    await expect
      .poll(async () =>
        page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth + 1,
        ),
      )
      .toBe(false);
  });
});
