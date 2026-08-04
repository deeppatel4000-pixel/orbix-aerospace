import type { Rocket } from "../../types";

export const spaceLaunchSystem = {
  category: "launch-vehicle",
  country: {
    isoCode: "US",
    name: "United States",
  },
  description:
    "NASA's super heavy-lift launch vehicle represented in the flown Block 1 crew configuration with twin boosters, a four-engine core, and the ICPS upper stage.",
  dimensions: {
    height: {
      qualifier: "nominal",
      unit: "m",
      value: 98.3,
    },
  },
  engineeringAnalysis: [
    {
      id: "sls-parallel-staging-placeholder",
      status: "placeholder",
      summary:
        "Placeholder: analyze thrust sharing between the solid boosters and liquid core during the parallel first phase of ascent.",
      topic: "staging",
    },
    {
      id: "sls-evolvability-placeholder",
      status: "placeholder",
      summary:
        "Placeholder: compare Block 1 with planned upper-stage and booster evolutions without merging their performance values.",
      topic: "systems-engineering",
    },
  ],
  firstFlight: "2022-11-16",
  id: "space-launch-system",
  manufacturer: "NASA and industry partners",
  mass: {
    liftoff: {
      qualifier: "nominal",
      unit: "t",
      value: 2608,
    },
  },
  name: "Space Launch System (SLS)",
  performance: {
    liftoffThrust: {
      qualifier: "maximum",
      unit: "kN",
      value: 39144,
    },
    payloadCapabilities: [
      {
        configuration: "expendable",
        mass: {
          qualifier: "minimum",
          unit: "kg",
          value: 95000,
        },
        orbit: "LEO",
      },
      {
        configuration: "expendable",
        mass: {
          qualifier: "minimum",
          unit: "kg",
          value: 27000,
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
          cycle: "solid",
          id: "sls-five-segment-srb",
          manufacturer: "Northrop Grumman",
          name: "Five-segment solid rocket motor",
          quantity: 2,
          thrust: {
            seaLevel: {
              qualifier: "approximate",
              unit: "MN",
              value: 16,
            },
          },
        },
      ],
      id: "sls-block-1-boosters",
      name: "Five-segment solid rocket boosters",
      propellant: {
        fuel: "Aluminum and PBAN binder",
        oxidizer: "Ammonium perchlorate",
      },
      reusable: false,
      stageNumber: 1,
    },
    {
      engines: [
        {
          cycle: "staged-combustion",
          id: "sls-block-1-rs-25",
          manufacturer: "Aerojet Rocketdyne",
          name: "RS-25",
          quantity: 4,
          thrust: {
            seaLevel: {
              qualifier: "approximate",
              unit: "kN",
              value: 1850,
            },
            vacuum: {
              qualifier: "minimum",
              unit: "kN",
              value: 2277,
            },
          },
        },
      ],
      id: "sls-block-1-core-stage",
      name: "Core stage",
      propellant: {
        fuel: "Liquid hydrogen",
        oxidizer: "Liquid oxygen",
      },
      reusable: false,
      stageNumber: 1,
    },
    {
      engines: [
        {
          cycle: "expander",
          id: "sls-block-1-rl10b-2",
          manufacturer: "Aerojet Rocketdyne",
          name: "RL10B-2",
          quantity: 1,
          thrust: {
            vacuum: {
              qualifier: "approximate",
              unit: "kN",
              value: 110,
            },
          },
        },
      ],
      id: "sls-block-1-icps",
      name: "Interim Cryogenic Propulsion Stage",
      propellant: {
        fuel: "Liquid hydrogen",
        oxidizer: "Liquid oxygen",
      },
      reusable: false,
      stageNumber: 2,
    },
  ],
} satisfies Rocket;
