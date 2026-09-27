export type RocketCardTreatment = "flagship" | "standard" | "wide";

export interface RocketVisual {
  /** Plain description of what the photograph shows. */
  readonly alt: string;
  readonly cardTreatment: RocketCardTreatment;
  /** Photographer or agency, as the licence asks to be credited. */
  readonly credit: string;
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
}

const PUBLIC_DOMAIN_NASA = {
  license: "Public domain (U.S. government work)",
  licenseUrl: "https://commons.wikimedia.org/wiki/Template:PD-USGov-NASA",
} as const;

const RESIZED = "Resized and converted to WebP" as const;

const rocketVisuals = {
  "falcon-9": {
    alt: "Falcon 9 climbing away from Launch Complex 39A, with the launch tower and a cloud of steam below",
    cardTreatment: "flagship",
    credit: "NASA/Tony Gray and Tim Powers",
    ...PUBLIC_DOMAIN_NASA,
    modifications: RESIZED,
    objectPosition: "50% 35%",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:SpaceX_Falcon_9_rocket_soars_upward_after_lifting_off_from_historic_Launch_Complex_39A.jpg",
    src: "/images/rockets/falcon-9.webp",
  },
  "falcon-heavy": {
    alt: "Falcon Heavy lifting off beside its launch tower at Launch Complex 39A, with steam clouds spreading across the pad",
    cardTreatment: "standard",
    credit: "NASA/Kim Shiflett",
    ...PUBLIC_DOMAIN_NASA,
    modifications: RESIZED,
    objectPosition: "50% 45%",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:NASA%27s_SpaceX_Europa_Clipper_Liftoff_(KSC-20241014-PH-KLS01_0008).jpg",
    src: "/images/rockets/falcon-heavy.webp",
  },
  "saturn-v": {
    alt: "Saturn V lifting off beside its launch umbilical tower at Launch Complex 39A during the Apollo 11 launch",
    cardTreatment: "wide",
    credit: "NASA",
    ...PUBLIC_DOMAIN_NASA,
    modifications: RESIZED,
    objectPosition: "50% 45%",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Apollo_11_Launch_-_GPN-2000-000630.jpg",
    src: "/images/rockets/saturn-v.webp",
  },
  "space-launch-system": {
    alt: "Space Launch System lifting off from Launch Complex 39B for Artemis II, seen from across the water",
    cardTreatment: "standard",
    credit: "NASA/Michael DeMocker",
    ...PUBLIC_DOMAIN_NASA,
    modifications: RESIZED,
    objectPosition: "55% 35%",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Artemis_II_launch_(SLS_MAF_20260401_ArtemisIILaunch_02).jpg",
    src: "/images/rockets/space-launch-system.webp",
  },
  starship: {
    alt: "Starship on its Super Heavy booster rising above a large exhaust cloud during its fifth flight test",
    cardTreatment: "wide",
    credit: "Steve Jurvetson",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
    modifications: RESIZED,
    objectPosition: "50% 35%",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Liftoff_of_SpaceX_IFT-5_(54064037095).jpg",
    src: "/images/rockets/starship.webp",
  },
} as const satisfies Record<string, RocketVisual>;

export function getRocketVisual(id: string): RocketVisual | undefined {
  return rocketVisuals[id as keyof typeof rocketVisuals];
}
