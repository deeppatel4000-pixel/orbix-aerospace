import {
  AIRCRAFT_IDS,
  expect,
  INFO_ROUTES,
  PROJECT_ROUTES,
  REMOVED_ROUTE_REDIRECTS,
  ROCKET_IDS,
  ROUTES,
  test,
} from "../fixtures/orbix";

const EVERY_PAGE = [
  ...Object.values(ROUTES),
  ...Object.values(INFO_ROUTES),
  ...Object.values(PROJECT_ROUTES),
  ...AIRCRAFT_IDS.map((id) => `/aircraft/${id}`),
  ...ROCKET_IDS.map((id) => `/rockets/${id}`),
];

/**
 * Routes removed in v4 (plan section 3).
 *
 * `/showcase` and every `/showcase-capture/*` page were public, so links to
 * them exist outside the site. Each must answer with a permanent redirect to
 * the place its content moved to, and the target section must exist, so an
 * old link lands on the right content rather than on the top of a page or
 * a 404.
 */
test.describe("Removed routes", () => {
  test.skip(
    () => test.info().project.name !== "desktop",
    "Redirects are viewport-independent.",
  );

  for (const { from, to } of REMOVED_ROUTE_REDIRECTS) {
    test(`${from} redirects permanently to ${to}`, async ({ request }) => {
      const response = await request.get(from, { maxRedirects: 0 });

      expect(response.status()).toBe(308);
      expect(response.headers()["location"]).toBe(to);
    });

    test(`${from} lands on the ${to.split("#")[1]} section`, async ({
      page,
    }) => {
      const response = await page.goto(from, { waitUntil: "load" });
      const [path, hash] = to.split("#");

      expect(response?.status()).toBe(200);
      expect(new URL(page.url()).pathname).toBe(path);
      expect(new URL(page.url()).hash).toBe(`#${hash}`);
      await expect(page.locator(`[id="${hash}"]`)).toHaveCount(1);
      await expect(page.locator(`[id="${hash}"]`)).toBeVisible();
    });
  }

  test("no page links to a removed route", async ({ request }) => {
    for (const path of EVERY_PAGE) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
      expect(await response.text(), `${path} links to /showcase`).not.toMatch(
        /href="\/showcase(?:[/"#?-])/,
      );
    }
  });
});
