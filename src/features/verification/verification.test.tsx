import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  calculateEscapeVelocity,
  calculateHohmannTransfer,
  calculateIsentropicFlow,
  calculateKeplerPosition,
  calculateNormalShock,
  calculateObliqueShock,
  calculateOrbitalPlaneChange,
  calculateRocketEquation,
  calculateStandardAtmosphere,
  calculateTotalPressureRecovery,
  calculateVisViva,
} from "@/features/engineering-lab/calculators";
import { VerificationPage } from "@/features/verification";
import {
  uncheckedCalculators,
  verificationGroups,
  verificationSources,
} from "@/features/verification/data/verification-cases";
import {
  decimalsForResolution,
  formatOrbixValue,
  formatPercentDifference,
  formatReferenceValue,
  isWithinReferenceRounding,
  percentDifference,
} from "@/features/verification/lib/compare";
import {
  OUTSIDE_ROUNDING_LABEL,
  summarizeVerification,
  toDisplayRow,
  WITHIN_ROUNDING_LABEL,
} from "@/features/verification/lib/display";

const GM = 3.986005e14;

const atmosphere = (altitudeMetres: number) =>
  calculateStandardAtmosphere({ altitudeMetres });

/**
 * Independent calculator calls with the source inputs typed out again, so a
 * value edited by hand in the data file would fail here.
 */
const expectedOrbix: Record<string, () => number> = {
  "atmosphere-1000-density": () =>
    atmosphere(1_000).densityKilogramsPerCubicMetre,
  "atmosphere-1000-pressure": () => atmosphere(1_000).pressurePascals,
  "atmosphere-1000-temperature": () => atmosphere(1_000).temperatureKelvin,
  "atmosphere-5000-density": () =>
    atmosphere(5_000).densityKilogramsPerCubicMetre,
  "atmosphere-5000-pressure": () => atmosphere(5_000).pressurePascals,
  "atmosphere-5000-temperature": () => atmosphere(5_000).temperatureKelvin,
  "atmosphere-11000-density": () =>
    atmosphere(11_000).densityKilogramsPerCubicMetre,
  "atmosphere-11000-pressure": () => atmosphere(11_000).pressurePascals,
  "atmosphere-11000-temperature": () => atmosphere(11_000).temperatureKelvin,
  "atmosphere-11000-geometric-density": () =>
    atmosphere(11_000).densityKilogramsPerCubicMetre,
  "atmosphere-11000-geometric-pressure": () =>
    atmosphere(11_000).pressurePascals,
  "atmosphere-11000-geometric-temperature": () =>
    atmosphere(11_000).temperatureKelvin,
  "escape-200km-velocity": () =>
    calculateEscapeVelocity({
      gravitationalParameter: GM,
      orbitalRadiusMetres: 6_578_140,
    }).escapeVelocityMetresPerSecond,
  "hohmann-leo-geo-first-burn": () =>
    calculateHohmannTransfer({
      finalOrbitRadiusMetres: 42_164_170,
      gravitationalParameter: GM,
      initialOrbitRadiusMetres: 6_578_140,
    }).firstBurnDeltaVMetresPerSecond,
  "hohmann-leo-geo-second-burn": () =>
    calculateHohmannTransfer({
      finalOrbitRadiusMetres: 42_164_170,
      gravitationalParameter: GM,
      initialOrbitRadiusMetres: 6_578_140,
    }).secondBurnDeltaVMetresPerSecond,
  "hohmann-leo-geo-total": () =>
    calculateHohmannTransfer({
      finalOrbitRadiusMetres: 42_164_170,
      gravitationalParameter: GM,
      initialOrbitRadiusMetres: 6_578_140,
    }).totalDeltaVMetresPerSecond,
  "isentropic-m2-density": () =>
    1 / calculateIsentropicFlow({ machNumber: 2 }).densityRatio,
  "isentropic-m2-pressure": () =>
    1 / calculateIsentropicFlow({ machNumber: 2 }).pressureRatio,
  "isentropic-m2-temperature": () =>
    1 / calculateIsentropicFlow({ machNumber: 2 }).temperatureRatio,
  "normal-shock-m2-density": () =>
    calculateNormalShock({ machNumber: 2 }).densityRatio,
  "normal-shock-m2-downstream-mach": () =>
    calculateNormalShock({ machNumber: 2 }).downstreamMach,
  "normal-shock-m2-pressure": () =>
    calculateNormalShock({ machNumber: 2 }).pressureRatio,
  "normal-shock-m2-temperature": () =>
    calculateNormalShock({ machNumber: 2 }).temperatureRatio,
  "oblique-shock-m3-downstream-mach": () =>
    calculateObliqueShock({ deflectionAngleDegrees: 12.7, machNumber: 3 })
      .downstreamMach,
  "oblique-shock-m3-shock-angle": () =>
    calculateObliqueShock({ deflectionAngleDegrees: 12.7, machNumber: 3 })
      .shockAngleDegrees,
  "plane-change-8deg-delta-v": () =>
    calculateOrbitalPlaneChange({
      inclinationChangeDegrees: 8,
      orbitalVelocityMetresPerSecond: 7_558,
    }).deltaVMetresPerSecond,
  "rocket-two-stage-stage-one": () =>
    calculateRocketEquation({
      finalMassKg: 45_000,
      initialMassKg: 165_000,
      specificImpulseSeconds: 260,
    }).deltaVMetresPerSecond,
  "rocket-two-stage-stage-two": () =>
    calculateRocketEquation({
      finalMassKg: 6_000,
      initialMassKg: 36_000,
      specificImpulseSeconds: 320,
    }).deltaVMetresPerSecond,
  "rocket-two-stage-total": () =>
    calculateRocketEquation({
      finalMassKg: 45_000,
      initialMassKg: 165_000,
      specificImpulseSeconds: 260,
    }).deltaVMetresPerSecond +
    calculateRocketEquation({
      finalMassKg: 6_000,
      initialMassKg: 36_000,
      specificImpulseSeconds: 320,
    }).deltaVMetresPerSecond,
  "total-pressure-recovery-m2-ratio": () =>
    calculateTotalPressureRecovery({ machNumber: 2 }).pressureRecoveryRatio,
  "vis-viva-apogee": () =>
    calculateVisViva({
      gravitationalParameter: GM,
      orbitalRadiusMetres: 6_878_140,
      semiMajorAxisMetres: 6_753_140,
    }).orbitalVelocityMetresPerSecond,
  "vis-viva-circular": () =>
    calculateVisViva({
      gravitationalParameter: GM,
      orbitalRadiusMetres: 6_578_140,
      semiMajorAxisMetres: 6_578_140,
    }).orbitalVelocityMetresPerSecond,
  "vis-viva-perigee": () =>
    calculateVisViva({
      gravitationalParameter: GM,
      orbitalRadiusMetres: 6_628_140,
      semiMajorAxisMetres: 6_753_140,
    }).orbitalVelocityMetresPerSecond,
};

