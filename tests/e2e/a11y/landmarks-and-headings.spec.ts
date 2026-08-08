import type { Page } from "@playwright/test";

import { expect, ROUTES, test } from "../fixtures/orbix";

const routeEntries = Object.entries(ROUTES);

interface HeadingInfo {
  level: number;
  text: string;
}

/**
 * Reads every *visible* heading on the page, in DOM order. Visibility is
 * checked with the element's own `checkVisibility()` (supported in the
 * Chromium builds every project in this config uses) so that headings
 * belonging to an inactive Engineering Lab workflow group -- rendered with
 * `hidden` by LaboratoryShell, but still present in the DOM -- are correctly
 * excluded, matching what a real user (sighted or with a screen reader)
 * would actually encounter.
 */
async function getVisibleHeadingsInOrder(page: Page): Promise<HeadingInfo[]> {
  return page.evaluate(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6"),
    );

    return elements
      .filter((element) =>
        element.checkVisibility({
          checkOpacity: false,
          checkVisibilityCSS: true,
        }),
      )
      .map((element) => ({
        level: Number.parseInt(element.tagName.slice(1), 10),
        text: (element.textContent ?? "").trim(),
      }));
  });
}

test.describe("Headings", () => {
  for (const [name, path] of routeEntries) {
    test(`${name} route has exactly one visible <h1> and no skipped heading levels`, async ({
      page,
    }) => {
      // `domcontentloaded` rather than the default `load`: these checks
      // only need the DOM, not every image finishing its network fetch --
      // waiting for `load` on an image-heavy route under this suite's
      // parallel workers can occasionally outlast Next's image-optimizer
      // concurrency limit (see the matching comment on
      // `expectAllImagesLoaded` in fixtures/orbix.ts).
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("main")).toBeVisible();

      const headings = await getVisibleHeadingsInOrder(page);

      const h1Count = headings.filter((heading) => heading.level === 1).length;
      expect(
        h1Count,
        `Expected exactly one visible <h1>, found ${h1Count}: ${JSON.stringify(headings)}`,
      ).toBe(1);

      // "No skipped levels" means a heading may drop back down to any
      // earlier level (ending one subsection and starting a new one), but
      // may never jump *forward* by more than one level at a time (e.g.
      // h1 -> h3 with no h2 in between). This mirrors the standard
      // heading-order accessibility rule.
      for (let index = 1; index < headings.length; index += 1) {
        const previous = headings[index - 1];
        const current = headings[index];
        if (previous === undefined || current === undefined) continue;

        const jump = current.level - previous.level;
        expect(
          jump,
          `Heading level jumped from h${previous.level} ("${previous.text}") ` +
            `to h${current.level} ("${current.text}") without an intermediate ` +
            `level.`,
        ).toBeLessThanOrEqual(1);
      }
    });
  }
});

test.describe("Images", () => {
  for (const [name, path] of routeEntries) {
    test(`${name} route: every <img> has an alt attribute`, async ({
      page,
    }) => {
      // `domcontentloaded` rather than the default `load`: these checks
      // only need the DOM, not every image finishing its network fetch --
      // waiting for `load` on an image-heavy route under this suite's
      // parallel workers can occasionally outlast Next's image-optimizer
      // concurrency limit (see the matching comment on
      // `expectAllImagesLoaded` in fixtures/orbix.ts).
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("main")).toBeVisible();

      // The `alt` attribute is present in the initial markup for every
      // Next.js `<Image>` regardless of whether the image has actually
      // finished (or even started) loading -- next/image requires an
      // `alt` prop at compile time and always renders it eagerly, only the
      // network fetch is lazy. So this doesn't need to wait for images to
      // load or scroll them into view first.
      const missingAlt = await page.evaluate(() =>
        Array.from(document.querySelectorAll("img"))
          .filter((image) => image.getAttribute("alt") === null)
          .map(
            (image) =>
              image.getAttribute("src") ??
              image.getAttribute("srcset") ??
              "(no src)",
          ),
      );

      expect(
        missingAlt,
        `Images missing an alt attribute (empty alt="" is fine for decorative images, but the attribute itself must exist): ${missingAlt.join(", ")}`,
      ).toEqual([]);
    });
  }
});

test.describe("Duplicate landmark roles", () => {
  for (const [name, path] of routeEntries) {
    test(`${name} route: no two visible <nav> landmarks share an accessible label`, async ({
      page,
    }) => {
      // `domcontentloaded` rather than the default `load`: these checks
      // only need the DOM, not every image finishing its network fetch --
      // waiting for `load` on an image-heavy route under this suite's
      // parallel workers can occasionally outlast Next's image-optimizer
      // concurrency limit (see the matching comment on
      // `expectAllImagesLoaded` in fixtures/orbix.ts).
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("main")).toBeVisible();

      const navLabels = await page.evaluate(() =>
        Array.from(document.querySelectorAll<HTMLElement>("nav"))
          .filter((nav) =>
            nav.checkVisibility({
              checkOpacity: false,
              checkVisibilityCSS: true,
            }),
          )
          .map((nav) => nav.getAttribute("aria-label")),
      );

      // Every <nav> in this app declares an aria-label (desktop nav,
      // footer nav, laboratory workflow nav, mission-control sections,
      // etc.) -- an unlabelled <nav> would itself be a regression this
      // check should catch, not silently pass through.
      for (const label of navLabels) {
        expect(
          label,
          "Every <nav> landmark should declare an aria-label",
        ).not.toBeNull();
      }

      const uniqueLabels = new Set(navLabels);
      expect(
        uniqueLabels.size,
        `Duplicate <nav> aria-labels found on ${name}: ${navLabels.join(", ")}`,
      ).toBe(navLabels.length);
    });
  }
});
