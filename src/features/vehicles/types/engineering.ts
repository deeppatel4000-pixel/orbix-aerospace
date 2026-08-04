export const engineeringDomains = [
  "aerodynamics",
  "propulsion",
  "structures",
  "flight-controls",
  "staging",
  "reusability",
  "orbital-mechanics",
  "mission-design",
  "systems-engineering",
] as const;

export const engineeringNoteStatuses = [
  "placeholder",
  "draft",
  "reviewed",
] as const;

export type EngineeringDomain = (typeof engineeringDomains)[number];
export type EngineeringNoteStatus = (typeof engineeringNoteStatuses)[number];

export interface EngineeringNote {
  readonly id: string;
  readonly status: EngineeringNoteStatus;
  readonly summary: string;
  readonly topic: EngineeringDomain;
}
