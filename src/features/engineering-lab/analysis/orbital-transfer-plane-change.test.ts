import { describe, expect, it } from "vitest";

import { calculateOrbitalPlaneChange } from "@/features/engineering-lab/calculators";
import type { OrbitalTransferPlaneChangeInputs } from "@/features/engineering-lab/types";

import { analyzeHohmannTransfer } from "./hohmann-transfer";
import { analyzeOrbitalTransferPlaneChange } from "./orbital-transfer-plane-change";

const lowEarthToGeostationaryInputs: OrbitalTransferPlaneChangeInputs = {
  finalAltitudeMetres: 35_786_000,
  inclinationChangeDegrees: 10,
  initialAltitudeMetres: 400_000,
};

describe("analyzeOrbitalTransferPlaneChange", () => {
  it("analyzes a LEO-to-GEO transfer followed by an inclination change", () => {
    const result = analyzeOrbitalTransferPlaneChange(
      lowEarthToGeostationaryInputs,
    );

    expect(result.transferDeltaVMetresPerSecond).toBeCloseTo(
      3_856.5784417632376,
      9,
    );
    expect(result.finalOrbitVelocityMetresPerSecond).toBeCloseTo(
      3_074.921541506354,
      9,
    );
    expect(result.planeChangeDeltaVMetresPerSecond).toBeCloseTo(
      535.9941416815205,
      9,
    );
    expect(result.totalDeltaVMetresPerSecond).toBeCloseTo(
      4_392.572583444758,
      9,
    );
  });

  it("supports a same-orbit mission containing only a plane change", () => {
    const result = analyzeOrbitalTransferPlaneChange({
      finalAltitudeMetres: 400_000,
      inclinationChangeDegrees: 28.5,
      initialAltitudeMetres: 400_000,
    });

    expect(result.transferDeltaVMetresPerSecond).toBe(0);
    expect(result.hohmannTransfer.transfer).toEqual({
      firstBurnDeltaVMetresPerSecond: 0,
      secondBurnDeltaVMetresPerSecond: 0,
      totalDeltaVMetresPerSecond: 0,
      transferSemiMajorAxisMetres: 6_771_000,
      transferTimeHours: 0,
      transferTimeSeconds: 0,
    });
    expect(result.planeChangeDeltaVMetresPerSecond).toBeCloseTo(
      3_777.2708467795437,
      9,
    );
    expect(result.totalDeltaVMetresPerSecond).toBe(
      result.planeChangeDeltaVMetresPerSecond,
    );
  });

  it("matches pure Hohmann delta-v when inclination change is zero", () => {
    const result = analyzeOrbitalTransferPlaneChange({
      ...lowEarthToGeostationaryInputs,
      inclinationChangeDegrees: 0,
    });

    expect(result.planeChangeDeltaVMetresPerSecond).toBe(0);
    expect(result.totalDeltaVMetresPerSecond).toBe(
      result.transferDeltaVMetresPerSecond,
    );
    expect(result.totalDeltaVMetresPerSecond).toBe(
      result.hohmannTransfer.transfer.totalDeltaVMetresPerSecond,
    );
  });

  it("requires more total delta-v for a larger inclination change", () => {
    const smallerChange = analyzeOrbitalTransferPlaneChange({
      ...lowEarthToGeostationaryInputs,
      inclinationChangeDegrees: 5,
    });
    const largerChange = analyzeOrbitalTransferPlaneChange({
      ...lowEarthToGeostationaryInputs,
      inclinationChangeDegrees: 20,
    });

    expect(largerChange.transferDeltaVMetresPerSecond).toBe(
      smallerChange.transferDeltaVMetresPerSecond,
    );
    expect(largerChange.totalDeltaVMetresPerSecond).toBeGreaterThan(
      smallerChange.totalDeltaVMetresPerSecond,
    );
  });

  it("requires more transfer delta-v for a larger altitude change", () => {
    const smallerTransfer = analyzeOrbitalTransferPlaneChange({
      finalAltitudeMetres: 2_000_000,
      inclinationChangeDegrees: 0,
      initialAltitudeMetres: 400_000,
    });
    const largerTransfer = analyzeOrbitalTransferPlaneChange({
      finalAltitudeMetres: 35_786_000,
      inclinationChangeDegrees: 0,
      initialAltitudeMetres: 400_000,
    });

    expect(largerTransfer.transferDeltaVMetresPerSecond).toBeGreaterThan(
      smallerTransfer.transferDeltaVMetresPerSecond,
    );
  });

  it("preserves the Hohmann transfer analysis result", () => {
    const result = analyzeOrbitalTransferPlaneChange(
      lowEarthToGeostationaryInputs,
    );
    const directTransfer = analyzeHohmannTransfer({
      finalAltitudeMetres: lowEarthToGeostationaryInputs.finalAltitudeMetres,
      initialAltitudeMetres:
        lowEarthToGeostationaryInputs.initialAltitudeMetres,
    });

    expect(result.hohmannTransfer).toEqual(directTransfer);
    expect(result.transferDeltaVMetresPerSecond).toBe(
      directTransfer.transfer.totalDeltaVMetresPerSecond,
    );
  });

  it("preserves the plane-change calculator result", () => {
    const result = analyzeOrbitalTransferPlaneChange(
      lowEarthToGeostationaryInputs,
    );
    const directPlaneChange = calculateOrbitalPlaneChange({
      inclinationChangeDegrees:
        lowEarthToGeostationaryInputs.inclinationChangeDegrees,
      orbitalVelocityMetresPerSecond:
        result.hohmannTransfer.finalOrbit.circularVelocityMetresPerSecond,
    });

    expect(result.planeChange).toEqual(directPlaneChange);
    expect(result.planeChangeDeltaVMetresPerSecond).toBe(
      directPlaneChange.deltaVMetresPerSecond,
    );
  });

  it("propagates custom central-body constants through the workflow", () => {
    const gravitationalParameter = 4.9048695e12;
    const planetRadiusMetres = 1_737_400;
    const result = analyzeOrbitalTransferPlaneChange({
      ...lowEarthToGeostationaryInputs,
      finalAltitudeMetres: 500_000,
      gravitationalParameter,
      initialAltitudeMetres: 100_000,
      planetRadiusMetres,
    });
    const directTransfer = analyzeHohmannTransfer({
      finalAltitudeMetres: 500_000,
      gravitationalParameter,
      initialAltitudeMetres: 100_000,
      planetRadiusMetres,
    });

    expect(result.hohmannTransfer).toEqual(directTransfer);
    expect(result.hohmannTransfer.resolved).toEqual({
      gravitationalParameter,
      planetRadiusMetres,
    });
  });

  it.each([
    ["initial altitude", "initialAltitudeMetres", -1],
    ["final altitude", "finalAltitudeMetres", -1],
    ["inclination change", "inclinationChangeDegrees", -1],
    ["planet radius", "planetRadiusMetres", 0],
    ["gravitational parameter", "gravitationalParameter", 0],
  ] as const)("propagates invalid %s errors", (_label, field, value) => {
    expect(() =>
      analyzeOrbitalTransferPlaneChange({
        ...lowEarthToGeostationaryInputs,
        [field]: value,
      }),
    ).toThrowError(RangeError);
  });

  it.each([
    ["initial altitude", "initialAltitudeMetres"],
    ["final altitude", "finalAltitudeMetres"],
    ["inclination change", "inclinationChangeDegrees"],
    ["planet radius", "planetRadiusMetres"],
    ["gravitational parameter", "gravitationalParameter"],
  ] as const)("propagates non-finite %s errors", (_label, field) => {
    for (const value of [
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
    ]) {
      expect(() =>
        analyzeOrbitalTransferPlaneChange({
          ...lowEarthToGeostationaryInputs,
          [field]: value,
        }),
      ).toThrowError(RangeError);
    }
  });
});
