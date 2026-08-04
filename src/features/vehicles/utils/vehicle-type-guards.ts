import type { Aircraft, Rocket, Vehicle } from "../types";

export function isAircraft(vehicle: Vehicle): vehicle is Aircraft {
  return vehicle.category === "military-aircraft";
}

export function isRocket(vehicle: Vehicle): vehicle is Rocket {
  return vehicle.category === "launch-vehicle";
}
