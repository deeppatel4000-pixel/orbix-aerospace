import { rocketVehicles } from "@/features/vehicles/data";
import type { Rocket } from "@/features/vehicles/types";

export function listRockets(): readonly Rocket[] {
  return rocketVehicles;
}

export function listRocketIds(): readonly string[] {
  return rocketVehicles.map((rocket) => rocket.id);
}

export function getRocketById(id: string): Rocket | undefined {
  return rocketVehicles.find((rocket) => rocket.id === id);
}
