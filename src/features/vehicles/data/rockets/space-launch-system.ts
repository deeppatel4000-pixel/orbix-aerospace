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
      status: "reviewed",
      summary:
        "SLS Block 1 combines two five-segment solid boosters with four RS-25 engines on the core stage. The boosters supply most of the liftoff thrust, while the hydrogen-fueled RS-25s continue powering the core after booster separation.",
      topic: "staging",
    },
    {
      id: "sls-evolvability-placeholder",
      status: "reviewed",
      summary:
        "SLS is deliberately evolvable. Block 1 uses the Interim Cryogenic Propulsion Stage; Block 1B replaces it with the more capable Exploration Upper Stage, and Block 2 adds evolved boosters—raising deep-space payload capability without discarding the core architecture.",
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
