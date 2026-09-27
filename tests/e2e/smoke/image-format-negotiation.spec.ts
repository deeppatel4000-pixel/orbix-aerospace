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
 *   Accept: image/avif                 -> 200 image/jpeg
 *   Accept: * / *                      -> 200 image/jpeg
 *
 * Since the 2026 redesign every vehicle photograph is stored as WebP. For a
 * client that does not accept WebP, Next falls back to the source format
 * only when that format is neither WebP nor AVIF; otherwise it encodes JPEG
 * (`node_modules/next/dist/server/image-optimizer.js`, the
 * `contentType = JPEG` branch). Measured against the local production build:
 * a 640px F-22 variant is 7,006 bytes as WebP and 11,101 bytes as JPEG.
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

  test("no format preference falls back to JPEG for a WebP source", async ({
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
    // The aircraft asset is a WebP file. A client that did not ask for WebP
    // must not be sent it, so the optimizer encodes a universally supported
    // JPEG instead.
    expect(response.headers()["content-type"]).toBe("image/jpeg");
  });

  test("the optimizer really resizes: a narrow variant is materially smaller", async ({
    request,
  }) => {
    // With WebP sources, comparing a negotiated response against the source
    // format no longer proves anything (both are WebP). Resizing is the other
    // half of what the optimizer is for, so compare two widths of the same
    // source instead: the narrow one must be clearly smaller.
    const variant = (width: number) =>
      `/_next/image?${new URLSearchParams({
        q: "75",
        url: "/images/aircraft/f-22-raptor.webp",
        w: String(width),
      }).toString()}`;

    const narrow = await request.get(variant(640), {
      headers: { accept: ACCEPT_WEBP_ONLY },
    });
    const wide = await request.get(variant(1920), {
      headers: { accept: ACCEPT_WEBP_ONLY },
    });

    expect(narrow.status()).toBe(200);
    expect(wide.status()).toBe(200);
    expect(narrow.headers()["content-type"]).toBe("image/webp");

    const narrowBytes = (await narrow.body()).byteLength;
    const wideBytes = (await wide.body()).byteLength;

    expect(
      narrowBytes,
      `the 640px variant (${narrowBytes}B) should be well under the 1920px one (${wideBytes}B)`,
    ).toBeLessThan(wideBytes * 0.75);
  });
});
