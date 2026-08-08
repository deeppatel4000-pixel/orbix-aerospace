import type { Locator, Page } from "@playwright/test";

import { expect, ROUTES, test } from "../fixtures/orbix";

/**
 * Snapshot of the CSS properties this app actually uses to render a focus
 * ring, captured with `getComputedStyle`. Two different mechanisms are in
 * use across the design system (see src/styles/orbix-foundations.css and
 * orbix-components.css):
 *  - a global fallback: `outline: 2px solid var(--accent)` via
 *    `:focus-visible` on bare interactive elements (e.g. the header logo
 *    link, which carries no `orbix-*` utility class of its own), and
 *  - component-specific rings that explicitly zero the outline
 *    (`outline: 0`) and draw a `box-shadow` ring instead (`.orbix-button`,
 *    `.orbix-icon-control`, `.orbix-nav-link`).
 * A check that only looks at `outline` would silently pass every element
 * using the first mechanism and silently *miss* real regressions in every
 * element using the second (an element can have `outline-style: none` and
 * still have a perfectly visible focus ring). This suite instead captures
 * both properties before and after a real, keyboard-driven focus change and
 * asserts that *something* about the rendered ring changed -- which is true
 * under both mechanisms and false if a focus style regresses to nothing.
 */
interface FocusStyleSnapshot {
  boxShadow: string;
  outlineColor: string;
  outlineStyle: string;
  outlineWidth: string;
}

async function captureFocusStyle(
  locator: Locator,
): Promise<FocusStyleSnapshot> {
  return locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      boxShadow: style.boxShadow,
      outlineColor: style.outlineColor,
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
    };
  });
}

function focusStyleDiffers(
  before: FocusStyleSnapshot,
  after: FocusStyleSnapshot,
): boolean {
  return (
    before.outlineStyle !== after.outlineStyle ||
    before.outlineWidth !== after.outlineWidth ||
    before.outlineColor !== after.outlineColor ||
    before.boxShadow !== after.boxShadow
  );
}

/**
 * Mission Control always mounts behind `MissionStartupSequence`, a
 * cinematic initialization overlay that auto-advances and unmounts itself
 * once finished. This is the same dismissal pattern the existing
 * `tests/e2e/smoke/mission-control.spec.ts` suite uses (see its
 * `dismissMissionControlStartup` for the fuller rationale); it is
 * reproduced here rather than imported so this a11y suite only depends on
 * the shared `fixtures/orbix` module.
 */
async function dismissMissionControlStartup(page: Page): Promise<void> {
  await expect(
    page.getByRole("navigation", { name: "Mission Control sections" }),
  ).toBeVisible();

  const skipButton = page.getByRole("button", {
    name: "Skip Mission Control startup",
  });

  if (await skipButton.isVisible().catch(() => false)) {
    await skipButton.click({ timeout: 5_000 }).catch(() => {});
  }

  await expect(skipButton).toBeHidden();
}

test.describe("Skip link", () => {
  test("first Tab focuses the skip link; activating it moves to #main-content", async ({
    page,
  }) => {
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });

    // Wait for real content before sending a raw key press: the site
    // streams behind a Suspense `loading.tsx`, so immediately after `goto`
    // the header (and the skip link that precedes it) may not exist yet
    // and focus is still on <body>.
    await expect(page.getByRole("banner")).toBeVisible();

    await page.keyboard.press("Tab");

    const skipLink = page.getByRole("link", { name: "Skip to main content" });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toHaveAttribute("href", "#main-content");

    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(/#main-content$/);
    // <main> has no explicit tabindex, so it never receives DOM focus from
    // a fragment jump (only elements with a tabindex do) -- the browser
    // still scrolls it into view and makes it the sequential-navigation
    // starting point. Asserting viewport position is therefore the correct
    // check here, not `toBeFocused()`.
    await expect(page.locator("#main-content")).toBeInViewport();
  });
});

