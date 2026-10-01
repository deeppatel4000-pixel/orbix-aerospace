import {
  expect,
  expectNoHorizontalOverflow,
  LEARN_PATHWAY_COUNT,
  ROUTES,
  test,
} from "../fixtures/orbix";

/**
 * Learn's educational value depends entirely on its outbound links actually
 * resolving. Every "continue in the Engineering Lab" link is a
 * `/engineering-lab#<anchorId>` deep link, and a typo in an anchor id would
 * fail silently: the browser would navigate to `/engineering-lab` and simply
 * not scroll anywhere, leaving the page looking fine while the learning
 * journey quietly dead-ends.
 *
 * Nothing else in the suite covers that, so these tests crawl the real links
 * Learn emits and assert each target id exists in the Engineering Lab
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

    // The learning pathways, each introduced by a level-2 heading, after
    // the "Contents" heading.
    const pathwayHeadings = page.getByRole("heading", { level: 2 });
    await expect(pathwayHeadings).toHaveCount(1 + LEARN_PATHWAY_COUNT);

    await expectNoHorizontalOverflow(page);
    expect(consoleMessages.errors).toEqual([]);
  });

  test("the orbital pathway shows a still transfer drawing that links to the lab explorer", async ({
    page,
  }) => {
    await page.goto(ROUTES.learn, { waitUntil: "domcontentloaded" });
    const figure = page
      .locator("#orbital-mechanics-mission-design")
      .locator("figure")
      .first();

    await expect(
      figure.getByRole("img", {
        name: /^Hohmann transfer from 200 km to 35,786 km/,
      }),
    ).toBeVisible();
    // Not a second copy of the interactive explorer: no slider, no Play.
    await expect(figure.getByRole("slider")).toHaveCount(0);
    await expect(figure.getByRole("button")).toHaveCount(0);
    await expect(
      figure.getByRole("link", { name: "Change the target orbit in the lab" }),
    ).toHaveAttribute("href", "/engineering-lab#transfer-explorer");
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
