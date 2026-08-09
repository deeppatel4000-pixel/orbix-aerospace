import type { Page } from "@playwright/test";

import { expect, ROUTES, test } from "../fixtures/orbix";

/**
 * Coverage for the `next/image` quality configuration in `next.config.ts`.
 *
 * `images.qualities: [75, 90]` had no test of any kind. Nothing verified that
 * the configured values are actually accepted, that quality genuinely affects
 * the optimized output, or what happens to an unconfigured value — so a
 * regression in that config would have been invisible: pages would still
 * render, images would still appear, and every existing assertion would pass.
 *
 * ## Behaviour is derived, not assumed
 *
 * Every expectation below was measured against the real deployment before
 * being written, using the application's own optimizer endpoint:
 *
 *   q=75  -> 200, image/*   (configured)
 *   q=90  -> 200, image/*   (configured, larger payload than q=75)
 *   q=50  -> 400 "Bad request ... INVALID_IMAGE_OPTIMIZE_REQUEST"
 *   q=1 / q=100 / q=0 -> 400, same
 *
 * The 400 is Next 16's actual response to an unconfigured quality. It was not
 * assumed — `images.qualities` in Next 16 is an allowlist, and anything
 * outside it is rejected rather than clamped.
 *
 * ## These are not hand-invented URLs
 *
 * The optimizer URL under test is read out of a real rendered `<img>` on a
 * real vehicle profile, so this exercises the same path the application uses
 * rather than a URL invented by the test. Only the `q` parameter is varied.
 */

/** From `next.config.ts`: `images.qualities`. */
const CONFIGURED_QUALITIES = [75, 90] as const;

/**
 * Values outside the allowlist. Deliberately spans below, above and inside
 * the usual 1-100 range so the test does not merely prove "0 is invalid".
 */
const UNCONFIGURED_QUALITIES = [0, 1, 50, 100] as const;

/**
 * Pulls a genuine `/_next/image` URL out of the rendered page and returns it
 * with the quality parameter replaced, so requests stay on the application's
 * real optimization path.
 */
async function optimizerUrlFromPage(
  page: Page,
  quality: number,
): Promise<string> {
  const rendered = await page
    .locator('img[src*="/_next/image"]')
    .first()
    .getAttribute("src");

  expect(
    rendered,
    "expected a rendered next/image element to derive the optimizer URL from",
  ).not.toBeNull();

  const url = new URL(rendered ?? "", "http://127.0.0.1");
  url.searchParams.set("q", String(quality));

  return `${url.pathname}?${url.searchParams.toString()}`;
}

test.describe("next/image quality configuration", () => {
  // Response behaviour is server-side and identical across viewports.
  test.skip(
    () => test.info().project.name !== "desktop",
    "Image optimizer responses do not vary by viewport.",
  );

  for (const quality of CONFIGURED_QUALITIES) {
    test(`configured quality ${quality} returns an optimized image`, async ({
      page,
      request,
    }) => {
      await page.goto(`${ROUTES.aircraft}/f-22-raptor`, {
        waitUntil: "domcontentloaded",
      });

      const url = await optimizerUrlFromPage(page, quality);
      const response = await request.get(url);

      expect(response.status(), `q=${quality} should be accepted`).toBe(200);

      // An actual image, not an HTML error page.
      const contentType = response.headers()["content-type"] ?? "";
      expect(contentType).toMatch(/^image\//);

      const body = await response.body();
      expect(
        body.byteLength,
        "an optimized image should have a non-trivial body",
      ).toBeGreaterThan(1_000);

      // It went through the optimizer rather than serving the raw asset:
      // the source PNGs in public/images/aircraft are 1.6-9.2 MB, so a
      // width-constrained optimized variant must be far smaller.
      expect(
        body.byteLength,
        "optimized output should be much smaller than the multi-megabyte source",
      ).toBeLessThan(1_000_000);
    });
  }

  test("quality actually changes the optimized output", async ({
    page,
    request,
  }) => {
    // The strongest evidence that the configuration is functioning rather
    // than merely accepted: same source, same width, different quality must
    // produce a different (larger, at higher quality) payload.
    await page.goto(`${ROUTES.aircraft}/f-22-raptor`, {
      waitUntil: "domcontentloaded",
    });

    const lower = await request.get(await optimizerUrlFromPage(page, 75));
    const higher = await request.get(await optimizerUrlFromPage(page, 90));

    expect(lower.status()).toBe(200);
    expect(higher.status()).toBe(200);

    const lowerBytes = (await lower.body()).byteLength;
    const higherBytes = (await higher.body()).byteLength;

    expect(
      higherBytes,
      `q=90 (${higherBytes}B) should encode more data than q=75 (${lowerBytes}B) for the same source and width`,
    ).toBeGreaterThan(lowerBytes);
  });

  for (const quality of UNCONFIGURED_QUALITIES) {
    test(`unconfigured quality ${quality} is rejected`, async ({
      page,
      request,
    }) => {
      await page.goto(`${ROUTES.aircraft}/f-22-raptor`, {
        waitUntil: "domcontentloaded",
      });

      const response = await request.get(
        await optimizerUrlFromPage(page, quality),
      );

      // Measured behaviour: Next 16 treats `images.qualities` as an allowlist
      // and rejects anything outside it. It does NOT clamp to the nearest
      // configured value, and it does NOT silently succeed.
      expect(
        response.status(),
        `q=${quality} is not in images.qualities and must be rejected`,
      ).toBe(400);

      const contentType = response.headers()["content-type"] ?? "";
      expect(contentType).not.toMatch(/^image\//);
    });
  }

  test("the qualities the application actually requests are all configured", async ({
    page,
  }) => {
    // Ties the config to real usage: every `q` the app emits on a profile
    // page must be in the allowlist, otherwise those images would 400 in
    // production while this suite's other tests still passed.
    await page.goto(`${ROUTES.rockets}/falcon-9`, {
      waitUntil: "domcontentloaded",
    });

    const requested = await page
      .locator('img[src*="/_next/image"]')
      .evaluateAll((images) =>
        images
          .map((image) => image.getAttribute("src") ?? "")
          .map((src) => new URL(src, "http://127.0.0.1").searchParams.get("q"))
          .filter((value): value is string => value !== null),
      );

    expect(
      requested.length,
      "expected the profile to render optimized images",
    ).toBeGreaterThan(0);

    const allowed = CONFIGURED_QUALITIES.map(String);
    const unexpected = [...new Set(requested)].filter(
      (value) => !allowed.includes(value),
    );

    expect(
      unexpected,
      `these qualities are requested but not in images.qualities: ${unexpected.join(", ")}`,
    ).toEqual([]);
  });
});
