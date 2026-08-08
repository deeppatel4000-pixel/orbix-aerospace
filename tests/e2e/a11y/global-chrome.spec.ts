import { expect, ROUTES, test } from "../fixtures/orbix";

/**
 * The 7 statically-linked `(site)` routes. `/showcase-capture/[id]` is
 * deliberately excluded from this list -- it lives outside the `(site)`
 * route group and has no shared header, footer, skip link, or
 * `id="main-content"` (see the dedicated test below), so asserting the
 * shared-chrome expectations against it would be asserting something the
 * app was never meant to do.
 */
const routeEntries = Object.entries(ROUTES);

test.describe("Landmark structure", () => {
  for (const [name, path] of routeEntries) {
    test(`${name} (${path}) exposes exactly one main, banner, and contentinfo landmark`, async ({
      page,
    }) => {
      // `domcontentloaded` rather than the default `load`: these
      // assertions only need the DOM (landmarks), not every image
      // finishing its network fetch, and waiting for `load` on an
      // image-heavy route under this suite's parallel workers can occasionally
      // outlast Next's image-optimizer concurrency limit (see the matching
      // comment on `expectAllImagesLoaded` in fixtures/orbix.ts).
      await page.goto(path, { waitUntil: "domcontentloaded" });

      // The site streams behind a Suspense `loading.tsx`, so the header
      // (and therefore the banner landmark) is not guaranteed to be in the
      // DOM the instant `goto` resolves. Wait for it before counting
      // landmarks, otherwise a slow hydration reads as "0 banners" instead
      // of a real regression.
      await expect(page.getByRole("banner")).toBeVisible();

      await expect(page.locator("main#main-content")).toHaveCount(1);
      await expect(page.getByRole("banner")).toHaveCount(1);
      await expect(page.getByRole("contentinfo")).toHaveCount(1);
    });
  }

  test("/showcase-capture/[id] has no header banner, footer, or skip link", async ({
    page,
  }) => {
    const response = await page.goto(
      "/showcase-capture/leo-satellite-deployment",
      { waitUntil: "domcontentloaded" },
    );
    expect(response?.status()).toBe(200);

    // This route renders its own <main> (still a "main" landmark) but,
    // being outside the `(site)` layout group, never gets SiteHeader,
    // SiteFooter, or SkipLink. Asserting the absence here locks in that
    // documented split so a future refactor that accidentally moves this
    // route into (or out of) the shared layout group is caught.
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("banner")).toHaveCount(0);
    await expect(page.getByRole("contentinfo")).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: "Skip to main content" }),
    ).toHaveCount(0);
  });
});

test.describe("Header", () => {
  test("logo link has an accessible name and navigates to the home page", async ({
    page,
  }) => {
    await page.goto(ROUTES.aircraft, { waitUntil: "domcontentloaded" });

    // Scoped to the banner: the footer repeats the same logo with the same
    // accessible name, and an unscoped query would violate Playwright's
    // strict-locator mode by matching both.
    const logo = page
      .getByRole("banner")
      .getByRole("link", { name: "Orbix home" });

    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute("href", "/");
  });

  test("every interactive element in the header has a non-empty accessible name", async ({
    page,
  }) => {
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });

    const header = page.getByRole("banner");
    // `.count()` is a one-shot query with no auto-retry, so make sure the
    // header has actually streamed in past the Suspense `loading.tsx`
    // fallback before relying on it, rather than racing hydration.
    await expect(header).toBeVisible();

    // `:visible` matters here: the header unconditionally renders BOTH the
    // desktop nav (`hidden lg:block`) and the mobile toggle (`lg:hidden`)
    // in the DOM at every viewport, CSS-hiding whichever one doesn't apply.
    // A CSS-hidden element has no accessible name at all (it isn't in the
    // accessibility tree), so without this filter every viewport would
    // "find" an empty-named element that isn't actually reachable by
    // anyone -- a false positive, not a real defect.
    const interactiveElements = header.locator("a:visible, button:visible");
    const count = await interactiveElements.count();
    expect(count).toBeGreaterThan(0);

    for (let index = 0; index < count; index += 1) {
      // A RegExp is used (rather than an exact string) because this loop
      // covers heterogeneous controls -- the logo link, primary nav links,
      // and the mobile menu toggle -- whose accessible names differ. `/\S/`
      // only asserts that some non-whitespace accessible name exists at
      // all, which is the actual bar this test is checking.
      await expect(interactiveElements.nth(index)).toHaveAccessibleName(/\S/);
    }
  });
});

test.describe("Footer", () => {
  test("footer links have non-empty accessible names and resolve to 200", async ({
    page,
    request,
  }) => {
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });

    const footer = page.getByRole("contentinfo");
    await expect(footer).toBeVisible();

    const footerLinks = footer.getByRole("link");
    const count = await footerLinks.count();
    expect(count).toBeGreaterThan(0);

    const hrefs: string[] = [];
    for (let index = 0; index < count; index += 1) {
      const link = footerLinks.nth(index);
      await expect(link).toHaveAccessibleName(/\S/);

      const href = await link.getAttribute("href");
      expect(href, "Footer link is missing an href").not.toBeNull();
      if (href !== null) hrefs.push(href);
    }

    // Requested once per unique href rather than once per link, so a footer
    // that happens to repeat the same href twice doesn't double the network
    // calls this test makes.
    for (const href of new Set(hrefs)) {
      const response = await request.get(href);
      expect(response.status(), `Footer link "${href}" should resolve`).toBe(
        200,
      );
    }
  });

  test("no interactive element in the footer has an empty accessible name", async ({
    page,
  }) => {
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });

    const footer = page.getByRole("contentinfo");
    // See the matching comment in the header test above: wait for the
    // footer to actually be there before a one-shot `.count()` call.
    await expect(footer).toBeVisible();

    const interactiveElements = footer.locator("a, button");
    const count = await interactiveElements.count();
    expect(count).toBeGreaterThan(0);

    for (let index = 0; index < count; index += 1) {
      await expect(interactiveElements.nth(index)).toHaveAccessibleName(/\S/);
    }
  });
});