test.describe("Focus indicators", () => {
  /**
   * A deliberately small, stable set of controls rather than a sweep of
   * every focusable element on the page: the skip link and header logo
   * exercise the two focus-ring mechanisms described above, and the third
   * control (desktop nav link vs. mobile menu toggle) exercises the
   * `.orbix-nav-link` / `.orbix-icon-control` box-shadow-ring variant on
   * whichever chrome is actually present at this viewport. Sweeping every
   * interactive element on the page would multiply run time and flakiness
   * risk without meaningfully increasing regression coverage, since all of
   * this app's focus rings are drawn by a handful of shared CSS rules.
   */
  test("representative interactive controls show a visible focus ring on real keyboard focus", async ({
    page,
  }) => {
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("banner")).toBeVisible();

    const skipLink = page.getByRole("link", { name: "Skip to main content" });
    const logoLink = page
      .getByRole("banner")
      .getByRole("link", { name: "Orbix home" });

    // Baselines are captured before either element has ever been focused.
    const skipBaseline = await captureFocusStyle(skipLink);
    const logoBaseline = await captureFocusStyle(logoLink);

    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();
    const skipFocused = await captureFocusStyle(skipLink);
    expect(
      focusStyleDiffers(skipBaseline, skipFocused),
      "Skip link should render a visible focus ring when focused",
    ).toBe(true);

    await page.keyboard.press("Tab");
    await expect(logoLink).toBeFocused();
    const logoFocused = await captureFocusStyle(logoLink);
    expect(
      focusStyleDiffers(logoBaseline, logoFocused),
      "Header logo link should render a visible focus ring when focused",
    ).toBe(true);

    const isDesktop = test.info().project.name === "desktop";

    if (isDesktop) {
      // Desktop nav only exists at >=1024px (desktop-navigation.tsx's
      // `hidden lg:block`).
      const homeLink = page
        .getByRole("navigation", { name: "Primary navigation" })
        .getByRole("link", { name: "Home", exact: true });
      const homeBaseline = await captureFocusStyle(homeLink);

      await page.keyboard.press("Tab");
      await expect(homeLink).toBeFocused();
      const homeFocused = await captureFocusStyle(homeLink);
      expect(
        focusStyleDiffers(homeBaseline, homeFocused),
        "Primary nav link should render a visible focus ring when focused",
      ).toBe(true);
    } else {
      // Below 1024px the desktop nav is `display:none` (removed from the
      // tab order); the mobile toggle is the next stop instead.
      const toggle = page.getByRole("button", { name: "Open navigation menu" });
      const toggleBaseline = await captureFocusStyle(toggle);

      await page.keyboard.press("Tab");
      await expect(toggle).toBeFocused();
      const toggleFocused = await captureFocusStyle(toggle);
      expect(
        focusStyleDiffers(toggleBaseline, toggleFocused),
        "Mobile nav toggle should render a visible focus ring when focused",
      ).toBe(true);
    }
  });
});

test.describe("Primary navigation tab order", () => {
  test("Tab order visits the primary nav links in visual order (desktop)", async ({
    page,
  }) => {
    test.skip(
      test.info().project.name !== "desktop",
      "The desktop primary navigation only exists at >=1024px (desktop-navigation.tsx's `hidden lg:block`); it is unreachable by Tab below that breakpoint.",
    );

    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("banner")).toBeVisible();

    // Mirrors src/config/navigation.ts's declared order. Kept inline
    // (rather than imported from the app) so this a11y suite stays
    // decoupled from internal app config and fails loudly -- rather than
    // silently tracking a change -- if the two drift apart.
    const expectedOrder = [
      "Home",
      "Aircraft",
      "Rockets",
      "Compare",
      "Engineering Lab",
      "Showcase",
      "Learn",
    ];

    const nav = page.getByRole("navigation", { name: "Primary navigation" });

    await page.keyboard.press("Tab"); // skip link
    await page.keyboard.press("Tab"); // header logo

    for (const label of expectedOrder) {
      await page.keyboard.press("Tab");
      await expect(
        nav.getByRole("link", { name: label, exact: true }),
      ).toBeFocused();
    }
  });
});

