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
 *   - each workflow is headed by a link to its first tool; only the active
 *     workflow's list is unfolded (every list is shown on a window at least
 *     1,200px tall), so reaching a tool in another workflow means following
 *     that workflow's header link first
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

/** A workflow's header link, which opens that workflow's first tool. */
function workflowLink(page: Page, label: string) {
  return toolIndex(page).getByRole("link", { name: label, exact: true });
}

/**
 * Opens a tool through the visible index the way a reader does: the tool's
 * own row when its workflow is unfolded, otherwise the workflow's header
 * link first (which unfolds it), then the row.
 */
async function openFromIndex(
  page: Page,
  workflowLabel: string,
  toolId: string,
) {
  // Retried as a unit: before hydration settles, the open workflow can
  // change under the check, and the open workflow's header is not a link.
  await expect(async () => {
    if ((await indexLink(page, toolId).count()) === 0) {
      await workflowLink(page, workflowLabel).click({ timeout: 2_000 });
    }
    await expect(indexLink(page, toolId)).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 20_000 });
  await indexLink(page, toolId).click();
}

test.describe("Engineering Lab tool navigation", () => {
  test("the index groups tools under the six workflow names", async ({
    page,
  }) => {
    test.skip(!isDesktop(), "The link index is only shown from 1024px.");

    await page.goto(ROUTES.engineeringLab, { waitUntil: "domcontentloaded" });
    const nav = toolIndex(page);
    await expect(nav).toBeVisible();

    for (const [index, workflow] of WORKFLOWS.entries()) {
      // Every workflow has a visible header. A folded workflow's header is
      // a link to its first tool; the open one (the first, on load) is the
      // same element without an href, so it is not a link and not a tab
      // stop, and its list's first row is the way to its first tool.
      const header = nav
        .locator("a")
        .filter({ has: page.getByText(workflow.label, { exact: true }) });
      await expect(header).toHaveCount(1);
      await expect(header).toBeVisible();
      if (index === 0) {
        await expect(header).not.toHaveAttribute("href", /.*/);
        await expect(workflowLink(page, workflow.label)).toHaveCount(0);
      } else {
        await expect(workflowLink(page, workflow.label)).toBeVisible();
        await expect(workflowLink(page, workflow.label)).toHaveAttribute(
          "href",
          `#${workflow.firstTool}`,
        );
      }
      // Folded lists stay mounted but hidden (out of the accessibility
      // tree), so the list is found through the header that labels it.
      const headerId = await header.getAttribute("id");
      expect(headerId).toBeTruthy();
      await expect(
        nav.locator(`ol[aria-labelledby="${headerId}"] > li`),
      ).not.toHaveCount(0);
    }

    // The active workflow's list is unfolded on load.
    await expect(
      nav.getByRole("list", { name: WORKFLOWS[0].label, exact: true }),
    ).toBeVisible();
    await expect(indexLink(page, WORKFLOWS[0].firstTool)).toBeVisible();

    // Following another workflow's header unfolds that workflow's list.
    await workflowLink(page, WORKFLOWS[2].label).click();
    await expect(
      nav.getByRole("list", { name: WORKFLOWS[2].label, exact: true }),
    ).toBeVisible();
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
    await openFromIndex(page, target.label, target.firstTool);

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
      await openFromIndex(page, workflow.label, workflow.firstTool);

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

    await openFromIndex(
      page,
      "Orbits and missions",
      "hohmann-transfer-analyzer",
    );
    await expect(
      page.locator('[id="hohmann-transfer-analyzer"]'),
    ).toBeVisible();

    // Switching to a tool in another workflow moves the content and hides the
    // previous workflow's tool.
    await openFromIndex(page, "Compressible flow", "shock-condition-analyzer");
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

    await openFromIndex(
      page,
      "Atmospheric entry",
      "hypersonic-heating-analyzer",
    );
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
