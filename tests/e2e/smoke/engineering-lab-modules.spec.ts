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
 * Every id below is a real deep-link target: Learn, Compare's row education
 * and the homepage link into the lab, so a module that stopped resolving
 * would break navigation from three other pages.
 *
 * v4 (plan section 6) cut the lab to these 14 tools. The ids of merged,
 * replaced and deferred modules still resolve: `LEGACY_ANCHORS` maps each to
 * the tool that took its place (checked below).
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
  "inlet-compression-analyzer",
  "hypersonic-heating-analyzer",
  "hohmann-transfer-analyzer",
  "orbital-plane-change-analyzer",
  "mission-planner",
] as const;

/**
 * Old deep links and the tool each now opens: the mission modules the
 * planner replaced, and the entry workflow whose one remaining tool is the
 * stagnation-point heating estimate. Typed out again from
 * `engineering-dashboard.tsx` so a dropped alias fails here.
 */
const LEGACY_ANCHORS = {
  "demo-mode": "mission-planner",
  "entry-systems-workflow": "hypersonic-heating-analyzer",
  "interactive-mission-viewer": "mission-planner",
  "mission-briefing": "mission-planner",
  "mission-control-dashboard": "mission-planner",
  "mission-operations-workflow": "mission-planner",
  "mission-preset-launcher": "mission-planner",
  "mission-profile-analyzer": "mission-planner",
  "mission-report-viewer": "mission-planner",
  "mission-scenario-builder": "mission-planner",
  "mission-showcase": "mission-planner",
  "mission-trade-study": "mission-planner",
  "mission-visualization": "mission-planner",
  "review-presentation-workflow": "mission-planner",
  "scenario-library": "mission-planner",
} as const;

/**
 * Loads the lab once and waits until React has hydrated the tool index.
 *
 * The sweeps below move between tools with same-document hash navigations.
 * If the first of those lands while the page is still hydrating, the Next.js
 * router's initial `history.replaceState` restores the hash it booted with,
 * and the shell (correctly) keeps showing that tool. Waiting for hydration
 * first makes every later hash change a real user-style navigation.
 */
