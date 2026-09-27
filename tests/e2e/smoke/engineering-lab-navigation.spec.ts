import {
  expect,
  expectNoUnexpectedConsoleErrors,
  ROUTES,
  test,
} from "../fixtures/orbix";

/**
 * Click-path coverage for the Engineering Lab tool index.
 *
 * `engineering-lab.spec.ts` already deep-links to each `#<workflow>` hash,
 * which exercises `LaboratoryShell`'s initial `resolveHash()` on load. What
 * this file covers is the path a reader actually takes: following a link in
 * the tool index. Those links are plain in-page anchors, so the path runs the
 * shell's `hashchange` listener (`laboratory-shell.tsx`). A regression there
 * would leave deep links working while the visible navigation silently broke.
 *
 * Behaviour asserted here is what the components implement (spec 14):
 *   - from 1024px, `<nav aria-label="Engineering Lab tools">` lists every
 *     tool as a link to its own id, grouped under the workflow names; the
 *     active tool's link carries `aria-current="location"`
 *   - below 1024px the same nav offers a `<select>` labelled "Choose a tool"
 *     (option values are tool ids) plus the full list in a `<details>`
 *   - selecting a tool updates the URL hash, reveals that tool's workflow
 *     section, and hides the other workflows' tools (they stay mounted, per
 *     the shell's `hidden` approach, so state is preserved)
 *   - a polite, visually hidden live region reads "Current tool: <title>"
 *
 * Workflow ids (`#foundations-workflow` and so on) are still valid deep-link
 * targets and open that workflow's first tool; they are simply no longer
 * links in the index.
 */

const WORKFLOWS = [
  {
    firstTool: "rocket-equation",
    id: "foundations-workflow",
    label: "Foundations",
  },
  {
    firstTool: "stagnation-condition-analyzer",
    id: "compressible-flow-workflow",
    label: "Compressible flow",
  },
  {
    firstTool: "hypersonic-heating-analyzer",
    id: "entry-systems-workflow",
    label: "Atmospheric entry",
  },
  {
    firstTool: "hohmann-transfer-analyzer",
    id: "orbital-mission-workflow",
    label: "Orbits and missions",
  },
  {
    firstTool: "mission-visualization",
    id: "mission-operations-workflow",
    label: "Mission visualization",
  },
  {
    firstTool: "mission-scenario-builder",
    id: "review-presentation-workflow",
    label: "Scenarios and review",
  },
] as const;

function isDesktop(): boolean {
  return test.info().project.name === "desktop";
}

/** The visible (desktop) index link for a tool. */
function indexLink(page: import("@playwright/test").Page, toolId: string) {
  return page
    .getByRole("navigation", { name: "Engineering Lab tools" })
    .locator(`a[href="#${toolId}"]:visible`);
}

