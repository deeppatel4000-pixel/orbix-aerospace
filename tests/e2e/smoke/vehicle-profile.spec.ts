import {
  AIRCRAFT_IDS,
  expect,
  ROCKET_IDS,
  ROUTES,
  test,
} from "../fixtures/orbix";

/**
 * Vehicle profile structure (2026 redesign).
 *
 * A profile is a documentation page: a breadcrumb, one h1, a credited
 * photograph, an "On this page" list, then one flat section per topic, each
 * an h2, ending with three related vehicles. The earlier hero record,
 * `data-profile-mode` section grammar and full-bleed hero image were removed
 * by design; these tests pin the structure that replaced them.
 *
 * Deliberately NOT asserted: pixel geometry, class names or copy beyond
 * section names. The contracts here are structural: which sections exist in
 * which order, that the section list matches them, that the specification
 * table is populated from real data, and that the photograph is credited.
 */

/** Section ids in document order, per domain. */
const AIRCRAFT_SECTIONS = [
  "overview",
  "specifications",
  "propulsion",
  "performance",
  "history",
  "variants",
  "engineering-notes",
  "related-aircraft",
] as const;

const ROCKET_SECTIONS = [
  "overview",
  "specifications",
  "stages",
  "propulsion",
  "performance",
  "engineering-notes",
  "related-rockets",
] as const;

const PROFILES = [
  ...AIRCRAFT_IDS.map((id) => ({
    path: `${ROUTES.aircraft}/${id}`,
    sections: AIRCRAFT_SECTIONS as readonly string[],
  })),
  ...ROCKET_IDS.map((id) => ({
    path: `${ROUTES.rockets}/${id}`,
    sections: ROCKET_SECTIONS as readonly string[],
  })),
];

test.describe("Vehicle profile structure", () => {
  test.skip(
    () => test.info().project.name !== "desktop",
    "Profile structure is viewport-independent; responsive behaviour is covered by the overflow guards.",
  );

  for (const { path, sections } of PROFILES) {
    test(`${path} has its sections in order, each titled by an h2`, async ({
      page,
    }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page.locator("main#main-content")).toBeVisible();
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);

      const found = await page
        .locator("#main-content section[id]")
        .evaluateAll((nodes) => nodes.map((node) => node.id));
      expect(found).toEqual([...sections]);

      for (const id of sections) {
        const heading = page.locator(`#${id} > h2#${id}-title`);
        await expect(heading, `#${id} needs its own h2`).toHaveCount(1);
        await expect(page.locator(`#${id}`)).toHaveAttribute(
          "aria-labelledby",
          `${id}-title`,
        );
        expect(((await heading.textContent()) ?? "").trim()).not.toBe("");
      }
    });

    test(`${path} lists every content section under "On this page"`, async ({
      page,
    }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });

      const nav = page.getByRole("navigation", { name: "On this page" });
      await expect(nav).toBeVisible();

      const targets = await nav
        .locator('a[href^="#"]')
        .evaluateAll((links) =>
          links.map((link) => (link.getAttribute("href") ?? "").slice(1)),
        );

      // Every section except the closing related-vehicles list, in order.
      expect(targets).toEqual(
        sections.filter((id) => !id.startsWith("related-")),
      );
    });
  }

  test("the specification table is populated from real data", async ({
    page,
  }) => {
    for (const { path } of PROFILES) {
      await page.goto(path, { waitUntil: "domcontentloaded" });

      const values = await page
        .locator("#specifications table tbody td.orbix-num")
        .evaluateAll((cells) =>
          cells.map((cell) => (cell.textContent ?? "").trim()),
        );

      expect(
        values.length,
        `${path} has no specification rows`,
      ).toBeGreaterThan(0);
      // A blank or placeholder here is a formatting regression, because every
      // row comes from a recorded figure.
      for (const value of values) {
        expect(value, `${path} rendered an empty value`).not.toBe("");
        expect(value).not.toMatch(/^(0|\u2014|-|N\/A)$/i);
      }
    }
  });

  test("each profile photograph has alt text and a credit with its source", async ({
    page,
  }) => {
    for (const { path } of PROFILES) {
      await page.goto(path, { waitUntil: "domcontentloaded" });

      const figure = page.locator("#main-content figure").first();
      await expect(figure).toBeVisible();

      const alt = (await figure.locator("img").getAttribute("alt")) ?? "";
      expect(
        alt.trim().length,
        `${path} photograph needs alt text`,
      ).toBeGreaterThan(10);

      const caption = figure.locator("figcaption");
      await expect(caption).toContainText(/public domain|CC BY/i);
      await expect(
        caption.getByRole("link", { name: /^Source of the / }),
      ).toHaveAttribute("href", /^https:\/\//);
    }
  });

  test("the breadcrumb leads back to the right registry", async ({ page }) => {
    await page.goto(`${ROUTES.aircraft}/b-2-spirit`, {
      waitUntil: "domcontentloaded",
    });
    const aircraftCrumbs = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(
      aircraftCrumbs.getByRole("link", { name: "Aircraft", exact: true }),
    ).toHaveAttribute("href", ROUTES.aircraft);

    await page.goto(`${ROUTES.rockets}/saturn-v`, {
      waitUntil: "domcontentloaded",
    });
    const rocketCrumbs = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(
      rocketCrumbs.getByRole("link", { name: "Launch vehicles", exact: true }),
    ).toHaveAttribute("href", ROUTES.rockets);
  });

  test("profiles carry their route's division", async ({ page }) => {
    await page.goto(`${ROUTES.aircraft}/b-2-spirit`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.locator("[data-orbix-division]")).toHaveAttribute(
      "data-orbix-division",
      "aircraft",
    );

    await page.goto(`${ROUTES.rockets}/saturn-v`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.locator("[data-orbix-division]")).toHaveAttribute(
      "data-orbix-division",
      "space",
    );
  });
});
