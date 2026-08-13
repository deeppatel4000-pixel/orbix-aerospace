import type { Rocket } from "../../types";

export const saturnV = {
  category: "launch-vehicle",
  country: {
    isoCode: "US",
    name: "United States",
  },
  description:
    "The three-stage heavy-lift launch vehicle developed for Apollo lunar missions, represented here in its crewed lunar-mission configuration.",
  dimensions: {
    height: {
      qualifier: "approximate",
      unit: "m",
      value: 111,
    },
  },
  engineeringAnalysis: [
    {
      id: "saturn-v-staging-placeholder",
      status: "reviewed",
      summary:
        "Saturn V split the lunar mission across propellants optimized for different phases: the S-IC first stage burned RP-1/LOX for very high liftoff thrust, while the S-II and S-IVB used hydrogen/oxygen for high-efficiency upper-stage work. The S-IVB could restart in orbit for translunar injection.",
      topic: "staging",
    },
    {
      id: "saturn-v-structures-placeholder",
      status: "reviewed",
      summary:
        "Saturn V’s structure had to carry millions of pounds of propellant and transmit engine, aerodynamic and staging loads while staying light enough to reach the Moon. NASA’s S-IC alone stood 138 feet tall, yet structural mass directly competed with payload and propellant performance.",
      topic: "structures",
    },
  ],
  firstFlight: "1967-11-09",
  id: "saturn-v",
  manufacturer: "NASA and Apollo prime contractors",
  mass: {
    liftoff: {
      qualifier: "approximate",
      unit: "kg",
      value: 2800000,
    },
  },
  name: "Saturn V",
  performance: {
    liftoffThrust: {
      qualifier: "approximate",
      unit: "MN",
      value: 34.5,
    },
    payloadCapabilities: [
      {
        configuration: "expendable",
        mass: {
          qualifier: "approximate",
          unit: "kg",
          value: 118000,
        },
        orbit: "LEO",
      },
      {
        configuration: "expendable",
        mass: {
          qualifier: "approximate",
          unit: "kg",
          value: 43500,
        },
        orbit: "TLI",
      },
    ],
    supportedOrbits: ["LEO", "TLI", "escape"],
  },
  stages: [
    {
      engines: [
        {
          cycle: "gas-generator",
          id: "saturn-v-f-1",
          manufacturer: "Rocketdyne",
          name: "F-1",
          quantity: 5,
          thrust: {
            seaLevel: {
              qualifier: "approximate",
              unit: "MN",
              value: 6.77,
            },
          },
        },
      ],
      id: "saturn-v-s-ic",
      name: "S-IC first stage",
      propellant: {
        fuel: "RP-1",
        oxidizer: "Liquid oxygen",
      },
      reusable: false,
      stageNumber: 1,
    },
    {
      engines: [
        {
          cycle: "gas-generator",
          id: "saturn-v-s-ii-j-2",
          manufacturer: "Rocketdyne",
          name: "J-2",
          quantity: 5,
          thrust: {
            vacuum: {
              qualifier: "approximate",
              unit: "MN",
              value: 1.03,
            },
          },
        },
      ],
      id: "saturn-v-s-ii",
      name: "S-II second stage",
      propellant: {
        fuel: "Liquid hydrogen",
        oxidizer: "Liquid oxygen",
      },
      reusable: false,
      stageNumber: 2,
    },
    {
      engines: [
        {
          cycle: "gas-generator",
          id: "saturn-v-s-ivb-j-2",
          manufacturer: "Rocketdyne",
          name: "J-2",
          quantity: 1,
          thrust: {
            vacuum: {
              qualifier: "approximate",
              unit: "MN",
              value: 1.03,
            },
          },
        },
      ],
      id: "saturn-v-s-ivb",
      name: "S-IVB third stage",
      propellant: {
        fuel: "Liquid hydrogen",
        oxidizer: "Liquid oxygen",
      },
      reusable: false,
      stageNumber: 3,
    },
  ],
} satisfies Rocket;
