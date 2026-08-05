import type {
  MissionReport,
  MissionReportExportFormat,
} from "@/features/engineering-lab/types";

type MarkdownTableRow = readonly [label: string, value: string | number];

const MISSING_SECTION_MESSAGE = "Not included in this mission report." as const;

function validateReportIdentity(report: MissionReport): void {
  if (
    typeof report.missionSummary.missionName !== "string" ||
    report.missionSummary.missionName.trim().length === 0
  ) {
    throw new RangeError("Mission report mission name must not be empty.");
  }

  if (
    typeof report.missionSummary.description !== "string" ||
    report.missionSummary.description.trim().length === 0
  ) {
    throw new RangeError("Mission report description must not be empty.");
  }
}

function escapeTableCell(value: string | number): string {
  return String(value).replaceAll("|", "\\|").replace(/\r?\n/g, " ");
}

function appendTable(lines: string[], rows: readonly MarkdownTableRow[]) {
  lines.push("| Metric | Value |", "| --- | --- |");

  for (const [label, value] of rows) {
    lines.push(`| ${escapeTableCell(label)} | ${escapeTableCell(value)} |`);
  }
}

function appendMissionSummary(lines: string[], report: MissionReport): void {
  lines.push(
    "## Mission Summary",
    "",
    report.missionSummary.description,
    "",
    `> ${report.missionAssessment.educationalSummary}`,
    "",
    "### Systems Used",
    "",
  );

  if (report.missionSummary.systemsUsed.length === 0) {
    lines.push("- None");
  } else {
    for (const system of report.missionSummary.systemsUsed) {
      lines.push(`- ${system}`);
    }
  }
}

function appendOrbitalAnalysis(lines: string[], report: MissionReport): void {
  lines.push("", "## Orbital Analysis", "");

  const orbital = report.orbitalAnalysis;

  if (orbital === undefined) {
    lines.push(MISSING_SECTION_MESSAGE);
    return;
  }

  appendTable(lines, [
    ["Total delta-v", `${orbital.totalDeltaVMetresPerSecond} m/s`],
  ]);

  if (orbital.hohmannTransfer !== undefined) {
    const transfer = orbital.hohmannTransfer;

    lines.push("", "### Transfer Information", "");
    appendTable(lines, [
      ["Initial altitude", `${transfer.initialOrbit.altitudeMetres} m`],
      [
        "Initial orbital radius",
        `${transfer.initialOrbit.orbitalRadiusMetres} m`,
      ],
      [
        "Initial circular velocity",
        `${transfer.initialOrbit.circularVelocityMetresPerSecond} m/s`,
      ],
      ["Final altitude", `${transfer.finalOrbit.altitudeMetres} m`],
      ["Final orbital radius", `${transfer.finalOrbit.orbitalRadiusMetres} m`],
      [
        "Final circular velocity",
        `${transfer.finalOrbit.circularVelocityMetresPerSecond} m/s`,
      ],
      [
        "Transfer semi-major axis",
        `${transfer.transfer.transferSemiMajorAxisMetres} m`,
      ],
      [
        "First burn delta-v",
        `${transfer.transfer.firstBurnDeltaVMetresPerSecond} m/s`,
      ],
      [
        "Second burn delta-v",
        `${transfer.transfer.secondBurnDeltaVMetresPerSecond} m/s`,
      ],
      [
        "Transfer delta-v",
        `${transfer.transfer.totalDeltaVMetresPerSecond} m/s`,
      ],
      ["Transfer time", `${transfer.transfer.transferTimeSeconds} s`],
      ["Transfer time", `${transfer.transfer.transferTimeHours} h`],
    ]);
  }

  if (orbital.orbitalPlaneChange !== undefined) {
    const planeChange = orbital.orbitalPlaneChange;

    lines.push("", "### Plane Change Information", "");
    appendTable(lines, [
      ["Orbital radius", `${planeChange.orbitalRadiusMetres} m`],
      ["Orbital velocity", `${planeChange.orbitalVelocityMetresPerSecond} m/s`],
      ["Inclination change", `${planeChange.inclinationChangeDegrees} deg`],
      ["Inclination change", `${planeChange.inclinationChangeRadians} rad`],
      ["Plane-change delta-v", `${planeChange.deltaVMetresPerSecond} m/s`],
    ]);
  }

  lines.push("", "### Delta-v Requirements", "");

  if (orbital.maneuvers.length === 0) {
    lines.push("No individual maneuvers were reported.");
    return;
  }

  lines.push("| Maneuver | Delta-v |", "| --- | ---: |");

  for (const maneuver of orbital.maneuvers) {
    lines.push(
      `| ${escapeTableCell(maneuver.name)} | ${maneuver.deltaVMetresPerSecond} m/s |`,
    );
  }
}

