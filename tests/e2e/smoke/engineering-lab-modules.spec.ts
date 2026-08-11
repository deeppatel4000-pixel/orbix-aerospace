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

  test("a known calculation still reaches the screen unchanged", async ({
    page,
  }) => {
    // The shared result, field and card primitives are rendered by every
    // module, so a presentation change there could quietly break the wiring
    // between a computed value and the figure a reader sees. This pins one
    // end-to-end case against the shipped defaults: 196,133 N over 10,000 kg
    // at the module's own g0 is exactly 2.
    await page.goto(`${ROUTES.engineeringLab}#thrust-to-weight`, {
      waitUntil: "domcontentloaded",
    });
    await expect
      .poll(async () => (await shownModuleIds(page)).join(","), {
        timeout: 15_000,
      })
      .toBe("thrust-to-weight");

    const tool = page.locator("#thrust-to-weight");
    await expect(tool.getByLabel("Thrust", { exact: true })).toHaveValue(
      "196133",
    );
    await expect(tool.getByLabel("Mass", { exact: true })).toHaveValue("10000");

    await tool.getByRole("button", { name: /calculate ratio/i }).click();

    const result = tool.locator("output");
    await expect(result).toHaveText("2.00");
    // The result panel must still say what was computed, not just show a number.
    await expect(tool).toContainText("Thrust-to-weight ratio");
    await expect(tool).toContainText("98,066.5 N");
  });

  test("every field keeps a real label, hint and unit", async ({ page }) => {
    await page.goto(`${ROUTES.engineeringLab}#lift-equation`, {
      waitUntil: "domcontentloaded",
    });
    await expect
      .poll(async () => (await shownModuleIds(page)).join(","), {
        timeout: 15_000,
      })
      .toBe("lift-equation");

    const unlabelled = await page.evaluate(() => {
      const shown = [
        ...document.querySelectorAll("[data-laboratory-tool]"),
      ].find((node) => !node.closest("[hidden]"));
      return [...(shown?.querySelectorAll("input[type=number]") ?? [])].filter(
        (input) => {
          const id = input.getAttribute("id") ?? "";
          const label = id
            ? document.querySelector(`label[for="${id}"]`)
            : null;
          const described = input.getAttribute("aria-describedby") ?? "";
          return (
            label === null ||
            (label.textContent ?? "").trim() === "" ||
            described === ""
          );
        },
      ).length;
    });

    expect(unlabelled, "every input needs a label and a description").toBe(0);
  });

  test("no module renders content wider than its own workspace", async ({
    page,
  }) => {
    // Swept across all 33 rather than sampled: the card, field and result
    // primitives are shared, so a layout defect introduced in one of them
    // surfaces in whichever module happens to have the widest content, which
    // is not knowable in advance.
    //
    // Measured against each module's own box, NOT the document. The laboratory
    // shell sets `overflow-clip`, so content wider than the phone never makes
    // the page scroll sideways — it is silently cut off instead, which is the
    // worse outcome and one a body-overflow assertion cannot see.
    await page.setViewportSize({ height: 844, width: 390 });

    const overflowing: string[] = [];
    for (const id of MODULE_IDS) {
      await page.goto(`${ROUTES.engineeringLab}#${id}`, {
        waitUntil: "domcontentloaded",
      });
      await expect
        .poll(async () => (await shownModuleIds(page)).join(","), {
          timeout: 15_000,
        })
        .toBe(id);

      const overflows = await page.evaluate((toolId) => {
        const element = document.getElementById(toolId);
        if (!element) return true;
        return (
          element.scrollWidth > element.clientWidth + 1 ||
          document.documentElement.scrollWidth > window.innerWidth + 1
        );
      }, id);
      if (overflows) overflowing.push(id);
    }

    expect(overflowing).toEqual([]);
  });

  /**
   * The three wide comparison tables.
   *
   * Each already had an `overflow-x-auto` wrapper, so the defect was never a
   * missing scroller — it was that the wrapper could not shrink. All three sit
   * in the second column of a grid, and a grid item defaults to
   * `min-width: auto`, which refuses to go below the intrinsic width of its
   * content. Below the `xl` breakpoint, where the grid collapses to one
   * column, the wrapper therefore grew to the table's full width (992, 704 and
   * 1216px), overflowed the module, and was silently cut off by the card's
   * `overflow: hidden` — 365, 77 and 589px lost at 768, and 708, 420 and 932px
   * at 390.
   *
   * The fix is `min-w-0` on that grid item, so these assertions are about the
   * relationship the fix restores: the wrapper is narrower than its table, and
   * the module is not.
   */
  const WIDE_TABLE_MODULES = [
    "reentry-trajectory-analyzer",
    "tps-material-comparison-analyzer",
    "vehicle-reentry-comparison-analyzer",
  ] as const;

  for (const id of WIDE_TABLE_MODULES) {
    test(`${id} scrolls its comparison table inside the module`, async ({
      page,
    }) => {
      await page.setViewportSize({ height: 844, width: 390 });
      await page.goto(`${ROUTES.engineeringLab}#${id}`, {
        waitUntil: "domcontentloaded",
      });
      await expect
        .poll(async () => (await shownModuleIds(page)).join(","), {
          timeout: 15_000,
        })
        .toBe(id);

      const geometry = await page.evaluate((toolId) => {
        const element = document.getElementById(toolId);
        const table = element?.querySelector("table");
        const wrapper = table?.parentElement;
        if (!element || !table || !wrapper) return null;

        return {
          bodyOverflow:
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
          headers: element.querySelectorAll("table th").length,
          moduleClip: element.scrollWidth - element.clientWidth,
          rows: element.querySelectorAll("table tbody tr").length,
          wrapperClient: wrapper.clientWidth,
          wrapperOverflowX: getComputedStyle(wrapper).overflowX,
          wrapperScroll: wrapper.scrollWidth,
        };
      }, id);

      expect(geometry).not.toBeNull();
      // Relational, never pixel-exact: the table keeps its full intrinsic
      // width and the wrapper is the thing that is narrower.
      expect(geometry?.wrapperScroll).toBeGreaterThan(
        geometry?.wrapperClient ?? 0,
      );
      expect(["auto", "scroll"]).toContain(geometry?.wrapperOverflowX);
      expect(geometry?.moduleClip, "the module must not clip").toBe(0);
      expect(geometry?.bodyOverflow, "the page must not scroll sideways").toBe(
        0,
      );
      // Still a table: values were not dropped to make it fit.
      expect(geometry?.headers).toBeGreaterThan(0);
      expect(geometry?.rows).toBeGreaterThan(0);
    });
  }
});
