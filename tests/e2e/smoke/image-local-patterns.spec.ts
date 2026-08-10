import type { Page } from "@playwright/test";

import { expect, ROUTES, test } from "../fixtures/orbix";

/**
 * Coverage for the `images.localPatterns` allowlist in `next.config.ts`.
 *
 * This is a security boundary, not a formatting detail. `localPatterns` is
 * what stops the image optimizer being pointed at arbitrary local paths and
 * query strings. Declaring it at all turns local image handling into an
 * allowlist, and ORBIX declares exactly two entries:
 *
 *   { pathname: "/**", search: "" }                        // any local asset, no query string
 *   { pathname: "/brand/**", search: "?surface=site-chrome" } // one specific marked asset
 *
 * The existing suite only ever proved the ALLOWED side: `image-optimization`
 * and `vehicle-profile-images` confirm real images load. Nothing proved the
 * allowlist actually rejects anything, so widening or deleting it would have
 * been invisible — every other test would still pass.
 *
 * ## Observed behaviour (measured, not assumed)
 *
 * Probed against both a local production build and the live deployment
 * before writing these assertions; both behave identically:
 *
 *   /images/... with no query                 -> 200 image/png
 *   /brand/... ?surface=site-chrome           -> 200 image/png
 *   /images/... ?foo=bar                      -> 400
 *   /brand/... ?surface=other                 -> 400
 *   /images/... ?surface=site-chrome          -> 400  (right query, wrong pathname)
 *
 * The last case matters: the `?surface=site-chrome` exemption is scoped to
 * `/brand/**`, so the same query on a non-brand path must still be rejected.
 *
 * One environment difference, deliberately NOT asserted: the 400 response
 * carries `content-type: text/plain` in production but an empty content-type
 * on a local `next start`. These tests assert the status and that the body is
 * not an image, which holds in both.
 */

/**
 * Pulls a genuinely rendered vehicle-image source path out of the page.
 *
 * Deliberately NOT `.first()`: the site chrome renders brand marks before the
 * vehicle imagery, and one of those (the wordmark) legitimately carries the
 * `?surface=site-chrome` marker. Picking the first optimized image would
 * therefore sometimes yield a path that already has a query string, which is
 * the opposite of what the no-query cases below need. Selecting a `/images/`
 * source makes the helper deterministic and matches the intent: an ordinary
 * local asset with no query string.
 */
async function renderedVehicleSourcePath(page: Page): Promise<string> {
  const sources = await page
    .locator('img[src*="/_next/image"]')
    .evaluateAll((images) =>
      images
        .map((image) => image.getAttribute("src") ?? "")
        .map(
          (src) =>
            new URL(src, "http://127.0.0.1").searchParams.get("url") ?? "",
        )
        .filter((source) => source.startsWith("/images/")),
    );

  const source = sources[0];

  expect(
    source,
    "expected a rendered vehicle image to derive the source path from",
  ).toBeDefined();

  return source ?? "";
}

/** Builds an optimizer request for a given local source path. */
function optimizerUrl(sourcePath: string, quality = 75): string {
  const params = new URLSearchParams({
    q: String(quality),
    url: sourcePath,
    w: "640",
  });

  return `/_next/image?${params.toString()}`;
}

test.describe("next/image localPatterns allowlist", () => {
  // Optimizer responses are server-side and identical across viewports.
  test.skip(
    () => test.info().project.name !== "desktop",
    "Image optimizer responses do not vary by viewport.",
  );

  test("an allowed local image is optimized", async ({ page, request }) => {
    await page.goto(`${ROUTES.aircraft}/f-22-raptor`, {
      waitUntil: "domcontentloaded",
    });

    // Derived from a real rendered image, not hand-written.
    const source = await renderedVehicleSourcePath(page);
    expect(source).not.toContain("?");

    const response = await request.get(optimizerUrl(source));

    expect(response.status(), `${source} should be allowed`).toBe(200);
    expect(response.headers()["content-type"] ?? "").toMatch(/^image\//);
  });

  test("the brand asset's marked query string is allowed", async ({
    request,
  }) => {
    // The one query string the allowlist permits, and the reason the second
    // localPatterns entry exists at all: src/components/layout/site-logo.tsx
    // requests this exact marker.
    const response = await request.get(
      optimizerUrl(
        "/brand/orbix-wordmark-transparent.png?surface=site-chrome",
        90,
      ),
    );

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"] ?? "").toMatch(/^image\//);
  });

  test("a query string on an otherwise-allowed path is rejected", async ({
    page,
    request,
  }) => {
    await page.goto(`${ROUTES.aircraft}/f-22-raptor`, {
      waitUntil: "domcontentloaded",
    });

    // Same real asset that succeeds above, with a query string appended. The
    // `/**` entry requires `search: ""`, so this must be rejected — proving
    // the allowlist discriminates rather than waving everything through.
    const source = await renderedVehicleSourcePath(page);
    const response = await request.get(optimizerUrl(`${source}?foo=bar`));

    expect(
      response.status(),
      "a disallowed query string must be rejected by the optimizer",
    ).toBe(400);
    expect(response.headers()["content-type"] ?? "").not.toMatch(/^image\//);
  });

  test("the brand exemption does not leak to other paths", async ({
    page,
    request,
  }) => {
    await page.goto(`${ROUTES.aircraft}/f-22-raptor`, {
      waitUntil: "domcontentloaded",
    });

    // `?surface=site-chrome` is only allowed under `/brand/**`. The same
    // query on a non-brand path must still fail, otherwise the exemption
    // would have effectively widened to every local asset.
    const source = await renderedVehicleSourcePath(page);
    const response = await request.get(
      optimizerUrl(`${source}?surface=site-chrome`),
    );

    expect(
      response.status(),
      "the brand query exemption must not apply outside /brand/**",
    ).toBe(400);
  });

  test("a different query value on the brand path is rejected", async ({
    request,
  }) => {
    // The allowlist pins an exact search string, not "any query on /brand".
    const response = await request.get(
      optimizerUrl("/brand/orbix-wordmark-transparent.png?surface=other", 90),
    );

    expect(
      response.status(),
      "only the exact configured search string may be allowed",
    ).toBe(400);
  });
});