function appendVehicleAnalysis(lines: string[], report: MissionReport): void {
  lines.push("", "## Vehicle Analysis", "");

  const vehicle = report.vehicleAnalysis;

  if (vehicle === undefined) {
    lines.push(MISSING_SECTION_MESSAGE);
    return;
  }

  lines.push(
    `**Selected vehicle:** ${vehicle.selectedVehicle.vehicleName}`,
    "",
  );
  appendTable(lines, [
    ["Vehicle mass", `${vehicle.selectedVehicle.massKilograms} kg`],
    ["Drag coefficient", vehicle.selectedVehicle.dragCoefficient],
    [
      "Reference area",
      `${vehicle.selectedVehicle.referenceAreaSquareMetres} m²`,
    ],
    ["Nose radius", `${vehicle.selectedVehicle.noseRadiusMetres} m`],
    [
      "Initial altitude",
      `${vehicle.performanceSummary.flight.initialAltitudeMeters} m`,
    ],
    [
      "Initial velocity",
      `${vehicle.performanceSummary.flight.initialVelocityMetersPerSecond} m/s`,
    ],
    [
      "Final altitude",
      `${vehicle.performanceSummary.flight.finalState.altitudeMeters} m`,
    ],
    [
      "Final velocity",
      `${vehicle.performanceSummary.flight.finalState.velocityMetersPerSecond} m/s`,
    ],
    [
      "Reentry duration",
      `${vehicle.performanceSummary.flight.reentryDurationSeconds} s`,
    ],
    [
      "Peak deceleration",
      `${vehicle.performanceSummary.dynamics.peakDeceleration.decelerationMetersPerSecondSquared} m/s²`,
    ],
    [
      "Peak deceleration",
      `${vehicle.performanceSummary.dynamics.peakDeceleration.decelerationGs} g`,
    ],
  ]);
}

function appendThermalAnalysis(lines: string[], report: MissionReport): void {
  lines.push("", "## Thermal Analysis", "");

  const thermal = report.thermalAnalysis;

  if (thermal === undefined) {
    lines.push(MISSING_SECTION_MESSAGE);
  } else {
    appendTable(lines, [
      [
        "Peak heat flux",
        `${thermal.thermalSummary.peakHeatFluxWattsPerSquareMetre} W/m²`,
      ],
      [
        "Peak heat flux",
        `${thermal.thermalSummary.peakHeatFluxKilowattsPerSquareMetre} kW/m²`,
      ],
      [
        "Peak heating altitude",
        `${thermal.thermalSummary.peakHeatingAltitudeMeters} m`,
      ],
      [
        "Total heat load",
        `${thermal.thermalSummary.totalHeatLoadJoulesPerSquareMetre} J/m²`,
      ],
      [
        "Total heat load",
        `${thermal.thermalSummary.totalHeatLoadMegajoulesPerSquareMetre} MJ/m²`,
      ],
    ]);
  }

  lines.push("", "## TPS Recommendation", "");

  const tps = thermal?.tpsRecommendation;

  if (tps === undefined) {
    lines.push(MISSING_SECTION_MESSAGE);
    return;
  }

  lines.push(
    `**Material:** ${tps.material.name}`,
    "",
    tps.material.description,
    "",
  );
  appendTable(lines, [
    ["Required thickness", `${tps.requiredThickness.metres} m`],
    ["Required thickness", `${tps.requiredThickness.millimetres} mm`],
    ["Estimated TPS mass", `${tps.estimatedTPSMassKilograms} kg`],
    ["Thermal margin", `${tps.thermalMargin.marginPercentage}%`],
    [
      "Heat-load margin",
      `${tps.thermalMargin.heatLoadMarginMegajoulesPerSquareMetre} MJ/m²`,
    ],
    ["Margin classification", tps.thermalMargin.classification],
  ]);
}

function appendAssessment(lines: string[], report: MissionReport): void {
  lines.push("", "## Assumptions", "");

  for (const assumption of report.missionAssessment.modelAssumptions) {
    lines.push(`- ${assumption}`);
  }

  lines.push("", "## Limitations", "");

  for (const limitation of report.missionAssessment.limitations) {
    lines.push(`- ${limitation}`);
  }
}

function exportMarkdown(report: MissionReport): string {
  const lines = [`# ${report.missionSummary.missionName}`, ""];

  appendMissionSummary(lines, report);
  appendOrbitalAnalysis(lines, report);
  appendVehicleAnalysis(lines, report);
  appendThermalAnalysis(lines, report);
  appendAssessment(lines, report);

  return lines.join("\n") + "\n";
}

export function exportMissionReport(
  report: MissionReport,
  format: "json",
): MissionReport;
export function exportMissionReport(
  report: MissionReport,
  format: "markdown",
): string;
export function exportMissionReport(
  report: MissionReport,
  format: MissionReportExportFormat,
): MissionReport | string;
/**
 * Exports an existing report without invoking engineering analyses or altering
 * the source object. JSON output is a detached, serializable structured clone.
 */
export function exportMissionReport(
  report: MissionReport,
  format: MissionReportExportFormat,
): MissionReport | string {
  if (format !== "json" && format !== "markdown") {
    throw new RangeError(`Unsupported mission report export format: ${format}`);
  }

  validateReportIdentity(report);

  if (format === "json") {
    return structuredClone(report);
  }

  return exportMarkdown(report);
}
