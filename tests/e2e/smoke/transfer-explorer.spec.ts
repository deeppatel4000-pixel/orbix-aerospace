import type { Locator, Page } from "@playwright/test";

import {
  expect,
  expectNoHorizontalOverflow,
  expectNoUnexpectedConsoleErrors,
  ROUTES,
  test,
} from "../fixtures/orbix";

/**
 * V1 Transfer Explorer (v4 plan section 5): the Hohmann transfer drawn on
 * Earth to scale, with heights stretched, a target slider with ISS, GEO and
 * Moon stops, live delta-v and a text table twin. Play runs the craft along
 * the arc only when the reader starts it; nothing moves on load and reduced
 * motion removes Play.
 *
 * The suite runs with `reducedMotion: "reduce"` (playwright.config.ts); the
 * tests that need motion opt out of it explicitly.
 */

/** The full explorer at the top of the lab. */
async function openLabExplorer(page: Page): Promise<Locator> {
  await page.goto(ROUTES.engineeringLab, { waitUntil: "domcontentloaded" });
  const explorer = page.locator("#transfer-explorer");
  const slider = explorer.getByRole("slider", {
    name: "Target orbit altitude",
  });
  await expect(slider).toBeVisible();
  // Wait for hydration: the server-rendered controls do nothing yet.
  await expect
    .poll(() =>
      slider.evaluate((input) =>
        Object.keys(input).some((key) => key.startsWith("__reactProps")),
      ),
    )
    .toBe(true);
  return explorer;
}

function totalDeltaV(explorer: Locator): Locator {
  return explorer
    .locator("dt", { hasText: "Total delta-v" })
    .locator("xpath=following-sibling::dd[1]");
}

test.describe("Transfer Explorer", () => {
  test("names its drawing and states its assumptions", async ({
    consoleMessages,
    page,
  }) => {
    const explorer = await openLabExplorer(page);

    await expect(
      explorer.getByRole("img", { name: /^Hohmann transfer from 200 km to/ }),
    ).toBeVisible();
    await expect(explorer).toContainText(
      "Assumes circular orbits in one plane, instant burns and Earth's gravity only.",
    );
    // It names the radius altitudes are measured from, because the
    // Verification page's worked example uses a different one.
    await expect(explorer).toContainText(
      "Altitudes are measured from Earth's mean radius, 6,371 km.",
    );
    // The heights are stretched, and the caption says by how much.
    await expect(explorer.locator("figcaption")).toContainText(
      /Earth is to scale|Drawn to scale/,
    );

    await expectNoHorizontalOverflow(page);
    expectNoUnexpectedConsoleErrors(consoleMessages);
  });

  test("the stops set the target and the numbers follow", async ({ page }) => {
    const explorer = await openLabExplorer(page);
    const slider = explorer.getByRole("slider", {
      name: "Target orbit altitude",
    });
    const stops = explorer.getByRole("group", { name: "Jump to" });

    // The lab opens on the ISS stop, so it does not repeat the home page's
    // GEO case.
    await expect(stops.getByRole("button", { name: "ISS" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(slider).toHaveAttribute(
      "aria-valuetext",
      "408 km, ISS altitude",
    );
    const atIss = await totalDeltaV(explorer).textContent();

    await stops.getByRole("button", { name: "GEO" }).click();
    await expect(stops.getByRole("button", { name: "GEO" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(stops.getByRole("button", { name: "ISS" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await expect(slider).toHaveAttribute(
      "aria-valuetext",
      "35,786 km, geostationary altitude",
    );
    await expect(totalDeltaV(explorer)).not.toHaveText(atIss ?? "");
    await expect(
      explorer.getByRole("img", {
        name: /^Hohmann transfer from 200 km to 35,786 km/,
      }),
    ).toBeVisible();

    await stops.getByRole("button", { name: "Moon" }).click();
    await expect(stops.getByRole("button", { name: "Moon" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("the number table lists both burns", async ({ page }) => {
    const explorer = await openLabExplorer(page);

    await explorer
      .getByText("Show the numbers as a table", { exact: true })
      .click();
    // DataTable names the table by its visible caption.
    const table = explorer.getByRole("table", {
      name: /^Hohmann transfer from 200 km to/,
    });
    await expect(table).toBeVisible();
    await expect(table.locator("tbody tr")).not.toHaveCount(0);
    await expect(table).toContainText("Burn 1");
    await expect(table).toContainText("Burn 2");
  });

  test("under reduced motion there is no Play, and the craft moves in three steps", async ({
    page,
  }) => {
    const explorer = await openLabExplorer(page);

    await expect(
      explorer.getByRole("button", { name: /Play the coast|Pause/ }),
    ).toHaveCount(0);
    await expect(explorer).toContainText("Reduced motion is on");

    const position = explorer.getByRole("slider", { name: "Craft position" });
    const max = Number(await position.getAttribute("max"));
    await expect(position).toHaveAttribute("step", String(max / 2));
  });

  test("nothing moves on load, and Play is started and stopped by the reader", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const explorer = await openLabExplorer(page);
    const position = explorer.getByRole("slider", { name: "Craft position" });
    const play = explorer.getByRole("button", { name: "Play the coast" });

    await expect(play).toHaveAttribute("aria-pressed", "false");
    // Nothing starts on its own.
    await page.waitForTimeout(1_000);
    await expect(position).toHaveValue("0");

    await play.click();
    const pause = explorer.getByRole("button", { name: "Pause" });
    await expect(pause).toHaveAttribute("aria-pressed", "true");
    await expect
      .poll(async () => Number(await position.inputValue()))
      .toBeGreaterThan(0);

    await pause.click();
    const stopped = await position.inputValue();
    await page.waitForTimeout(500);
    await expect(position).toHaveValue(stopped);
  });
});
