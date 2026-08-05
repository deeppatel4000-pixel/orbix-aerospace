import {
  formatLaunchConfiguration,
  formatOrbitType,
  formatRocketFirstFlight,
  formatRocketMeasurement,
} from "@/features/rockets/utils";
import type {
  ComparisonCellValue,
  ComparisonResult,
  ComparisonRow,
} from "@/features/compare/types";
import type { Rocket } from "@/features/vehicles/types";

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
  rockets: readonly Rocket[],
  id: string,
  label: string,
  getCell: (item: Rocket) => ComparisonCellValue,
  description?: string,
): ComparisonRow {
  return {
    cells: rockets.map(getCell),
    description,
    id,
    label,
  };
}

function formatStages(rocket: Rocket): ComparisonCellValue {
  const stages = rocket.stages.map(
    (stage) =>
      "Phase " +
      stage.stageNumber +
      ": " +
      stage.name +
      " (" +
      (stage.reusable ? "reusable" : "expendable") +
      ")",
  );

  const [primaryStage, ...additionalStages] = stages;

  if (!primaryStage) return unavailableValue;

  return availableValue(primaryStage, {
    details: additionalStages,
    note:
      rocket.stages.length +
      (rocket.stages.length === 1
        ? " architecture element"
        : " architecture elements"),
  });
}

function formatPayloadCapability(rocket: Rocket): ComparisonCellValue {
  const capabilities = rocket.performance.payloadCapabilities.map(
    (capability) => {
      const mass = formatRocketMeasurement(capability.mass);

      return {
        note: formatOrbitType(capability.orbit) + ": " + mass.note,
        value:
          capability.orbit +
          ": " +
          mass.value +
          " (" +
          formatLaunchConfiguration(capability.configuration) +
          ")",
      };
    },
  );

  const [primaryCapability, ...additionalCapabilities] = capabilities;

  if (!primaryCapability) return unavailableValue;

  return availableValue(primaryCapability.value, {
    details: additionalCapabilities.map((capability) => capability.value),
    note: capabilities.map((capability) => capability.note).join("; "),
  });
}

function formatOrbitCapability(rocket: Rocket): ComparisonCellValue {
  if (rocket.performance.supportedOrbits.length === 0) {
    return unavailableValue;
  }

  return availableValue(
    rocket.performance.supportedOrbits.map(formatOrbitType).join(" · "),
    { note: "Published mission regimes" },
  );
}

export function adaptRocketComparison(
  rockets: readonly Rocket[],
): ComparisonResult {
  return {
    category: "rockets",
    rows: [
      createRow(rockets, "manufacturer", "Manufacturer", (item) =>
        availableValue(item.manufacturer),
      ),
      createRow(rockets, "first-flight", "First flight", (item) =>
        availableValue(formatRocketFirstFlight(item.firstFlight)),
      ),
      createRow(rockets, "height", "Height", (item) => {
        const height = formatRocketMeasurement(item.dimensions.height);
        return availableValue(height.value, { note: height.note });
      }),
      createRow(rockets, "mass", "Mass", (item) => {
        const mass = formatRocketMeasurement(item.mass.liftoff);
        return availableValue(mass.value, { note: mass.note });
      }),
      createRow(rockets, "thrust", "Thrust", (item) => {
        const thrust = formatRocketMeasurement(item.performance.liftoffThrust);
        return availableValue(thrust.value, { note: thrust.note });
      }),
      createRow(
        rockets,
        "stages",
        "Stages",
        formatStages,
        "Parallel boosters and cores are represented as separate architecture elements.",
      ),
      createRow(
        rockets,
        "payload-capability",
        "Payload capability",
        formatPayloadCapability,
        "Payload values remain tied to their published orbit and launch configuration.",
      ),
      createRow(
        rockets,
        "orbit-capability",
        "Orbit capability",
        formatOrbitCapability,
      ),
    ],
    vehicles: rockets.map((item) => ({
      detailHref: "/rockets/" + item.id,
      id: item.id,
      manufacturer: item.manufacturer,
      name: item.name,
    })),
  };
}
