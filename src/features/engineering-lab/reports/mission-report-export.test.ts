import { describe, expect, it } from "vitest";

import type {
  MissionReport,
  MissionReportExportFormat,
  MissionProfileInputs,
} from "@/features/engineering-lab/types";

import { analyzeMissionProfile } from "../analysis";
import { generateMissionReport } from "./mission-report";
import { exportMissionReport } from "./mission-report-export";

const completeMissionInputs: MissionProfileInputs = {
  deltaVBudget: {
    hohmannTransfer: {
      finalAltitudeMetres: 400_000,
      initialAltitudeMetres: 200_000,
    },
    missionName: "Export reference delta-v budget",
    orbitalPlaneChange: {
      inclinationChangeDegrees: 5,
      orbitalAltitudeMetres: 400_000,
    },
  },
  missionName: "Export Reference Mission",
  vehicleReentryEvaluation: {
    initialAltitudeMeters: 1_000,
    initialVelocityMetersPerSecond: 150,
    safetyFactor: 1.5,
    vehicle: {
      dragCoefficient: 1.5,
      massKilograms: 5_000,
      noseRadiusMetres: 1,
      referenceAreaSquareMetres: 12,
      vehicleName: "Export Reference Vehicle",
    },
  },
};

const completeReport = generateMissionReport({
  description: "A complete mission used to verify portable report exports.",
  missionProfileAnalysis: analyzeMissionProfile(completeMissionInputs),
});

const partialReport = generateMissionReport({
  description: "A mission report with no optional engineering systems.",
  missionProfileAnalysis: analyzeMissionProfile({
    missionName: "Partial Export Mission",
  }),
});

describe("exportMissionReport", () => {
  it("exports a detached, JSON-serializable report object", () => {
    const exported = exportMissionReport(completeReport, "json");

    expect(exported).toEqual(completeReport);
    expect(exported).not.toBe(completeReport);
    expect(exported.missionAssessment).not.toBe(
      completeReport.missionAssessment,
    );
    expect(() => JSON.stringify(exported)).not.toThrow();
  });

  it("preserves every report section in JSON output", () => {
    const exported = exportMissionReport(completeReport, "json");

    expect(exported.missionSummary).toEqual(completeReport.missionSummary);
    expect(exported.orbitalAnalysis).toEqual(completeReport.orbitalAnalysis);
    expect(exported.vehicleAnalysis).toEqual(completeReport.vehicleAnalysis);
    expect(exported.thermalAnalysis).toEqual(completeReport.thermalAnalysis);
    expect(exported.missionAssessment).toEqual(
      completeReport.missionAssessment,
    );
    expect(exported.sourceAnalysis).toEqual(completeReport.sourceAnalysis);
  });

  it("does not modify the source report during export", () => {
    const sourceSnapshot = structuredClone(completeReport);

    exportMissionReport(completeReport, "json");
    exportMissionReport(completeReport, "markdown");

    expect(completeReport).toEqual(sourceSnapshot);
  });

  it("exports readable Markdown with all required engineering sections", () => {
    const markdown = exportMissionReport(completeReport, "markdown");

    expect(markdown).toContain("# Export Reference Mission");
    expect(markdown).toContain("## Mission Summary");
    expect(markdown).toContain("## Orbital Analysis");
    expect(markdown).toContain("### Transfer Information");
    expect(markdown).toContain("### Plane Change Information");
    expect(markdown).toContain("## Vehicle Analysis");
    expect(markdown).toContain("## Thermal Analysis");
    expect(markdown).toContain("## TPS Recommendation");
    expect(markdown).toContain("## Assumptions");
    expect(markdown).toContain("## Limitations");
    expect(markdown).toContain("| Metric | Value |");
  });

  it("marks optional Markdown sections as unavailable when absent", () => {
    const markdown = exportMissionReport(partialReport, "markdown");

    expect(markdown).toContain("## Orbital Analysis");
    expect(markdown).toContain("## Vehicle Analysis");
    expect(markdown).toContain("## Thermal Analysis");
    expect(markdown).toContain("## TPS Recommendation");
    expect(
      markdown.match(/Not included in this mission report\./g),
    ).toHaveLength(4);
  });

  it("preserves existing numerical and recommendation values in Markdown", () => {
    const markdown = exportMissionReport(completeReport, "markdown");
    const orbital = completeReport.orbitalAnalysis;
    const thermal = completeReport.thermalAnalysis;

    expect(markdown).toContain(`${orbital?.totalDeltaVMetresPerSecond} m/s`);
    expect(markdown).toContain(
      `${thermal?.thermalSummary.peakHeatFluxWattsPerSquareMetre} W/m²`,
    );
    expect(markdown).toContain(
      `${thermal?.tpsRecommendation?.estimatedTPSMassKilograms} kg`,
    );
    expect(markdown).toContain(
      `**Material:** ${thermal?.tpsRecommendation?.material.name}`,
    );
  });

  it("rejects unsupported export formats", () => {
    expect(() =>
      exportMissionReport(completeReport, "pdf" as MissionReportExportFormat),
    ).toThrowError(
      new RangeError("Unsupported mission report export format: pdf"),
    );
  });

  it.each(["", "   ", "\t\n"])(
    "rejects an empty report mission name %j",
    (missionName) => {
      const invalidReport: MissionReport = {
        ...completeReport,
        missionSummary: {
          ...completeReport.missionSummary,
          missionName,
        },
      };

      expect(() => exportMissionReport(invalidReport, "json")).toThrowError(
        new RangeError("Mission report mission name must not be empty."),
      );
    },
  );

  it.each(["", "   ", "\t\n"])(
    "rejects an empty report description %j",
    (description) => {
      const invalidReport: MissionReport = {
        ...completeReport,
        missionSummary: {
          ...completeReport.missionSummary,
          description,
        },
      };

      expect(() => exportMissionReport(invalidReport, "markdown")).toThrowError(
        new RangeError("Mission report description must not be empty."),
      );
    },
  );
});
