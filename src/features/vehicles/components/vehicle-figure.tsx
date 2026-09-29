/** The credit fields a visual record may carry (spec 12.3). */
export interface VehicleImageCredit {
  readonly credit?: string;
  readonly license?: string;
  /** Page stating the licence terms; the licence name links to it. */
  readonly licenseUrl?: string;
  readonly sourceUrl: string;
}

/**
 * The credit prefix: "Photo: NASA", or the credit as recorded when it already
 * says it is a photo ("U.S. Air Force photo by ..."). Undefined when no credit
 * is recorded, so nothing is invented.
 */
export function formatImageCredit(visual: VehicleImageCredit) {
  const credit = visual.credit?.trim();
  if (!credit) return undefined;
  return /\bphoto\b/i.test(credit) ? credit : `Photo: ${credit}`;
}
