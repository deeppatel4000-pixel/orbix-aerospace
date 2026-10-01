import type { Rocket } from "../../types";

export const falconHeavy = {
  category: "launch-vehicle",
  country: {
    isoCode: "US",
    name: "United States",
  },
  description:
    "A partially reusable heavy-lift launch vehicle built around three modified Falcon 9 first-stage cores and a common Falcon upper stage.",
  dimensions: {
    height: {
      qualifier: "nominal",
      unit: "m",
      value: 70,
    },
  },
  engineeringAnalysis: [
    {
      id: "falcon-heavy-core-loading-placeholder",
      status: "reviewed",
      summary:
        "Falcon Heavy joins three Falcon first-stage cores into one launch vehicle, so the side-booster separation and the longer burn of the center core have to work as one ascent. It has more than five million pounds of liftoff thrust and can lift nearly 64 tonnes to LEO.",
      topic: "structures",
    },
    {
      id: "falcon-heavy-recovery-placeholder",
      status: "reviewed",
      summary:
        "Falcon Heavy can recover and refly its side boosters, but what it recovers depends on mission energy. On some high-energy missions the side boosters land and the center core is expended, giving up reusable hardware for the velocity a demanding payload needs.",
      topic: "reusability",
    },
  ],
  firstFlight: "2018-02-06",
  id: "falcon-heavy",
  manufacturer: "SpaceX",
  mass: {
    liftoff: {
      qualifier: "nominal",
      unit: "kg",
      value: 1420788,
    },
  },
  name: "Falcon Heavy",
  performance: {
    liftoffThrust: {
      qualifier: "nominal",
      unit: "kN",
      value: 22819,
    },
    payloadCapabilities: [
      {
        configuration: "expendable",
        mass: {
          qualifier: "maximum",
          unit: "kg",
          value: 63800,
        },
        orbit: "LEO",
      },
      {
        configuration: "expendable",
        mass: {
          qualifier: "maximum",
          unit: "kg",
          value: 26700,
        },
        orbit: "GTO",
      },
    ],
    supportedOrbits: ["LEO", "GTO", "GEO", "escape"],
  },
  stages: [
    {
      engines: [
        {
          cycle: "gas-generator",
          id: "falcon-heavy-booster-merlin-1d",
          manufacturer: "SpaceX",
          name: "Merlin 1D",
          quantity: 18,
          thrust: {
            seaLevel: {
              qualifier: "maximum",
              unit: "kN",
              value: 845,
            },
          },
        },
      ],
      id: "falcon-heavy-side-boosters",
      name: "Side boosters (two cores)",
      propellant: {
        fuel: "RP-1",
        oxidizer: "Liquid oxygen",
      },
      reusable: true,
      stageNumber: 1,
    },
    {
      engines: [
        {
          cycle: "gas-generator",
          id: "falcon-heavy-core-merlin-1d",
          manufacturer: "SpaceX",
          name: "Merlin 1D",
          quantity: 9,
          thrust: {
            seaLevel: {
              qualifier: "maximum",
              unit: "kN",
              value: 845,
            },
          },
        },
      ],
      id: "falcon-heavy-center-core",
      name: "Center core",
      propellant: {
        fuel: "RP-1",
        oxidizer: "Liquid oxygen",
      },
      reusable: true,
      stageNumber: 1,
    },
    {
      engines: [
        {
          cycle: "gas-generator",
          id: "falcon-heavy-merlin-vacuum",
          manufacturer: "SpaceX",
          name: "Merlin Vacuum",
          quantity: 1,
          thrust: {
            vacuum: {
              qualifier: "nominal",
              unit: "kN",
              value: 981,
            },
          },
        },
      ],
      id: "falcon-heavy-second-stage",
      name: "Second stage",
      propellant: {
        fuel: "RP-1",
        oxidizer: "Liquid oxygen",
      },
      reusable: false,
      stageNumber: 2,
    },
  ],
} satisfies Rocket;