const kepler = calculateKeplerPosition({
  eccentricity: 0.1,
  elapsedTimeSeconds: 1_200,
  gravitationalParameter: GM,
  initialTrueAnomalyRadians: Math.PI / 2,
  semiMajorAxisMetres: 7_500_000,
});

expectedOrbix["kepler-braeunig-4-14-mean-anomaly"] = () =>
  kepler.meanAnomalyRadians;
expectedOrbix["kepler-braeunig-4-14-eccentric-anomaly"] = () =>
  kepler.eccentricAnomalyRadians;
expectedOrbix["kepler-braeunig-4-14-true-anomaly"] = () =>
  kepler.trueAnomalyRadians;

/** Rows the page must show as outside the reference rounding. */
const expectedOutsideRounding = [
  "atmosphere-1000-density",
  "atmosphere-5000-pressure",
  "atmosphere-11000-geometric-density",
  "atmosphere-11000-geometric-pressure",
  "atmosphere-11000-geometric-temperature",
  "hohmann-leo-geo-second-burn",
  "hohmann-leo-geo-total",
  "kepler-braeunig-4-14-eccentric-anomaly",
  "kepler-braeunig-4-14-mean-anomaly",
  "oblique-shock-m3-downstream-mach",
];

const allCases = verificationGroups.flatMap((group) => group.cases);
const allRows = allCases.flatMap((item) => item.rows);

