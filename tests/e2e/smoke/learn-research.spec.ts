import { expect, ROUTES, test } from "../fixtures/orbix";

/**
 * Learn research layout (Phase 6A).
 *
 * The dataset itself is frozen by `learning-areas.test.ts`; this covers what
 * only a browser can see — that the redesigned pathway records stay inside the
 * viewport, that the research division and heading structure survive, and that
 * no link ends up nested inside another control.
 *
 * ## Why the containment check is built the way it is
 *
 * It took three wrong instruments to measure this honestly, and each failure is
 * worth recording because each looked reasonable:
 *
 *   measured too early    The first version read geometry straight after
 *                         `domcontentloaded`, before the stylesheet applied.
 *                         Every section reported its unstyled block width, so a
 *                         deliberately 960px-wide pathway looked fine. The test
 *                         completed in 396ms.
 *
 *   polled a negative     `expect.poll(...).toBe(false)` reads as a wait and
 *                         behaves as an instant pass: a poll is satisfied by its
 *                         FIRST matching sample, and "is the document
 *                         overflowing?" is false before layout exists.
 *
 *   readiness on a zero   A later readiness probe sampled the first pathway's
 *                         `padding-top`. That pathway carries `first:pt-0`, so
 *                         its zero padding is by design and could never signal
 *                         that CSS had arrived. Its timeout was then mistaken
 *                         for the geometry assertion catching a defect.
 *
 * So: readiness and containment are separate, separately named assertions; all
 * geometry comes from ONE helper in ONE `page.evaluate`; and the helper is
 * itself under test — `the containment helper detects an injected overflow`
 * injects a real defect with `addStyleTag` and proves the same violation
 * function that guards production actually catches it.
 */

const MOBILE_WIDTHS = [390, 320] as const;

interface PathwayGeometry {
  readonly id: string;
  readonly left: number;
  readonly right: number;
  readonly width: number;
  readonly parentLeft: number;
  readonly parentRight: number;
  readonly display: string;
  readonly visibility: string;
  readonly overflowX: string;
  readonly hidden: boolean;
  readonly overflowLeft: number;
  readonly overflowRight: number;
}

interface LearnGeometry {
  readonly innerWidth: number;
  readonly clientWidth: number;
  readonly documentScrollWidth: number;
  readonly bodyScrollWidth: number;
  readonly pathways: readonly PathwayGeometry[];
}

/**
 * Every containment number this file uses, read in one pass so the diagnostic
 * and the assertion can never disagree about what was on screen.
 */
async function collectGeometry(
  page: import("@playwright/test").Page,
): Promise<LearnGeometry> {
  return page.evaluate(() => {
    const documentElement = document.documentElement;

    const pathways = [...document.querySelectorAll("section[id]")].map(
      (node) => {
        const box = node.getBoundingClientRect();
        const style = getComputedStyle(node);
        const parentBox = (
          node.parentElement ?? documentElement
        ).getBoundingClientRect();

        return {
          display: style.display,
          hidden: box.width <= 1 || box.height <= 1,
          id: node.id,
          left: Math.round(box.left),
          overflowLeft: Math.round(0 - box.left),
          overflowRight: Math.round(box.right - window.innerWidth),
          overflowX: style.overflowX,
          parentLeft: Math.round(parentBox.left),
          parentRight: Math.round(parentBox.right),
          right: Math.round(box.right),
          visibility: style.visibility,
          width: Math.round(box.width),
        };
      },
    );

    return {
      bodyScrollWidth: document.body.scrollWidth,
      clientWidth: documentElement.clientWidth,
      documentScrollWidth: documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      pathways,
    };
  });
}

/**
 * Containment violations derived from a geometry reading. Pure, so the same
 * function judges the production layout and the injected-defect self-test.
 *
 * 1px of tolerance for subpixel rounding and no more — a real overflow here is
 * hundreds of pixels.
 */
