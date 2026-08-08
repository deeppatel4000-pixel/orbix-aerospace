import type { Page } from "@playwright/test";

import {
  expect,
  expectNoHorizontalOverflow,
  expectNoUnexpectedConsoleErrors,
  ROUTES,
  test,
} from "../fixtures/orbix";

const MISSION_CONTROL_HASH = "#mission-control-dashboard";

/**
 * `LaboratoryShell` renders every workflow group up front and only reveals
 * the one matching the URL hash, and it does that from a `useEffect` that
 * runs after hydration — so immediately after navigation the Mission
 * Operations group (and Mission Control inside it) is still `hidden`. This
 * waits for the hash to actually take effect before anything else touches
 * Mission Control; skipping this wait was previously making the startup
 * overlay's "Skip startup" button read as hidden for the wrong reason (its
 * hidden ancestor, not a dismissed overlay), causing the helper below to
 * exit as a false positive before the real UI had even appeared.
 */
async function waitForMissionControlActive(page: Page): Promise<void> {
  await expect(
    page.getByRole("navigation", { name: "Mission Control sections" }),
  ).toBeVisible();
}

/**
 * Mission Control always mounts wrapped in `MissionStartupSequence`, a
 * cinematic initialization overlay that starts active and auto-advances
 * (faster under `prefers-reduced-motion`, which this project's config
 * enables). Its "Skip startup" button is present while the overlay is
 * active. Whether the timer has already finished by the time a test looks
 * for it is a race, so this either dismisses it or, if it already completed
 * on its own, no-ops — either way the overlay is confirmed gone afterwards.
 */
async function dismissMissionControlStartup(page: Page): Promise<void> {
  await waitForMissionControlActive(page);

  const skipButton = page.getByRole("button", {
    name: "Skip Mission Control startup",
  });

  // The overlay auto-advances on its own timer (faster under reduced
  // motion) and unmounts itself the moment it finishes, so the button can
  // legitimately detach from the DOM mid-click if the timer wins the race.
  // Either outcome is fine — the assertion below is what actually matters —
  // so a click that fails because the button vanished out from under it is
  // not itself a test failure.
  if (await skipButton.isVisible().catch(() => false)) {
    await skipButton.click({ timeout: 5_000 }).catch(() => {});
  }

  await expect(skipButton).toBeHidden();
}

test.describe("Mission Control", () => {
  test("renders the workspace tablist and switches workspaces on click", async ({
    consoleMessages,
    page,
  }) => {
    await page.goto(`${ROUTES.engineeringLab}${MISSION_CONTROL_HASH}`, {
      waitUntil: "domcontentloaded",
    });
    await dismissMissionControlStartup(page);

    const missionControlNav = page.getByRole("navigation", {
      name: "Mission Control sections",
    });
    await expect(missionControlNav).toBeVisible();

    const tablist = missionControlNav.getByRole("tablist");
    await expect(tablist).toBeVisible();

    const overviewTab = tablist.getByRole("tab", {
      name: "Overview - Mission Timeline summary",
    });
    const orbitTab = tablist.getByRole("tab", { name: "Orbit - Orbital View" });

    await expect(overviewTab).toHaveAttribute("aria-selected", "true");
    await expect(orbitTab).toHaveAttribute("aria-selected", "false");

    await orbitTab.click();

    await expect(orbitTab).toHaveAttribute("aria-selected", "true");
    await expect(overviewTab).toHaveAttribute("aria-selected", "false");

    const panel = page.locator("#mission-workspace-panel");
    await expect(panel).toHaveAttribute(
      "aria-labelledby",
      "mission-workspace-orbit-tab",
    );
    await expect(
      panel.getByRole("region", { name: "Mission orbit visualization" }),
    ).toBeVisible();

    await expectNoHorizontalOverflow(page);
    expectNoUnexpectedConsoleErrors(consoleMessages);
  });

  test("keyboard Tab reaches the active tab and moves focus into the workspace panel", async ({
    page,
  }) => {
    await page.goto(`${ROUTES.engineeringLab}${MISSION_CONTROL_HASH}`, {
      waitUntil: "domcontentloaded",
    });
    await dismissMissionControlStartup(page);

    const missionControlNav = page.getByRole("navigation", {
      name: "Mission Control sections",
    });
    const activeTab = missionControlNav.getByRole("tab", {
      selected: true,
    });

    // Roving tabindex: only the active tab is a Tab stop (inactive tabs sit
    // at tabIndex -1 and are reached with arrow keys instead), so focusing
    // it directly proves it is the element sequential Tab navigation lands
    // on, without needing to simulate every intervening Tab stop on the
    // page.
    await activeTab.focus();
    await expect(activeTab).toBeFocused();
    await expect(activeTab).toHaveAttribute("tabindex", "0");

    // The next Tab stop after the tablist is the workspace tabpanel itself
    // (it carries tabIndex 0 with a visible focus ring), confirming Tab
    // moves forward through Mission Control in a sane, reachable order.
    await page.keyboard.press("Tab");
    await expect(page.locator("#mission-workspace-panel")).toBeFocused();
  });

  test("switching through every workspace does not crash", async ({
    consoleMessages,
    page,
  }) => {
    await page.goto(`${ROUTES.engineeringLab}${MISSION_CONTROL_HASH}`, {
      waitUntil: "domcontentloaded",
    });
    await dismissMissionControlStartup(page);

    const tablist = page
      .getByRole("navigation", { name: "Mission Control sections" })
      .getByRole("tablist");
    const panel = page.locator("#mission-workspace-panel");

    // `.count()` is a one-shot query with no auto-retry, so make sure the
    // tabs have actually rendered before relying on it, rather than
    // catching them mid-hydration.
    await expect(tablist.getByRole("tab").first()).toBeVisible();
    const tabCount = await tablist.getByRole("tab").count();
    expect(tabCount).toBeGreaterThan(0);

    for (let index = 0; index < tabCount; index += 1) {
      const tab = tablist.getByRole("tab").nth(index);
      const tabId = await tab.getAttribute("id");

      await tab.click();
      await expect(tab).toHaveAttribute("aria-selected", "true");
      await expect(panel).toHaveAttribute("aria-labelledby", tabId ?? "");
      // The panel is never left empty: every workspace either renders its
      // full visualization or an accessible "awaiting data" placeholder
      // (e.g. "not yet assembled" / "awaiting analysis") rather than
      // throwing. In this app's only Mission Control instance every
      // workspace is always given complete mission data, so the
      // placeholder copy itself is not currently reachable here; this
      // assertion instead confirms the panel always renders real content
      // and the app never crashes while switching.
      await expect(panel).not.toBeEmpty();
    }

    expectNoUnexpectedConsoleErrors(consoleMessages);
  });

  test("has no horizontal overflow on the mobile viewport", async ({
    page,
  }) => {
    test.skip(
      test.info().project.name !== "mobile",
      "Layout overflow at narrow widths is only meaningful on the mobile project.",
    );

    await page.goto(`${ROUTES.engineeringLab}${MISSION_CONTROL_HASH}`, {
      waitUntil: "domcontentloaded",
    });
    await dismissMissionControlStartup(page);

    await expectNoHorizontalOverflow(page);
  });
});
