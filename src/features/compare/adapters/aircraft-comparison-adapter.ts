import {
  formatAircraftEngineType,
  formatAircraftMeasurement,
  formatAircraftRoles,
  formatFirstFlight,
} from "@/features/aircraft/utils";
import type {
  ComparisonCellValue,
  ComparisonResult,
  ComparisonRow,
} from "@/features/compare/types";
import type { Aircraft } from "@/features/vehicles/types";

const unavailableValue: ComparisonCellValue = {
  note: "Not available in the current dataset",
  status: "unavailable",
  value: "Unavailable",
};

function availableValue(
  value: string,
  options: Pick<ComparisonCellValue, "details" | "note"> = {},
): ComparisonCellValue {
  return {
    ...options,
    status: "available",
    value,
  };
}

function createRow(
  aircraft: readonly Aircraft[],
  id: string,
  label: string,
  getCell: (item: Aircraft) => ComparisonCellValue,
  description?: string,
): ComparisonRow {
  return {
    cells: aircraft.map(getCell),
    description,
    id,
    label,
  };
}

function formatPropulsion(aircraft: Aircraft): ComparisonCellValue {
  const engines = aircraft.propulsion.engines.map(
    (engine) =>
      engine.quantity +
      " × " +
      engine.name +
      " (" +
      formatAircraftEngineType(engine.type) +
      ")",
  );

  const [primaryEngine, ...additionalEngines] = engines;

  if (!primaryEngine) return unavailableValue;

  return availableValue(primaryEngine, {
    details: additionalEngines,
    note: "Installed engine configuration",
  });
}

function formatDimensions(aircraft: Aircraft): ComparisonCellValue {
  const length = formatAircraftMeasurement(aircraft.dimensions.length);
  const wingspan = formatAircraftMeasurement(aircraft.dimensions.wingspan);

  return availableValue("Length: " + length.value, {
    details: ["Wingspan: " + wingspan.value],
    note: "Length: " + length.note + "; wingspan: " + wingspan.note,
  });
}

function formatWeight(aircraft: Aircraft): ComparisonCellValue {
  const empty = formatAircraftMeasurement(aircraft.weights.empty);
  const maximumTakeoff = formatAircraftMeasurement(
    aircraft.weights.maximumTakeoff,
  );

  return availableValue("Empty: " + empty.value, {
    details: ["Maximum takeoff: " + maximumTakeoff.value],
    note: "Empty: " + empty.note + "; maximum takeoff: " + maximumTakeoff.note,
  });
}

export function adaptAircraftComparison(
  aircraft: readonly Aircraft[],
): ComparisonResult {
  return {
    category: "aircraft",
    rows: [
      createRow(aircraft, "manufacturer", "Manufacturer", (item) =>
        availableValue(item.manufacturer),
      ),
      createRow(aircraft, "role", "Role", (item) =>
        item.roles.length > 0
          ? availableValue(formatAircraftRoles(item.roles))
          : unavailableValue,
      ),
      createRow(aircraft, "first-flight", "First flight", (item) =>
        availableValue(formatFirstFlight(item.firstFlight)),
      ),
      createRow(
        aircraft,
        "speed",
        "Speed",
        (item) => {
          const speed = formatAircraftMeasurement(item.performance.maxSpeed);
          return availableValue(speed.value, { note: speed.note });
        },
        "Published maximum speed; source units are preserved.",
      ),
      createRow(aircraft, "range", "Range", (item) => {
        const range = formatAircraftMeasurement(item.performance.range);
        return availableValue(range.value, { note: range.note });
      }),
      createRow(aircraft, "ceiling", "Ceiling", (item) => {
        const ceiling = formatAircraftMeasurement(
          item.performance.serviceCeiling,
        );
        return availableValue(ceiling.value, { note: ceiling.note });
      }),
      createRow(aircraft, "propulsion", "Propulsion", formatPropulsion),
      createRow(aircraft, "dimensions", "Dimensions", formatDimensions),
      createRow(aircraft, "weight", "Weight", formatWeight),
    ],
    vehicles: aircraft.map((item) => ({
      detailHref: "/aircraft/" + item.id,
      id: item.id,
      manufacturer: item.manufacturer,
      name: item.name,
    })),
  };
}
