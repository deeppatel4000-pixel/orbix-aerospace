/**
 * Shown beside every thermal readout in the mission tools. The entry models
 * run in the standard troposphere only, so a mission's heating and TPS
 * figures cover the descent below 11 km, not an entry from orbit, and read
 * as implausibly small without this context.
 */
export const THERMAL_MODEL_NOTE =
  "Heating is computed for the descent below 11 km only (the standard troposphere model), not the full entry from orbit, so heat loads and TPS sizes are small.";