function containmentViolations(geometry: LearnGeometry): string[] {
  const violations: string[] = [];

  for (const pathway of geometry.pathways) {
    if (pathway.hidden) continue;

    if (pathway.left < -1) {
      violations.push(`${pathway.id}: left ${pathway.left} < 0`);
    }
    if (pathway.overflowRight > 1) {
      violations.push(
        `${pathway.id}: right ${pathway.right} exceeds viewport ${geometry.innerWidth} by ${pathway.overflowRight}`,
      );
    }
    if (pathway.width > geometry.innerWidth + 1) {
      violations.push(
        `${pathway.id}: width ${pathway.width} exceeds viewport ${geometry.innerWidth}`,
      );
    }
  }

  if (geometry.documentScrollWidth > geometry.clientWidth + 1) {
    violations.push(
      `document scrolls sideways: scrollWidth ${geometry.documentScrollWidth} vs clientWidth ${geometry.clientWidth}`,
    );
  }

  return violations;
}

/**
 * Positive readiness: the real content is present and the stylesheet is in
 * effect. Never a negative poll, and never a property that is legitimately
 * zero.
 */
async function waitForStyledLearn(page: import("@playwright/test").Page) {
  await page.waitForLoadState("load");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("section[id]")).toHaveCount(6);

  await expect
    .poll(async () =>
      page.evaluate(() => {
        // `.orbix-section` takes its padding from a design token, so a
        // non-zero value proves the stylesheet arrived.
        const wrapper = document.querySelector(".orbix-section");
        if (!wrapper) return 0;
        return Number.parseFloat(getComputedStyle(wrapper).paddingBlockStart);
      }),
    )
    .toBeGreaterThan(0);

  // Two frames, so the measurement runs after layout has settled rather than
  // after an arbitrary delay.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
  );
}

test.describe("Learn research layout", () => {
  test.skip(
    () => test.info().project.name !== "desktop",
    "This case sets its own viewports.",
  );

  for (const width of MOBILE_WIDTHS) {
    test(`every pathway record stays inside a ${width}px viewport`, async ({
      page,
    }) => {
      await page.setViewportSize({ height: 844, width });
      await page.goto(ROUTES.learn, { waitUntil: "domcontentloaded" });
      await waitForStyledLearn(page);

      const geometry = await collectGeometry(page);

      // Attached so a failure shows exactly what was on screen, and can never
      // again be confused with a readiness timeout.
      await test.info().attach(`learn-geometry-${width}`, {
        body: JSON.stringify(geometry, null, 2),
        contentType: "application/json",
      });

      expect(geometry.pathways).toHaveLength(6);
      expect(containmentViolations(geometry)).toEqual([]);
    });
  }

  /**
   * The instrument's own test.
   *
   * A containment assertion that has never been shown to fail is not coverage.
   * This injects a real, unmistakable overflow into the live page with
   * `addStyleTag` — no production edit, no rebuild — then runs the SAME helper
   * and the SAME violation function that guard the tests above.
   */
  for (const width of MOBILE_WIDTHS) {
    test(`the containment helper detects an injected overflow at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ height: 844, width });
      await page.goto(ROUTES.learn, { waitUntil: "domcontentloaded" });
      await waitForStyledLearn(page);

      expect(containmentViolations(await collectGeometry(page))).toEqual([]);

      await page.addStyleTag({
        content: `.orbix-section section[id] { min-width: 60rem !important; }`,
      });
      await page.evaluate(
        () =>
          new Promise<void>((resolve) => {
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
          }),
      );

      const broken = await collectGeometry(page);
      await test.info().attach(`injected-overflow-${width}`, {
        body: JSON.stringify(broken, null, 2),
        contentType: "application/json",
      });

      // First prove the defect is genuinely on screen...
      const [firstPathway] = broken.pathways;
      expect(firstPathway?.width).toBeGreaterThan(900);
      expect(firstPathway?.overflowRight).toBeGreaterThan(100);

      // ...then prove the production assertion would have caught it.
      const violations = containmentViolations(broken);
      expect(violations.length).toBeGreaterThan(0);
      expect(violations.join(" | ")).toContain("exceeds viewport");
    });
  }

  test("the research division and heading structure survive the redesign", async ({
    page,
  }) => {
    await page.goto(ROUTES.learn, { waitUntil: "domcontentloaded" });

    await expect(page.locator("[data-orbix-division]").first()).toHaveAttribute(
      "data-orbix-division",
      "research",
    );
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);

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
