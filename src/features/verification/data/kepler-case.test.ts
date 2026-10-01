import { describe, expect, it } from "vitest";

import { calculateKeplerPosition } from "@/features/engineering-lab/calculators";
import { toDisplayRow } from "@/features/verification/lib/display";

import {
  keplerOutsideRoundingRowIds,
  keplerVerificationCase,
} from "./kepler-case";
import { verificationSources } from "./verification-cases";

/** Inputs typed out again, so an edited data file fails here. */
const fresh = calculateKeplerPosition({
  eccentricity: 0.1,
  elapsedTimeSeconds: 1_200,
  gravitationalParameter: 3.986005e14,
  initialTrueAnomalyRadians: Math.PI / 2,
  semiMajorAxisMetres: 7_500_000,
});

const expected: Record<string, number> = {
  "kepler-braeunig-4-14-eccentric-anomaly": fresh.eccentricAnomalyRadians,
  "kepler-braeunig-4-14-mean-anomaly": fresh.meanAnomalyRadians,
  "kepler-braeunig-4-14-true-anomaly": fresh.trueAnomalyRadians,
};

describe("Kepler verification case", () => {
  it("cites an existing source", () => {
    expect(verificationSources[keplerVerificationCase.sourceId].url).toMatch(
      /^https?:\/\//,
    );
  });

  it("uses the calculator output for every row", () => {
    expect(keplerVerificationCase.rows.map((row) => row.id).sort()).toEqual(
      Object.keys(expected).sort(),
    );
    for (const row of keplerVerificationCase.rows) {
      expect(row.orbix).toBe(expected[row.id]);
    }
  });

  it("marks exactly the rows outside rounding, and explains them", () => {
    const outside = keplerVerificationCase.rows
      .filter((row) => !toDisplayRow(row).withinRounding)
      .map((row) => row.id);
    expect(outside).toEqual([...keplerOutsideRoundingRowIds]);
    expect(keplerVerificationCase.notes.length).toBeGreaterThan(0);
  });

  it("agrees with the printed true anomaly in degrees (151.3)", () => {
    expect(
      Number(((fresh.trueAnomalyRadians * 180) / Math.PI).toFixed(1)),
    ).toBe(151.3);
  });
});