describe("verification data", () => {
  it("covers between 8 and 12 ORBIX calculation functions", () => {
    const functions = new Set(allCases.map((item) => item.calculator));

    expect(functions.size).toBeGreaterThanOrEqual(8);
    expect(functions.size).toBeLessThanOrEqual(12);
  });

  it("has an independent calculator call for every row and no extras", () => {
    expect(allRows.map((row) => row.id).sort()).toEqual(
      Object.keys(expectedOrbix).sort(),
    );
    expect(new Set(allRows.map((row) => row.id)).size).toBe(allRows.length);
  });

  for (const row of allRows) {
    describe(row.id, () => {
      const fresh = expectedOrbix[row.id]!();
      const display = toDisplayRow(row);
      const reference = row.reference.value;
      const resolution = row.reference.resolution;

      it("uses the calculator output as the ORBIX value", () => {
        expect(row.orbix).toBe(fresh);
        expect(display.orbix).toBe(formatOrbixValue(fresh, resolution));
      });

      it("computes the difference as (ORBIX - reference) / reference", () => {
        const expected = ((fresh - reference) / reference) * 100;

        expect(display.differencePercent).toBeCloseTo(expected, 12);
        expect(display.difference).toBe(formatPercentDifference(expected));
      });

      it("applies the half-last-digit rounding tolerance", () => {
        const halfUnit = resolution / 2;
        const within = Math.abs(fresh - reference) <= halfUnit * (1 + 1e-9);

        expect(display.withinRounding).toBe(within);
        expect(display.withinRounding).toBe(
          !expectedOutsideRounding.includes(row.id),
        );
        expect(display.roundingLabel).toBe(
          within ? WITHIN_ROUNDING_LABEL : OUTSIDE_ROUNDING_LABEL,
        );
      });

      it("prints the reference with the digits the source prints", () => {
        expect(display.reference).toBe(
          formatReferenceValue(reference, resolution),
        );
      });
    });
  }

  it("explains every case that has a row outside rounding", () => {
    for (const item of allCases) {
      if (item.rows.some((row) => !toDisplayRow(row).withinRounding)) {
        expect(item.notes.length).toBeGreaterThan(0);
      }
    }
  });

  it("summarizes the counts the page states", () => {
    expect(summarizeVerification(verificationGroups)).toEqual({
      outsideRounding: expectedOutsideRounding.length,
      total: allRows.length,
      withinRounding: allRows.length - expectedOutsideRounding.length,
    });
  });

  it("cites a source with an https or http URL for every case", () => {
    for (const item of allCases) {
      expect(verificationSources[item.sourceId].url).toMatch(/^https?:\/\//);
      expect(item.location.length).toBeGreaterThan(0);
    }
  });

  it("does not list a checked function as unchecked", () => {
    for (const item of allCases) {
      expect(uncheckedCalculators).not.toContain(item.calculator);
    }
  });
});

describe("comparison helpers", () => {
  it("computes signed percentage differences", () => {
    expect(percentDifference(101, 100)).toBeCloseTo(1, 12);
    expect(percentDifference(99, 100)).toBeCloseTo(-1, 12);
    expect(() => percentDifference(1, 0)).toThrow(RangeError);
  });

  it("treats a value exactly half a unit away as within rounding", () => {
    expect(isWithinReferenceRounding(1.6875, 1.688, 0.001)).toBe(true);
    expect(isWithinReferenceRounding(1.6874999999999998, 1.688, 0.001)).toBe(
      true,
    );
    expect(isWithinReferenceRounding(1.6874, 1.688, 0.001)).toBe(false);
  });

  it("derives decimals from the last printed digit", () => {
    expect(decimalsForResolution(1)).toBe(0);
    expect(decimalsForResolution(0.001)).toBe(3);
    expect(decimalsForResolution(0.00001)).toBe(5);
  });

  it("formats numbers with grouping and a true minus sign", () => {
    expect(formatReferenceValue(89_874, 1)).toBe("89,874");
    expect(formatOrbixValue(89_874.455, 1)).toBe("89,874.46");
    expect(formatPercentDifference(-0.3)).toBe("\u22120.300%");
    expect(formatPercentDifference(0.0001)).toBe("0.000%");
    expect(formatPercentDifference(0.47)).toBe("+0.470%");
  });
});

describe("verification page markup", () => {
  const markup = renderToStaticMarkup(<VerificationPage />);

  it("has one h1 and links back to the Engineering Lab", () => {
    expect(markup.match(/<h1\b/g)).toHaveLength(1);
    expect(markup).toContain('href="/engineering-lab"');
  });

  it("gives every table a caption, scoped headers and a scroll region", () => {
    const tables = markup.match(/<table\b/g) ?? [];

    expect(tables.length).toBe(allCases.length);
    // DataTable names each table with a visible caption above it.
    expect(markup.match(/<table aria-labelledby="[^"]+"/g)).toHaveLength(
      tables.length,
    );
    expect(markup.match(/role="region"/g)).toHaveLength(tables.length);
    expect(markup.match(/scope="row"/g)).toHaveLength(allRows.length);
    expect(markup).not.toMatch(/<th(?=[\s>])(?![^>]*scope=)[^>]*>/);
  });

  it("shows each ORBIX value exactly as formatted from the calculator", () => {
    // Figures are split into spans to center the separators; compare text.
    const text = markup.replace(/<[^>]+>/g, "");
    for (const row of allRows) {
      expect(text).toContain(
        formatOrbixValue(expectedOrbix[row.id]!(), row.reference.resolution),
      );
    }
  });

  it("states the within and outside counts", () => {
    const within = allRows.length - expectedOutsideRounding.length;

    expect(markup).toContain(
      `${within} of ${allRows.length} compared values pass the rounding check.`,
    );
  });

  it("contains no em dash, emoji or banned copy", () => {
    const text = markup.replace(/<[^>]+>/g, " ");

    expect(text).not.toContain("\u2014");
    expect(text).not.toMatch(/\p{Extended_Pictographic}/u);
    expect(text).not.toMatch(
      /\b(elevate|seamless|unleash|next-gen|cutting-edge|revolutionary|empower|world-class|premium|state-of-the-art|journey|passion-driven)\b/i,
    );
  });
});
