export type RocketCardTreatment = "flagship" | "standard" | "wide";

export interface RocketVisual {
  readonly alt: string;
  readonly cardTreatment: RocketCardTreatment;
  readonly objectPosition: string;
  readonly sourceUrl: string;
  readonly src: string;
}

const rocketVisuals = {
  "falcon-9": {
    alt: "Falcon 9 ascending from its coastal launch complex",
    cardTreatment: "flagship",
    objectPosition: "50% 42%",
    sourceUrl:
      "https://storage.googleapis.com/nextspaceflight/media/rockets/Falcon_9_Block_5.webp",
    src: "/images/rockets/falcon-9.png",
  },
  "falcon-heavy": {
    alt: "Falcon Heavy climbing through a blue sky under full engine power",
    cardTreatment: "standard",
    objectPosition: "50% 52%",
    sourceUrl: "https://cdn.mos.cms.futurecdn.net/MHy4P6q3tVwgDGdw69XwoQ.jpg",
    src: "/images/rockets/falcon-heavy.png",
  },
  "saturn-v": {
    alt: "Saturn V lifting away from Launch Complex 39A during Apollo 11",
    cardTreatment: "wide",
    objectPosition: "50% 52%",
    sourceUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Apollo_11_Launch_-_GPN-2000-000630.jpg/960px-Apollo_11_Launch_-_GPN-2000-000630.jpg",
    src: "/images/rockets/saturn-v.png",
  },
  "space-launch-system": {
    alt: "Space Launch System rising beside its launch tower",
    cardTreatment: "standard",
    objectPosition: "50% 45%",
    sourceUrl:
      "https://upload.wikimedia.org/wikipedia/commons/b/b1/Artemis_II_launch_%28SLS_MAF_20260401_ArtemisIILaunch_02%29_crop.jpg",
    src: "/images/rockets/space-launch-system.png",
  },
  starship: {
    alt: "Starship lifting from the pad amid an illuminated exhaust plume",
    cardTreatment: "wide",
    objectPosition: "50% 48%",
    sourceUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/SpaceX_Starship_ignition_during_IFT-5.jpg/1280px-SpaceX_Starship_ignition_during_IFT-5.jpg",
    src: "/images/rockets/starship.png",
  },
} as const satisfies Record<string, RocketVisual>;

export function getRocketVisual(id: string): RocketVisual | undefined {
  return rocketVisuals[id as keyof typeof rocketVisuals];
}
