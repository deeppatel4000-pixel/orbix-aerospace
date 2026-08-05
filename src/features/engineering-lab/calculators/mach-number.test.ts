import { describe, expect, it } from "vitest";

import { calculateMachNumber, classifyMachNumber } from "./mach-number";

describe("calculateMachNumber", () => {
  it("calculates a Mach 1 transonic condition", () => {
    const result = calculateMachNumber({
      speedOfSoundMetersPerSecond: 340,
      velocityMetresPerSecond: 340,
    });

    expect(result.machNumber).toBe(1);
    expect(result.flowRegime).toBe("transonic");
  });

  it("calculates a supersonic condition", () => {
    const result = calculateMachNumber({
      speedOfSoundMetersPerSecond: 340,
      velocityMetresPerSecond: 680,
    });

    expect(result.machNumber).toBe(2);
    expect(result.flowRegime).toBe("supersonic");
  });

  it.each([
    ["negative velocity", -1],
    ["non-finite velocity", Number.NaN],
  ])("rejects %s", (_label, velocityMetresPerSecond) => {
    expect(() =>
      calculateMachNumber({
        speedOfSoundMetersPerSecond: 340,
        velocityMetresPerSecond,
      }),
    ).toThrowError(RangeError);
  });

  it.each([
    ["zero speed of sound", 0],
    ["negative speed of sound", -1],
    ["non-finite speed of sound", Number.POSITIVE_INFINITY],
  ])("rejects %s", (_label, speedOfSoundMetersPerSecond) => {
    expect(() =>
      calculateMachNumber({
        speedOfSoundMetersPerSecond,
        velocityMetresPerSecond: 340,
      }),
    ).toThrowError(RangeError);
  });
});

describe("classifyMachNumber", () => {
  it("applies the documented regime boundaries", () => {
    expect(classifyMachNumber(0)).toBe("subsonic");
    expect(classifyMachNumber(0.799)).toBe("subsonic");
    expect(classifyMachNumber(0.8)).toBe("transonic");
    expect(classifyMachNumber(1.199)).toBe("transonic");
    expect(classifyMachNumber(1.2)).toBe("supersonic");
    expect(classifyMachNumber(4.999)).toBe("supersonic");
    expect(classifyMachNumber(5)).toBe("hypersonic");
  });
});
