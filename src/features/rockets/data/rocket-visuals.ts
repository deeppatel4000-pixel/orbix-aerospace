export type RocketCardTreatment = "flagship" | "standard" | "wide";

export interface RocketVisual {
  /** Plain description of what the photograph shows. */
  readonly alt: string;
  readonly cardTreatment: RocketCardTreatment;
  /**
   * `object-position` for the 3:4 portrait registry card, chosen so the
   * whole vehicle stays in frame. Other surfaces keep `objectPosition`.
   */
  readonly cardObjectPosition: string;
  /**
   * Optional zoom for the stacked registry card, for a photograph whose
   * vehicle is small in the frame (SLS: about a quarter of the card height,
   * over trees and a wall), with the point it zooms towards. The frame
   * clips the overflow. The feature card and other surfaces are unscaled.
   */
  readonly cardScale?: number;
  readonly cardScaleOrigin?: string;
  /**
   * A shorter card title that the record name starts with, for a name that
   * would wrap in a card. The full name stays in the heading for assistive
   * technology.
   */
  readonly cardName?: string;
  /**
   * One factual line for the registry card, taken only from the stage
   * records: the engines and propellants ("Merlin engines on RP-1 and
   * LOX"), which the classification line above it (stage count and
   * reusability) does not give. At most 31 characters
   * (CARD_SUMMARY_MAX_LENGTH): the summary line is 223px wide in the
   * narrowest card (320px), where 33 characters wrapped. Shown whole,
   * never truncated; the visuals test enforces the limit.
   */
  readonly cardSummary: string;
  /**
   * Replaces the reuse clause of the classification ("fully reusable") on
   * the card and the profile, for a record whose reuse is a design goal
   * rather than a demonstrated fact (Starship: "a design in active
   * development").
   */
  readonly reuseLabel?: string;
  /** Photographer or agency, as the licence asks to be credited. */
  readonly credit: string;
  /**
   * `object-position` for the first registry card from 40rem: the left
   * half of a two-column card, as tall as the card (narrower than 3:4,
   * so the crop only trims the sides).
   */
  readonly featureObjectPosition: string;
  /** Intrinsic height of the file in pixels. */
  readonly height: number;
  /** `object-position` for the full-bleed profile and registry hero. */
  readonly heroObjectPosition: string;
  /**
   * `object-position` for the hero's 3:4 phone plate (below 48rem), chosen
   * so the whole vehicle, nose to pad, stays in frame.
   */
  readonly heroPhoneObjectPosition: string;
  /** Licence name, for example "Public domain (U.S. government work)" or "CC BY 2.0". */
  readonly license: string;
  /** Page that states the licence terms. */
  readonly licenseUrl: string;
  /** What was changed from the original file. */
  readonly modifications: string;
  readonly objectPosition: string;
  /** Human-readable file page for the original, not the raw image URL. */
  readonly sourceUrl: string;
  readonly src: string;
  /** Intrinsic width of the file in pixels. */
  readonly width: number;
}

const PUBLIC_DOMAIN_NASA = {
  license: "Public domain (U.S. government work)",
  licenseUrl: "https://commons.wikimedia.org/wiki/Template:PD-USGov-NASA",
} as const;

const RESIZED = "Resized and converted to WebP" as const;

const rocketVisuals = {
  "falcon-9": {
    alt: "Falcon 9 climbing away from Launch Complex 39A, with the launch tower and a cloud of steam below",
    cardObjectPosition: "50% 30%",
    cardSummary: "Merlin engines on RP-1 and LOX",
    cardTreatment: "flagship",
    credit: "NASA/Tony Gray and Tim Powers",
    featureObjectPosition: "50% 0%",
    height: 1920,
    heroObjectPosition: "50% 13%",
    heroPhoneObjectPosition: "50% 15%",
    ...PUBLIC_DOMAIN_NASA,
    modifications: RESIZED,
    objectPosition: "50% 35%",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:SpaceX_Falcon_9_rocket_soars_upward_after_lifting_off_from_historic_Launch_Complex_39A.jpg",
    src: "/images/rockets/falcon-9.webp",
    width: 1278,
  },
  "falcon-heavy": {
    alt: "Falcon Heavy lifting off beside its launch tower at Launch Complex 39A, with steam clouds spreading across the pad",
    cardObjectPosition: "50% 40%",
    cardSummary: "Three Merlin-powered cores",
    cardTreatment: "standard",
    credit: "NASA/Kim Shiflett",
    featureObjectPosition: "40% 50%",
    height: 1920,
    heroObjectPosition: "50% 29%",
    heroPhoneObjectPosition: "50% 30%",
    ...PUBLIC_DOMAIN_NASA,
    modifications: RESIZED,
    objectPosition: "50% 45%",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:NASA%27s_SpaceX_Europa_Clipper_Liftoff_(KSC-20241014-PH-KLS01_0008).jpg",
    src: "/images/rockets/falcon-heavy.webp",
    width: 1281,
  },
  "saturn-v": {
    alt: "Saturn V lifting off beside its launch umbilical tower at Launch Complex 39A during the Apollo 11 launch",
    cardObjectPosition: "45% 50%",
    cardSummary: "F-1 and J-2 engines",
    cardTreatment: "wide",
    credit: "NASA",
    featureObjectPosition: "54% 50%",
    height: 1920,
    heroObjectPosition: "50% 21%",
    heroPhoneObjectPosition: "50% 55%",
    ...PUBLIC_DOMAIN_NASA,
    modifications: RESIZED,
    objectPosition: "50% 45%",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Apollo_11_Launch_-_GPN-2000-000630.jpg",
    src: "/images/rockets/saturn-v.webp",
    width: 1536,
  },
  "space-launch-system": {
    alt: "Space Launch System lifting off from Launch Complex 39B for Artemis II, seen from across the water",
    cardName: "Space Launch System",
    cardObjectPosition: "50% 0%",
    cardScale: 1.25,
    cardScaleOrigin: "55% 10%",
    cardSummary: "Solid boosters and four RS-25s",
    cardTreatment: "standard",
    credit: "NASA/Michael DeMocker",
    featureObjectPosition: "78% 50%",
    height: 1920,
    heroObjectPosition: "50% 6%",
    heroPhoneObjectPosition: "50% 0%",
    ...PUBLIC_DOMAIN_NASA,
    modifications: RESIZED,
    objectPosition: "55% 35%",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Artemis_II_launch_(SLS_MAF_20260401_ArtemisIILaunch_02).jpg",
    src: "/images/rockets/space-launch-system.webp",
    width: 1280,
  },
  starship: {
    alt: "Starship on its Super Heavy booster rising above a large exhaust cloud during its fifth flight test",
    cardObjectPosition: "100% 50%",
    cardSummary: "Raptor engines on methane",
    cardTreatment: "wide",
    credit: "Steve Jurvetson",
    featureObjectPosition: "72% 50%",
    height: 1920,
    heroObjectPosition: "50% 12%",
    heroPhoneObjectPosition: "57% 50%",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
    modifications: RESIZED,
    objectPosition: "50% 35%",
    reuseLabel: "designed for full reuse",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Liftoff_of_SpaceX_IFT-5_(54064037095).jpg",
    src: "/images/rockets/starship.webp",
    width: 1676,
  },
} as const satisfies Record<string, RocketVisual>;

export function getRocketVisual(id: string): RocketVisual | undefined {
  return rocketVisuals[id as keyof typeof rocketVisuals];
}

/** The longest `cardSummary` that still sets on one line at 320px. */
export const CARD_SUMMARY_MAX_LENGTH = 31;
