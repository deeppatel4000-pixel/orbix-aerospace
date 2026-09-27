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

/** Column headers in the comparison table, one per selected vehicle. */
function vehicleColumns(page: import("@playwright/test").Page) {
  return page.locator("thead th").filter({ hasText: /\S/ });
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

    const table = page.getByRole("table");
    await expect(table).toBeVisible();

    // Both requested aircraft are present as columns, and a third is not.
    await expect(
      table.getByRole("columnheader", { name: /^F-22 Raptor/ }),
    ).toBeVisible();
    await expect(
      table.getByRole("columnheader", { name: /^F-15 Eagle/ }),
    ).toBeVisible();
    await expect(
      table.getByText("SR-71 Blackbird", { exact: false }),
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

    const table = page.getByRole("table");
    await expect(table).toBeVisible();
    await expect(
      table.getByRole("columnheader", { name: /^Falcon 9/ }),
    ).toBeVisible();
    await expect(
      table.getByRole("columnheader", { name: /^Saturn V/ }),
    ).toBeVisible();

    // Cross-category leakage would be a real defect: aircraft must not appear
    // in a rockets comparison.
    await expect(table.getByText("F-22 Raptor", { exact: false })).toHaveCount(
      0,
    );

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

    // The two requested rockets fill the first two vehicle selects, in order,
    // and the optional third is left empty.
    await expect(page.getByLabel("First vehicle")).toHaveValue("falcon-9");
    await expect(page.getByLabel("Second vehicle")).toHaveValue("starship");
    await expect(page.locator("#compare-vehicle-3")).toHaveValue("");
  });

  test("more ids than the maximum are capped at three", async ({ page }) => {
    // Five requested; MAX_COMPARISON_VEHICLES is 3.
    await page.goto(
      `${COMPARE}?category=aircraft&vehicles=f-22-raptor,f-15-eagle,sr-71-blackbird,b-2-spirit,f-35-lightning-ii`,
      { waitUntil: "domcontentloaded" },
    );

    // One leading header cell labels the rows; the rest are vehicle columns.
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
    expect(await vehicleColumns(page).count()).toBe(3);
    await expect(
      page.locator("thead th[scope=col] .orbix-h4", { hasText: "F-22 Raptor" }),
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
      page.getByRole("columnheader", { name: /^F-22 Raptor/ }),
    ).toBeVisible();

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
    await expect(page.getByRole("table")).toBeVisible();

    await page.goto(ROUTES.aircraft, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await page.goBack({ waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/category=rockets/);
    const table = page.getByRole("table");
    await expect(table).toBeVisible();
    await expect(
      table.getByRole("columnheader", { name: /^Falcon 9/ }),
    ).toBeVisible();
    await expect(
      table.getByRole("columnheader", { name: /^Saturn V/ }),
    ).toBeVisible();
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
    await expect(page.getByRole("table")).toBeVisible();

    // The form is server-rendered; a selection made before React hydrates it
    // is reset by hydration. Wait until the select has its React handlers.
    await expect
      .poll(() =>
        page
          .locator("#compare-vehicle-3")
          .evaluate((select) =>
            Object.keys(select).some((key) => key.startsWith("__reactProps")),
          ),
      )
      .toBe(true);

    await page
      .getByLabel("Third vehicle (optional)")
      .selectOption("b-2-spirit");
    await page
      .getByRole("button", { name: "Compare selected vehicles" })
      .click();

    await expect(page).toHaveURL(
      /vehicles=f-22-raptor(,|%2C)f-15-eagle(,|%2C)b-2-spirit/,
    );
    await expect(
      page.getByRole("columnheader", { name: /^B-2 Spirit/ }),
    ).toBeVisible();
  });
});
