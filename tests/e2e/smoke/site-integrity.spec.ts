import type { APIRequestContext, Page } from "@playwright/test";

import {
  AIRCRAFT_IDS,
  CONTACT_EMAIL,
  expect,
  expectAllImagesLoaded,
  INFO_ROUTES,
  PROJECT_ROUTES,
  ROCKET_IDS,
  ROUTES,
  test,
} from "../fixtures/orbix";

/**
 * Site-wide integrity sweep over every public route.
 *
 * Each page-level spec checks its own page in depth; this file checks the
 * properties every page must share, on every page, so a regression on a page
 * nobody is looking at still fails CI:
 *
 *   a. the route returns 200
 *   b. a non-empty <title> and meta description, each unique across the site
 *   c. exactly one h1
 *   d. no horizontal page scroll at 320, 360 and 1440px
 *   e. every internal link and every in-page anchor resolves (crawled and
 *      de-duplicated across all routes)
 *   f. every <img> has an alt attribute and actually loads
 *   g. no visible text, alt text, aria-label or title contains an em dash
 *      (U+2014), which the redesign's writing rules forbid
 *   h. the footer has a mailto: link to the contact address
 *   i. the header logo links to the home page
 *
 * plus: an unknown path returns the custom 404 page inside the site chrome.
 *
 * The sweep sets its own viewports, so it runs once, in the desktop project.
 */

const SITE_ROUTES: readonly string[] = [
  ...Object.values(ROUTES),
  ...AIRCRAFT_IDS.map((id) => `${ROUTES.aircraft}/${id}`),
  ...ROCKET_IDS.map((id) => `${ROUTES.rockets}/${id}`),
  ...Object.values(INFO_ROUTES),
  ...Object.values(PROJECT_ROUTES),
];

const OVERFLOW_WIDTHS = [320, 360, 1440] as const;

/** The em dash, written as an escape so this file never contains one. */
const EM_DASH = "\u2014";

test.skip(
  () => test.info().project.name !== "desktop",
  "The sweep sets its own viewports; running it per project would only repeat it.",
);

// Headless Chromium hides scrollbars by default, so a page could only ever
// overflow by its own content. Real desktop browsers on Windows and Linux
// draw a classic 15-17px scrollbar inside the viewport, which is exactly how
// the old `html { min-width: 320px }` produced 15px of sideways scroll at a
// 320px window. Keeping scrollbars makes the overflow check see what those
// readers see. (Worker-scoped: this file gets its own browser.)
test.use({ launchOptions: { ignoreDefaultArgs: ["--hide-scrollbars"] } });

/**
 * Loads a route and waits for its real content. The root `loading.tsx`
 * fallback is its own <main> without the site chrome, so waiting on
 * `main#main-content` guarantees the route itself has been revealed.
 */
async function openRoute(page: Page, path: string) {
  const response = await page.goto(path, { waitUntil: "domcontentloaded" });
  await expect(page.locator("main#main-content")).toBeVisible();
  return response;
}

/** Reads `<title>` and the meta description out of server-rendered HTML. */
async function readHead(
  request: APIRequestContext,
  path: string,
): Promise<{ description: string; status: number; title: string }> {
  const response = await request.get(path);
  const html = await response.text();
  const title = /<title>([^<]*)<\/title>/.exec(html)?.[1] ?? "";
  const description =
    /<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? "";
  return { description, status: response.status(), title };
}

