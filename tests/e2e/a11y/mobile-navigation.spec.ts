import {
  expect,
  expectNoHorizontalOverflow,
  ROUTES,
  test,
} from "../fixtures/orbix";

/**
 * The 7 nav links in mobile-navigation.tsx's declared order (mirrors
 * src/config/navigation.ts). Kept inline rather than imported so this a11y
 * suite stays decoupled from internal app config.
 */
const expectedLabels = [
  "Home",
  "Aircraft",
  "Rockets",
  "Compare",
  "Engineering Lab",
  "Showcase",
  "Learn",
];

/**
 * mobile-navigation.tsx wraps its toggle button in a `lg:hidden` div: at
 * >=1024px the whole control is `display:none` and unreachable, so the
 * desktop project is skipped for every test in this file rather than
 * repeating the same guard per test.
 */
function skipOnDesktop() {
  test.skip(
    test.info().project.name === "desktop",
    "Mobile navigation only renders below the 1024px breakpoint (mobile-navigation.tsx's `lg:hidden` wrapper); it is display:none and non-interactive on the desktop project.",
  );
}

test.describe("Mobile navigation toggle", () => {
  test("aria-expanded and accessible name flip false -> true -> false across a full open/close cycle", async ({
    page,
  }) => {
    skipOnDesktop();

    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("banner")).toBeVisible();

    const closedToggle = page.getByRole("button", {
      name: "Open navigation menu",
    });
    await expect(closedToggle).toHaveAttribute("aria-expanded", "false");

    await closedToggle.click();

    const openToggle = page.getByRole("button", {
      name: "Close navigation menu",
    });
    await expect(openToggle).toHaveAttribute("aria-expanded", "true");
    // Same underlying <button>; its accessible name genuinely changes with
    // state rather than a second control appearing alongside the first.
    await expect(
      page.getByRole("button", { name: "Open navigation menu" }),
    ).toHaveCount(0);

    await openToggle.click();

    await expect(
      page.getByRole("button", { name: "Open navigation menu" }),
    ).toHaveAttribute("aria-expanded", "false");
    await expect(
      page.getByRole("button", { name: "Close navigation menu" }),
    ).toHaveCount(0);
  });

  test("aria-controls references an element that exists once the menu is open", async ({
    page,
  }) => {
    skipOnDesktop();

    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("banner")).toBeVisible();

    const toggle = page.getByRole("button", { name: "Open navigation menu" });
    const controlsId = await toggle.getAttribute("aria-controls");
    expect(controlsId, "Toggle button is missing aria-controls").not.toBeNull();

    await toggle.click();

    if (controlsId !== null) {
      const controlledElement = page.locator(`#${controlsId}`);
      await expect(controlledElement).toBeVisible();
      await expect(controlledElement).toHaveAttribute(
        "aria-label",
        "Mobile navigation",
      );
    }
  });
});

test.describe("Mobile navigation menu contents", () => {
  test("opening the menu reveals all 7 nav links with correct accessible names", async ({
    page,
  }) => {
    skipOnDesktop();

    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("banner")).toBeVisible();

    await page.getByRole("button", { name: "Open navigation menu" }).click();

    const mobileNav = page.getByRole("navigation", {
      name: "Mobile navigation",
    });
    await expect(mobileNav).toBeVisible();
    await expect(mobileNav.getByRole("link")).toHaveCount(
      expectedLabels.length,
    );

    for (const label of expectedLabels) {
      await expect(
        mobileNav.getByRole("link", { name: label, exact: true }),
      ).toBeVisible();
    }
  });

  test("clicking a link navigates and closes the menu", async ({ page }) => {
    skipOnDesktop();

    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("banner")).toBeVisible();

    await page.getByRole("button", { name: "Open navigation menu" }).click();

    const mobileNav = page.getByRole("navigation", {
      name: "Mobile navigation",
    });
    await mobileNav
      .getByRole("link", { name: "Aircraft", exact: true })
      .click();

    await expect(page).toHaveURL(`${ROUTES.aircraft}`);
    await expect(
      page.getByRole("navigation", { name: "Mobile navigation" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Open navigation menu" }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  test("Escape closes the menu", async ({ page }) => {
    skipOnDesktop();

    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("banner")).toBeVisible();

    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await expect(
      page.getByRole("navigation", { name: "Mobile navigation" }),
    ).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(
      page.getByRole("navigation", { name: "Mobile navigation" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Open navigation menu" }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  test("menu open does not cause horizontal overflow", async ({ page }) => {
    skipOnDesktop();

    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("banner")).toBeVisible();

    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await expect(
      page.getByRole("navigation", { name: "Mobile navigation" }),
    ).toBeVisible();

    await expectNoHorizontalOverflow(page);
  });
});
