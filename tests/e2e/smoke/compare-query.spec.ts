import {
  expect,
  expectNoHorizontalOverflow,
  expectNoUnexpectedConsoleErrors,
  ROUTES,
  test,
} from "../fixtures/orbix";

/**
 * Query-parameter coverage for `/compare`.
 *
 * `/compare` is the only dynamic (server-rendered on demand) route in ORBIX,
 * and its entire initial state comes from the URL. Nothing previously
 * exercised it with real parameters — `public-routes.spec.ts` only loads the
 * bare route, and the two visual baselines capture the empty state. A
 * regression in `parseComparisonQuery` or the repository lookup would have
 * shipped silently.
 *
 * Every expectation below mirrors behaviour that already exists in
 * `src/features/compare/utils/parse-comparison-query.ts` and
 * `src/features/compare/data/comparison-repository.ts`:
 *
 *   - `category` is `"rockets"` only when it exactly equals that string;
 *     every other value (including a missing or nonsense one) falls back to
 *     `"aircraft"`.
 *   - `vehicles` is comma-separated, trimmed, de-duplicated, empty entries
 *     dropped, then capped at `MAX_COMPARISON_VEHICLES` (3).
 *   - Ids that do not match a known vehicle are silently filtered out by
 *     `selectById`, rather than erroring.
 *
 * No new product behaviour is asserted here.
 */

const COMPARE = ROUTES.compare;

/**
 * The comparison sheet. Design v2 sets it as one table per engineering group
 * (heritage, geometry, mass, propulsion, ...), every one with the same column
 * headers, so the first group's table stands for the column structure.
 */
function sheet(page: import("@playwright/test").Page) {
  return page.getByRole("table").first();
}

/** Column headers in the comparison sheet, one per selected vehicle. */
function vehicleColumns(page: import("@playwright/test").Page) {
  return sheet(page).locator("thead th").filter({ hasText: /\S/ });
}

/**
 * The real column headers are visually hidden: the sheet shows the vehicle
 * names in a decorative band and in the "Selected ..." identity strip above
 * it. Column headers are therefore asserted as present in the accessibility
 * tree, and what a sighted reader sees is asserted through the strip.
 */
function selectedStrip(page: import("@playwright/test").Page) {
  return page.getByRole("list", { name: /^Selected / });
}

/**
 * A vehicle's selection tile. The tiles are toggle buttons (spec 9:
 * `aria-pressed`), named by the vehicle and its maker.
 */
function vehicleTile(page: import("@playwright/test").Page, name: string) {
  return page.getByRole("button", { name: new RegExp(`^${name} `) });
}

