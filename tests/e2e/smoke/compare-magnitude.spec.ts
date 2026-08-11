import { expect, ROUTES, test } from "../fixtures/orbix";

/**
 * Compare magnitude encoding (Phase 3B) coverage.
 *
 * The risk this phase introduces is not a bar of the wrong length — it is a bar
 * appearing beside values that were never comparable. Most of what follows
 * therefore asserts that tracks are ABSENT, and the length assertions are
 * relational rather than pixel-exact.
 *
 * The selections below are chosen from the real dataset so that each one
 * exercises a specific unit situation:
 *
 *   MIXED_SPEED     F-15 publishes 1,875 mph while the F-22 and SR-71 publish
 *                   Mach numbers, so the speed row must stay unencoded. The
 *                   ceiling row in the same comparison is feet throughout and
 *                   must be encoded — proving the rejection is row-scoped and
 *                   not a blanket switch.
 *
 *   SAME_SPEED      All three publish Mach, so the same speed row IS encoded.
 *                   Eligibility follows the vehicles actually selected.
 *
 *   ROCKETS         Height and liftoff mass are metres and kilograms
 *                   throughout, but thrust mixes kN and MN.
 */

const MIXED_SPEED = `${ROUTES.compare}?category=aircraft&vehicles=f-15-eagle,f-22-raptor,sr-71-blackbird`;
const SAME_SPEED = `${ROUTES.compare}?category=aircraft&vehicles=f-22-raptor,f-35-lightning-ii,sr-71-blackbird`;
const ROCKETS = `${ROUTES.compare}?category=rockets&vehicles=falcon-9,falcon-heavy,saturn-v`;

const FILL = ".orbix-magnitude__fill";

function row(page: import("@playwright/test").Page, id: string) {
  return page.locator(`tr[data-row-id="${id}"]`);
}

/** Rendered fill widths for a row, left to right. */
async function fillWidths(
  page: import("@playwright/test").Page,
  id: string,
): Promise<number[]> {
  return page.evaluate((rowId) => {
    const target = document.querySelector(`tr[data-row-id="${rowId}"]`);
    return [...(target?.querySelectorAll(".orbix-magnitude__fill") ?? [])].map(
      (node) => node.getBoundingClientRect().width,
    );
  }, id);
}

/**
 * Fill widths once layout has actually resolved them.
 *
 * Waiting on element count is not enough: the tracks are server-rendered, so
 * they exist in the DOM the moment the HTML parses — before the stylesheet
 * that gives them width has applied. Polling on the count therefore returns a
 * row of zero-width elements. The condition that matters is geometric, so this
 * waits for the longest track in the row to have real width.
 */
async function settledFillWidths(
  page: import("@playwright/test").Page,
  id: string,
  expectedCount: number,
): Promise<number[]> {
  await expect
    .poll(async () => {
      const widths = await fillWidths(page, id);
      return widths.length === expectedCount ? Math.max(...widths) : 0;
    })
    .toBeGreaterThan(0);

  return fillWidths(page, id);
}

