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
      status: "reviewed",
      summary:
        "Starship’s recovery architecture carries hardware and propellant that an expendable vehicle would not need: thermal protection, aerodynamic flaps and landing reserves. SpaceX’s lunar lander variant removes Earth-return hardware, illustrating how reusability requirements directly shape vehicle mass and configuration.",
      topic: "reusability",
    },
    {
      id: "starship-orbital-refilling-placeholder",
      status: "reviewed",
      summary:
        "Starship’s lunar architecture depends on moving cryogenic propellant in orbit. NASA and SpaceX are developing depot-and-tanker operations so a vehicle can launch to low Earth orbit, refill there, and then depart with the propellant needed for lunar or other high-energy missions.",
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