test.describe("Compare query parameters", () => {
  test("valid aircraft parameters drive the initial comparison", async ({
    consoleMessages,
    page,
  }) => {
    const response = await page.goto(
      `${COMPARE}?category=aircraft&vehicles=f-22-raptor,f-15-eagle`,
      { waitUntil: "domcontentloaded" },
    );
    expect(response?.status()).toBe(200);

    const table = sheet(page);
    await expect(table).toBeVisible();

    // Both requested aircraft are present as columns, and a third is not.
    await expect(
      table.getByRole("columnheader", { name: /^F-22 Raptor/ }),
    ).toHaveCount(1);
    await expect(
      table.getByRole("columnheader", { name: /^F-15 Eagle/ }),
    ).toHaveCount(1);
    await expect(selectedStrip(page)).toContainText("F-22 Raptor");
    await expect(selectedStrip(page)).toContainText("F-15 Eagle");
    await expect(selectedStrip(page)).toBeVisible();
    await expect(
      page.getByRole("table").getByText("SR-71 Blackbird", { exact: false }),
    ).toHaveCount(0);

    await expectNoHorizontalOverflow(page);
    expectNoUnexpectedConsoleErrors(consoleMessages);
  });

  test("valid rocket parameters drive the initial comparison", async ({
    consoleMessages,
    page,
  }) => {
    const response = await page.goto(
      `${COMPARE}?category=rockets&vehicles=falcon-9,saturn-v`,
      { waitUntil: "domcontentloaded" },
    );
    expect(response?.status()).toBe(200);

    const table = sheet(page);
    await expect(table).toBeVisible();
    await expect(
      table.getByRole("columnheader", { name: /^Falcon 9/ }),
    ).toHaveCount(1);
    await expect(
      table.getByRole("columnheader", { name: /^Saturn V/ }),
    ).toHaveCount(1);

    // Cross-category leakage would be a real defect: aircraft must not appear
    // in a rockets comparison.
    await expect(
      page.getByRole("table").getByText("F-22 Raptor", { exact: false }),
    ).toHaveCount(0);

    await expectNoHorizontalOverflow(page);
    expectNoUnexpectedConsoleErrors(consoleMessages);
  });

  test("the selection controls reflect the URL, not just the table", async ({
    page,
  }) => {
    await page.goto(`${COMPARE}?category=rockets&vehicles=falcon-9,starship`, {
      waitUntil: "domcontentloaded",
    });

    // The launch-vehicle category radio is the checked one.
    await expect(
      page.getByRole("radio", { name: "Launch vehicles" }),
    ).toBeChecked();
    await expect(
      page.getByRole("radio", { name: "Aircraft" }),
    ).not.toBeChecked();

    // The two requested rockets are the pressed tiles, numbered in URL order
    // (the number is the tile's column in the sheet), and nothing else is
    // selected.
    const falcon9 = vehicleTile(page, "Falcon 9");
    const starship = vehicleTile(page, "Starship");
    await expect(falcon9).toHaveAttribute("aria-pressed", "true");
    await expect(starship).toHaveAttribute("aria-pressed", "true");
    await expect(falcon9.locator(".orbix-readout-inline")).toHaveText("1");
    await expect(starship.locator(".orbix-readout-inline")).toHaveText("2");
    await expect(
      page.locator('button[aria-pressed="true"][aria-labelledby]'),
    ).toHaveCount(2);
  });

  test("more ids than the maximum are capped at three", async ({ page }) => {
    // Five requested; MAX_COMPARISON_VEHICLES is 3.
    await page.goto(
      `${COMPARE}?category=aircraft&vehicles=f-22-raptor,f-15-eagle,sr-71-blackbird,b-2-spirit,f-35-lightning-ii`,
      { waitUntil: "domcontentloaded" },
    );

    // One leading header cell labels the rows; the rest are vehicle columns.
    await expect(sheet(page)).toBeVisible();
    const columns = await vehicleColumns(page).count();
    expect(
      columns,
      "expected the row-label column plus exactly 3 vehicle columns",
    ).toBe(4);
  });

  test("duplicate and whitespace-padded ids are normalised", async ({
    page,
  }) => {
    await page.goto(
      `${COMPARE}?category=aircraft&vehicles=f-22-raptor,%20f-22-raptor%20,f-15-eagle`,
      { waitUntil: "domcontentloaded" },
    );

    // The duplicate collapses and the padded id still resolves, leaving the
    // row-label column plus 2 vehicle columns.
    await expect(sheet(page)).toBeVisible();
    expect(await vehicleColumns(page).count()).toBe(3);
    await expect(
      sheet(page).getByRole("columnheader", { name: "F-22 Raptor" }),
    ).toHaveCount(1);
  });

  test("an unrecognised category falls back to aircraft", async ({
    consoleMessages,
    page,
  }) => {
    const response = await page.goto(
      `${COMPARE}?category=submarines&vehicles=f-22-raptor,f-15-eagle`,
      { waitUntil: "domcontentloaded" },
    );
    expect(response?.status()).toBe(200);

    await expect(page.getByRole("radio", { name: "Aircraft" })).toBeChecked();
    await expect(
      sheet(page).getByRole("columnheader", { name: /^F-22 Raptor/ }),
    ).toHaveCount(1);

    expectNoUnexpectedConsoleErrors(consoleMessages);
  });

  test("unknown vehicle ids are dropped without erroring", async ({
    consoleMessages,
    page,
  }) => {
    const response = await page.goto(
      `${COMPARE}?category=aircraft&vehicles=not-a-real-plane,f-22-raptor,f-15-eagle`,
      { waitUntil: "domcontentloaded" },
    );
    expect(response?.status()).toBe(200);

    // The two valid ids still render; the bogus one contributes no column,
    // leaving the row-label column plus 2 vehicle columns.
    await expect(sheet(page)).toBeVisible();
    expect(await vehicleColumns(page).count()).toBe(3);
    expectNoUnexpectedConsoleErrors(consoleMessages);
  });

  test("a single valid vehicle shows the 'select one more' empty state", async ({
    consoleMessages,
    page,
  }) => {
    // `compare-page.tsx` gates the table on `result.vehicles.length >= 2`, so
    // one vehicle is a legitimate intermediate state, not a broken table.
    const response = await page.goto(
      `${COMPARE}?category=aircraft&vehicles=f-22-raptor`,
      { waitUntil: "domcontentloaded" },
    );
    expect(response?.status()).toBe(200);

    await expect(page.getByRole("table")).toHaveCount(0);
    await expect(page.getByText("Select one more vehicle")).toBeVisible();

    expectNoUnexpectedConsoleErrors(consoleMessages);
  });

  test("no vehicles yields the empty state rather than a broken table", async ({
    consoleMessages,
    page,
  }) => {
    const response = await page.goto(`${COMPARE}?category=aircraft&vehicles=`, {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status()).toBe(200);

    await expect(page.getByRole("table")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    expectNoUnexpectedConsoleErrors(consoleMessages);
  });

  test("browser back returns to a parameterised comparison intact", async ({
    page,
  }) => {
    // What this asserts is that a parameterised comparison survives
    // navigating away and coming back. (Submitting the selection form uses
    // `router.push`, so each submitted comparison is its own history entry.)
    await page.goto(`${COMPARE}?category=rockets&vehicles=falcon-9,saturn-v`, {
      waitUntil: "domcontentloaded",
    });
    await expect(sheet(page)).toBeVisible();

    await page.goto(ROUTES.aircraft, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await page.goBack({ waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/category=rockets/);
    const table = sheet(page);
    await expect(table).toBeVisible();
    await expect(
      table.getByRole("columnheader", { name: /^Falcon 9/ }),
    ).toHaveCount(1);
    await expect(
      table.getByRole("columnheader", { name: /^Saturn V/ }),
    ).toHaveCount(1);
  });

  test("submitting the selection form updates the URL and the table", async ({
    page,
  }) => {
    await page.goto(
      `${COMPARE}?category=aircraft&vehicles=f-22-raptor,f-15-eagle`,
      {
        waitUntil: "domcontentloaded",
      },
    );
    await expect(sheet(page)).toBeVisible();

    // The form is server-rendered; a click before React hydrates the tiles
    // does nothing. Wait until the tile has its React handlers.
    const b2 = vehicleTile(page, "B-2 Spirit");
    await expect
      .poll(() =>
        b2.evaluate((tile) =>
          Object.keys(tile).some((key) => key.startsWith("__reactProps")),
        ),
      )
      .toBe(true);

    await b2.click();
    await expect(b2).toHaveAttribute("aria-pressed", "true");
    await page
      .getByRole("button", { name: "Compare selected vehicles" })
      .click();

    await expect(page).toHaveURL(
      /vehicles=f-22-raptor(,|%2C)f-15-eagle(,|%2C)b-2-spirit/,
    );
    await expect(
      sheet(page).getByRole("columnheader", { name: /^B-2 Spirit/ }),
    ).toHaveCount(1);
  });
});
