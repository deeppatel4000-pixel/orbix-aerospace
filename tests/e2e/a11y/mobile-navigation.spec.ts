import type { Page } from "@playwright/test";

import {
  expect,
  expectNoHorizontalOverflow,
  ROUTES,
  test,
} from "../fixtures/orbix";

/**
 * The 5 header links in mobile-navigation.tsx's declared order (mirrors
 * src/config/navigation.ts, v4 plan section 3). The wordmark links home, so
 * Home is not listed. Kept inline rather than imported so this a11y suite
 * stays decoupled from internal app config.
 */
const expectedLabels = [
  "Engineering Lab",
  "Verification",
  "Aircraft",
  "Rockets",
  "How I built it",
];

/**
 * The sheet also anchors a quieter group to its foot, the footer's site
 * links (v4 plan section 3), then the operator line with the contact
 * address as an inline link.
 */
const secondaryLabels = ["Compare", "Learn", "About", "Image credits"];

/** The contact address link in the operator line. */
const CONTACT_LINK = 'a[href^="mailto:"]';

/**
 * The toggle reads "Menu" when closed and "Close" when open (spec 8); open,
 * its accessible name is "Close menu", which starts with the visible word
 * (WCAG 2.5.3 label in name). Matched exactly, because a substring match on
 * "Menu" would also find "Close menu".
 */
function closedToggle(page: Page) {
  return page.getByRole("button", { name: "Menu", exact: true });
}

function openToggle(page: Page) {
  return page.getByRole("button", { name: "Close menu", exact: true });
}

function mobileNav(page: Page) {
  return page.getByRole("navigation", { name: "Mobile navigation" });
}

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

async function openHome(page: Page): Promise<void> {
  await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("banner")).toBeVisible();
  // The toggle is server-rendered, so it is visible (and clickable) before
  // React attaches its click handler. Under a loaded parallel run a click in
  // that window does nothing, so wait until the button is hydrated.
  await expect
    .poll(() =>
      page
        .locator(".orbix-menu-toggle")
        .evaluate((button) =>
          Object.keys(button).some((key) => key.startsWith("__reactProps")),
        ),
    )
    .toBe(true);
}

test.describe("Mobile navigation toggle", () => {
  test("aria-expanded and the visible name flip false -> true -> false across a full open/close cycle", async ({
    page,
  }) => {
    skipOnDesktop();
    await openHome(page);

    await expect(closedToggle(page)).toHaveAttribute("aria-expanded", "false");
    await expect(closedToggle(page)).toHaveText("Menu");

    await closedToggle(page).click();

    await expect(openToggle(page)).toHaveAttribute("aria-expanded", "true");
    await expect(openToggle(page)).toHaveText("Close");
    // Same underlying <button>; its name genuinely changes with state rather
    // than a second control appearing alongside the first.
    await expect(closedToggle(page)).toHaveCount(0);

    await openToggle(page).click();

    await expect(closedToggle(page)).toHaveAttribute("aria-expanded", "false");
    await expect(openToggle(page)).toHaveCount(0);
  });

  test("aria-controls references an element that exists once the menu is open", async ({
    page,
  }) => {
    skipOnDesktop();
    await openHome(page);

    const controlsId = await closedToggle(page).getAttribute("aria-controls");
    expect(controlsId, "Toggle button is missing aria-controls").not.toBeNull();

    await closedToggle(page).click();

    if (controlsId !== null) {
      const controlledElement = page.locator(`[id="${controlsId}"]`);
      await expect(controlledElement).toBeVisible();
      await expect(controlledElement).toHaveAttribute(
        "aria-label",
        "Mobile navigation",
      );
    }
  });
});

