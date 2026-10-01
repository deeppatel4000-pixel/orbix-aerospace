import type { Rocket } from "../../types";

export const starship = {
  category: "launch-vehicle",
  country: {
    isoCode: "US",
    name: "United States",
  },
  description:
    "A fully reusable two-stage launch system in active development, with 33 Raptor engines on the Super Heavy booster and six on the Starship upper stage, burning liquid methane and liquid oxygen.",
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
        "Recovering Starship means carrying hardware and propellant an expendable vehicle would not need: thermal protection, aerodynamic flaps and landing reserves. SpaceX’s lunar lander variant leaves out the Earth-return hardware, so reuse directly changes the vehicle’s mass and layout.",
      topic: "reusability",
    },
    {
      id: "starship-orbital-refilling-placeholder",
      status: "reviewed",
      summary:
        "Starship’s lunar missions depend on moving cryogenic propellant in orbit. NASA and SpaceX are developing depot and tanker flights so a vehicle can launch to low Earth orbit, refill there, and leave with the propellant needed for the Moon or other high-energy missions.",
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
