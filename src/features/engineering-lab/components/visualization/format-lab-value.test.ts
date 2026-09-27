import { describe, expect, it } from "vitest";

import { formatLabValue } from "./format-lab-value";

describe("formatLabValue", () => {
  it("keeps small non-zero values visible", () => {
    expect(formatLabValue(0.001)).toBe("0.001");
    expect(formatLabValue(0.0012345)).toBe("0.00123");
    expect(formatLabValue(-0.25)).toBe("-0.25");
  });

  it("uses two decimal places for ordinary magnitudes", () => {
    expect(formatLabValue(0)).toBe("0");
    expect(formatLabValue(1234.567)).toBe("1,234.57");
    expect(formatLabValue(3)).toBe("3");
  });
});
