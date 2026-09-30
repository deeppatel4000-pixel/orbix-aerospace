/**
 * The one stage vocabulary and order used by the briefing, the walkthrough
 * and the mission timeline, so a mission reads with the same sequence
 * wherever it appears. Every view is built from MISSION_STAGE_SEQUENCE; a
 * view that adds a trailing step uses Review, and only Review
 * (MISSION_STEPS), so every view ends on the same step.
 */
export const MISSION_STAGE = {
  arrival: "Arrival",
  launch: "Launch",
  orbitInsertion: "Orbit insertion",
  reentry: "Reentry",
  review: "Review",
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

/** The core sequence plus the one shared trailing step, Review. */
export const MISSION_STEPS = [
  ...MISSION_STAGE_SEQUENCE,
  MISSION_STAGE.review,
] as const;

export type CoreMissionStage = (typeof MISSION_STAGE_SEQUENCE)[number];
