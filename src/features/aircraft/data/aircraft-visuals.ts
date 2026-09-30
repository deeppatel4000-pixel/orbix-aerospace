export type AircraftCardTreatment = "flagship" | "standard" | "wide";

export interface AircraftVisual {
  /** Plain description of what the photograph shows. */
  readonly alt: string;
  readonly cardTreatment: AircraftCardTreatment;
  /**
   * `object-position` for the 16:10 registry card. The profile hero and the
   * other surfaces keep using `objectPosition`.
   */
  readonly cardObjectPosition: string;
  /**
   * One factual line for the registry card, taken only from the vehicle
   * record: engines, then type ("Twin-engine stealth fighter"). At most
   * 31 characters (CARD_SUMMARY_MAX_LENGTH): the summary line is 223px
   * wide in the narrowest card (320px), where 33 characters wrapped.
   * Shown whole, never truncated; the visuals test enforces the limit.
   */
  readonly cardSummary: string;
  /** Photographer or agency, as the licence asks to be credited. */
  readonly credit: string;
  /**
   * `object-position` for the wide first registry card from 40rem: the
   * photograph across a two-column card at 2:1.
   */
  readonly featureObjectPosition: string;
  /** Intrinsic height of the file in pixels. */
  readonly height: number;
  /**
   * `object-position` for the profile hero banner: the y value keeps the
   * nose and the fins in frame where a wide window crops the photograph
   * top and bottom, and clear of the bottom fade under the heading.
   */
  readonly heroObjectPosition: string;
  /** Licence name, for example "Public domain (U.S. government work)" or "CC BY 2.0". */
  readonly license: string;
  /** Page that states the licence terms. */
  readonly licenseUrl: string;
  /** What was changed from the original file. */
  readonly modifications: string;
  readonly objectPosition: string;
  /**
   * The crop in the `/aircraft` registry hero, per breakpoint (below 48rem,
   * 48rem to 64rem, from 64rem). Only the featured aircraft needs one.
   */
  readonly registryHeroObjectPosition?: {
    readonly base: string;
    readonly lg: string;
    readonly md: string;
  };
  /** Human-readable file page for the original, not the raw image URL. */
  readonly sourceUrl: string;
  readonly src: string;
  /** Intrinsic width of the file in pixels. */
  readonly width: number;
}

const PUBLIC_DOMAIN_USAF = {
  license: "Public domain (U.S. government work)",
  licenseUrl:
    "https://commons.wikimedia.org/wiki/Template:PD-USGov-Military-Air_Force",
} as const;

const PUBLIC_DOMAIN_NASA = {
  license: "Public domain (U.S. government work)",
  licenseUrl: "https://commons.wikimedia.org/wiki/Template:PD-USGov-NASA",
} as const;

const RESIZED = "Resized and converted to WebP" as const;

const aircraftVisuals = {
  "b-2-spirit": {
    alt: "B-2 Spirit flying over the Pacific Ocean with scattered clouds far below",
    cardObjectPosition: "50% 50%",
    cardSummary: "Four-engine flying-wing bomber",
    cardTreatment: "wide",
    credit: "U.S. Air Force photo by Staff Sgt. Bennie J. Davis III",
    featureObjectPosition: "50% 35%",
    height: 1202,
    heroObjectPosition: "50% 40%",
    ...PUBLIC_DOMAIN_USAF,
    modifications: RESIZED,
    objectPosition: "50% 45%",
    // The featured aircraft on /aircraft (see aircraft-explorer.tsx). The
    // airframe spans 4.7 to 96.1 percent of the width and 25 to 48 percent
    // of the height, leaving open ocean across the lower half, so the spec
    // panel at the bottom right never covers it. From 64rem x = 58% keeps
    // both wingtips in frame wherever the hero is cropped at the sides
    // (1024x768 and 1152x864: x from 41 to 71 percent works). From 48rem to
    // 64rem (portrait tablet) the photograph is a banner above the text, so
    // it is centred. On the 4:3 phone plate 50% trims both tips evenly.
    registryHeroObjectPosition: {
      base: "50% 40%",
      lg: "58% 40%",
      md: "50% 40%",
    },
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:B-2_Spirit_original.jpg",
    src: "/images/aircraft/b-2-spirit.webp",
    width: 1920,
  },
  "f-15-eagle": {
    alt: "F-15C Eagle banking toward the camera over the ocean",
    cardObjectPosition: "50% 55%",
    cardSummary: "Twin-engine tactical fighter",
    cardTreatment: "wide",
    credit: "U.S. Air Force photo by Airman 1st Class Matthew Seefeldt",
    featureObjectPosition: "60% 50%",
    height: 1345,
    heroObjectPosition: "50% 58%",
    ...PUBLIC_DOMAIN_USAF,
    modifications: RESIZED,
    objectPosition: "50% 50%",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:F-15C_Eagle_from_the_44th_Fighter_Squadron_flies_during_a_routine_training_exercise_April_15,_2019.jpg",
    src: "/images/aircraft/f-15-eagle.webp",
    width: 1920,
  },
  "f-22-raptor": {
    alt: "F-22 Raptor seen from slightly above, flying over dark blue water",
    cardObjectPosition: "50% 50%",
    cardSummary: "Twin-engine stealth fighter",
    cardTreatment: "flagship",
    credit: "U.S. Air Force photo by Master Sgt. Andy Dunaway",
    // The 2:1 wide first registry card: the tail tip at 12 percent and the
    // nose at 78 percent of the height fit the 75 percent band this keeps.
    featureObjectPosition: "50% 30%",
    height: 1277,
    heroObjectPosition: "50% 58%",
    ...PUBLIC_DOMAIN_USAF,
    modifications: RESIZED,
    objectPosition: "50% 48%",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:F-22_Raptor.JPG",
    src: "/images/aircraft/f-22-raptor.webp",
    width: 1920,
  },
  "f-35-lightning-ii": {
    alt: "F-35A Lightning II in flight against a clear blue sky",
    cardObjectPosition: "50% 12%",
    cardSummary: "Single-engine fighter family",
    cardTreatment: "standard",
    credit: "U.S. Air Force photo by Master Sgt. Donald R. Allen",
    featureObjectPosition: "50% 40%",
    height: 1271,
    heroObjectPosition: "50% 62%",
    ...PUBLIC_DOMAIN_USAF,
    modifications:
      "Converted to WebP from the Wikimedia Commons crop of the original",
    objectPosition: "50% 50%",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:F-35A_flight_(cropped).jpg",
    src: "/images/aircraft/f-35-lightning-ii.webp",
    width: 1772,
  },
  "sr-71-blackbird": {
    alt: "NASA SR-71B Blackbird flying over the snow-covered Sierra Nevada mountains",
    cardObjectPosition: "50% 25%",
    cardSummary: "Twin-engine reconnaissance jet",
    cardTreatment: "wide",
    credit: "NASA",
    featureObjectPosition: "55% 50%",
    height: 1532,
    heroObjectPosition: "50% 62%",
    ...PUBLIC_DOMAIN_NASA,
    modifications: RESIZED,
    objectPosition: "50% 55%",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:SR-71_Over_Snow_Capped_Mountains_-_GPN-2000-000162.jpg",
    src: "/images/aircraft/sr-71-blackbird.webp",
    width: 1920,
  },
} as const satisfies Record<string, AircraftVisual>;

export function getAircraftVisual(id: string): AircraftVisual | undefined {
  return aircraftVisuals[id as keyof typeof aircraftVisuals];
}

/** The longest `cardSummary` that still sets on one line at 320px. */
export const CARD_SUMMARY_MAX_LENGTH = 31;
