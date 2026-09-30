import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { analyzeMissionProfile } from "@/features/engineering-lab/analysis";
import type { MissionScenario } from "@/features/engineering-lab/missions";
import { generateMissionReport } from "@/features/engineering-lab/reports";
import type { MissionProfileInputs } from "@/features/engineering-lab/types";

import { MissionTradeStudy } from "./mission-trade-study";

const baselineInputs: MissionProfileInputs = {
  deltaVBudget: {
    hohmannTransfer: {
      finalAltitudeMetres: 400_000,
      initialAltitudeMetres: 200_000,
    },
    missionName: "Baseline Orbital Budget",
  },
  missionName: "LEO Deployment Baseline",
  vehicleReentryEvaluation: {
    initialAltitudeMeters: 1_000,
    initialVelocityMetersPerSecond: 150,
    safetyFactor: 1.5,
    vehicle: {
      dragCoefficient: 1.5,
      massKilograms: 5_000,
      noseRadiusMetres: 1,
      referenceAreaSquareMetres: 12,
      vehicleName: "Trade Study Capsule",
    },
  },
};

const extendedInputs: MissionProfileInputs = {
  deltaVBudget: {
    hohmannTransfer: {
      finalAltitudeMetres: 550_000,
      initialAltitudeMetres: 200_000,
    },
    missionName: "Extended Orbital Budget",
  },
  missionName: "LEO Deployment Extended",
};

const baselineAnalysis = analyzeMissionProfile(baselineInputs);
const extendedAnalysis = analyzeMissionProfile(extendedInputs);
const baselineReport = generateMissionReport({
  description: "Baseline orbital and reentry architecture.",
  missionProfileAnalysis: baselineAnalysis,
});
const extendedReport = generateMissionReport({
  description: "Extended orbital deployment architecture.",
  missionProfileAnalysis: extendedAnalysis,
});

const scenarios: readonly MissionScenario[] = [
  {
    category: "orbital-logistics",
    createdAt: "2026-08-04T12:00:00.000Z",
    description: "Baseline orbital and reentry architecture.",
    id: "baseline",
    name: "LEO Deployment Baseline",
    profile: baselineInputs,
    updatedAt: "2026-08-04T12:00:00.000Z",
  },
  {
    category: "orbital-deployment",
    createdAt: "2026-08-04T12:05:00.000Z",
    description: "Extended orbital deployment architecture.",
    id: "extended",
    name: "LEO Deployment Extended",
    profile: extendedInputs,
    updatedAt: "2026-08-04T12:05:00.000Z",
  },
  {
    category: "deep-space-concept",
    createdAt: "2026-08-04T12:10:00.000Z",
    description: "Identity-only deep-space architecture fixture.",
    id: "deep-space-shell",
    name: "Deep Space Shell",
    profile: { missionName: "Deep Space Shell" },
    updatedAt: "2026-08-04T12:10:00.000Z",
  },
];

describe("MissionTradeStudy", () => {
  it("renders multiple saved mission scenario cards", () => {
    const markup = renderToStaticMarkup(
      <MissionTradeStudy scenarios={scenarios} />,
    );

    expect(markup).toContain("Mission architecture trade study");
    expect(markup).toContain("Mission architectures");
    expect(markup).toContain("LEO Deployment Baseline");
    expect(markup).toContain("LEO Deployment Extended");
    expect(markup).toContain("Deep Space Shell");
    expect(markup).toContain("Orbital logistics");
    expect(markup).toContain("Deep space concept");
  });

  it("compares orbital metrics and names vehicle and thermal rows", () => {
    const markup = renderToStaticMarkup(
      <MissionTradeStudy
        analyses={[baselineAnalysis, extendedAnalysis]}
        reports={[baselineReport, extendedReport]}
        scenarios={scenarios.slice(0, 2)}
      />,
    );

    expect(markup).toContain("Mission comparison metrics");
    expect(markup).toContain("Delta-v");
    expect(markup).toContain("Transfer duration");
    expect(markup).toContain("Maneuvers");
    // Only the baseline reports vehicle and thermal values, so those rows
    // are named under the table rather than compared.
    expect(markup).toContain("peak deceleration");
    expect(markup).toContain("reentry duration");
    expect(markup).toContain("TPS material");
    expect(markup).toContain("thermal margin");
  });

  it("handles missing reports without running report generation", () => {
    const markup = renderToStaticMarkup(
      <MissionTradeStudy
        analyses={[baselineAnalysis, extendedAnalysis]}
        scenarios={scenarios}
      />,
    );

    expect(markup).toContain("LEO Deployment Baseline");
    // Rows two missions report stay; the third mission's cells are muted.
    expect(markup).toContain("Not reported");
  });

  it("names rows only one mission reports instead of filling them with gaps", () => {
    const markup = renderToStaticMarkup(
      <MissionTradeStudy
        analyses={[baselineAnalysis, extendedAnalysis]}
        reports={[baselineReport, extendedReport]}
        scenarios={scenarios.slice(0, 2)}
      />,
    );

    expect(markup).toContain("Reported by one mission only, so not compared:");
    expect(markup).toContain("peak deceleration");
    expect(markup).not.toContain("Trade Study Capsule");
  });

  it("handles missing analyses while preserving supplied report values", () => {
    const markup = renderToStaticMarkup(
      <MissionTradeStudy
        reports={[baselineReport]}
        scenarios={[scenarios[0]!]}
      />,
    );

    expect(markup).toContain("Trade Study Capsule");
    expect(markup).toContain("TPS mass");
    expect(markup).toContain("Thermal margin");
  });

  it("adds no restating notes and chooses no winner", () => {
    const markup = renderToStaticMarkup(
      <MissionTradeStudy
        analyses={[baselineAnalysis, extendedAnalysis]}
        reports={[baselineReport, extendedReport]}
        scenarios={scenarios.slice(0, 2)}
      />,
    );

    expect(markup).not.toContain("Trade study notes");
    expect(markup).toContain("winner selection");
    expect(markup).toContain("no feasibility assessment");
    expect(markup).not.toContain("Winner");
  });

  it("provides semantic table and accessible live-update behavior", () => {
    const markup = renderToStaticMarkup(
      <MissionTradeStudy
        analyses={[baselineAnalysis, extendedAnalysis]}
        scenarios={scenarios}
      />,
    );

    expect(markup).toContain('aria-label="Mission architecture trade study"');
    expect(markup).toContain("<table");
    expect(markup).toContain('scope="col"');
    expect(markup).toContain('scope="row"');
    // The shared DataTable names the table and its scroll region with the
    // visible caption above them.
    expect(markup).toContain("orbix-data-table__caption");
    expect(markup).toMatch(/role="region"[^>]*tabindex="0"/i);
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain('role="status"');
  });

  it("renders an accessible empty state", () => {
    const markup = renderToStaticMarkup(<MissionTradeStudy scenarios={[]} />);

    expect(markup).toContain("No mission scenarios selected");
    expect(markup).toContain(
      "Supply saved scenarios and optional completed reports or analyses",
    );
    expect(markup).not.toContain("Mission comparison metrics");
  });
});
