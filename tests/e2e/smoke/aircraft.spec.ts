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

  // Level 3, not 2: the registry section itself is the <h2>
  // ("Engineering profiles" / the launch-vehicle registry heading), so an
  // individual aircraft record nests one level below it. These names were
  // previously <h2>, which made each card a sibling of the section it
  // belongs to. The landmark/heading suite verifies the resulting order
  // has no skipped levels.
  for (const id of AIRCRAFT_IDS) {
    await expect(
      registry.getByRole("heading", { level: 3, name: AIRCRAFT_NAMES[id] }),
    ).toBeVisible();
  }
});

test("navigating into the F-22 Raptor profile works, shows its heading, loads its images, and its CTA navigates", async ({
  consoleMessages,
  page,
}) => {
  await page.goto(ROUTES.aircraft, { waitUntil: "domcontentloaded" });

  // Each registry card is one link whose accessible name starts with the
  // vehicle name (followed by its role and headline specifications).
  await page
    .locator("#available-aircraft")
    .getByRole("link", {
      name: new RegExp(`^${AIRCRAFT_NAMES["f-22-raptor"]}`),
    })
    .click();

  await expect(page).toHaveURL(`${ROUTES.aircraft}/f-22-raptor`);
  await expect(
    page.getByRole("heading", { level: 1, name: "F-22 Raptor" }),
  ).toBeVisible();

  await expectAllImagesLoaded(page);

  // The profile's breadcrumb leads back to the registry...
  await expect(
    page
      .getByRole("navigation", { name: "Breadcrumb" })
      .getByRole("link", { name: "Aircraft", exact: true }),
  ).toHaveAttribute("href", ROUTES.aircraft);

  // ...and its own call-to-action, after the related aircraft, navigates there.
  await page.getByRole("link", { name: "Browse all aircraft" }).click();
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
