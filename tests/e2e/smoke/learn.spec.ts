import {
  expect,
  expectNoHorizontalOverflow,
  ROUTES,
  test,
} from "../fixtures/orbix";

/**
 * Learn's educational value depends entirely on its outbound links actually
 * resolving. Every "continue in the Engineering Laboratory" pill is a
 * `/engineering-lab#<anchorId>` deep link, and a typo in an anchor id would
 * fail silently: the browser would navigate to `/engineering-lab` and simply
 * not scroll anywhere, leaving the page looking fine while the learning
 * journey quietly dead-ends.
 *
 * Nothing else in the suite covers that, so these tests crawl the real links
 * Learn emits and assert each target id exists in the Engineering Laboratory
 * document.
 */

test.describe("Learn", () => {
  test("renders its pathways and is a well-formed page", async ({
    consoleMessages,
    page,
  }) => {
    const response = await page.goto(ROUTES.learn, {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status()).toBe(200);

    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);

    // Six learning pathways, each introduced by a level-2 heading.
    const pathwayHeadings = page.getByRole("heading", { level: 2 });
    expect(await pathwayHeadings.count()).toBeGreaterThanOrEqual(6);

    await expectNoHorizontalOverflow(page);
    expect(consoleMessages.errors).toEqual([]);
  });

  test("every Engineering Laboratory deep link resolves to a real anchor", async ({
    page,
  }) => {
    await page.goto(ROUTES.learn, { waitUntil: "domcontentloaded" });

    const anchorIds = await page
      .locator('a[href*="/engineering-lab#"]')
      .evaluateAll((anchors) =>
        anchors
          .map((anchor) => anchor.getAttribute("href") ?? "")
          .map((href) => href.split("#")[1] ?? "")
          .filter((id) => id.length > 0),
      );

    // Guard against the crawl silently finding nothing and passing vacuously.
    expect(anchorIds.length).toBeGreaterThan(0);

    await page.goto(ROUTES.engineeringLab, { waitUntil: "domcontentloaded" });

    const missing: string[] = [];
    for (const id of [...new Set(anchorIds)]) {
      const count = await page.locator(`[id="${id}"]`).count();
      if (count === 0) missing.push(id);
    }

    expect(
      missing,
      `Learn links to Engineering Laboratory anchors that do not exist: ${missing.join(", ")}`,
    ).toEqual([]);
  });

  test("every in-ORBIX exploration link resolves", async ({
    page,
    request,
  }) => {
    await page.goto(ROUTES.learn, { waitUntil: "domcontentloaded" });

    const hrefs = await page
      .locator("main a[href^='/']")
      .evaluateAll((anchors) =>
        anchors
          .map((anchor) => anchor.getAttribute("href") ?? "")
          // Drop in-page and Lab-anchor links; those are covered above.
          .filter((href) => href.length > 0 && !href.includes("#")),
      );

    expect(hrefs.length).toBeGreaterThan(0);

    for (const href of [...new Set(hrefs)]) {
      const response = await request.get(href);
      expect(response.status(), `Learn link "${href}" should resolve`).toBe(
        200,
      );
    }
  });
});
