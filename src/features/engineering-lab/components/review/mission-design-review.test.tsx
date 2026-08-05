import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  analyzeMissionProfile,
  generateMissionInsights,
} from "@/features/engineering-lab/analysis";
import { generateMissionReport } from "@/features/engineering-lab/reports";

import { MissionDesignReview } from "./mission-design-review";

const missionProfile = analyzeMissionProfile({
  deltaVBudget: {
    hohmannTransfer: {
      finalAltitudeMetres: 400_000,
      initialAltitudeMetres: 200_000,
    },
    missionName: "Design review orbital budget",
  },
  missionName: "ORBIX Design Review Mission",
  vehicleReentryEvaluation: {
    initialAltitudeMeters: 1_000,
    initialVelocityMetersPerSecond: 150,
    safetyFactor: 1.5,
    vehicle: {
      dragCoefficient: 1.5,
      massKilograms: 5_000,
      noseRadiusMetres: 1,
      referenceAreaSquareMetres: 12,
      vehicleName: "Design Review Vehicle",
    },
  },
});

const report = generateMissionReport({
  description: "A completed educational mission design review fixture.",
  missionProfileAnalysis: missionProfile,
});
const insights = generateMissionInsights(missionProfile, report);

describe("MissionDesignReview", () => {
  it("renders the professional mission review workspace", () => {
    const markup = renderToStaticMarkup(
      <MissionDesignReview
        insights={insights}
        missionCategory="orbital-logistics"
        missionProfile={missionProfile}
        report={report}
      />,
    );

    expect(markup).toContain("ORBIX // Mission Design Review");
    expect(markup).toContain("ORBIX Design Review Mission");
    expect(markup).toContain("Orbital logistics");
    expect(markup).toContain("Mission parameter");
  });

  it("renders all requested review sections", () => {
    const markup = renderToStaticMarkup(
      <MissionDesignReview
        insights={insights}
        missionProfile={missionProfile}
        report={report}
      />,
    );

    expect(markup).toContain("Mission Architecture");
    expect(markup).toContain("Orbital Considerations");
    expect(markup).toContain("Vehicle Considerations");
    expect(markup).toContain("Thermal Considerations");
    expect(markup).toContain("Modeling Assumptions");
    expect(markup).toContain("Limitations");
  });

  it("displays supplied orbital, vehicle, and thermal outputs", () => {
    const markup = renderToStaticMarkup(
      <MissionDesignReview
        insights={insights}
        missionProfile={missionProfile}
        report={report}
      />,
    );

    expect(markup).toContain("Transfer delta-v");
    expect(markup).toContain("Initial orbit altitude");
    expect(markup).toContain("Maneuver count");
    expect(markup).toContain("Design Review Vehicle");
    expect(markup).toContain("Initial reentry velocity");
    expect(markup).toContain("Peak deceleration");
    expect(markup).toContain("TPS material");
    expect(markup).toContain("TPS mass");
    expect(markup).toContain("Thermal margin");
  });

  it("uses explicit missing-data states without creating parameters", () => {
    const sparseProfile = analyzeMissionProfile({
      missionName: "Sparse review mission",
    });
    const markup = renderToStaticMarkup(
      <MissionDesignReview missionProfile={sparseProfile} />,
    );

    expect(markup).toContain("Sparse review mission");
    expect(markup).toContain('data-parameter-availability="not-reported"');
    expect(markup).toContain("Not Reported");
    expect(markup).toContain("No modeling assumptions were reported");
  });

  it("renders a clear empty state when completed review objects are absent", () => {
    const markup = renderToStaticMarkup(<MissionDesignReview />);

    expect(markup).toContain("Mission design review unavailable");
    expect(markup).toContain("No replacement parameters have been generated");
  });

  it("provides semantic sections and keyboard-focusable parameter cards", () => {
    const markup = renderToStaticMarkup(
      <MissionDesignReview
        insights={insights}
        missionProfile={missionProfile}
        report={report}
      />,
    );

    expect(markup).toContain('aria-labelledby="mission-design-review-title"');
    expect(markup).toContain(
      'aria-labelledby="design-review-architecture-title"',
    );
    expect(markup).toContain('aria-label="Mission category:');
    expect(markup).toContain('tabindex="0"');
    expect(markup).toContain("motion-reduce:transition-none");
  });

  it("does not present outcome or feasibility verdicts", () => {
    const markup = renderToStaticMarkup(
      <MissionDesignReview
        insights={insights}
        missionProfile={missionProfile}
        report={report}
      />,
    ).toLowerCase();

    expect(markup).not.toMatch(/\b(approved|failed|safe|unsafe)\b/);
    expect(markup).not.toContain("mission viable");
  });
});
