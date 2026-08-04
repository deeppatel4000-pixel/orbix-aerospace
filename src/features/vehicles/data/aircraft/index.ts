import type { Aircraft } from "../../types";
import { b2Spirit } from "./b-2-spirit";
import { f15Eagle } from "./f-15-eagle";
import { f22Raptor } from "./f-22-raptor";
import { f35LightningII } from "./f-35-lightning-ii";
import { sr71Blackbird } from "./sr-71-blackbird";

export { b2Spirit } from "./b-2-spirit";
export { f15Eagle } from "./f-15-eagle";
export { f22Raptor } from "./f-22-raptor";
export { f35LightningII } from "./f-35-lightning-ii";
export { sr71Blackbird } from "./sr-71-blackbird";

export const aircraftVehicles = [
  f22Raptor,
  f35LightningII,
  sr71Blackbird,
  b2Spirit,
  f15Eagle,
] satisfies readonly Aircraft[];
