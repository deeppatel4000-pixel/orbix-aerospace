import type { Rocket } from "../../types";
import { falcon9 } from "./falcon-9";
import { falconHeavy } from "./falcon-heavy";
import { saturnV } from "./saturn-v";
import { spaceLaunchSystem } from "./space-launch-system";
import { starship } from "./starship";

export { falcon9 } from "./falcon-9";
export { falconHeavy } from "./falcon-heavy";
export { saturnV } from "./saturn-v";
export { spaceLaunchSystem } from "./space-launch-system";
export { starship } from "./starship";

export const rocketVehicles = [
  falcon9,
  falconHeavy,
  saturnV,
  spaceLaunchSystem,
  starship,
] satisfies readonly Rocket[];
