/**
 * The one stage vocabulary and order used by the briefing, the walkthrough
 * and the mission timeline, so a mission reads with the same sequence
 * wherever it appears. Every view is built from MISSION_STAGE_SEQUENCE; a
 * view may add at most one clearly separate trailing step after it.
 */
export const MISSION_STAGE = {
  arrival: "Arrival",
  launch: "Launch",
  orbitInsertion: "Orbit insertion",
  reentry: "Reentry",
  review: "Review",
  thermalProtection: "Thermal protection",
  transfer: "Transfer",
} as const;

/** The core mission sequence, in flight order. */
export const MISSION_STAGE_SEQUENCE = [
  MISSION_STAGE.launch,
  MISSION_STAGE.orbitInsertion,
  MISSION_STAGE.transfer,
  MISSION_STAGE.arrival,
  MISSION_STAGE.reentry,
] as const;

export type CoreMissionStage = (typeof MISSION_STAGE_SEQUENCE)[number];
