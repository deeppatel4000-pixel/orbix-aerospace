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
 * Behaviour asserted here is what the components implement (design v2,
 * spec 9):
 *   - from 1024px, `<nav aria-label="Engineering Lab tools">` lists every
 *     tool as a numbered link to its own id, grouped under the workflow
 *     names; the active tool's link carries `aria-current="location"`
 *   - v4 cut the lab to three workflows, so every workflow's list is open
 *     and its name is a plain label (not a link); every tool is one click
 *     away
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
    firstTool: "hohmann-transfer-analyzer",
    id: "orbital-mission-workflow",
    label: "Orbits and missions",
  },
] as const;

/**
 * Workflows v4 removed (plan section 6). Their ids stay valid deep links
 * and open the tool that took their place.
 */
const REMOVED_WORKFLOWS = [
  { id: "entry-systems-workflow", opens: "hypersonic-heating-analyzer" },
  { id: "mission-operations-workflow", opens: "mission-planner" },
  { id: "review-presentation-workflow", opens: "mission-planner" },
] as const;

function isDesktop(): boolean {
  return test.info().project.name === "desktop";
}

type Page = import("@playwright/test").Page;

function toolIndex(page: Page) {
  return page.getByRole("navigation", {
    exact: true,
    name: "Engineering Lab tools",
  });
}

/** The visible (desktop) index row link for a tool. */
function indexLink(page: Page, toolId: string) {
  return toolIndex(page).locator(`ol a[href="#${toolId}"]:visible`);
}

/**
 * Opens a tool through the visible index the way a reader does: its own
 * row. Retried as a unit, because a click that lands before hydration
 * settles can be undone by the router restoring the boot hash.
 */
async function openFromIndex(page: Page, toolId: string) {
  await expect(async () => {
    await indexLink(page, toolId).click({ timeout: 2_000 });
    await expect(page.locator(`[id="${toolId}"]`)).toBeVisible({
      timeout: 2_000,
    });
  }).toPass({ timeout: 20_000 });
}

test.describe("Engineering Lab tool navigation", () => {
  test("the index groups tools under the three workflow names", async ({
    page,
  }) => {
    test.skip(!isDesktop(), "The link index is only shown from 1024px.");

    await page.goto(ROUTES.engineeringLab, { waitUntil: "domcontentloaded" });
    const nav = toolIndex(page);
    await expect(nav).toBeVisible();

    for (const workflow of WORKFLOWS) {
      // Every workflow is a visible, named list; its name is a label, not a
      // link, and the list opens on the workflow's first tool.
      const list = nav.getByRole("list", { exact: true, name: workflow.label });
      await expect(list).toBeVisible();
      await expect(
        nav.getByRole("link", { exact: true, name: workflow.label }),
      ).toHaveCount(0);
      await expect(list.getByRole("link").first()).toHaveAttribute(
        "href",
        `#${workflow.firstTool}`,
      );
    }

    // Every tool row in the index is visible at once.
    const rows = nav.locator("ol a[href^='#']");
    const visible = await rows.evaluateAll(
      (links) => links.filter((link) => link.checkVisibility()).length,
    );
    expect(visible).toBe(await rows.count());
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
    const target = WORKFLOWS[2];
    await openFromIndex(page, target.firstTool);

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

    await page.goto(ROUTES.engineeringLab, { waitUntil: "load" });
    const nav = toolIndex(page);
    await expect(nav).toBeVisible();

    for (const workflow of WORKFLOWS) {
      await openFromIndex(page, workflow.firstTool);

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

    await openFromIndex(page, "hohmann-transfer-analyzer");
    await expect(
      page.locator('[id="hohmann-transfer-analyzer"]'),
    ).toBeVisible();

    // Switching to a tool in another workflow moves the content and hides the
    // previous workflow's tool.
    await openFromIndex(page, "shock-condition-analyzer");
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
    for (const workflow of REMOVED_WORKFLOWS) {
      await page.goto(`${ROUTES.engineeringLab}#${workflow.id}`, {
        waitUntil: "domcontentloaded",
      });
      await expect(page.locator(`[id="${workflow.opens}"]`)).toBeVisible();
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

    await openFromIndex(page, "hypersonic-heating-analyzer");
    await expect(liveRegion).toHaveText(
      "Current tool: Stagnation-point heating estimate",
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
