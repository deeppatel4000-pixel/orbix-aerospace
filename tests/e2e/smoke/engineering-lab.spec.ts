import {
  expect,
  expectNoUnexpectedConsoleErrors,
  ROUTES,
  test,
} from "../fixtures/orbix";

/**
 * One representative tool per workflow group (33 tools exist in total; this
 * exercises the tool each workflow opens on rather than asserting on all of
 * them). A workflow hash opens that workflow's first tool.
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
    representativeCardTitle: "Stagnation condition analyzer",
    title: "Compressible flow",
  },
  {
    id: "entry-systems-workflow",
    representativeCardId: "hypersonic-heating-analyzer",
    representativeCardTitle: "Hypersonic heating analyzer",
    title: "Atmospheric entry",
  },
  {
    id: "orbital-mission-workflow",
    representativeCardId: "hohmann-transfer-analyzer",
    representativeCardTitle: "Hohmann transfer analyzer",
    title: "Orbits and missions",
  },
  {
    id: "mission-operations-workflow",
    representativeCardId: "mission-visualization",
    representativeCardTitle: "Mission diagrams",
    title: "Mission visualization",
  },
  {
    id: "review-presentation-workflow",
    representativeCardId: "mission-scenario-builder",
    representativeCardTitle: "Mission scenario builder",
    title: "Scenarios and review",
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
    page.getByRole("navigation", {
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
