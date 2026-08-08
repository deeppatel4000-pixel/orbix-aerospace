import {
  expect,
  expectNoHorizontalOverflow,
  expectNoUnexpectedConsoleErrors,
  ROUTES,
  test,
} from "../fixtures/orbix";

/**
 * The 7 primary navigation routes, plus the one showcase-capture deep link
 * called out in the brief. Unlike the nav routes, `/showcase-capture/[id]`
 * lives outside the `(site)` route group: it renders its own `<main>`
 * without the shared `id="main-content"`, and without the site header,
 * footer, or skip link. `hasSiteChrome: false` captures that so the shared
 * assertions below stay true for every route instead of asserting something
 * the app doesn't actually do.
 */
const routesUnderTest = [
  { hasSiteChrome: true, name: "home", path: ROUTES.home },
  { hasSiteChrome: true, name: "aircraft", path: ROUTES.aircraft },
  { hasSiteChrome: true, name: "rockets", path: ROUTES.rockets },
  { hasSiteChrome: true, name: "compare", path: ROUTES.compare },
  {
    hasSiteChrome: true,
    name: "engineering-lab",
    path: ROUTES.engineeringLab,
  },
  { hasSiteChrome: true, name: "showcase", path: ROUTES.showcase },
  { hasSiteChrome: true, name: "learn", path: ROUTES.learn },
  {
    hasSiteChrome: false,
    name: "showcase-capture",
    path: "/showcase-capture/leo-satellite-deployment",
  },
] as const;

for (const route of routesUnderTest) {
  test(`${route.name} route (${route.path}) is a well-formed page`, async ({
    consoleMessages,
    page,
  }) => {
    const response = await page.goto(route.path, {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status()).toBe(200);

    await expect(page).toHaveTitle(/.+/);

    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);

    if (route.hasSiteChrome) {
      await expect(page.locator("main#main-content")).toBeVisible();
    } else {
      // Outside the (site) layout group: still a <main> landmark, just
      // without the shared id used by the skip link on the other routes.
      await expect(page.getByRole("main")).toBeVisible();
    }

    await expectNoHorizontalOverflow(page);
    expectNoUnexpectedConsoleErrors(consoleMessages);
  });
}

test("header logo link returns to the home page", async ({ page }) => {
  await page.goto(ROUTES.aircraft, { waitUntil: "domcontentloaded" });

  // The footer repeats the same logo with the same accessible name, so an
  // unscoped query would match twice; scope to the banner landmark.
  await page
    .getByRole("banner")
    .getByRole("link", { name: "Orbix home" })
    .click();

  await expect(page).toHaveURL(`${ROUTES.home}`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("footer exists and its links resolve", async ({ page, request }) => {
  await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });

  const footer = page.getByRole("contentinfo");
  await expect(footer).toBeVisible();

  const footerNav = footer.getByRole("navigation", {
    name: "Footer navigation",
  });
  const footerLinks = footerNav.getByRole("link");
  const linkCount = await footerLinks.count();
  expect(linkCount).toBeGreaterThan(0);

  const hrefs = await footerLinks.evaluateAll((anchors) =>
    anchors.map((anchor) => anchor.getAttribute("href")),
  );

  for (const href of hrefs) {
    expect(href).not.toBeNull();
    if (href === null) continue;

    const response = await request.get(href);
    expect(response.status(), `Footer link "${href}" should resolve`).toBe(200);
  }
});

test("skip link is focusable via Tab and targets main content", async ({
  page,
}) => {
  await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });

  // The site chrome streams in behind a Suspense fallback (`loading.tsx`),
  // so the skip link isn't in the DOM (and focus is still on <body>)
  // immediately after `goto` resolves. Locator-based assertions and actions
  // auto-wait for that, but a raw `keyboard.press("Tab")` does not, so wait
  // for real content explicitly before sending it.
  await expect(page.getByRole("banner")).toBeVisible();

  await page.keyboard.press("Tab");

  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toHaveAttribute("href", "#main-content");

  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/#main-content$/);
  await expect(page.locator("#main-content")).toBeInViewport();
});
