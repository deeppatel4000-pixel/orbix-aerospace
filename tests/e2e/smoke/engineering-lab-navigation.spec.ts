import {
  expect,
  expectNoUnexpectedConsoleErrors,
  ROUTES,
  test,
} from "../fixtures/orbix";

/**
 * Click-path coverage for the Engineering Laboratory workflow switcher.
 *
 * `engineering-lab.spec.ts` already deep-links to each `#<workflow>` hash,
 * which exercises `LaboratoryShell`'s initial `resolveHash()` on load. What
 * nothing covered is the path a real user actually takes: clicking the
 * workflow index. That path runs different code — `selectWorkflow`, which
 * sets React state AND assigns `window.location.hash`, plus the `hashchange`
 * listener it triggers (`laboratory-shell.tsx`). A regression there would
 * leave deep links working while the visible navigation silently broke.
 *
 * Behaviour asserted here is what the components already implement:
 *   - desktop (>=1024px) renders `<nav aria-label="Engineering Laboratory
 *     workflows">` containing anchor links; the active one carries
 *     `aria-current="location"`
 *   - below 1024px the same nav exposes a `<select>` labelled
 *     "Current workflow" instead
 *   - selecting a workflow updates the URL hash, reveals that workflow's
 *     section, and hides the others (they stay mounted, per the shell's
 *     `hidden` approach, so state is preserved)
 *   - a polite live region announces the current workflow
 */

const WORKFLOWS = [
  { id: "foundations-workflow", label: /Engineering foundations/i },
  { id: "compressible-flow-workflow", label: /Compressible flow/i },
  { id: "entry-systems-workflow", label: /Entry systems/i },
  { id: "orbital-mission-workflow", label: /Orbital and mission design/i },
  { id: "mission-operations-workflow", label: /Mission operations/i },
  { id: "review-presentation-workflow", label: /Review and presentation/i },
] as const;

function isDesktop(): boolean {
  return test.info().project.name === "desktop";
}

test.describe("Engineering Laboratory workflow navigation", () => {
  test("clicking a workflow in the index activates it and updates the hash", async ({
    consoleMessages,
    page,
  }) => {
    test.skip(
      !isDesktop(),
      "The anchor-based workflow index is only rendered at >=1024px; the narrow-viewport control is covered separately.",
    );

    await page.goto(ROUTES.engineeringLab, { waitUntil: "domcontentloaded" });

    const nav = page.getByRole("navigation", {
      name: "Engineering Laboratory workflows",
    });
    await expect(nav).toBeVisible();

    // The first workflow is active on load, before any interaction.
    await expect(
      page.locator(`[id="${WORKFLOWS[0].id}"]`),
      "the first workflow should be active before any click",
    ).toBeVisible();

    // Click a DIFFERENT workflow through the visible index.
    const target = WORKFLOWS[3];
    await nav.locator(`a[href="#${target.id}"]`).click();

    // The clicked workflow becomes the active one...
    await expect(page.locator(`[id="${target.id}"]`)).toBeVisible();
    await expect(nav.locator(`a[href="#${target.id}"]`)).toHaveAttribute(
      "aria-current",
      "location",
    );

    // ...the previously active one is no longer shown...
    await expect(page.locator(`[id="${WORKFLOWS[0].id}"]`)).toBeHidden();

    // ...and the click drove the URL, not just local state.
    await expect(page).toHaveURL(new RegExp(`#${target.id}$`));

    expectNoUnexpectedConsoleErrors(consoleMessages);
  });

  test("every workflow in the index can be reached by clicking", async ({
    consoleMessages,
    page,
  }) => {
    test.skip(!isDesktop(), "Anchor index is desktop-only.");

    await page.goto(ROUTES.engineeringLab, { waitUntil: "domcontentloaded" });
    const nav = page.getByRole("navigation", {
      name: "Engineering Laboratory workflows",
    });

    for (const workflow of WORKFLOWS) {
      await nav.locator(`a[href="#${workflow.id}"]`).click();

      await expect(
        page.locator(`[id="${workflow.id}"]`),
        `clicking "${workflow.id}" should reveal its section`,
      ).toBeVisible();
      await expect(nav.locator(`a[href="#${workflow.id}"]`)).toHaveAttribute(
        "aria-current",
        "location",
      );

      // Exactly one workflow is current at a time.
      await expect(nav.locator('a[aria-current="location"]')).toHaveCount(1);
    }

    expectNoUnexpectedConsoleErrors(consoleMessages);
  });

  test("clicking a workflow reveals its analyzer content", async ({ page }) => {
    test.skip(!isDesktop(), "Anchor index is desktop-only.");

    await page.goto(ROUTES.engineeringLab, { waitUntil: "domcontentloaded" });
    const nav = page.getByRole("navigation", {
      name: "Engineering Laboratory workflows",
    });

    // Orbital workflow owns the Hohmann transfer analyzer.
    await nav.locator('a[href="#orbital-mission-workflow"]').click();
    await expect(
      page.locator('[id="hohmann-transfer-analyzer"]'),
    ).toBeVisible();

    // Compressible flow owns the shock analyzers; switching moves the content.
    //
    // The module asserted here changed with the module workspace: a workflow
    // now opens on its FIRST module rather than rendering all of them stacked,
    // so compressible flow shows the stagnation analyzer and the shock
    // analyzer sits one module along. The contract this test exists for is
    // unchanged and still checked — clicking a workflow swaps the visible
    // content and hides the previous workflow's.
    await nav.locator('a[href="#compressible-flow-workflow"]').click();
    await expect(
      page.locator('[id="stagnation-condition-analyzer"]'),
    ).toBeVisible();
    await expect(page.locator('[id="hohmann-transfer-analyzer"]')).toBeHidden();
  });

  test("the live region announces the workflow selected by click", async ({
    page,
  }) => {
    test.skip(!isDesktop(), "Anchor index is desktop-only.");

    await page.goto(ROUTES.engineeringLab, { waitUntil: "domcontentloaded" });
    const nav = page.getByRole("navigation", {
      name: "Engineering Laboratory workflows",
    });

    const liveRegion = page.locator('[aria-live="polite"]', {
      hasText: /Current laboratory workflow/i,
    });

    await nav.locator('a[href="#entry-systems-workflow"]').click();
    await expect(liveRegion).toContainText(/Entry systems/i);
  });

  test("the narrow-viewport control selects a workflow", async ({ page }) => {
    test.skip(
      isDesktop(),
      "Below 1024px the index is replaced by a select; this covers that control.",
    );

    await page.goto(ROUTES.engineeringLab, { waitUntil: "domcontentloaded" });

    const select = page.getByLabel("Current workflow");
    await expect(select).toBeVisible();

    await select.selectOption("#orbital-mission-workflow");

    await expect(page.locator('[id="orbital-mission-workflow"]')).toBeVisible();
    await expect(page.locator('[id="foundations-workflow"]')).toBeHidden();
    await expect(page).toHaveURL(/#orbital-mission-workflow$/);
  });
});