test.describe("Engineering Lab tool navigation", () => {
  test("the index groups tools under the six workflow names", async ({
    page,
  }) => {
    test.skip(!isDesktop(), "The link index is only shown from 1024px.");

    await page.goto(ROUTES.engineeringLab, { waitUntil: "domcontentloaded" });
    const nav = page.getByRole("navigation", { name: "Engineering Lab tools" });
    await expect(nav).toBeVisible();

    for (const workflow of WORKFLOWS) {
      await expect(
        nav.getByRole("list", { name: workflow.label, exact: true }),
      ).toBeVisible();
      await expect(indexLink(page, workflow.firstTool)).toBeVisible();
    }
  });

  test("clicking a tool in the index activates it and updates the hash", async ({
    consoleMessages,
    page,
  }) => {
    test.skip(
      !isDesktop(),
      "The link index is only shown from 1024px; the narrow-viewport control is covered separately.",
    );

    await page.goto(ROUTES.engineeringLab, { waitUntil: "domcontentloaded" });

    // The first workflow's first tool is active on load, before any click.
    await expect(
      page.locator(`[id="${WORKFLOWS[0].firstTool}"]`),
      "the first tool should be active before any click",
    ).toBeVisible();
    await expect(indexLink(page, WORKFLOWS[0].firstTool)).toHaveAttribute(
      "aria-current",
      "location",
    );

    // Click a tool in a DIFFERENT workflow through the visible index.
    const target = WORKFLOWS[3];
    await indexLink(page, target.firstTool).click();

    // The clicked tool becomes the active one...
    await expect(page.locator(`[id="${target.firstTool}"]`)).toBeVisible();
    await expect(indexLink(page, target.firstTool)).toHaveAttribute(
      "aria-current",
      "location",
    );

    // ...the previously active one is no longer shown...
    await expect(page.locator(`[id="${WORKFLOWS[0].firstTool}"]`)).toBeHidden();

    // ...and the click drove the URL, not just local state.
    await expect(page).toHaveURL(new RegExp(`#${target.firstTool}$`));

    expectNoUnexpectedConsoleErrors(consoleMessages);
  });

  test("every workflow's first tool can be reached by clicking", async ({
    consoleMessages,
    page,
  }) => {
    test.skip(!isDesktop(), "The link index is desktop-only.");

    await page.goto(ROUTES.engineeringLab, { waitUntil: "domcontentloaded" });
    const nav = page.getByRole("navigation", { name: "Engineering Lab tools" });

    for (const workflow of WORKFLOWS) {
      await indexLink(page, workflow.firstTool).click();

      await expect(
        page.locator(`[id="${workflow.firstTool}"]`),
        `clicking "${workflow.firstTool}" should reveal it`,
      ).toBeVisible();
      await expect(indexLink(page, workflow.firstTool)).toHaveAttribute(
        "aria-current",
        "location",
      );

      // Exactly one visible link is current at a time.
      await expect(
        nav.locator('a[aria-current="location"]:visible'),
      ).toHaveCount(1);
    }

    expectNoUnexpectedConsoleErrors(consoleMessages);
  });

  test("clicking a tool swaps the workspace content", async ({ page }) => {
    test.skip(!isDesktop(), "The link index is desktop-only.");

    await page.goto(ROUTES.engineeringLab, { waitUntil: "domcontentloaded" });

    await indexLink(page, "hohmann-transfer-analyzer").click();
    await expect(
      page.locator('[id="hohmann-transfer-analyzer"]'),
    ).toBeVisible();

    // Switching to a tool in another workflow moves the content and hides the
    // previous workflow's tool.
    await indexLink(page, "shock-condition-analyzer").click();
    await expect(page.locator('[id="shock-condition-analyzer"]')).toBeVisible();
    await expect(page.locator('[id="hohmann-transfer-analyzer"]')).toBeHidden();
  });

  test("a workflow hash still opens that workflow's first tool", async ({
    page,
  }) => {
    for (const workflow of WORKFLOWS) {
      await page.goto(`${ROUTES.engineeringLab}#${workflow.id}`, {
        waitUntil: "domcontentloaded",
      });
      await expect(page.locator(`[id="${workflow.firstTool}"]`)).toBeVisible();
    }
  });

  test("the live region announces the tool selected by click", async ({
    page,
  }) => {
    test.skip(!isDesktop(), "The link index is desktop-only.");

    await page.goto(ROUTES.engineeringLab, { waitUntil: "domcontentloaded" });

    const liveRegion = page.locator('[aria-live="polite"]', {
      hasText: /^Current tool: /,
    });

    await indexLink(page, "hypersonic-heating-analyzer").click();
    await expect(liveRegion).toHaveText(
      "Current tool: Hypersonic heating analyzer",
    );
  });

  test("the narrow-viewport control selects a tool", async ({ page }) => {
    test.skip(
      isDesktop(),
      "Below 1024px the index is offered as a select; this covers that control.",
    );

    await page.goto(ROUTES.engineeringLab, { waitUntil: "domcontentloaded" });

    const select = page.getByLabel("Choose a tool");
    await expect(select).toBeVisible();
    await expect(select).toHaveValue("rocket-equation");

    await select.selectOption("hohmann-transfer-analyzer");

    await expect(
      page.locator('[id="hohmann-transfer-analyzer"]'),
    ).toBeVisible();
    await expect(page.locator('[id="rocket-equation"]')).toBeHidden();
    await expect(page).toHaveURL(/#hohmann-transfer-analyzer$/);
  });
});
