import { describe, expect, it } from "vitest";

import {
  altitudeReadout,
  formatLabAltitude,
  formatLabValue,
} from "./format-lab-value";

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

describe("altitude readouts", () => {
  it("reports altitudes of 1 km or more in kilometers", () => {
    expect(altitudeReadout(408_000)).toEqual({ unit: "km", value: 408 });
    expect(formatLabAltitude(200_000)).toBe("200 km");
    expect(formatLabAltitude(35_786_000)).toBe("35,786 km");
  });

  it("keeps meters below 1 km and passes undefined through", () => {
    expect(formatLabAltitude(850)).toBe("850 m");
    expect(altitudeReadout(undefined)).toEqual({
      unit: "m",
      value: undefined,
    });
  });
});
