import { aircraftVehicles } from "@/features/vehicles/data";
import type { Aircraft } from "@/features/vehicles/types";

export function listAircraft(): readonly Aircraft[] {
  return aircraftVehicles;
}

export function listAircraftIds(): readonly string[] {
  return aircraftVehicles.map((aircraft) => aircraft.id);
}

export function getAircraftById(id: string): Aircraft | undefined {
  return aircraftVehicles.find((aircraft) => aircraft.id === id);
}
