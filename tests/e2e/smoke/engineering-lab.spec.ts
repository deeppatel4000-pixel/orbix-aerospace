import {
  expect,
  expectNoUnexpectedConsoleErrors,
  ROUTES,
  test,
} from "../fixtures/orbix";

/**
 * One representative tool per workflow group: the tool each workflow opens
 * on (the lab's tool count is asserted in engineering-lab-modules.spec.ts).
 * A workflow hash opens that workflow's first tool.
 */
const workflows = [
  {
    id: "foundations-workflow",
    representativeCardId: "rocket-equation",
    representativeCardTitle: "Tsiolkovsky rocket equation",
    title: "Foundations",
  },
  {
    id: "compressible-flow-workflow",
    representativeCardId: "stagnation-condition-analyzer",
    representativeCardTitle: "Stagnation condition",
    title: "Compressible flow",
  },
  {
    id: "orbital-mission-workflow",
    representativeCardId: "hohmann-transfer-analyzer",
    representativeCardTitle: "Hohmann transfer",
    title: "Orbits and missions",
  },
] as const;

test("engineering lab loads with its tool index present", async ({
  consoleMessages,
  page,
}) => {
  const response = await page.goto(ROUTES.engineeringLab, {
    waitUntil: "domcontentloaded",
  });
  expect(response?.status()).toBe(200);

  await expect(
    page.getByRole("heading", { level: 1, name: "Engineering Lab" }),
  ).toBeVisible();

  await expect(
    // Exact: below 1024px a second nav, "All Engineering Lab tools", holds
    // the full list in a disclosure.
    page.getByRole("navigation", {
      exact: true,
      name: "Engineering Lab tools",
    }),
  ).toBeVisible();

  expectNoUnexpectedConsoleErrors(consoleMessages);
});

test("hash deep-links activate each workflow and render its first tool", async ({
  consoleMessages,
  page,
}) => {
  for (const workflow of workflows) {
    await page.goto(`${ROUTES.engineeringLab}#${workflow.id}`, {
      waitUntil: "domcontentloaded",
    });

    // Each workflow is a region named by its (visible) workflow label.
    const section = page.locator(`#${workflow.id}`);
    await expect(section).toBeVisible();
    await expect(section).toHaveAccessibleName(workflow.title);

    // The tool is the workspace's main subject, so its title is an h2.
    const card = page.locator(`#${workflow.representativeCardId}`);
    await expect(card).toBeVisible();
    await expect(
      card.getByRole("heading", {
        level: 2,
        name: workflow.representativeCardTitle,
        exact: true,
      }),
    ).toBeVisible();
  }

  expectNoUnexpectedConsoleErrors(consoleMessages);
});

test("hero record row keeps every figure inside its clip, down to 320px", async ({
  page,
}) => {
  // The record row pulls its list left by one compartment inset and clips
  // it, so a page that narrows the item inset without narrowing the pull
  // cuts the first label ("irst burn"). Checked at the project width and at
  // the narrowest supported phone.
  await page.goto(ROUTES.engineeringLab, { waitUntil: "domcontentloaded" });
  const viewport = page.viewportSize();

  for (const width of [viewport?.width ?? 1440, 320]) {
    await page.setViewportSize({ height: viewport?.height ?? 844, width });
    const row = page.locator(".orbix-record-row").first();
    await expect(row).toBeVisible();

    const offsets = await row.evaluate((element) => {
      const box = element.getBoundingClientRect();
      return [...element.querySelectorAll("dt, dd")].map((cell) => {
        const range = document.createRange();
        range.selectNodeContents(cell);
        const text = range.getBoundingClientRect();
        return {
          left: text.left - box.left,
          right: box.right - text.right,
          text: cell.textContent ?? "",
        };
      });
    });

    expect(offsets.length).toBeGreaterThan(0);
    for (const offset of offsets) {
      expect(
        offset.left,
        `"${offset.text}" starts left of the row at ${width}px`,
      ).toBeGreaterThanOrEqual(0);
      expect(
        offset.right,
        `"${offset.text}" ends right of the row at ${width}px`,
      ).toBeGreaterThanOrEqual(0);
    }
  }
});

test("rocket equation sets on one line, down to 320px", async ({ page }) => {
  await page.goto(ROUTES.engineeringLab, { waitUntil: "domcontentloaded" });
  const viewport = page.viewportSize();

  for (const width of [viewport?.width ?? 1440, 320]) {
    await page.setViewportSize({ height: viewport?.height ?? 844, width });
    const expression = page.locator(".orbix-equation__expr").first();
    await expect(expression).toBeVisible();

    // One line: the content box is less than two line heights tall
    // (subscripts can deepen a single line box a little, never double it).
    const lineRatio = await expression.evaluate((element) => {
      const style = getComputedStyle(element);
      const content =
        element.clientHeight -
        parseFloat(style.paddingTop) -
        parseFloat(style.paddingBottom);
      return content / parseFloat(style.lineHeight);
    });
    const overflows = await expression.evaluate(
      (element) => element.scrollWidth > element.clientWidth + 1,
    );

    expect(lineRatio, `rocket equation lines at ${width}px`).toBeLessThan(2);
    expect(overflows, `rocket equation scrolls at ${width}px`).toBe(false);
  }
});
