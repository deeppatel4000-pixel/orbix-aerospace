import { STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES } from "@/features/engineering-lab/types";

/**
 * Label and hint for altitude inputs that feed `calculateStandardAtmosphere`.
 *
 * The model is the US Standard Atmosphere troposphere, T = T0 - L h with a
 * constant sea-level g0 in the pressure exponent. That form is written in
 * geopotential altitude, so the input is geopotential, not geometric. With the
 * standard's effective Earth radius (6,356,766 m), geometric altitude
 * z = r H / (r - H) exceeds geopotential altitude H by at most 19.07 m at the
 * model's 11,000 m ceiling.
 */
export const GEOPOTENTIAL_ALTITUDE_LABEL = "Geopotential altitude";

/** The same input where it is the start of an entry trajectory. */
export const INITIAL_GEOPOTENTIAL_ALTITUDE_LABEL =
  "Initial geopotential altitude";

export const GEOPOTENTIAL_ALTITUDE_HINT =
  "Height scaled to constant sea-level gravity, 0 to " +
  STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES.toLocaleString("en-US") +
  " m; within 20 m of geometric altitude.";
