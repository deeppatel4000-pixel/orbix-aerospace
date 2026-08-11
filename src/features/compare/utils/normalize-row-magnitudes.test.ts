import { describe, expect, it } from "vitest";

import { getComparisonResult } from "@/features/compare/data";
import type { ComparisonCellValue } from "@/features/compare/types";
import { normalizeRowMagnitudes } from "@/features/compare/utils/normalize-row-magnitudes";

/**
 * These tests pin the honesty rules, not the visual result.
 *
 * The dangerous failure this phase can produce is not a bar of the wrong
 * length — it is a bar that appears at all next to values that were never
 * comparable. Most of what follows therefore asserts that a row is REJECTED.
 */

function cell(
  value: string,
  magnitude?: ComparisonCellValue["magnitude"],
): ComparisonCellValue {
  return { magnitude, status: "available", value };
}

const missing: ComparisonCellValue = {
  status: "unavailable",
  value: "Unavailable",
};

describe("normalizeRowMagnitudes", () => {
  it("normalizes the largest value to a full track", () => {
    const result = normalizeRowMagnitudes([
      cell("50,000 ft", { unit: "ft", value: 50000 }),
      cell("85,000 ft", { unit: "ft", value: 85000 }),
    ]);

    expect(result).toEqual([50000 / 85000, 1]);
  });

  it("gives equal values equal tracks", () => {
    const result = normalizeRowMagnitudes([
      cell("50,000 ft", { unit: "ft", value: 50000 }),
      cell("50,000 ft", { unit: "ft", value: 50000 }),
    ]);

    expect(result).toEqual([1, 1]);
  });

  it("keeps a smaller value proportionally smaller", () => {
    const result = normalizeRowMagnitudes([
      cell("25 m", { unit: "m", value: 25 }),
      cell("100 m", { unit: "m", value: 100 }),
    ]);

    expect(result?.[0]).toBeLessThan(result?.[1] ?? 0);
    expect(result?.[0]).toBeCloseTo(0.25, 10);
  });

  it("renders a genuine zero as an empty track rather than omitting it", () => {
    const result = normalizeRowMagnitudes([
      cell("0 kg", { unit: "kg", value: 0 }),
      cell("500 kg", { unit: "kg", value: 500 }),
    ]);

    expect(result).toEqual([0, 1]);
  });

  it("excludes unavailable cells from the denominator and gives them no track", () => {
    const result = normalizeRowMagnitudes([
      cell("40 m", { unit: "m", value: 40 }),
      missing,
      cell("80 m", { unit: "m", value: 80 }),
    ]);

    // The unavailable cell neither renders a bar nor drags the scale: 80 is
    // still the maximum, so 40 is still exactly half.
    expect(result).toEqual([0.5, null, 1]);
  });

  it("rejects the row when present units differ", () => {
    // The known-unsafe case, in miniature.
    expect(
      normalizeRowMagnitudes([
        cell("1,875 mph", { unit: "mph", value: 1875 }),
        cell("Mach 2", { unit: "Mach", value: 2 }),
      ]),
    ).toBeNull();
  });

  it("rejects the row when a present value carries no magnitude", () => {
    // An uninstrumented present value is not the same as a missing one: the
    // reader can see a number, so bars beside it would invite a comparison
    // that has no basis.
    expect(
      normalizeRowMagnitudes([
        cell("70 m", { unit: "m", value: 70 }),
        cell("Length: 69 ft"),
      ]),
    ).toBeNull();
  });

  it("rejects non-finite magnitudes", () => {
    for (const value of [Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(
        normalizeRowMagnitudes([
          cell("70 m", { unit: "m", value: 70 }),
          cell("broken", { unit: "m", value }),
        ]),
      ).toBeNull();
    }
  });

  it("rejects negative magnitudes rather than encoding them as length", () => {
    // Phase 3B policy: no comparison row in the dataset is signed, so a
    // negative value means an assumption broke. Failing closed is safe.
    expect(
      normalizeRowMagnitudes([
        cell("70 m", { unit: "m", value: 70 }),
        cell("-5 m", { unit: "m", value: -5 }),
      ]),
    ).toBeNull();
  });

  it("rejects a row where every present value is zero", () => {
    // There is no scale to normalize against, and dividing would yield NaN.
    expect(
      normalizeRowMagnitudes([
        cell("0 kg", { unit: "kg", value: 0 }),
        cell("0 kg", { unit: "kg", value: 0 }),
      ]),
    ).toBeNull();
  });

  it("rejects a row with fewer than two present values", () => {
    expect(
      normalizeRowMagnitudes([cell("70 m", { unit: "m", value: 70 }), missing]),
    ).toBeNull();
    expect(normalizeRowMagnitudes([])).toBeNull();
  });
});

describe("comparison magnitude eligibility against the real dataset", () => {
  // Goes through the real repository path the page uses, so these assertions
  // are about shipped data rather than a fixture that could drift from it.
  function rowsOf(ids: readonly string[]) {
    const result = getComparisonResult("aircraft", ids);
    return new Map(result.rows.map((row) => [row.id, row]));
  }

  it("leaves the mixed-unit speed row unencoded and its text untouched", () => {
    // The F-15 publishes 1,875 mph; the F-22 publishes Mach 2. These are the
    // real records, not fixtures.
    const rows = rowsOf(["f-15-eagle", "f-22-raptor"]);
    const speed = rows.get("speed");

    expect(speed).toBeDefined();
    expect(normalizeRowMagnitudes(speed?.cells ?? [])).toBeNull();

    const values = (speed?.cells ?? []).map((entry) => entry.value);
    expect(values).toContain("1,875 mph");
    expect(values.some((value) => value.startsWith("Mach"))).toBe(true);
  });

  it("encodes the ceiling row, which is feet for every aircraft", () => {
    const rows = rowsOf(["f-15-eagle", "f-22-raptor", "sr-71-blackbird"]);
    const magnitudes = normalizeRowMagnitudes(rows.get("ceiling")?.cells ?? []);

    // 65,000 / 50,000 / 85,000 ft — the SR-71 is the scale.
    expect(magnitudes).not.toBeNull();
    expect(magnitudes?.[2]).toBe(1);
    expect(magnitudes?.[1]).toBeLessThan(magnitudes?.[0] ?? 0);
  });

  it("leaves qualitative and composite rows unencoded", () => {
    const rows = rowsOf(["f-15-eagle", "f-22-raptor"]);

    for (const id of [
      "manufacturer",
      "role",
      "first-flight",
      "propulsion",
      "dimensions",
      "weight",
    ]) {
      expect(
        normalizeRowMagnitudes(rows.get(id)?.cells ?? []),
        `${id} must remain text only`,
      ).toBeNull();
    }
  });
});
