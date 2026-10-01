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
 * an h2, ending with three related vehicles. Design v2 (spec 9) puts the
 * photograph in the hero with a credit line: a framed plate beside the text
 * on aircraft profiles and a feathered plate on the right on rocket profiles,
 * above the text on a phone. The
 * hero is where the photograph is shown large; no profile repeats it in the
 * overview, which is a short spec sheet of the record's facts. The aircraft
 * history timeline section was removed. These tests pin that structure.
 *
 * Deliberately NOT asserted: pixel geometry, class names or copy beyond
 * section names. The contracts here are structural: which sections exist in
 * which order, that the section list matches them, that the specification
 * table is populated from real data, and that the photograph is credited.
 */

/**
 * Section ids in document order, per domain. v4 (plan sections 7 and 8)
 * moved the engineering analysis up to follow the overview and added a
 * gallery of further photographs before the related vehicles.
 */
const AIRCRAFT_SECTIONS = [
  "overview",
  "engineering-notes",
  "specifications",
  "propulsion",
  "performance",
  "variants",
  "photographs",
  "related-aircraft",
] as const;

const ROCKET_SECTIONS = [
  "overview",
  "engineering-notes",
  "specifications",
  "stages",
  "propulsion",
  "performance",
  "photographs",
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

      // Every profile's hero photograph carries alt text and a visible
      // credit, licence and source link.
      const hero = page.locator("#main-content .orbix-photo-hero__figure");
      await expect(hero).toHaveCount(1);
      const heroAlt = (await hero.locator("img").getAttribute("alt")) ?? "";
      expect(
        heroAlt.trim().length,
        `${path} hero photograph needs alt text`,
      ).toBeGreaterThan(10);
      const heroCaption = hero.locator("figcaption");
      await expect(heroCaption).toContainText(/public domain|CC BY/i);
      // The credit: "Photo: NASA", or a credit that already names the
      // photograph ("U.S. Air Force photo by ...") as it stands.
      await expect(heroCaption).toContainText(/\bphoto(graph)?\b/i);
      await expect(
        heroCaption.getByRole("link", { name: "Source file" }),
      ).toHaveAttribute("href", /^https:\/\//);

      // The hero is the only credited vehicle photograph: no profile
      // repeats it in the overview (design v2), so no other figure links to
      // a source file of the vehicle.
      const repeated = page.locator("#main-content figure", {
        has: page.getByRole("link", { name: /^Source file of the / }),
      });
      await expect(repeated).toHaveCount(0);
    }
  });

  test("each profile's gallery adds two or three credited views, none repeating the hero", async ({
    page,
  }) => {
    // v4 plan section 7: a short gallery per profile, and no photograph in
    // more than one slot.
    const sourceOf = (img: import("@playwright/test").Locator) =>
      img.evaluate((node) => {
        const src = node.getAttribute("src") ?? "";
        return new URL(src, "http://localhost").searchParams.get("url") ?? src;
      });

    for (const { path } of PROFILES) {
      await page.goto(path, { waitUntil: "domcontentloaded" });

      const heroSource = await sourceOf(
        page.locator("#main-content .orbix-photo-hero__figure img"),
      );
      const views = page.locator("#photographs figure");
      const count = await views.count();
      expect(count, `${path} gallery size`).toBeGreaterThanOrEqual(2);
      expect(count, `${path} gallery size`).toBeLessThanOrEqual(3);

      const sources: string[] = [];
      for (let index = 0; index < count; index += 1) {
        const view = views.nth(index);
        const alt = (await view.locator("img").getAttribute("alt")) ?? "";
        expect(
          alt.trim().length,
          `${path} view ${index + 1} alt`,
        ).toBeGreaterThan(10);
        await expect(view.locator("figcaption")).toContainText(
          /public domain|CC BY|CC0/i,
        );
        await expect(
          view.getByRole("link", { name: /^Source file/ }),
        ).toHaveAttribute("href", /^https:\/\//);
        sources.push(await sourceOf(view.locator("img")));
      }

      expect(new Set(sources).size, `${path} repeats a view`).toBe(count);
      expect(sources, `${path} repeats its hero`).not.toContain(heroSource);
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
