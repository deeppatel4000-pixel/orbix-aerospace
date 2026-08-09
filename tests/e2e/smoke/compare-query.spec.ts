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
      table.getByText("F-22 Raptor", { exact: false }),
    ).toBeVisible();
    await expect(table.getByText("F-15 Eagle", { exact: false })).toBeVisible();
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
    await expect(table.getByText("Falcon 9", { exact: false })).toBeVisible();
    await expect(table.getByText("Saturn V", { exact: false })).toBeVisible();

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

    // The rockets category control is the active one.
    await expect(page.getByRole("button", { name: "Rockets" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    // The two requested rockets are the checked profiles.
    await expect(
      page.getByRole("checkbox", { name: /Falcon 9/ }),
    ).toBeChecked();
    await expect(
      page.getByRole("checkbox", { name: /Starship/ }),
    ).toBeChecked();
    await expect(
      page.getByRole("checkbox", { name: /Saturn V/ }),
    ).not.toBeChecked();
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
      page.getByRole("table").getByText("F-22 Raptor", { exact: false }),
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

    await expect(
      page.getByRole("button", { name: "Aircraft" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.getByRole("table").getByText("F-22 Raptor", { exact: false }),
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
    // Note on scope: the in-page selection controls use `router.replace`
    // (see comparison-controls.tsx), so changing a selection deliberately
    // does NOT push a history entry. What the architecture does support —
    // and what this asserts — is that a parameterised comparison survives
    // navigating away and coming back.
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
    await expect(table.getByText("Falcon 9", { exact: false })).toBeVisible();
    await expect(table.getByText("Saturn V", { exact: false })).toBeVisible();
  });
});