test.describe("Site integrity", () => {
  // Each route test visits one page at three widths and scrolls it fully to
  // load its images, so it gets more than the default budget.
  test.describe.configure({ timeout: 120_000 });

  for (const path of SITE_ROUTES) {
    test(`${path} meets the shared page contract`, async ({ page }) => {
      // a. 200
      const response = await openRoute(page, path);
      expect(response?.status(), `${path} should return 200`).toBe(200);

      // c. exactly one h1, with text.
      const h1 = page.locator("h1");
      await expect(h1).toHaveCount(1);
      await expect(h1).toHaveAccessibleName(/\S/);

      // i. the header logo links home.
      const logo = page.getByRole("banner").getByRole("link", {
        name: "Orbix home",
      });
      await expect(logo).toHaveAttribute("href", "/");

      // h. the footer carries a working mailto: link to the contact address.
      const mailto = page
        .getByRole("contentinfo")
        .locator('a[href^="mailto:"]');
      await expect(mailto).toHaveCount(1);
      await expect(mailto).toHaveAttribute("href", `mailto:${CONTACT_EMAIL}`);
      await expect(mailto).toHaveText(CONTACT_EMAIL);
      await expect(mailto).toBeVisible();

      // g. no em dash in anything a reader sees or hears.
      const dashed = await page.evaluate((dash) => {
        const found: string[] = [];
        const text = document.body.innerText;
        if (text.includes(dash)) {
          const index = text.indexOf(dash);
          found.push(
            `text: "${text.slice(Math.max(0, index - 40), index + 40)}"`,
          );
        }
        for (const element of document.querySelectorAll(
          "[alt], [aria-label], [title]",
        )) {
          for (const name of ["alt", "aria-label", "title"]) {
            const value = element.getAttribute(name);
            if (value?.includes(dash)) found.push(`${name}: "${value}"`);
          }
        }
        if (document.title.includes(dash)) found.push(`<title>`);
        return found;
      }, EM_DASH);
      expect(dashed, `${path} contains an em dash`).toEqual([]);

      // f. every image has an alt attribute (empty is fine for decoration)...
      const missingAlt = await page.evaluate(() =>
        [...document.querySelectorAll("img")]
          .filter((image) => !image.hasAttribute("alt"))
          .map((image) => image.currentSrc || image.src),
      );
      expect(missingAlt, `${path} has images without alt`).toEqual([]);

      // ...and actually loads once scrolled into view.
      await expectAllImagesLoaded(page);
      const broken = await page.evaluate(() =>
        [...document.querySelectorAll("img")]
          .filter((image) => image.naturalWidth === 0)
          .map((image) => image.currentSrc || image.src),
      );
      expect(broken, `${path} has images that did not load`).toEqual([]);

      // d. no sideways page scroll at any supported width.
      for (const width of OVERFLOW_WIDTHS) {
        await page.setViewportSize({ height: 900, width });
        await page.evaluate(() => window.scrollTo(0, 0));
        await expect
          .poll(
            () =>
              page.evaluate(
                () =>
                  document.documentElement.scrollWidth -
                  document.documentElement.clientWidth,
              ),
            { message: `${path} scrolls sideways at ${width}px` },
          )
          .toBeLessThanOrEqual(0);
      }
    });
  }

  test("every page has a unique, non-empty title and meta description", async ({
    request,
  }) => {
    const heads = new Map<string, { description: string; title: string }>();
    for (const path of SITE_ROUTES) {
      const head = await readHead(request, path);
      expect(head.status, `${path} should return 200`).toBe(200);
      expect(head.title.trim(), `${path} needs a <title>`).not.toBe("");
      expect(
        head.description.trim(),
        `${path} needs a meta description`,
      ).not.toBe("");
      heads.set(path, head);
    }

    const duplicates = (field: "description" | "title") => {
      const seen = new Map<string, string[]>();
      for (const [path, head] of heads) {
        seen.set(head[field], [...(seen.get(head[field]) ?? []), path]);
      }
      return [...seen.values()].filter((paths) => paths.length > 1);
    };

    expect(duplicates("title"), "pages sharing a <title>").toEqual([]);
    expect(duplicates("description"), "pages sharing a description").toEqual(
      [],
    );
  });

  test("every internal link and in-page anchor resolves", async ({
    page,
    request,
  }) => {
    test.setTimeout(300_000);

    // Crawl: collect every internal and in-page link from every route, as
    // rendered in the browser.
    const internal = new Set<string>();
    const brokenAnchors: string[] = [];

    for (const path of SITE_ROUTES) {
      await openRoute(page, path);

      const { hrefs, missing } = await page.evaluate(() => {
        const links = [
          ...document.querySelectorAll<HTMLAnchorElement>("a[href]"),
        ];
        const hrefs = links
          .map((link) => link.getAttribute("href") ?? "")
          .filter((href) => href.startsWith("/"));
        const missing = links
          .map((link) => link.getAttribute("href") ?? "")
          .filter((href) => href.startsWith("#") && href.length > 1)
          .filter(
            (href) =>
              document.getElementById(decodeURIComponent(href.slice(1))) ===
              null,
          );
        return { hrefs, missing };
      });

      for (const href of hrefs) internal.add(href);
      for (const href of new Set(missing))
        brokenAnchors.push(`${path} -> ${href}`);
    }

    expect(brokenAnchors, "in-page anchors without a target").toEqual([]);
    expect(internal.size).toBeGreaterThan(SITE_ROUTES.length);

    // Resolve: each distinct document once, then each distinct fragment
    // against that document's server-rendered HTML.
    const documents = new Map<string, string>();
    const failures: string[] = [];

    for (const href of internal) {
      const [target = "", fragment] = href.split("#");
      if (!documents.has(target)) {
        const response = await request.get(target);
        if (response.status() !== 200) {
          failures.push(`${target} returned ${response.status()}`);
          documents.set(target, "");
          continue;
        }
        const contentType = response.headers()["content-type"] ?? "";
        documents.set(
          target,
          contentType.includes("text/html") ? await response.text() : "",
        );
      }

      if (fragment !== undefined && fragment !== "") {
        const html = documents.get(target) ?? "";
        if (!html.includes(`id="${decodeURIComponent(fragment)}"`)) {
          failures.push(`${href} has no #${fragment} target`);
        }
      }
    }

    expect(failures, "internal links that do not resolve").toEqual([]);
  });

  test("the header logo navigates home", async ({ page }) => {
    await openRoute(page, `${ROUTES.aircraft}/f-22-raptor`);
    await page
      .getByRole("banner")
      .getByRole("link", { name: "Orbix home" })
      .click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("main#main-content h1")).toHaveCount(1);
  });

  test("an unknown path returns the custom 404 page inside the site chrome", async ({
    page,
  }) => {
    const path = `/no-such-page-${Date.now().toString(36)}`;
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(404);

    await expect(page.locator("main#main-content")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Off course.",
    );
    await expect(
      page.getByText("Page not found", { exact: true }),
    ).toBeVisible();
    await expect(page).toHaveTitle(/ORBIX/);

    // The chrome: skip link, header with the logo, footer with the contact.
    await expect(
      page.getByRole("link", { name: "Skip to main content" }),
    ).toHaveAttribute("href", "#main-content");
    await expect(
      page.getByRole("banner").getByRole("link", { name: "Orbix home" }),
    ).toHaveAttribute("href", "/");
    await expect(
      page.getByRole("contentinfo").locator('a[href^="mailto:"]'),
    ).toHaveAttribute("href", `mailto:${CONTACT_EMAIL}`);

    // And a way back into the site.
    await expect(
      page.getByRole("main").getByRole("link", { name: "Go to the home page" }),
    ).toHaveAttribute("href", "/");

    // Its plate is the not-found slot photograph, used on no other page
    // (v4 plan section 7), with its caption and credit.
    const plate = page.getByRole("main").locator("figure img");
    await expect(plate).toHaveCount(1);
    expect(await plate.getAttribute("src")).toContain("f-22-raptor-hangar");
    await expect(page.getByRole("main").locator("figcaption")).toContainText(
      "DeAndre Curtiss",
    );
  });
});
