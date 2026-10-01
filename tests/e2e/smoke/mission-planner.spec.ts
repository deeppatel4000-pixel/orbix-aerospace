import type { Locator, Page } from "@playwright/test";

import {
  expect,
  expectNoUnexpectedConsoleErrors,
  ROUTES,
  test,
} from "../fixtures/orbix";

/**
 * V2 Mission Planner and V3 delta-v ledger (v4 plan section 5). They
 * replaced the eight mission modules, the replay and the dashboard.
 *
 * The contracts: every step is listed in flight order; steps the models do
 * not cover are listed as not modelled and carry no number; Mars is preset
 * allowances, never presented as computed; the reader's own altitudes run
 * through the same analyses, with errors named per field; and nothing
 * claims a mission is feasible.
 */

async function openPlanner(page: Page): Promise<Locator> {
  await page.goto(`${ROUTES.engineeringLab}#mission-planner`, {
    waitUntil: "domcontentloaded",
  });
  const tool = page.locator('[data-laboratory-tool="mission-planner"]');
  await expect(tool).toBeVisible({ timeout: 15_000 });
  // Wait for hydration before using the controls.
  await expect
    .poll(() =>
      tool
        .getByRole("radio")
        .first()
        .evaluate((input) =>
          Object.keys(input).some((key) => key.startsWith("__reactProps")),
        ),
    )
    .toBe(true);
  return tool;
}

function missions(tool: Locator): Locator {
  return tool.getByRole("group", { exact: true, name: "Mission" });
}

function flightPlan(tool: Locator): Locator {
  return tool.getByRole("list", { exact: true, name: "Flight plan" });
}

test.describe("Mission planner", () => {
  test("opens on the first preset with its steps in flight order", async ({
    consoleMessages,
    page,
  }) => {
    const tool = await openPlanner(page);

    await expect(missions(tool).getByRole("radio").first()).toBeChecked();
    const steps = flightPlan(tool).getByRole("listitem");
    await expect(steps.first()).toContainText("Launch");
    await expect(steps.first()).toContainText("Not modelled.");
    const labels = (await steps.allTextContents()).map((text) => text.trim());
    const order = ["Launch", "Burn 1", "Coast", "Burn 2"].map((label) =>
      labels.findIndex((text) => text.startsWith(label)),
    );
    expect(order.every((index) => index >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);

    await expect(
      tool.getByText("Total delta-v", { exact: true }),
    ).toBeVisible();
    expectNoUnexpectedConsoleErrors(consoleMessages);
  });

  test("a step that is not modelled carries no delta-v", async ({ page }) => {
    const tool = await openPlanner(page);

    const launch = flightPlan(tool)
      .getByRole("listitem")
      .filter({ hasText: "Not modelled." })
      .first();
    await expect(launch).toBeVisible();
    await expect(launch).not.toContainText("m/s");
  });

  test("Mars is shown as preset allowances, not as computed", async ({
    page,
  }) => {
    const tool = await openPlanner(page);

    await missions(tool)
      .getByRole("radio", { name: "Mars transfer concept" })
      .check();
    await expect(flightPlan(tool)).toContainText(
      "Preset allowance, not computed.",
    );
    await expect(
      tool.getByText(/Total delta-v, preset allowances/),
    ).toBeVisible();
    // No transfer to draw for allowances.
    await expect(flightPlan(tool).getByRole("button")).toHaveCount(0);

    // The ledger marks the Mars row the same way.
    await expect(tool).toContainText("(preset allowances, not computed)");
  });

  test("your own altitudes run through the same analyses", async ({ page }) => {
    const tool = await openPlanner(page);

    await missions(tool)
      .getByRole("radio", { name: "Your own altitudes" })
      .check();
    const target = tool.getByLabel("Target altitude");
    await expect(target).toBeVisible();

    await target.fill("35786");
    await expect(flightPlan(tool)).toContainText("Burn 2");
    const total = await tool
      .locator("dt", { hasText: "Total delta-v" })
      .locator("xpath=following-sibling::dd[1]")
      .textContent();
    expect(total?.replace(/\s+/g, "")).toMatch(/^[\d,.]+m\/s$/);

    // An error names its field and replaces the plan.
    await target.fill("");
    await expect(tool).toContainText("Enter a number for target altitude.");
    await expect(flightPlan(tool)).toHaveCount(0);

    await target.fill("-5");
    await expect(tool).toContainText("Target altitude must not be negative.");
  });

  test("the ledger has a table twin with every preset", async ({ page }) => {
    const tool = await openPlanner(page);

    const presetNames = (
      await missions(tool)
        .getByRole("radio")
        .evaluateAll((radios) =>
          radios.map(
            (radio) => radio.closest("label")?.textContent?.trim() ?? "",
          ),
        )
    ).filter((name) => name !== "Your own altitudes");
    expect(presetNames.length).toBeGreaterThan(0);

    await tool
      .getByText("Show the numbers as a table", { exact: true })
      .click();
    const table = tool.getByRole("table", {
      name: "Delta-v by mission and step",
    });
    await expect(table).toBeVisible();
    for (const name of presetNames) {
      await expect(table).toContainText(name);
    }
  });

  test("never claims a mission is feasible", async ({ page }) => {
    const tool = await openPlanner(page);

    await expect(tool).toContainText(
      "it does not say whether a mission is feasible",
    );
    // Apart from that disclaimer, the word never appears.
    const text = ((await tool.textContent()) ?? "")
      .toLowerCase()
      .replace("it does not say whether a mission is feasible", "");
    expect(text).not.toContain("feasib");
  });
});
