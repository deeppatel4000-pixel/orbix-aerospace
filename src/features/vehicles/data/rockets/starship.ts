import type { Rocket } from "../../types";

export const starship = {
  category: "launch-vehicle",
  country: {
    isoCode: "US",
    name: "United States",
  },
  description:
    "A fully reusable launch-system design in active development, represented as a labeled 2026 public snapshot with published system targets and the 33-plus-six engine flight architecture.",
  dimensions: {
    height: {
      qualifier: "nominal",
      unit: "m",
      value: 124.4,
    },
  },
  engineeringAnalysis: [
    {
      id: "starship-full-reuse-placeholder",
      status: "placeholder",
      summary:
        "Placeholder: examine the mass, thermal-protection, and propellant reserves required to recover both stages.",
      topic: "reusability",
    },
    {
      id: "starship-orbital-refilling-placeholder",
      status: "placeholder",
      summary:
        "Placeholder: study how on-orbit propellant transfer changes payload capability for cislunar and interplanetary missions.",
      topic: "mission-design",
    },
  ],
  firstFlight: "2023-04-20",
  id: "starship",
  manufacturer: "SpaceX",
  mass: {
    liftoff: {
      qualifier: "nominal",
      unit: "kg",
      value: 5533000,
    },
  },
  name: "Starship",
  performance: {
    liftoffThrust: {
      qualifier: "approximate",
      unit: "MN",
      value: 74.4,
    },
    payloadCapabilities: [
      {
        configuration: "reusable",
        mass: {
          qualifier: "minimum",
          unit: "kg",
          value: 100000,
        },
        orbit: "LEO",
      },
    ],
    supportedOrbits: ["LEO", "GTO", "TLI", "escape"],
  },
  stages: [
    {
      engines: [
        {
          cycle: "full-flow-staged-combustion",
          id: "starship-super-heavy-raptor",
          manufacturer: "SpaceX",
          name: "Raptor",
          quantity: 33,
          thrust: {
            seaLevel: {
              qualifier: "approximate",
              unit: "MN",
              value: 2.26,
            },
          },
        },
      ],
      id: "starship-super-heavy",
      name: "Super Heavy booster (33-engine flight architecture)",
      propellant: {
        fuel: "Liquid methane",
        oxidizer: "Liquid oxygen",
      },
      reusable: true,
      stageNumber: 1,
    },
    {
      engines: [
        {
          cycle: "full-flow-staged-combustion",
          id: "starship-upper-stage-raptor-sea-level",
          manufacturer: "SpaceX",
          name: "Raptor sea-level",
          quantity: 3,
          thrust: {
            seaLevel: {
              qualifier: "approximate",
              unit: "MN",
              value: 2.26,
            },
          },
        },
        {
          cycle: "full-flow-staged-combustion",
          id: "starship-upper-stage-raptor-vacuum",
          manufacturer: "SpaceX",
          name: "Raptor Vacuum",
          quantity: 3,
          thrust: {
            vacuum: {
              qualifier: "approximate",
              unit: "MN",
              value: 2.58,
            },
          },
        },
      ],
      id: "starship-upper-stage",
      name: "Starship upper stage (six-engine flight architecture)",
      propellant: {
        fuel: "Liquid methane",
        oxidizer: "Liquid oxygen",
      },
      reusable: true,
      stageNumber: 2,
    },
  ],
} satisfies Rocket;
