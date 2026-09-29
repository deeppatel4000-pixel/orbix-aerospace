import {
  getAircraftVisual,
  listAircraft,
  type AircraftVisual,
} from "@/features/aircraft/data";
import {
  getRocketVisual,
  listRockets,
  type RocketVisual,
} from "@/features/rockets/data";

/**
 * Credit fields the imagery task adds to each visual record (spec 12.3).
 * Declared optional here so the Credits page keeps rendering while those
 * fields are being filled in, and after they become required.
 */
interface CreditFields {
  readonly credit?: string;
  readonly license?: string;
  readonly licenseUrl?: string;
  readonly modifications?: string;
  readonly sourcePageUrl?: string;
}

export type ImageCreditGroup = "Aircraft" | "Launch vehicles";

export interface ImageCredit {
  readonly alt: string;
  /** `object-position` for the registry card crop, which keeps the whole vehicle in frame. */
  readonly cardObjectPosition: string;
  readonly credit: string | null;
  readonly group: ImageCreditGroup;
  readonly license: string | null;
  readonly licenseUrl: string | null;
  readonly modifications: string | null;
  /** The file page when recorded, otherwise the recorded source URL. */
  readonly sourceUrl: string | null;
  readonly src: string;
  readonly vehicleId: string;
  readonly vehicleName: string;
}

function clean(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function toCredit(
  group: ImageCreditGroup,
  vehicle: { readonly id: string; readonly name: string },
  visual: (AircraftVisual | RocketVisual) & CreditFields,
): ImageCredit {
  return {
    alt: visual.alt,
    cardObjectPosition: visual.cardObjectPosition,
    credit: clean(visual.credit),
    group,
    license: clean(visual.license),
    licenseUrl: clean(visual.licenseUrl),
    modifications: clean(visual.modifications),
    sourceUrl: clean(visual.sourcePageUrl) ?? clean(visual.sourceUrl),
    src: visual.src,
    vehicleId: vehicle.id,
    vehicleName: vehicle.name,
  };
}

/** Every vehicle photograph shown on ORBIX, in registry order. */
export function listImageCredits(): readonly ImageCredit[] {
  const credits: ImageCredit[] = [];

  for (const aircraft of listAircraft()) {
    const visual = getAircraftVisual(aircraft.id);
    if (visual) credits.push(toCredit("Aircraft", aircraft, visual));
  }

  for (const rocket of listRockets()) {
    const visual = getRocketVisual(rocket.id);
    if (visual) credits.push(toCredit("Launch vehicles", rocket, visual));
  }

  return credits;
}

/** Host name shown as the source link's visible site name. */
export function describeSourceSite(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.endsWith("wikimedia.org") || host.endsWith("wikipedia.org")) {
      return "Wikimedia Commons";
    }
    if (host.endsWith("nasa.gov")) return "NASA";
    return host;
  } catch {
    return "Source";
  }
}
