import { formatLaunchConfiguration } from "@/features/rockets/utils";
import { measurementParts } from "@/features/vehicles/components/measurement-display";
import type {
  Measurement,
  MeasurementUnit,
  OrbitType,
  PayloadCapability,
  Rocket,
} from "@/features/vehicles/types";

/**
 * The largest published payload to one destination orbit across the
 * record's configurations, or undefined when none is published.
 */
export function maxPayloadTo(
  rocket: Rocket,
  orbit: OrbitType,
): PayloadCapability | undefined {
  return rocket.performance.payloadCapabilities
    .filter((capability) => capability.orbit === orbit)
    .sort((a, b) => payloadKg(b) - payloadKg(a))[0];
}

const kilograms: Record<PayloadCapability["mass"]["unit"], number> = {
  kg: 1,
  lb: 0.45359237,
  t: 1000,
};

function payloadKg(capability: PayloadCapability) {
  return capability.mass.value * kilograms[capability.mass.unit];
}

/** Total engines and motors across every stage element. */
export function countRocketEngines(rocket: Rocket) {
  return rocket.stages.reduce(
    (total, stage) =>
      total + stage.engines.reduce((sum, engine) => sum + engine.quantity, 0),
    0,
  );
}

/**
 * "Payload to LEO". Kept short so it sets on one line in a spec cell; the
 * configuration the figure was published for goes on the qualifier line
 * under the value (`payloadConfiguration`), because recovering boosters
 * costs payload.
 */
export function payloadLabel(capability: PayloadCapability) {
  return `Payload to ${capability.orbit}`;
}

/** "Expendable" or "Reusable": the configuration a payload figure is for. */
export function payloadConfiguration(capability: PayloadCapability) {
  return formatLaunchConfiguration(capability.configuration);
}

/**
 * Liftoff thrust for cards, spec panels and record rows, in the unit the
 * source published ("7,686 kN", "34.5 MN"), so the figure reads the same
 * as in the profile's Specifications table. A published minimum keeps its
 * plus sign, as in `measurementParts`.
 */
export function thrustParts(thrust: Measurement<MeasurementUnit>) {
  return measurementParts(thrust);
}

/** `thrustParts` as one string: "7,686 kN". */
export function thrustText(thrust: Measurement<MeasurementUnit>) {
  const { unit, value } = thrustParts(thrust);
  return unit ? `${value} ${unit}` : value;
}
