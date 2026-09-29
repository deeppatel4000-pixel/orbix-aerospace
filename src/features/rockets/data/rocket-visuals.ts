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
   * A shorter card title that the record name starts with, for a name that
   * would wrap in a card. The full name stays in the heading for assistive
   * technology.
   */
  readonly cardName?: string;
  /**
   * One factual line for the registry card, taken only from the vehicle
   * record, in one grammar for every vehicle: architecture or propulsion,
   * then type ("Twin-engine stealth fighter", "Three-stage heavy-lift
   * rocket"). At most 34 characters (CARD_SUMMARY_MAX_LENGTH), about 225px
   * at 14px, so it sets on one line in the narrowest card (about 240px of
   * text at 320px). Shown whole, never truncated; the visuals test enforces
   * the limit.
   */
  readonly cardSummary: string;
  /** Photographer or agency, as the licence asks to be credited. */
  readonly credit: string;
  /**
   * `object-position` for the first registry card from 64rem: the left
   * half of a two-column card, as tall as its grid row (narrower than 3:4,
   * so the crop only trims the sides).
   */
  readonly featureObjectPosition: string;
  /** Intrinsic height of the file in pixels. */
  readonly height: number;
  /** `object-position` for the full-bleed profile and registry hero. */
  readonly heroObjectPosition: string;
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
    cardSummary: "Two-stage partly reusable rocket",
    cardTreatment: "flagship",
    credit: "NASA/Tony Gray and Tim Powers",
    featureObjectPosition: "50% 0%",
    height: 1920,
    heroObjectPosition: "50% 13%",
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
    cardSummary: "Three-core heavy-lift rocket",
    cardTreatment: "standard",
    credit: "NASA/Kim Shiflett",
    featureObjectPosition: "40% 50%",
    height: 1920,
    heroObjectPosition: "50% 29%",
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
    cardSummary: "Three-stage heavy-lift rocket",
    cardTreatment: "wide",
    credit: "NASA",
    featureObjectPosition: "54% 50%",
    height: 1920,
    heroObjectPosition: "50% 21%",
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
    cardSummary: "Super heavy-lift crew rocket",
    cardTreatment: "standard",
    credit: "NASA/Michael DeMocker",
    featureObjectPosition: "78% 50%",
    height: 1920,
    heroObjectPosition: "50% 6%",
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
    cardSummary: "Two-stage fully reusable rocket",
    cardTreatment: "wide",
    credit: "Steve Jurvetson",
    featureObjectPosition: "72% 50%",
    height: 1920,
    heroObjectPosition: "50% 12%",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
    modifications: RESIZED,
    objectPosition: "50% 35%",
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
export const CARD_SUMMARY_MAX_LENGTH = 34;