async function openHydratedLab(
  page: import("@playwright/test").Page,
): Promise<void> {
  await page.goto(ROUTES.engineeringLab, { waitUntil: "load" });
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const select = document.getElementById("laboratory-tool-select");
          return (
            select !== null &&
            Object.keys(select).some((key) => key.startsWith("__reactProps"))
          );
        }),
      { timeout: 30_000 },
    )
    .toBe(true);
}

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
    await openHydratedLab(page);
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

  test("old deep links open the tool that replaced them", async ({ page }) => {
    await openHydratedLab(page);
    for (const [legacy, id] of Object.entries(LEGACY_ANCHORS)) {
      await page.goto(`${ROUTES.engineeringLab}#${legacy}`, {
        waitUntil: "domcontentloaded",
      });
      await expect
        .poll(async () => (await shownModuleIds(page)).join(","), {
          message: `#${legacy}`,
          timeout: 15_000,
        })
        .toBe(id);
    }
  });

  test("the index lists exactly the tools on the page, in order", async ({
    page,
  }) => {
    await openHydratedLab(page);
    const indexed = await page.evaluate(() =>
      [
        ...document.querySelectorAll(
          'nav[aria-label="Engineering Lab tools"] a[href^="#"]',
        ),
      ]
        .filter((link) => link.checkVisibility())
        .map((link) => (link.getAttribute("href") ?? "").slice(1))
        .filter((id) =>
          document.querySelector(`[data-laboratory-tool="${id}"]`),
        ),
    );
    const tools = await page.evaluate(() =>
      [...document.querySelectorAll("[data-laboratory-tool]")].map(
        (node) => node.getAttribute("data-laboratory-tool") ?? "",
      ),
    );

    expect(tools).toEqual([...MODULE_IDS]);
    expect(indexed).toEqual([...MODULE_IDS]);
  });

  test("the index label matches the module it reveals", async ({ page }) => {
    // The index is authored beside the cards rather than derived from them.
    // If the two lists ever slip out of order, a reader would select one model
    // and be shown another — the worst failure this design can produce.
    await openHydratedLab(page);
    for (const id of MODULE_IDS) {
      await page.goto(`${ROUTES.engineeringLab}#${id}`, {
        waitUntil: "domcontentloaded",
      });
      await expect
        .poll(async () => (await shownModuleIds(page)).join(","), {
          timeout: 15_000,
        })
        .toBe(id);

      // Read in one pass: the current link in the visible index (the index
      // is rendered twice, once for narrow viewports inside a <details>, so
      // only the visible copy counts) against the visible tool's heading.
      const pair = await page.evaluate(() => {
        const shown = [
          ...document.querySelectorAll("[data-laboratory-tool]"),
        ].find((node) => !node.closest("[hidden]"));
        const label = [
          ...document.querySelectorAll(
            'nav[aria-label="Engineering Lab tools"] a[aria-current="location"]',
          ),
        ]
          .find((link) => link.checkVisibility())
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
      .getByRole("navigation", { name: "Engineering Lab tools" })
      .getByRole("link", { name: "Drag equation", exact: true })
      .filter({ visible: true })
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

    // Marked: the current link carries aria-current (and a text weight and
    // border change, not only a colour change).
    const current = page.locator(
      'nav[aria-label="Engineering Lab tools"] a[aria-current="location"]:visible',
    );
    await expect(current).toHaveCount(1);
    await expect(current).toHaveText("Lift equation");

    // Announced: a polite live region names the current tool.
    await expect(
      page.locator('[aria-live="polite"]', { hasText: /^Current tool: / }),
    ).toHaveText("Current tool: Lift equation");
  });

  test("index entries are plain links with a usable target", async ({
    page,
  }) => {
    await page.goto(ROUTES.engineeringLab, { waitUntil: "domcontentloaded" });

    // Every entry is a single in-page link to its tool id, with nothing
    // interactive nested inside it.
    const entries = await page.evaluate(() =>
      [
        ...document.querySelectorAll(
          'nav[aria-label="Engineering Lab tools"] li',
        ),
      ].map((item) => {
        const controls = item.querySelectorAll("a, button, input, select");
        const link = item.querySelector("a");
        return {
          controls: controls.length,
          href: link?.getAttribute("href") ?? "",
        };
      }),
    );
    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      expect(entry.controls).toBe(1);
      expect(entry.href).toMatch(/^#[a-z0-9-]+$/);
    }

    // WCAG 2.2 2.5.8: every visible entry is at least 24px tall and spans
    // the index width. Polled: the links are server-rendered, so they exist
    // in the DOM before the stylesheet that gives them their height applies.
    await expect
      .poll(async () =>
        page.evaluate(
          () =>
            [
              ...document.querySelectorAll(
                'nav[aria-label="Engineering Lab tools"] a',
              ),
            ]
              .filter((node) => node.checkVisibility())
              .map((node) => node.getBoundingClientRect().height)
              .filter((height) => height < 24).length,
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
    // Swept across every tool rather than sampled: the card, field and result
    // primitives are shared, so a layout defect introduced in one of them
    // surfaces in whichever module happens to have the widest content, which
    // is not knowable in advance.
    //
    // Measured against each module's own box, NOT the document. The laboratory
    // shell sets `overflow-clip`, so content wider than the phone never makes
    // the page scroll sideways — it is silently cut off instead, which is the
    // worse outcome and one a body-overflow assertion cannot see.
    await page.setViewportSize({ height: 844, width: 390 });
    await openHydratedLab(page);

    const overflowing: string[] = [];
    for (const id of MODULE_IDS) {
      await page.goto(`${ROUTES.engineeringLab}#${id}`, {
        waitUntil: "domcontentloaded",
      });
      // 30s rather than the 15s used elsewhere in this file. This test alone
      // navigates the heaviest route once per tool in a single case, and under full
      // parallel-suite load one of those hydrations exceeded 15 seconds once,
      // failing before the clipping assertion below ever ran. The condition is
      // unchanged — only the patience. In isolation each full sweep completes
      // in roughly 11 seconds, so this is headroom, not a masked defect.
      await expect
        .poll(async () => (await shownModuleIds(page)).join(","), {
          timeout: 30_000,
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
   * The wide table: the mission planner's delta-v ledger as a table. It sits
   * in an `overflow-x-auto` wrapper that must be able to shrink below the
   * table (a grid or flex item defaults to `min-width: auto`), so on a phone
   * the wrapper scrolls and the module does not clip.
   */
  const WIDE_TABLES = [
    { id: "mission-planner", summary: "Show the numbers as a table" },
  ] as const;

  for (const { id, summary } of WIDE_TABLES) {
    test(`${id} scrolls its table inside the module`, async ({ page }) => {
      await page.setViewportSize({ height: 844, width: 390 });
      await openHydratedLab(page);
      await page.goto(`${ROUTES.engineeringLab}#${id}`, {
        waitUntil: "domcontentloaded",
      });
      await expect
        .poll(async () => (await shownModuleIds(page)).join(","), {
          timeout: 15_000,
        })
        .toBe(id);

      const tool = page.locator(`[id="${id}"]`);
      await tool.getByText(summary, { exact: true }).click();
      await expect(tool.locator("table")).toBeVisible();

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
      expect(["auto", "scroll"]).toContain(geometry?.wrapperOverflowX);
      expect(geometry?.moduleClip, "the module must not clip").toBe(0);
      expect(
        geometry?.bodyOverflow,
        "the page must not scroll sideways",
      ).toBeLessThanOrEqual(0);
      // Still a table: values were not dropped to make it fit.
      expect(geometry?.headers).toBeGreaterThan(0);
      expect(geometry?.rows).toBeGreaterThan(0);
    });
  }
});
