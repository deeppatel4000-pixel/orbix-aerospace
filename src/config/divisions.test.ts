import { describe, expect, it } from "vitest";

import {
  DEFAULT_DIVISION,
  resolveDivision,
  type OrbixDivision,
} from "@/config/divisions";
import { navigationItems } from "@/config/navigation";

describe("resolveDivision", () => {
  it("maps each primary route to its division", () => {
    const expected: ReadonlyArray<readonly [string, OrbixDivision]> = [
      ["/", "space"],
      ["/aircraft", "aircraft"],
      ["/rockets", "space"],
      ["/compare", "engineering"],
      ["/engineering-lab", "engineering"],
      ["/learn", "research"],
      ["/showcase", "space"],
    ];

    for (const [pathname, division] of expected) {
      expect(resolveDivision(pathname), pathname).toBe(division);
    }
  });

  it("inherits the division on nested vehicle profiles", () => {
    // Profiles have no rule of their own; they resolve through the section
    // prefix, so adding a vehicle never requires touching this table.
    expect(resolveDivision("/aircraft/f-22-raptor")).toBe("aircraft");
    expect(resolveDivision("/rockets/saturn-v")).toBe("space");
  });

  it("matches whole segments, not bare string prefixes", () => {
    // `/learning` must NOT resolve through `/learn`.
    expect(resolveDivision("/learning")).toBe(DEFAULT_DIVISION);
    expect(resolveDivision("/aircraft-registry")).toBe(DEFAULT_DIVISION);
  });

  it("falls back to the default division for unknown routes", () => {
    expect(resolveDivision("/not-a-real-route")).toBe(DEFAULT_DIVISION);
    expect(resolveDivision("/")).toBe(DEFAULT_DIVISION);
  });

  it("resolves every navigation destination to a known division", () => {
    // Guards against a nav entry being added without a division rule, which
    // would silently fall back to the default rather than failing loudly.
    const known: readonly OrbixDivision[] = [
      "aircraft",
      "defense",
      "engineering",
      "research",
      "space",
    ];

    for (const item of navigationItems) {
      expect(known, item.href).toContain(resolveDivision(item.href));
    }
  });

  it("prefers the longest matching prefix", () => {
    // `/engineering-lab` must not be shadowed by a shorter rule, and adding
    // a longer, more specific rule later must be able to win.
    expect(resolveDivision("/engineering-lab/tools")).toBe("engineering");
  });
});
