import {
  AIRCRAFT_IDS,
  expect,
  expectAllImagesLoaded,
  expectNoUnexpectedConsoleErrors,
  ROUTES,
  test,
} from "../fixtures/orbix";

/** Display names as published in the vehicle data (`Aircraft["name"]`). */
const AIRCRAFT_NAMES: Record<(typeof AIRCRAFT_IDS)[number], string> = {
  "f-22-raptor": "F-22 Raptor",
  "f-35-lightning-ii": "F-35 Lightning II",
  "f-15-eagle": "F-15 Eagle",
  "b-2-spirit": "B-2 Spirit",
  "sr-71-blackbird": "SR-71 Blackbird",
};

test("explorer lists all 5 aircraft by name", async ({ page }) => {
  await page.goto(ROUTES.aircraft, { waitUntil: "domcontentloaded" });

  // Scoped to the registry grid: the hero also repeats the featured
  // aircraft's name in its own heading, so an unscoped query would match
  // that heading a second time and violate Playwright's strict-locator mode.
  const registry = page.locator("#available-aircraft");

  for (const id of AIRCRAFT_IDS) {
    await expect(
      registry.getByRole("heading", { level: 2, name: AIRCRAFT_NAMES[id] }),
    ).toBeVisible();
  }
});

test("navigating into the F-22 Raptor profile works, shows its heading, loads its images, and its CTA navigates", async ({
  consoleMessages,
  page,
}) => {
  await page.goto(ROUTES.aircraft, { waitUntil: "domcontentloaded" });

  // The explorer hero always features the F-22 Raptor.
  await page
    .getByRole("link", { name: `Open ${AIRCRAFT_NAMES["f-22-raptor"]}` })
    .click();

  await expect(page).toHaveURL(`${ROUTES.aircraft}/f-22-raptor`);
  await expect(
    page.getByRole("heading", { level: 1, name: "F-22 Raptor" }),
  ).toBeVisible();

  await expectAllImagesLoaded(page);

  // The profile's own call-to-action navigates back to the explorer.
  await page.getByRole("link", { name: "Back to Explorer" }).click();
  await expect(page).toHaveURL(ROUTES.aircraft);

  expectNoUnexpectedConsoleErrors(consoleMessages);
});

test("each aircraft profile deep link renders its heading", async ({
  page,
}) => {
  for (const id of AIRCRAFT_IDS) {
    const response = await page.goto(`${ROUTES.aircraft}/${id}`, {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status()).toBe(200);

    await expect(
      page.getByRole("heading", { level: 1, name: AIRCRAFT_NAMES[id] }),
    ).toBeVisible();
  }
});
