export type AircraftCardTreatment = "flagship" | "standard" | "wide";

export interface AircraftVisual {
  readonly alt: string;
  readonly cardTreatment: AircraftCardTreatment;
  readonly objectPosition: string;
  readonly sourceUrl: string;
  readonly src: string;
}

const aircraftVisuals = {
  "b-2-spirit": {
    alt: "B-2 Spirit flying above a blue atmospheric horizon",
    cardTreatment: "wide",
    objectPosition: "50% 48%",
    sourceUrl:
      "https://upload.wikimedia.org/wikipedia/commons/7/77/RAF_F-35B_integration_flying_training_with_USAF_B-2_30092019_-_4.jpg",
    src: "/images/aircraft/b-2-spirit.png",
  },
  "f-15-eagle": {
    alt: "F-15 Eagle banking in flight against a clear blue sky",
    cardTreatment: "wide",
    objectPosition: "50% 48%",
    sourceUrl:
      "https://upload.wikimedia.org/wikipedia/commons/a/a6/F-15C_Eagle_from_the_44th_Fighter_Squadron_flies_during_a_routine_training_exercise_April_15%2C_2019.jpg",
    src: "/images/aircraft/f-15-eagle.png",
  },
  "f-22-raptor": {
    alt: "F-22 Raptor viewed from above while banking in flight",
    cardTreatment: "flagship",
    objectPosition: "50% 44%",
    sourceUrl:
      "https://upload.wikimedia.org/wikipedia/commons/1/1e/F-22_Raptor_edit1_%28cropped%29.jpg",
    src: "/images/aircraft/f-22-raptor.png",
  },
  "f-35-lightning-ii": {
    alt: "F-35 Lightning II flying against a blue sky",
    cardTreatment: "standard",
    objectPosition: "50% 48%",
    sourceUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/F-35A_flight_%28cropped%29.jpg/1280px-F-35A_flight_%28cropped%29.jpg",
    src: "/images/aircraft/f-35-lightning-ii.png",
  },
  "sr-71-blackbird": {
    alt: "SR-71 Blackbird in high-altitude flight above the Earth",
    cardTreatment: "wide",
    objectPosition: "50% 50%",
    sourceUrl:
      "https://blackbirdsims.com/flight/products/SR71MSFS/images/03.jpg",
    src: "/images/aircraft/sr-71-blackbird.png",
  },
} as const satisfies Record<string, AircraftVisual>;

export function getAircraftVisual(id: string): AircraftVisual | undefined {
  return aircraftVisuals[id as keyof typeof aircraftVisuals];
}
