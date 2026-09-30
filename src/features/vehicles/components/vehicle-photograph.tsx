import type { VehicleImageCredit } from "./vehicle-figure";

/**
 * A vehicle photograph with the facts needed to show and credit it. The
 * profile hero is the one place a profile shows its photograph large, so
 * the standalone photograph component that used this type was removed;
 * the type stays here for the learn pathway figures, which import it.
 */
export interface VehiclePhotographRecord extends VehicleImageCredit {
  readonly alt: string;
  readonly height: number;
  readonly src: string;
  readonly width: number;
}