test.describe("Mobile navigation menu contents", () => {
  test("opening the menu reveals every nav link with its accessible name", async ({
    page,
  }) => {
    skipOnDesktop();
    await openHome(page);

    await closedToggle(page).click();

    await expect(mobileNav(page)).toBeVisible();
    await expect(mobileNav(page).getByRole("link")).toHaveCount(
      expectedLabels.length + secondaryLabels.length + 1,
    );
    await expect(mobileNav(page).locator(CONTACT_LINK)).toHaveCount(1);

    for (const label of [...expectedLabels, ...secondaryLabels]) {
      await expect(
        mobileNav(page).getByRole("link", { name: label, exact: true }),
      ).toBeVisible();
    }

    // Home is not in the menu, so nothing in it is the current page.
    await expect(mobileNav(page).locator('[aria-current="page"]')).toHaveCount(
      0,
    );
  });

  test("the menu marks the current section in words", async ({ page }) => {
    skipOnDesktop();
    await openHome(page);
    await page.goto(`${ROUTES.aircraft}/b-2-spirit`, {
      waitUntil: "domcontentloaded",
    });
    await expect
      .poll(() =>
        page
          .locator(".orbix-menu-toggle")
          .evaluate((button) =>
            Object.keys(button).some((key) => key.startsWith("__reactProps")),
          ),
      )
      .toBe(true);

    await closedToggle(page).click();
    await expect(
      mobileNav(page).getByRole("link", { name: "Aircraft", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await expect(mobileNav(page).locator('[aria-current="page"]')).toHaveCount(
      1,
    );
  });

  test("opening the menu moves focus to its first link", async ({ page }) => {
    skipOnDesktop();
    await openHome(page);

    await closedToggle(page).click();

    await expect(
      mobileNav(page).getByRole("link", {
        name: expectedLabels[0],
        exact: true,
      }),
    ).toBeFocused();
  });

  test("clicking a link navigates and closes the menu, without forcing focus back to the toggle", async ({
    page,
  }) => {
    skipOnDesktop();
    await openHome(page);

    await closedToggle(page).click();
    await mobileNav(page)
      .getByRole("link", { name: "Aircraft", exact: true })
      .click();

    await expect(page).toHaveURL(`${ROUTES.aircraft}`);
    await expect(mobileNav(page)).toHaveCount(0);
    await expect(closedToggle(page)).toHaveAttribute("aria-expanded", "false");

    // The link click path is a genuine navigation, not a dismissal: the
    // user is leaving this page on purpose. mobile-navigation.tsx's focus
    // restoration only fires for the Escape/dismissal path (see
    // restoreFocusOnCloseRef in the component), so a link click must NOT
    // force focus back onto the toggle button behind the page that's now
    // loading.
    await expect(closedToggle(page)).not.toBeFocused();
  });

  test("Escape from a link inside the menu closes it and returns focus to the toggle, not <body>", async ({
    page,
  }) => {
    skipOnDesktop();
    await openHome(page);

    await closedToggle(page).click();
    await expect(openToggle(page)).toHaveAttribute("aria-expanded", "true");
    await expect(mobileNav(page)).toBeVisible();

    // Opening already put focus on the first link. Tab once more so focus is
    // genuinely deep inside the menu before backing out with Escape.
    await page.keyboard.press("Tab");
    await expect(
      mobileNav(page).getByRole("link", {
        name: expectedLabels[1],
        exact: true,
      }),
    ).toBeFocused();

    await page.keyboard.press("Escape");

    // Menu closed...
    await expect(mobileNav(page)).toHaveCount(0);
    await expect(closedToggle(page)).toHaveAttribute("aria-expanded", "false");

    // ...and focus landed back on the toggle, not on <body>. Asserting the
    // raw DOM active element (rather than just `toBeFocused()` on the
    // toggle) is deliberate: it's the strongest possible proof that focus
    // was genuinely restored to a real, re-operable control and not merely
    // dropped by the browser when the focused link unmounted.
    await expect(closedToggle(page)).toBeFocused();
    const active = await page.evaluate(() => ({
      tag: document.activeElement?.tagName ?? null,
      text: document.activeElement?.textContent?.trim() ?? null,
    }));
    expect(active).toEqual({ tag: "BUTTON", text: "Menu" });
  });

  test("Escape right after opening closes the menu and returns focus to the toggle", async ({
    page,
  }) => {
    skipOnDesktop();
    await openHome(page);

    await closedToggle(page).click();
    await expect(mobileNav(page)).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(mobileNav(page)).toHaveCount(0);
    await expect(closedToggle(page)).toHaveAttribute("aria-expanded", "false");
    await expect(closedToggle(page)).toBeFocused();
  });

  test("menu links are comfortable touch targets", async ({ page }) => {
    skipOnDesktop();
    await openHome(page);

    await closedToggle(page).click();
    // Every site and secondary link is a 44px target. The contact address
    // is an inline link inside the operator sentence, which WCAG 2.5.8
    // exempts from the target size; that it really is inline is asserted.
    const heights = await mobileNav(page)
      .getByRole("link")
      .evaluateAll((links) =>
        links
          .filter((link) => !link.matches('a[href^="mailto:"]'))
          .map((link) => link.getBoundingClientRect().height),
      );

    expect(heights).toHaveLength(
      expectedLabels.length + secondaryLabels.length,
    );
    for (const height of heights) {
      expect(height).toBeGreaterThanOrEqual(44);
    }

    const contactIsInline = await mobileNav(page)
      .locator(CONTACT_LINK)
      .evaluate((link) => {
        const line = link.parentElement;
        const lineText = (line?.textContent ?? "").trim();
        const linkText = (link.textContent ?? "").trim();
        return lineText.length > linkText.length;
      });
    expect(contactIsInline).toBe(true);
  });

  test("menu open does not cause horizontal overflow", async ({ page }) => {
    skipOnDesktop();
    await openHome(page);

    await closedToggle(page).click();
    await expect(mobileNav(page)).toBeVisible();

    await expectNoHorizontalOverflow(page);
  });
});
