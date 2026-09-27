export type AircraftCardTreatment = "flagship" | "standard" | "wide";

export interface AircraftVisual {
  /** Plain description of what the photograph shows. */
  readonly alt: string;
  readonly cardTreatment: AircraftCardTreatment;
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
    cardTreatment: "wide",
    credit: "U.S. Air Force photo by Staff Sgt. Bennie J. Davis III",
    ...PUBLIC_DOMAIN_USAF,
    modifications: RESIZED,
    objectPosition: "50% 45%",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:B-2_Spirit_original.jpg",
    src: "/images/aircraft/b-2-spirit.webp",
  },
  "f-15-eagle": {
    alt: "F-15C Eagle banking toward the camera over the ocean",
    cardTreatment: "wide",
    credit: "U.S. Air Force photo by Airman 1st Class Matthew Seefeldt",
    ...PUBLIC_DOMAIN_USAF,
    modifications: RESIZED,
    objectPosition: "50% 50%",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:F-15C_Eagle_from_the_44th_Fighter_Squadron_flies_during_a_routine_training_exercise_April_15,_2019.jpg",
    src: "/images/aircraft/f-15-eagle.webp",
  },
  "f-22-raptor": {
    alt: "F-22 Raptor seen from slightly above, flying over dark blue water",
    cardTreatment: "flagship",
    credit: "U.S. Air Force photo by Master Sgt. Andy Dunaway",
    ...PUBLIC_DOMAIN_USAF,
    modifications: RESIZED,
    objectPosition: "50% 48%",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:F-22_Raptor.JPG",
    src: "/images/aircraft/f-22-raptor.webp",
  },
  "f-35-lightning-ii": {
    alt: "F-35A Lightning II in flight against a clear blue sky",
    cardTreatment: "standard",
    credit: "U.S. Air Force photo by Master Sgt. Donald R. Allen",
    ...PUBLIC_DOMAIN_USAF,
    modifications:
      "Converted to WebP from the Wikimedia Commons crop of the original",
    objectPosition: "50% 50%",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:F-35A_flight_(cropped).jpg",
    src: "/images/aircraft/f-35-lightning-ii.webp",
  },
  "sr-71-blackbird": {
    alt: "NASA SR-71B Blackbird flying over the snow-covered Sierra Nevada mountains",
    cardTreatment: "wide",
    credit: "NASA",
    ...PUBLIC_DOMAIN_NASA,
    modifications: RESIZED,
    objectPosition: "50% 55%",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:SR-71_Over_Snow_Capped_Mountains_-_GPN-2000-000162.jpg",
    src: "/images/aircraft/sr-71-blackbird.webp",
  },
} as const satisfies Record<string, AircraftVisual>;

export function getAircraftVisual(id: string): AircraftVisual | undefined {
  return aircraftVisuals[id as keyof typeof aircraftVisuals];
}
