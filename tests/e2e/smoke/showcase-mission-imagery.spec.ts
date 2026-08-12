import { expect, ROUTES, test } from "../fixtures/orbix";

/**
 * Showcase mission imagery, as a browser actually resolves it.
 *
 * The data contract beside `mission-showcase.ts` proves the five configured
 * sources are the approved ones, are byte-distinct, and exist on disk. That is
 * a different claim from "five photographs reached the screen": `next/image`
 * rewrites every source into an optimizer request, so a path the optimizer
 * rejects, a 404, or two cards collapsing onto one file all leave the markup
 * looking entirely correct.
 *
 * `naturalWidth` is the honest signal. It stays 0 for an image that never
 * decoded, whatever its `src` says, which separates "the element is there" from
 * "the picture is there".
 *
 * Each image is read through the card that owns it, so a rendered image is tied
 * to a specific mission rather than to a position in a list.
 */

/** Mission order and the file each card must end up showing. */
const EXPECTED = [
  { asset: "leo-satellite-deployment.webp", id: "leo-satellite-deployment" },
  { asset: "iss-style-resupply.webp", id: "iss-style-resupply" },
  { asset: "lunar-transfer-concept.webp", id: "lunar-transfer-concept" },
  { asset: "reentry-demonstrator.webp", id: "reentry-demonstrator" },
  { asset: "mars-transfer-concept.webp", id: "mars-transfer-concept" },
] as const;

interface CardImage {
  readonly alt: string;
  readonly asset: string;
  readonly complete: boolean;
  readonly missionId: string;
  readonly naturalHeight: number;
  readonly naturalWidth: number;
}

/**
 * One reading of every mission card's image, taken through the card's own
 * capture link so the mission identity comes from the DOM rather than from
 * ordering assumptions.
 */
async function cardImages(
  page: import("@playwright/test").Page,
): Promise<CardImage[]> {
  return page.evaluate(() => {
    const gallery = document.querySelector("#mission-gallery");
    if (!gallery) return [];

    return [...gallery.querySelectorAll("article")].flatMap((card) => {
      const capture = card.querySelector<HTMLAnchorElement>(
        'a[href^="/showcase-capture/"]',
      );
      const image = card.querySelector("img");
      if (!capture || !image) return [];

      // `currentSrc` is what the browser actually fetched. Whether Next served
      // the file directly or through its optimizer, the underlying asset is
      // the last path segment of the real file — read it without depending on
      // the optimizer's parameter format.
      const resolved = new URL(
        image.currentSrc || image.src,
        window.location.href,
      );
      const underlying = decodeURIComponent(
        resolved.searchParams.get("url") ?? resolved.pathname,
      );

      return [
        {
          alt: image.alt,
          asset: underlying.split("/").pop() ?? "",
          complete: image.complete,
          missionId: capture.pathname.replace("/showcase-capture/", ""),
          naturalHeight: image.naturalHeight,
          naturalWidth: image.naturalWidth,
        },
      ];
    });
  });
}

/**
 * Bring every card into view, then poll until all five have decoded.
 *
 * The scroll is required, not defensive. `next/image` lazy-loads by default, so
 * on a 390px viewport — where the gallery runs far below the fold — only the
 * first two cards had decoded after 25 seconds. That is the component working
 * correctly; measuring it without scrolling would be measuring the fold.
 */
async function loadedCardImages(page: import("@playwright/test").Page) {
  await page.waitForLoadState("load");

  const cards = page.locator("#mission-gallery article");
  await expect(cards).toHaveCount(EXPECTED.length);
  for (let index = 0; index < EXPECTED.length; index += 1) {
    await cards.nth(index).scrollIntoViewIfNeeded();
  }

  await expect
    .poll(
      async () => {
        const images = await cardImages(page);
        return images.filter(
          (image) => image.complete && image.naturalWidth > 0,
        ).length;
      },
      { timeout: 25_000 },
    )
    .toBe(EXPECTED.length);

  return cardImages(page);
}

test.describe("Showcase mission imagery", () => {
  test.skip(
    () => test.info().project.name !== "desktop",
    "The phone case below sets its own viewport.",
  );

  test("every mission card shows its own photograph, fully loaded", async ({
    page,
  }) => {
    await page.goto(ROUTES.showcase, { waitUntil: "domcontentloaded" });
    const images = await loadedCardImages(page);

    await test.info().attach("gallery-images", {
      body: JSON.stringify(images, null, 2),
      contentType: "application/json",
    });

    expect(images).toHaveLength(EXPECTED.length);

    // Mission identity comes from the card's own link, so this fails if a
    // photograph ever renders on the wrong card.
    expect(
      images.map((image) => ({ asset: image.asset, id: image.missionId })),
    ).toEqual(EXPECTED.map((entry) => ({ asset: entry.asset, id: entry.id })));

    for (const image of images) {
      expect(image.naturalWidth, `${image.missionId} decoded`).toBeGreaterThan(
        0,
      );
      expect(image.naturalHeight, `${image.missionId} decoded`).toBeGreaterThan(
        0,
      );
      expect(image.complete).toBe(true);
    }
  });

  test("no two cards resolve to the same file", async ({ page }) => {
    await page.goto(ROUTES.showcase, { waitUntil: "domcontentloaded" });
    const images = await loadedCardImages(page);

    expect(new Set(images.map((image) => image.asset)).size).toBe(
      EXPECTED.length,
    );
  });

  test("every mission image carries its own meaningful alt text", async ({
    page,
  }) => {
    await page.goto(ROUTES.showcase, { waitUntil: "domcontentloaded" });
    const images = await loadedCardImages(page);

    const alts = images.map((image) => image.alt);
    expect(new Set(alts).size, "alt text must not be shared").toBe(alts.length);

    for (const alt of alts) {
      expect(alt.trim()).not.toBe("");
      expect(alt).not.toMatch(/\.webp/i);
    }
  });

  test("no mission image request fails", async ({ page }) => {
    // A broken image is a network fact before it is a visual one. Catching the
    // failed response names the asset, which naturalWidth alone cannot.
    const failed: string[] = [];
    page.on("response", (response) => {
      const url = response.url();
      if (
        (url.includes("/images/missions/") || url.includes("/_next/image")) &&
        response.status() >= 400
      ) {
        failed.push(`${response.status()} ${url}`);
      }
    });

    await page.goto(ROUTES.showcase, { waitUntil: "domcontentloaded" });
    await loadedCardImages(page);

    expect(failed).toEqual([]);
  });

  test("every card still links to its own capture route", async ({ page }) => {
    await page.goto(ROUTES.showcase, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("load");

    const destinations = await page.evaluate(() =>
      [...document.querySelectorAll("#mission-gallery article")].map(
        (card) =>
          card.querySelector<HTMLAnchorElement>('a[href^="/showcase-capture/"]')
            ?.pathname ?? "",
      ),
    );

    expect(destinations).toEqual(
      EXPECTED.map((entry) => `/showcase-capture/${entry.id}`),
    );
  });

  test("the photographs load on a phone without overflowing it", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto(ROUTES.showcase, { waitUntil: "domcontentloaded" });
    await loadedCardImages(page);

    const overflow = await page.evaluate(() => {
      const gallery = document.querySelector("#mission-gallery");
      if (!gallery) return null;
      return {
        document:
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
        escaping: [...gallery.querySelectorAll("img")].filter(
          (image) =>
            image.getBoundingClientRect().right > window.innerWidth + 1,
        ).length,
      };
    });

    expect(overflow?.escaping, "no image may spill past the viewport").toBe(0);
    expect(overflow?.document).toBeLessThanOrEqual(1);
  });
});
