import type { Page } from "@playwright/test";

import { expect, ROUTES, test } from "../fixtures/orbix";

/**
 * Coverage for `next/image` format content negotiation.
 *
 * ORBIX does not configure `images.formats`, so Next 16's default applies.
 * That default was read from the installed package rather than assumed:
 *
 *   node_modules/next/dist/shared/lib/image-config.js -> formats: ['image/webp']
 *
 * ## Observed behaviour (measured against a local production build AND the
 * live deployment; identical in both)
 *
 *   Accept: image/avif,image/webp,...  -> 200 image/webp   (NOT avif)
 *   Accept: image/webp                 -> 200 image/webp
 *   Accept: image/avif                 -> 200 image/png    (source format)
 *   Accept: * / *                      -> 200 image/png    (source format)
 *
 * A .jpg source behaves the same way, falling back to `image/jpeg` rather
 * than `image/png`, confirming the fallback is "the source's own format"
 * rather than a hardcoded PNG.
 *
 * ## Why AVIF is asserted as NOT produced
 *
 * It would be easy to write "requesting AVIF returns AVIF" — but that is not
 * what this application does. AVIF is absent from the configured formats, so
 * advertising it alone gets the original format back. These tests encode the
 * real policy: WebP is the one negotiated format, and AVIF is not served.
 *
 * If AVIF is ever deliberately enabled, the AVIF test below is the one that
 * should be updated, and its failure is the signal that the policy changed.
 * This suite exists to make that change visible, not to prevent it.
 */

/** Chrome's real Accept header for images. */
const ACCEPT_AVIF_AND_WEBP =
  "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8";
const ACCEPT_WEBP_ONLY = "image/webp";
const ACCEPT_AVIF_ONLY = "image/avif";
const ACCEPT_ANY = "*/*";

/**
 * A genuinely rendered optimizer URL for a VEHICLE image, so the test
 * exercises the real path.
 *
 * Deliberately not `.first()`: the site chrome renders brand marks first, and
 * one of them carries a `?surface=site-chrome` marker, which would make the
 * selected URL vary between runs. Pinning to a `/images/` source keeps this
 * deterministic.
 */
async function renderedOptimizerUrl(page: Page): Promise<string> {
  const urls = await page
    .locator('img[src*="/_next/image"]')
    .evaluateAll((images) =>
      images
        .map((image) => image.getAttribute("src") ?? "")
        .filter((src) => {
          const source = new URL(src, "http://127.0.0.1").searchParams.get(
            "url",
          );
          return source?.startsWith("/images/") ?? false;
        }),
    );

  const rendered = urls[0];

  expect(
    rendered,
    "expected a rendered vehicle image to derive the optimizer URL from",
  ).toBeDefined();

  const url = new URL(rendered ?? "", "http://127.0.0.1");

  return `${url.pathname}?${url.searchParams.toString()}`;
}

test.describe("next/image format negotiation", () => {
  // Content negotiation is server-side and identical across viewports.
  test.skip(
    () => test.info().project.name !== "desktop",
    "Optimizer content negotiation does not vary by viewport.",
  );

  test("a browser advertising WebP receives WebP", async ({
    page,
    request,
  }) => {
    await page.goto(`${ROUTES.aircraft}/f-22-raptor`, {
      waitUntil: "domcontentloaded",
    });
    const url = await renderedOptimizerUrl(page);

    const response = await request.get(url, {
      headers: { accept: ACCEPT_WEBP_ONLY },
    });

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("image/webp");
  });

  test("a Chrome-like Accept header negotiates WebP, not AVIF", async ({
    page,
    request,
  }) => {
    await page.goto(`${ROUTES.aircraft}/f-22-raptor`, {
      waitUntil: "domcontentloaded",
    });
    const url = await renderedOptimizerUrl(page);

    const response = await request.get(url, {
      headers: { accept: ACCEPT_AVIF_AND_WEBP },
    });

    expect(response.status()).toBe(200);

    // The real behaviour: AVIF is advertised first by the browser but is not
    // in the configured formats, so WebP is selected.
    expect(response.headers()["content-type"]).toBe("image/webp");
  });

  test("AVIF is not served, because it is not a configured format", async ({
    page,
    request,
  }) => {
    await page.goto(`${ROUTES.aircraft}/f-22-raptor`, {
      waitUntil: "domcontentloaded",
    });
    const url = await renderedOptimizerUrl(page);

    const response = await request.get(url, {
      headers: { accept: ACCEPT_AVIF_ONLY },
    });

    // Not an error: the optimizer falls back to the source format rather
    // than failing or inventing an AVIF encode.
    expect(response.status()).toBe(200);

    const contentType = response.headers()["content-type"] ?? "";
    expect(
      contentType,
      "images.formats does not include AVIF, so AVIF must not be served",
    ).not.toBe("image/avif");
    expect(contentType).toMatch(/^image\//);
  });

  test("no format preference falls back to the source format", async ({
    page,
    request,
  }) => {
    await page.goto(`${ROUTES.aircraft}/f-22-raptor`, {
      waitUntil: "domcontentloaded",
    });
    const url = await renderedOptimizerUrl(page);

    const response = await request.get(url, {
      headers: { accept: ACCEPT_ANY },
    });

    expect(response.status()).toBe(200);
    // The aircraft asset is a PNG, and that is what comes back untranscoded.
    expect(response.headers()["content-type"]).toBe("image/png");
  });

  test("negotiated WebP is materially smaller than the untranscoded source", async ({
    page,
    request,
  }) => {
    // The point of negotiation is payload reduction. Comparing the two
    // responses proves transcoding actually happened rather than the header
    // merely being echoed.
    await page.goto(`${ROUTES.aircraft}/f-22-raptor`, {
      waitUntil: "domcontentloaded",
    });
    const url = await renderedOptimizerUrl(page);

    const webp = await request.get(url, {
      headers: { accept: ACCEPT_WEBP_ONLY },
    });
    const original = await request.get(url, {
      headers: { accept: ACCEPT_ANY },
    });

    expect(webp.status()).toBe(200);
    expect(original.status()).toBe(200);

    const webpBytes = (await webp.body()).byteLength;
    const originalBytes = (await original.body()).byteLength;

    expect(
      webpBytes,
      `negotiated WebP (${webpBytes}B) should be smaller than the source-format response (${originalBytes}B)`,
    ).toBeLessThan(originalBytes);
  });

  test("a JPEG source falls back to JPEG rather than a hardcoded PNG", async ({
    request,
  }) => {
    // f-35-lightning-ii is the one .jpg in the aircraft set, which is what
    // makes it useful here: it proves the no-preference fallback follows the
    // source's own format.
    const params = new URLSearchParams({
      q: "90",
      url: "/images/aircraft/f-35-lightning-ii.jpg",
      w: "640",
    });

    const response = await request.get(`/_next/image?${params.toString()}`, {
      headers: { accept: ACCEPT_ANY },
    });

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("image/jpeg");
  });
});
