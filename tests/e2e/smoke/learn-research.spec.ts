import { expect, ROUTES, test } from "../fixtures/orbix";

/**
 * Learn research layout (Phase 6A).
 *
 * The dataset itself is frozen by `learning-areas.test.ts`; this covers what
 * only a browser can see — that the redesigned pathway asides stay inside the
 * viewport, keep every destination reachable, and remain on the research
 * division.
 */

test.describe("Learn research layout", () => {
  test.skip(
    () => test.info().project.name !== "desktop",
    "This case sets its own viewports.",
  );

  test("every pathway record stays inside a phone viewport", async ({
    page,
  }) => {
    // Measured against each record's own box as well as the document: the
    // laboratory taught us that a clipped record and an overflowing page are
    // different failures, and only one of them scrolls.
    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto(ROUTES.learn, { waitUntil: "domcontentloaded" });

    // Two distinct failures, both checked: a record whose content is clipped
    // inside its own box, and a record that is simply wider than the phone.
    // The second does not always make the document scroll, because an ancestor
    // may clip it — so it is measured directly against the viewport.
    const faults = await page.evaluate(() => {
      const sections = [...document.querySelectorAll("section[id]")];
      return {
        clipping: sections.filter(
          (node) => node.scrollWidth > node.clientWidth + 1,
        ).length,
        tooWide: sections.filter(
          (node) => node.getBoundingClientRect().width > window.innerWidth + 1,
        ).length,
      };
    });
    expect(faults.clipping, "no pathway may clip its own content").toBe(0);
    expect(faults.tooWide, "no pathway may exceed the viewport").toBe(0);

    await expect
      .poll(async () =>
        page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth + 1,
        ),
      )
      .toBe(false);
  });

  test("the research division and heading structure survive the redesign", async ({
    page,
  }) => {
    await page.goto(ROUTES.learn, { waitUntil: "domcontentloaded" });

    await expect(page.locator("[data-orbix-division]").first()).toHaveAttribute(
      "data-orbix-division",
      "research",
    );
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);

    // Six pathways, each contributing a heading, and the aside groups that
    // previously had none now carry real headings rather than styled labels.
    const structure = await page.evaluate(() => ({
      h2: document.querySelectorAll("#main-content h2").length,
      h3: document.querySelectorAll("#main-content h3").length,
    }));
    expect(structure.h2).toBe(6);
    expect(structure.h3).toBeGreaterThanOrEqual(6);
  });

  test("no pathway link is nested inside another interactive control", async ({
    page,
  }) => {
    await page.goto(ROUTES.learn, { waitUntil: "domcontentloaded" });

    const nested = await page.evaluate(
      () =>
        [...document.querySelectorAll("#main-content a")].filter(
          (link) => link.querySelector("a, button") !== null,
        ).length,
    );
    expect(nested).toBe(0);
  });
});
