import type { Rocket } from "../../types";

export const falcon9 = {
  category: "launch-vehicle",
  country: {
    isoCode: "US",
    name: "United States",
  },
  description:
    "A partially reusable two-stage launch vehicle that uses a nine-engine booster and a restartable vacuum upper stage to serve Earth-orbit and escape missions.",
  dimensions: {
    height: {
      qualifier: "nominal",
      unit: "m",
      value: 70,
    },
  },
  engineeringAnalysis: [
    {
      id: "falcon-9-staging-placeholder",
      status: "placeholder",
      summary:
        "Placeholder: examine how propellant allocation, engine count, and staging affect mission performance.",
      topic: "staging",
    },
    {
      id: "falcon-9-reusability-placeholder",
      status: "placeholder",
      summary:
        "Placeholder: compare the payload and propellant tradeoffs introduced by first-stage recovery.",
      topic: "reusability",
    },
  ],
  firstFlight: "2010-06-04",
  id: "falcon-9",
  manufacturer: "SpaceX",
  mass: {
    liftoff: {
      qualifier: "nominal",
      unit: "kg",
      value: 549054,
    },
  },
  name: "Falcon 9",
  performance: {
    liftoffThrust: {
      qualifier: "maximum",
      unit: "kN",
      value: 7686,
    },
    payloadCapabilities: [
      {
        configuration: "expendable",
        mass: {
          qualifier: "maximum",
          unit: "kg",
          value: 22800,
        },
        orbit: "LEO",
      },
      {
        configuration: "expendable",
        mass: {
          qualifier: "maximum",
          unit: "kg",
          value: 8300,
        },
        orbit: "GTO",
      },
    ],
    supportedOrbits: ["LEO", "SSO", "MEO", "GTO", "HEO", "escape"],
  },
  stages: [
    {
      engines: [
        {
          cycle: "gas-generator",
          id: "merlin-1d",
          manufacturer: "SpaceX",
          name: "Merlin 1D",
          quantity: 9,
          thrust: {
            seaLevel: {
              qualifier: "maximum",
              unit: "kN",
              value: 854,
            },
          },
        },
      ],
      id: "falcon-9-first-stage",
      name: "First stage",
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
          id: "merlin-vacuum",
          manufacturer: "SpaceX",
          name: "Merlin Vacuum",
          quantity: 1,
          thrust: {
            vacuum: {
              qualifier: "approximate",
              unit: "kN",
              value: 981,
            },
          },
        },
      ],
      id: "falcon-9-second-stage",
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
