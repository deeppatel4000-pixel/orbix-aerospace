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
import type {
  Aircraft,
  Measurement,
  MeasurementUnit,
} from "@/features/vehicles/types";

const unavailableValue: ComparisonCellValue = {
  note: "Not available in the current dataset",
  status: "unavailable",
  value: "Unavailable",
};

function availableValue(
  value: string,
  options: Pick<ComparisonCellValue, "details" | "magnitude" | "note"> = {},
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

/**
 * A cell whose displayed value is exactly one measurement.
 *
 * The magnitude is copied straight off the dataset record — the same object the
 * formatter reads — so the number and the unit are the published source values,
 * never anything recovered from the formatted string. Rows whose cells mix
 * units (speed can be Mach or mph, range can be miles or nautical miles) are
 * filtered out downstream by unit equality, not here.
 */
function measurementValue<TUnit extends MeasurementUnit>(
  measurement: Measurement<TUnit>,
): ComparisonCellValue {
  const formatted = formatAircraftMeasurement(measurement);

  return availableValue(formatted.value, {
    magnitude: { unit: measurement.unit, value: measurement.value },
    note: formatted.note,
  });
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
        (item) => measurementValue(item.performance.maxSpeed),
        "Published maximum speed; source units are preserved.",
      ),
      createRow(aircraft, "range", "Range", (item) =>
        measurementValue(item.performance.range),
      ),
      createRow(aircraft, "ceiling", "Ceiling", (item) =>
        measurementValue(item.performance.serviceCeiling),
      ),
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
