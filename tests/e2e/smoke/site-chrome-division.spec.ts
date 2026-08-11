import { expect, ROUTES, test } from "../fixtures/orbix";

/**
 * Division propagation and active-navigation coverage for the shared chrome.
 *
 * ## What this exists to protect
 *
 * Before the site-chrome phase, ORBIX had a full division token system that
 * reached nothing: the only theming attribute in the app sat on an
 * `aria-hidden`, `-z-20` decorative backdrop, so no readable content ever
 * inherited a division accent. Nothing failed, because nothing asserted it.
 *
 * These tests assert the contract that replaced it — that each route's
 * division reaches the shared shell, and that the header reflects the current
 * route — so the same silent-no-op regression cannot recur.
 *
 * The division value is asserted on the shell wrapper rather than on any
 * styled element, because the wrapper is the contract: everything else
 * inherits from it through CSS custom properties.
 */

const DIVISION_BY_ROUTE = [
  { division: "space", label: "Home", path: ROUTES.home },
  { division: "aircraft", label: "Aircraft", path: ROUTES.aircraft },
  { division: "space", label: "Rockets", path: ROUTES.rockets },
  { division: "engineering", label: "Compare", path: ROUTES.compare },
  {
    division: "engineering",
    label: "Engineering Lab",
    path: ROUTES.engineeringLab,
  },
  { division: "research", label: "Learn", path: ROUTES.learn },
  { division: "space", label: "Showcase", path: ROUTES.showcase },
] as const;

test.describe("Division propagation", () => {
  test.skip(
    () => test.info().project.name !== "desktop",
    "Division resolution is route-derived and identical at every viewport.",
  );

  for (const { division, path } of DIVISION_BY_ROUTE) {
    test(`${path} resolves to the ${division} division`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });

      // Scoped to the SHELL wrapper rather than "any element with a
      // division": routes may legitimately mark individual sections with a
      // division accent (the homepage does, for its aircraft, launch-vehicle,
      // engineering and research sections). The contract is that the shell
      // carries the route's division, not that only one element does.
      const shell = page.locator("body [data-orbix-division]").first();
      await expect(shell).toHaveAttribute("data-orbix-division", division);
    });
  }

  test("the division is present in the server-rendered HTML, not applied after hydration", async ({
    request,
  }) => {
    // Fetched over HTTP with no browser involved, so this can only pass if
    // the attribute is in the markup the server sent. That is what rules out
    // a first-paint flash of the wrong accent.
    const response = await request.get(ROUTES.aircraft);
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain('data-orbix-division="aircraft"');
  });

  test("a vehicle profile inherits its section's division", async ({
    page,
  }) => {
    await page.goto(`${ROUTES.aircraft}/f-22-raptor`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.locator("body [data-orbix-division]").first(),
    ).toHaveAttribute("data-orbix-division", "aircraft");
  });

  test("the division updates on client-side navigation", async ({ page }) => {
    // The failure this guards against is a stale accent: the shell keeping
    // the previous route's division after an in-app navigation, which a
    // pathname read inside an effect would produce.
    await page.goto(ROUTES.learn, { waitUntil: "domcontentloaded" });
    await expect(
      page.locator("body [data-orbix-division]").first(),
    ).toHaveAttribute("data-orbix-division", "research");

    await page
      .getByRole("navigation", { name: "Primary navigation" })
      .getByRole("link", { name: "Aircraft", exact: true })
      .click();

    await expect(page).toHaveURL(ROUTES.aircraft);
    await expect(
      page.locator("body [data-orbix-division]").first(),
    ).toHaveAttribute("data-orbix-division", "aircraft");
  });
});

test.describe("Active navigation state", () => {
  test.skip(
    () => test.info().project.name !== "desktop",
    "The desktop navigation is only rendered at lg and above.",
  );

  for (const { label, path } of DIVISION_BY_ROUTE) {
    test(`${path} marks "${label}" as the current page`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });

      const nav = page.getByRole("navigation", { name: "Primary navigation" });
      await expect(
        nav.getByRole("link", { exact: true, name: label }),
      ).toHaveAttribute("aria-current", "page");

      // Exactly one item may claim the current page, otherwise the indicator
      // means nothing.
      await expect(nav.locator('a[aria-current="page"]')).toHaveCount(1);
    });
  }

  test("a vehicle profile keeps its section marked as current", async ({
    page,
  }) => {
    await page.goto(`${ROUTES.rockets}/saturn-v`, {
      waitUntil: "domcontentloaded",
    });

    const nav = page.getByRole("navigation", { name: "Primary navigation" });
    await expect(
      nav.getByRole("link", { exact: true, name: "Rockets" }),
    ).toHaveAttribute("aria-current", "page");
    await expect(nav.locator('a[aria-current="page"]')).toHaveCount(1);
  });
});