test.describe("Mission Control workspace tabs", () => {
  const missionControlUrl = `${ROUTES.engineeringLab}#mission-control-dashboard`;

  test("arrow keys move roving-tabindex focus and immediately activate the newly-focused tab", async ({
    page,
  }) => {
    await page.goto(missionControlUrl, { waitUntil: "domcontentloaded" });
    await dismissMissionControlStartup(page);

    // mission-control-sidebar.tsx implements a genuine roving-tabindex
    // tablist: only the active tab carries tabIndex 0 (a Tab stop), every
    // other tab sits at tabIndex -1, and ArrowUp/Down/Left/Right/Home/End
    // are handled explicitly (resolveWorkspaceNavigationIndex) to move
    // focus AND activate the newly-focused workspace in the same keypress.
    const tablist = page
      .getByRole("navigation", { name: "Mission Control sections" })
      .getByRole("tablist");

    const overviewTab = tablist.getByRole("tab", {
      name: "Overview - Mission Timeline summary",
    });
    const unifiedTab = tablist.getByRole("tab", {
      name: "Unified View - Unified Mission presentation",
    });

    await expect(overviewTab).toHaveAttribute("aria-selected", "true");
    await expect(overviewTab).toHaveAttribute("tabindex", "0");
    await expect(unifiedTab).toHaveAttribute("tabindex", "-1");

    // Roving tabindex means only the active tab is a Tab stop; focusing it
    // directly is how sequential Tab navigation actually reaches this
    // tablist (the same rationale the existing mission-control smoke suite
    // uses), rather than simulating every intervening Tab stop on the page.
    await overviewTab.focus();
    await expect(overviewTab).toBeFocused();

    await page.keyboard.press("ArrowDown");

    await expect(unifiedTab).toBeFocused();
    await expect(unifiedTab).toHaveAttribute("aria-selected", "true");
    await expect(unifiedTab).toHaveAttribute("tabindex", "0");
    await expect(overviewTab).toHaveAttribute("aria-selected", "false");
    await expect(overviewTab).toHaveAttribute("tabindex", "-1");
  });

  test("Home and End jump to the first and last workspace tab", async ({
    page,
  }) => {
    await page.goto(missionControlUrl, { waitUntil: "domcontentloaded" });
    await dismissMissionControlStartup(page);

    const tablist = page
      .getByRole("navigation", { name: "Mission Control sections" })
      .getByRole("tablist");
    const tabs = tablist.getByRole("tab");
    const firstTab = tabs.first();
    const lastTab = tabs.last();

    await firstTab.focus();
    await page.keyboard.press("End");
    await expect(lastTab).toBeFocused();
    await expect(lastTab).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("Home");
    await expect(firstTab).toBeFocused();
    await expect(firstTab).toHaveAttribute("aria-selected", "true");
  });

  test("Enter and Space activate whichever tab currently holds DOM focus", async ({
    page,
  }) => {
    await page.goto(missionControlUrl, { waitUntil: "domcontentloaded" });
    await dismissMissionControlStartup(page);

    // Every workspace tab is a real <button type="button">, which the
    // browser natively activates (fires `click`) on Enter/Space while
    // focused -- mission-control-sidebar.tsx's own onKeyDown handler only
    // intercepts arrow/Home/End, so it never interferes with that native
    // behaviour. Moving DOM focus directly onto an *inactive* tab (which
    // `.focus()` can do even though it sits at tabIndex -1, unlike Tab)
    // isolates and confirms that Enter/Space -- not just a click -- is what
    // activates the tab currently holding focus.
    const tablist = page
      .getByRole("navigation", { name: "Mission Control sections" })
      .getByRole("tablist");

    const reentryTab = tablist.getByRole("tab", {
      name: "Reentry - Reentry View",
    });
    await expect(reentryTab).toHaveAttribute("aria-selected", "false");
    await reentryTab.focus();
    await page.keyboard.press("Enter");
    await expect(reentryTab).toHaveAttribute("aria-selected", "true");

    const groundTrackTab = tablist.getByRole("tab", {
      name: "Ground Track - Planetary orbital projection",
    });
    await expect(groundTrackTab).toHaveAttribute("aria-selected", "false");
    await groundTrackTab.focus();
    await page.keyboard.press(" ");
    await expect(groundTrackTab).toHaveAttribute("aria-selected", "true");
  });
});

test.describe("Mobile menu Escape handling", () => {
  test("Escape closes the mobile menu; focus is NOT returned to the toggle (documented finding)", async ({
    page,
  }) => {
    test.skip(
      test.info().project.name === "desktop",
      "The mobile navigation only exists below the 1024px breakpoint.",
    );

    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("banner")).toBeVisible();

    await page.getByRole("button", { name: "Open navigation menu" }).click();

    const mobileNav = page.getByRole("navigation", {
      name: "Mobile navigation",
    });
    await expect(mobileNav).toBeVisible();

    // Move focus onto a link inside the open menu, as a keyboard user
    // plausibly would before deciding to back out with Escape.
    const firstLink = mobileNav.getByRole("link").first();
    await firstLink.focus();
    await expect(firstLink).toBeFocused();

    await page.keyboard.press("Escape");

    await expect(mobileNav).toBeHidden();
    await expect(
      page.getByRole("button", { name: "Open navigation menu" }),
    ).toHaveAttribute("aria-expanded", "false");

    // FINDING (see this file's final report): mobile-navigation.tsx's
    // Escape handler only calls `setIsOpen(false)`; it never moves focus
    // back to the toggle button. The link that held focus is removed from
    // the DOM the moment the <nav> unmounts, so the browser drops focus to
    // <body> instead -- a keyboard user loses their place entirely rather
    // than landing back on a sensible, re-operable control. This assertion
    // documents that CURRENT behaviour (not the behaviour a well-behaved
    // disclosure widget would have) so a future change is visible here.
    const activeElementTag = await page.evaluate(
      () => document.activeElement?.tagName ?? null,
    );
    expect(activeElementTag).toBe("BODY");

    await expect(
      page.getByRole("button", { name: "Open navigation menu" }),
    ).not.toBeFocused();
  });
});
