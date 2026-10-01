import { describe, expect, it } from "vitest";

import { formatIndexNumber } from "@/components/ui/section-index";

describe("formatIndexNumber", () => {
  it("pads to two digits", () => {
    expect(formatIndexNumber(1)).toBe("01");
    expect(formatIndexNumber(6)).toBe("06");
    expect(formatIndexNumber(12)).toBe("12");
  });
});
