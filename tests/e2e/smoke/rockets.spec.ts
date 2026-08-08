import {
  expect,
  expectAllImagesLoaded,
  expectNoUnexpectedConsoleErrors,
  ROCKET_IDS,
  ROUTES,
  test,
} from "../fixtures/orbix";

/** Display names as published in the vehicle data (`Rocket["name"]`). */
const ROCKET_NAMES: Record<(typeof ROCKET_IDS)[number], string> = {
  "falcon-9": "Falcon 9",
  "falcon-heavy": "Falcon Heavy",
  "saturn-v": "Saturn V",
  "space-launch-system": "Space Launch System (SLS)",
  starship: "Starship",
};

test("explorer lists all 5 rockets by name", async ({ page }) => {
  await page.goto(ROUTES.rockets, { waitUntil: "domcontentloaded" });

  // Scoped to the registry grid: the hero also repeats the featured
  // rocket's name in its own heading, so an unscoped query would match
  // that heading a second time and violate Playwright's strict-locator mode.
  const registry = page.locator("#launch-vehicle-registry");

  for (const id of ROCKET_IDS) {
    await expect(
      registry.getByRole("heading", { level: 2, name: ROCKET_NAMES[id] }),
    ).toBeVisible();
  }
});

test("navigating into the Falcon 9 profile works, shows its heading, loads its images, and its CTA navigates", async ({
  consoleMessages,
  page,
}) => {
  await page.goto(ROUTES.rockets, { waitUntil: "domcontentloaded" });

  // The explorer hero always features the first vehicle in the registry,
  // Falcon 9.
  await page
    .getByRole("link", { name: `Open ${ROCKET_NAMES["falcon-9"]}` })
    .click();

  await expect(page).toHaveURL(`${ROUTES.rockets}/falcon-9`);
  await expect(
    page.getByRole("heading", { level: 1, name: "Falcon 9" }),
  ).toBeVisible();

  await expectAllImagesLoaded(page);

  // The profile's own call-to-action navigates back to the explorer.
  await page.getByRole("link", { name: "Back to Explorer" }).click();
  await expect(page).toHaveURL(ROUTES.rockets);

  expectNoUnexpectedConsoleErrors(consoleMessages);
});

test("each rocket profile deep link renders its heading", async ({ page }) => {
  for (const id of ROCKET_IDS) {
    const response = await page.goto(`${ROUTES.rockets}/${id}`, {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status()).toBe(200);

    await expect(
      page.getByRole("heading", { level: 1, name: ROCKET_NAMES[id] }),
    ).toBeVisible();
  }
});
