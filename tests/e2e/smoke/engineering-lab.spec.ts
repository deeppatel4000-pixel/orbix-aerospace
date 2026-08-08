import {
  expect,
  expectNoUnexpectedConsoleErrors,
  ROUTES,
  test,
} from "../fixtures/orbix";

/**
 * One representative analyzer card per workflow group (33 cards exist in
 * total; this exercises a sample from each of the 6 groups rather than
 * asserting on all of them).
 */
const workflows = [
  {
    id: "foundations-workflow",
    representativeCardId: "rocket-equation",
    representativeCardTitle: "Tsiolkovsky Rocket Equation",
    title: "Engineering foundations",
  },
  {
    id: "compressible-flow-workflow",
    representativeCardId: "stagnation-condition-analyzer",
    representativeCardTitle: "Stagnation Condition Analyzer",
    title: "Compressible flow and shock systems",
  },
  {
    id: "entry-systems-workflow",
    representativeCardId: "hypersonic-heating-analyzer",
    representativeCardTitle: "Hypersonic Heating Analyzer",
    title: "Atmospheric entry and thermal systems",
  },
  {
    id: "orbital-mission-workflow",
    representativeCardId: "hohmann-transfer-analyzer",
    representativeCardTitle: "Hohmann Transfer Analyzer",
    title: "Orbital and mission architecture",
  },
  {
    id: "mission-operations-workflow",
    representativeCardId: "mission-visualization",
    representativeCardTitle: "Mission Visualization",
    title: "Mission operations and visualization",
  },
  {
    id: "review-presentation-workflow",
    representativeCardId: "mission-scenario-builder",
    representativeCardTitle: "Mission Scenario Builder",
    title: "Scenario review and presentation",
  },
] as const;

test("engineering lab loads with its workflow index present", async ({
  consoleMessages,
  page,
}) => {
  const response = await page.goto(ROUTES.engineeringLab, {
    waitUntil: "domcontentloaded",
  });
  expect(response?.status()).toBe(200);

  await expect(
    page.getByRole("heading", { level: 1, name: "Engineering Laboratory" }),
  ).toBeVisible();

  await expect(
    page.getByRole("navigation", {
      name: "Engineering Laboratory workflows",
    }),
  ).toBeVisible();

  expectNoUnexpectedConsoleErrors(consoleMessages);
});

test("hash deep-links activate each workflow and render a representative analyzer card", async ({
  consoleMessages,
  page,
}) => {
  for (const workflow of workflows) {
    await page.goto(`${ROUTES.engineeringLab}#${workflow.id}`, {
      waitUntil: "domcontentloaded",
    });

    const section = page.locator(`#${workflow.id}`);
    await expect(section).toBeVisible();
    await expect(
      section.getByRole("heading", { level: 2, name: workflow.title }),
    ).toBeVisible();

    const card = page.locator(`#${workflow.representativeCardId}`);
    await expect(card).toBeVisible();
    await expect(
      card.getByRole("heading", {
        level: 3,
        name: workflow.representativeCardTitle,
      }),
    ).toBeVisible();
  }

  expectNoUnexpectedConsoleErrors(consoleMessages);
});
