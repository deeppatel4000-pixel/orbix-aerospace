import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  analyzeMissionProfile,
  analyzeVehicleReentryEvaluation,
} from "@/features/engineering-lab/analysis";
import { generateMissionReport } from "@/features/engineering-lab/reports";
import type {
  MissionProfileInputs,
  VehicleReentryEvaluationInputs,
} from "@/features/engineering-lab/types";

import { Mission3DScene } from "./mission-3d-scene";

const reentryInputs: VehicleReentryEvaluationInputs = {
  initialAltitudeMeters: 1_000,
  initialVelocityMetersPerSecond: 150,
  safetyFactor: 1.5,
  vehicle: {
    dragCoefficient: 1.5,
    massKilograms: 5_000,
    noseRadiusMetres: 1,
    referenceAreaSquareMetres: 12,
    vehicleName: "3D Scene Test Vehicle",
  },
};

const missionInputs: MissionProfileInputs = {
  deltaVBudget: {
    hohmannTransfer: {
      finalAltitudeMetres: 400_000,
      initialAltitudeMetres: 200_000,
    },
    missionName: "3D scene delta-v budget",
    orbitalPlaneChange: {
      inclinationChangeDegrees: 5,
      orbitalAltitudeMetres: 400_000,
    },
  },
  missionName: "Interactive 3D Scene Test",
  vehicleReentryEvaluation: reentryInputs,
};

const missionAnalysis = analyzeMissionProfile(missionInputs);
const missionReport = generateMissionReport({
  description: "An immersive presentation-layer mission test.",
  missionProfileAnalysis: missionAnalysis,
});
const reentryEvaluation = analyzeVehicleReentryEvaluation(reentryInputs);

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const nestedValue of Object.values(value)) {
      deepFreeze(nestedValue);
    }

    Object.freeze(value);
  }

  return value;
}

describe("Mission3DScene", () => {
  it("renders the orbital scene from completed orbital outputs", () => {
    const markup = renderToStaticMarkup(
      <Mission3DScene
        missionProfileAnalysis={missionAnalysis}
        missionReport={missionReport}
        vehicleReentryEvaluation={reentryEvaluation}
      />,
    );

    expect(markup).toContain("Interactive 3D Mission Scene");
    expect(markup).toContain("Orbital Mission");
    expect(markup).toContain("Orbital mission scene");
    expect(markup).toContain("Earth with orbital mission paths");
    expect(markup).toContain("Initial orbit");
    expect(markup).toContain("Final orbit");
    expect(markup).toContain("Transfer trajectory");
    expect(markup).toContain("Orbit transfer");
  });

  it("renders the reentry scene from a completed vehicle evaluation", () => {
    const markup = renderToStaticMarkup(
      <Mission3DScene
        initialMode="reentry"
        missionProfileAnalysis={missionAnalysis}
        missionReport={missionReport}
        vehicleReentryEvaluation={reentryEvaluation}
      />,
    );

    expect(markup).toContain("Reentry Mission");
    expect(markup).toContain("Reentry mission scene");
    expect(markup).toContain("Earth atmospheric reentry target");
    expect(markup).toContain("Reentry corridor");
    expect(markup).toContain("Heating phase indicated");
    expect(markup).toContain("3D Scene Test Vehicle");
  });

  it("handles a mission without optional reentry data", () => {
    const orbitalAnalysis = analyzeMissionProfile({
      deltaVBudget: missionInputs.deltaVBudget,
      missionName: "Orbital-only scene",
    });
    const markup = renderToStaticMarkup(
      <Mission3DScene missionProfileAnalysis={orbitalAnalysis} />,
    );

    expect(markup).toContain("Orbital-only scene");
    expect(markup).toContain("Orbital mission scene");
    expect(markup).toContain("Reentry Mission");
    expect(markup).toContain("disabled");
    expect(markup).toContain("Not reported");
  });

  it("renders an explicit empty state without orbital or reentry outputs", () => {
    const emptyAnalysis = analyzeMissionProfile({
      missionName: "Empty 3D scene",
    });
    const markup = renderToStaticMarkup(
      <Mission3DScene missionProfileAnalysis={emptyAnalysis} />,
    );

    expect(markup).toContain("3D mission visualization unavailable");
    expect(markup).toContain(
      "A resolved orbital transfer, orbital maneuver, or vehicle reentry evaluation is required",
    );
  });

  it("does not mutate supplied mission, report, or reentry objects", () => {
    const frozenAnalysis = deepFreeze(missionAnalysis);
    const frozenReport = deepFreeze(missionReport);
    const frozenReentry = deepFreeze(reentryEvaluation);
    const before = JSON.stringify({
      frozenAnalysis,
      frozenReentry,
      frozenReport,
    });

    expect(() =>
      renderToStaticMarkup(
        <Mission3DScene
          missionProfileAnalysis={frozenAnalysis}
          missionReport={frozenReport}
          vehicleReentryEvaluation={frozenReentry}
        />,
      ),
    ).not.toThrow();

    expect(
      JSON.stringify({ frozenAnalysis, frozenReentry, frozenReport }),
    ).toBe(before);
  });
});
