import { describe, expect, it } from "vitest";

import { toSentenceCase } from "./sentence-case";

describe("toSentenceCase", () => {
  it("uppercases only the first letter", () => {
    expect(toSentenceCase("above one")).toBe("Above one");
    expect(toSentenceCase("supersonic")).toBe("Supersonic");
  });

  it("returns an empty string unchanged", () => {
    expect(toSentenceCase("")).toBe("");
  });
});
