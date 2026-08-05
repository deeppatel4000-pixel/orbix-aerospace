import { describe, expect, it } from "vitest";

import type {
  DeltaVBudgetInputs,
  DeltaVBudgetManeuver,
} from "@/features/engineering-lab/types";

import { analyzeDeltaVBudget } from "./delta-v-budget";
import { analyzeHohmannTransfer } from "./hohmann-transfer";
import { analyzeOrbitalPlaneChange } from "./orbital-plane-change";

const departureBurn: DeltaVBudgetManeuver = {
  deltaVMetresPerSecond: 3_200,
  id: "departure-burn",
  name: "Departure burn",
};

const correctionBurn: DeltaVBudgetManeuver = {
  deltaVMetresPerSecond: 45,
  id: "course-correction",
  name: "Course correction",
};

const hohmannTransferInputs = {
  finalAltitudeMetres: 35_786_000,
  initialAltitudeMetres: 400_000,
} as const;

const orbitalPlaneChangeInputs = {
  inclinationChangeDegrees: 10,
  orbitalAltitudeMetres: 35_786_000,
} as const;

describe("analyzeDeltaVBudget", () => {
  it("summarizes a single caller-supplied maneuver", () => {
    const result = analyzeDeltaVBudget({
      maneuvers: [departureBurn],
      missionName: "Single-burn mission",
    });

    expect(result).toEqual({
      largestDeltaVContributor: departureBurn,
      maneuvers: [departureBurn],
      missionName: "Single-burn mission",
      numberOfManeuvers: 1,
      sourceAnalyses: {},
      totalDeltaVMetresPerSecond: 3_200,
    });
  });

  it("preserves caller-supplied maneuver order and totals multiple maneuvers", () => {
    const result = analyzeDeltaVBudget({
      maneuvers: [correctionBurn, departureBurn],
      missionName: "Ordered burns",
    });

    expect(result.maneuvers).toEqual([correctionBurn, departureBurn]);
    expect(result.totalDeltaVMetresPerSecond).toBe(3_245);
    expect(result.numberOfManeuvers).toBe(2);
  });

  it("resolves and preserves a complete Hohmann transfer analysis", () => {
    const result = analyzeDeltaVBudget({
      hohmannTransfer: hohmannTransferInputs,
      missionName: "Orbit raising",
    });
    const directTransfer = analyzeHohmannTransfer(hohmannTransferInputs);

    expect(result.sourceAnalyses.hohmannTransfer).toEqual(directTransfer);
    expect(result.maneuvers).toEqual([
      {
        deltaVMetresPerSecond:
          directTransfer.transfer.totalDeltaVMetresPerSecond,
        id: "hohmann-transfer",
        name: "Hohmann transfer",
      },
    ]);
  });

  it("resolves and preserves a complete orbital plane-change analysis", () => {
    const result = analyzeDeltaVBudget({
      missionName: "Inclination adjustment",
      orbitalPlaneChange: orbitalPlaneChangeInputs,
    });
    const directPlaneChange = analyzeOrbitalPlaneChange(
      orbitalPlaneChangeInputs,
    );

    expect(result.sourceAnalyses.orbitalPlaneChange).toEqual(directPlaneChange);
    expect(result.maneuvers).toEqual([
      {
        deltaVMetresPerSecond: directPlaneChange.deltaVMetresPerSecond,
        id: "orbital-plane-change",
        name: "Orbital plane change",
      },
    ]);
  });

  it("combines custom and resolved maneuvers into one mission total", () => {
    const result = analyzeDeltaVBudget({
      hohmannTransfer: hohmannTransferInputs,
      maneuvers: [departureBurn, correctionBurn],
      missionName: "Combined orbital mission",
      orbitalPlaneChange: orbitalPlaneChangeInputs,
    });
    const transferDeltaV =
      result.sourceAnalyses.hohmannTransfer?.transfer
        .totalDeltaVMetresPerSecond ?? 0;
    const planeChangeDeltaV =
      result.sourceAnalyses.orbitalPlaneChange?.deltaVMetresPerSecond ?? 0;

    expect(result.maneuvers.map(({ id }) => id)).toEqual([
      "departure-burn",
      "course-correction",
      "hohmann-transfer",
      "orbital-plane-change",
    ]);
    expect(result.totalDeltaVMetresPerSecond).toBeCloseTo(
      3_245 + transferDeltaV + planeChangeDeltaV,
      9,
    );
    expect(result.numberOfManeuvers).toBe(4);
  });

  it("identifies the largest delta-v contributor", () => {
    const result = analyzeDeltaVBudget({
      maneuvers: [correctionBurn, departureBurn],
      missionName: "Contributor summary",
    });

    expect(result.largestDeltaVContributor).toBe(departureBurn);
  });

  it("preserves first occurrence when largest contributors are tied", () => {
    const first: DeltaVBudgetManeuver = {
      deltaVMetresPerSecond: 500,
      id: "first",
      name: "First equal burn",
    };
    const second: DeltaVBudgetManeuver = {
      deltaVMetresPerSecond: 500,
      id: "second",
      name: "Second equal burn",
    };
    const result = analyzeDeltaVBudget({
      maneuvers: [first, second],
      missionName: "Tie behavior",
    });

    expect(result.largestDeltaVContributor).toBe(first);
  });

  it("returns an empty summary when no maneuvers are supplied", () => {
    const result = analyzeDeltaVBudget({ missionName: "Planning shell" });

    expect(result.maneuvers).toEqual([]);
    expect(result.totalDeltaVMetresPerSecond).toBe(0);
    expect(result.numberOfManeuvers).toBe(0);
    expect(result.largestDeltaVContributor).toBeNull();
  });

  it.each(["", "   ", "\t\n"])(
    'rejects an empty mission name: "%s"',
    (missionName) => {
      expect(() => analyzeDeltaVBudget({ missionName })).toThrowError(
        new RangeError("Mission name must not be empty."),
      );
    },
  );

  it("delegates Hohmann transfer numerical validation", () => {
    expect(() =>
      analyzeDeltaVBudget({
        hohmannTransfer: {
          ...hohmannTransferInputs,
          initialAltitudeMetres: -1,
        },
        missionName: "Invalid transfer",
      }),
    ).toThrowError(RangeError);
  });

  it("delegates plane-change numerical validation", () => {
    expect(() =>
      analyzeDeltaVBudget({
        missionName: "Invalid plane change",
        orbitalPlaneChange: {
          ...orbitalPlaneChangeInputs,
          inclinationChangeDegrees: Number.POSITIVE_INFINITY,
        },
      }),
    ).toThrowError(RangeError);
  });

  it("propagates optional constants unchanged to both source analyses", () => {
    const gravitationalParameter = 4.9048695e12;
    const planetRadiusMetres = 1_737_400;
    const inputs: DeltaVBudgetInputs = {
      hohmannTransfer: {
        finalAltitudeMetres: 500_000,
        gravitationalParameter,
        initialAltitudeMetres: 100_000,
        planetRadiusMetres,
      },
      missionName: "Lunar orbital mission",
      orbitalPlaneChange: {
        gravitationalParameter,
        inclinationChangeDegrees: 5,
        orbitalAltitudeMetres: 500_000,
        planetRadiusMetres,
      },
    };
    const result = analyzeDeltaVBudget(inputs);

    expect(result.sourceAnalyses.hohmannTransfer).toEqual(
      analyzeHohmannTransfer(inputs.hohmannTransfer!),
    );
    expect(result.sourceAnalyses.orbitalPlaneChange).toEqual(
      analyzeOrbitalPlaneChange(inputs.orbitalPlaneChange!),
    );
  });
});
