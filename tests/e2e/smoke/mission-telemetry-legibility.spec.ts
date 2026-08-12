import { expect, ROUTES, test } from "../fixtures/orbix";

/**
 * Mission Control telemetry row legibility.
 *
 * ## Why this contract has four parts
 *
 * The label/value collision in the telemetry grid survived three separate
 * measurements, each of which was individually reasonable and individually
 * blind:
 *
 *   box intersection only   Returned zero. The boxes genuinely do not
 *                           intersect — the label's TEXT paints outside its
 *                           own box while the box stays put. The defect was
 *                           reported and withdrawn on this evidence.
 *
 *   label spill only        Passed a fix that gave the label `min-w-0` and
 *                           `break-words`, which cleared the overflow by
 *                           breaking the label one character per line:
 *                           I / N / I / T / I / A / L.
 *
 *   label spill only again  Passed a second fix that put a floor under the
 *                           label column, after which the VALUE overlapped the
 *                           label: "INIT200,000.00".
 *
 * So a row is only legible when all of the following hold at once, and this
 * test asserts them together rather than one at a time.
 *
 * ## Visually hidden content is excluded
 *
 * An `sr-only` element is clipped to a 1px box, so `scrollWidth - clientWidth`
 * is enormous by construction. The status bar's screen-reader-only `<dt>`
 * reported a 204px "spill" and is not a defect. Accessibility-only text is
 * never a visual collision, so anything rendering at 1px or less is filtered
 * out before measurement.
 *
 * ## Deliberate truncation is a different defect, and not this one
 *
 * `StatusBarItem` and two other components clip their values with
 * `truncate` (overflow hidden plus an ellipsis). That also makes
 * `scrollWidth > clientWidth`, but the text is cut off cleanly rather than
 * painted over its neighbour, and it is a deliberate pattern. Measuring it as
 * a collision would conflate two different problems, so value overflow is
 * recorded and reported but not asserted here. The owners are
 * `mission-control-status-bar.tsx`, `mission-replay.tsx` (`ReplayTelemetry`)
 * and `mission-3d-scene.tsx`; whether those values should wrap instead of
 * truncate is a separate question from this fix.
 *
 * ## Character-per-line wrapping
 *
 * Bounding boxes cannot see this: a label broken one letter per line fits its
 * box perfectly. It is caught structurally instead, by measuring how many
 * lines a multi-word label occupies against how many words it has. A label
 * wrapping at word boundaries can never need more lines than it has words.
 */

const VIEWPORTS = [1440, 1280, 1024, 768, 390, 320] as const;

async function openReplay(page: import("@playwright/test").Page) {
  await page.goto(`${ROUTES.engineeringLab}#mission-control-dashboard`, {
    waitUntil: "domcontentloaded",
  });

  const skip = page.getByRole("button", {
    name: "Skip Mission Control startup",
  });
  if (await skip.isVisible({ timeout: 15_000 }).catch(() => false)) {
    await skip.click().catch(() => {});
  }
  await expect(skip).toBeHidden();

  await page.getByRole("tab", { name: "Replay" }).click();
  await expect(
    page.getByRole("button", { name: "Play mission replay" }),
  ).toBeVisible();
}

interface RowViolation {
  readonly kind: string;
  readonly label: string;
  readonly detail: number;
}

/** Every way a telemetry row can be illegible, measured in one pass. */
async function rowViolations(
  page: import("@playwright/test").Page,
): Promise<RowViolation[]> {
  return page.evaluate(() => {
    const rendered = (node: Element) => {
      const box = node.getBoundingClientRect();
      // Filters sr-only and other 1px accessibility clips.
      if (box.width <= 1 || box.height <= 1) return false;
      const style = getComputedStyle(node);
      return style.display !== "none" && style.visibility !== "hidden";
    };

    const violations: { kind: string; label: string; detail: number }[] = [];

    for (const label of [...document.querySelectorAll("dt")]) {
      const value = label.nextElementSibling;
      if (!value || !rendered(label) || !rendered(value)) continue;

      const text = (label.textContent ?? "").trim();
      const labelBox = label.getBoundingClientRect();
      const valueBox = value.getBoundingClientRect();

      // A. the label's text must fit the box it was given
      const labelSpill = label.scrollWidth - label.clientWidth;
      if (labelSpill > 1) {
        violations.push({
          detail: labelSpill,
          kind: "label-spill",
          label: text,
        });
      }

      // B. the value's text must fit its own box, UNLESS it is deliberately
      // clipped with an ellipsis — see the note above.
      const valueSpill = value.scrollWidth - value.clientWidth;
      const clipped = [value, ...value.querySelectorAll("*")].some((node) => {
        const style = getComputedStyle(node);
        return (
          style.textOverflow === "ellipsis" && style.overflow !== "visible"
        );
      });
      if (valueSpill > 1 && !clipped) {
        violations.push({
          detail: valueSpill,
          kind: "value-spill",
          label: text,
        });
      }

      // C. the two rendered regions must not intersect
      const overlapX =
        Math.min(labelBox.right, valueBox.right) -
        Math.max(labelBox.left, valueBox.left);
      const overlapY =
        Math.min(labelBox.bottom, valueBox.bottom) -
        Math.max(labelBox.top, valueBox.top);
      if (overlapX > 1 && overlapY > 1) {
        violations.push({
          detail: Math.round(overlapX),
          kind: "label-value-overlap",
          label: text,
        });
      }

      // D. neither may escape the row that contains them
      const row = label.parentElement;
      if (row) {
        const rowBox = row.getBoundingClientRect();
        const escape = Math.max(
          labelBox.right - rowBox.right,
          valueBox.right - rowBox.right,
          rowBox.left - labelBox.left,
          rowBox.left - valueBox.left,
        );
        if (escape > 1) {
          violations.push({
            detail: Math.round(escape),
            kind: "row-escape",
            label: text,
          });
        }
      }

      // F. a multi-word label may never need more lines than it has words.
      // Character-per-line wrapping fits its box perfectly, so geometry alone
      // cannot see it; line count against word count can.
      const words = text.split(/\s+/).filter(Boolean).length;
      const lineHeight = Number.parseFloat(getComputedStyle(label).lineHeight);
      if (words > 0 && Number.isFinite(lineHeight) && lineHeight > 0) {
        const lines = Math.round(labelBox.height / lineHeight);
        if (lines > words) {
          violations.push({
            detail: lines,
            kind: "character-wrap",
            label: text,
          });
        }
      }
    }

    return violations;
  });
}

test.describe("Mission Control telemetry legibility", () => {
  test.skip(
    () => test.info().project.name !== "desktop",
    "This case sweeps every viewport itself.",
  );

  test("telemetry rows stay legible at every width", async ({ page }) => {
    await openReplay(page);

    for (const width of VIEWPORTS) {
      await page.setViewportSize({ height: 900, width });

      await expect
        .poll(
          async () =>
            (await rowViolations(page)).map(
              (violation) =>
                `${violation.kind}:${violation.label}(${violation.detail})`,
            ),
          { timeout: 15_000 },
        )
        .toEqual([]);
    }
  });

  test("the replay view never scrolls the page sideways", async ({ page }) => {
    await openReplay(page);

    for (const width of VIEWPORTS) {
      await page.setViewportSize({ height: 900, width });
      await expect
        .poll(async () =>
          page.evaluate(
            () => document.documentElement.scrollWidth > window.innerWidth + 1,
          ),
        )
        .toBe(false);
    }
  });
});