test.describe("Compare magnitude encoding", () => {
  test.skip(
    () => test.info().project.name !== "desktop",
    "Encoding is viewport-independent; the containment test below sets its own viewport.",
  );

  test("a mixed-unit speed row renders no tracks and keeps its published text", async ({
    page,
  }) => {
    await page.goto(MIXED_SPEED, { waitUntil: "domcontentloaded" });

    await expect(row(page, "speed").locator(FILL)).toHaveCount(0);

    // The numbers themselves are untouched, in their own source units.
    await expect(row(page, "speed")).toContainText("1,875 mph");
    await expect(row(page, "speed")).toContainText("Mach 2");
    await expect(row(page, "speed")).toContainText("Mach 3");
  });

  test("a comparable row in that same comparison is still encoded", async ({
    page,
  }) => {
    // Rejection is per row. If this were a blanket switch, a single awkward
    // row would silently strip encoding from every honest one beside it.
    await page.goto(MIXED_SPEED, { waitUntil: "domcontentloaded" });

    await expect(row(page, "ceiling").locator(FILL)).toHaveCount(3);
  });

  test("speed becomes eligible when every selected aircraft publishes Mach", async ({
    page,
  }) => {
    await page.goto(SAME_SPEED, { waitUntil: "domcontentloaded" });

    await expect(row(page, "speed").locator(FILL)).toHaveCount(3);
  });

  test("the largest aircraft value has the longest track", async ({ page }) => {
    await page.goto(MIXED_SPEED, { waitUntil: "domcontentloaded" });

    // Ceilings are 65,000 / 50,000 / 85,000 ft. Relational, not pixel-exact:
    // the contract is ordering and proportion, not a layout constant.
    const widths = await settledFillWidths(page, "ceiling", 3);

    expect(widths[2]).toBeGreaterThan(widths[0] ?? 0);
    expect(widths[0]).toBeGreaterThan(widths[1] ?? 0);
  });

  test("equal aircraft values produce equal tracks", async ({ page }) => {
    await page.goto(SAME_SPEED, { waitUntil: "domcontentloaded" });

    // The F-22 and F-35 both list a 50,000 ft ceiling; the SR-71 lists 85,000.
    const widths = await settledFillWidths(page, "ceiling", 3);

    expect(Math.abs((widths[0] ?? 0) - (widths[1] ?? 0))).toBeLessThan(1);
    expect(widths[2]).toBeGreaterThan(widths[0] ?? 0);
  });

  test("rocket height and mass are encoded while mixed-unit thrust is not", async ({
    page,
  }) => {
    await page.goto(ROCKETS, { waitUntil: "domcontentloaded" });

    await expect(row(page, "height").locator(FILL)).toHaveCount(3);
    await expect(row(page, "mass").locator(FILL)).toHaveCount(3);
    // Falcon 9 and Falcon Heavy publish kN; Saturn V publishes MN.
    await expect(row(page, "thrust").locator(FILL)).toHaveCount(0);
  });

  test("the largest rocket value has the longest track", async ({ page }) => {
    await page.goto(ROCKETS, { waitUntil: "domcontentloaded" });

    // Liftoff mass: 549,054 / 1,420,788 / 2,800,000 kg — strictly increasing.
    const widths = await settledFillWidths(page, "mass", 3);

    expect(widths[1]).toBeGreaterThan(widths[0] ?? 0);
    expect(widths[2]).toBeGreaterThan(widths[1] ?? 0);
  });

  test("qualitative and composite rows are never encoded", async ({ page }) => {
    await page.goto(ROCKETS, { waitUntil: "domcontentloaded" });

    for (const id of [
      "manufacturer",
      "first-flight",
      "stages",
      "payload-capability",
      "orbit-capability",
    ]) {
      await expect(
        row(page, id).locator(FILL),
        `${id} must remain text only`,
      ).toHaveCount(0);
    }
  });

  test("tracks are hidden from assistive technology and carry no ranking text", async ({
    page,
  }) => {
    await page.goto(ROCKETS, { waitUntil: "domcontentloaded" });

    const tracks = page.locator(".orbix-magnitude");
    expect(await tracks.count()).toBeGreaterThan(0);

    // The published figure is the accessible value; a normalized fraction is
    // an artefact of this layout, so it is never announced.
    const exposed = await page.evaluate(
      () =>
        [...document.querySelectorAll(".orbix-magnitude")].filter(
          (node) => node.getAttribute("aria-hidden") !== "true",
        ).length,
    );
    expect(exposed).toBe(0);

    // No winner, best, rank or medal semantics anywhere in the matrix.
    const matrix = (await page.locator("table").innerText()).toLowerCase();
    for (const word of ["winner", "best", "rank", "fastest", "biggest"]) {
      expect(matrix, `the matrix must not claim a ${word}`).not.toContain(word);
    }
  });

  test("every encoded cell still shows its published value as text", async ({
    page,
  }) => {
    await page.goto(ROCKETS, { waitUntil: "domcontentloaded" });

    const blank = await page.evaluate(
      () =>
        [...document.querySelectorAll(".orbix-magnitude")].filter(
          (node) => (node.closest("td")?.innerText ?? "").trim() === "",
        ).length,
    );

    expect(blank, "a track must never be the only content of a cell").toBe(0);
  });

  test("tracks stay inside the scroll region on a phone viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto(ROCKETS, { waitUntil: "domcontentloaded" });

    await expect
      .poll(async () =>
        page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth + 1,
        ),
      )
      .toBe(false);

    // The matrix is a horizontal scroller, so a track being outside the
    // viewport is expected. What must not happen is a track escaping the cell
    // it belongs to and overlapping the column beside it.
    const escaping = await page.evaluate(
      () =>
        [...document.querySelectorAll(".orbix-magnitude")].filter((node) => {
          const cell = node.closest("td");
          if (!cell) return true;
          return (
            node.getBoundingClientRect().right >
            cell.getBoundingClientRect().right + 1
          );
        }).length,
    );

    expect(escaping).toBe(0);
  });
});
