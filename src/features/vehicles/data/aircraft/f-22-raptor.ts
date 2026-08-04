import type { Aircraft } from "../../types";

export const f22Raptor = {
  category: "military-aircraft",
  country: {
    isoCode: "US",
    name: "United States",
  },
  description:
    "A twin-engine air-superiority aircraft used here as the initial aircraft data example.",
  dimensions: {
    length: {
      qualifier: "nominal",
      unit: "ft",
      value: 62.1,
    },
    wingspan: {
      qualifier: "nominal",
      unit: "ft",
      value: 44.5,
    },
  },
  engineeringAnalysis: [
    {
      id: "f-22-aerodynamics-placeholder",
      status: "placeholder",
      summary:
        "Placeholder: examine how planform geometry, control surfaces, and mission requirements influence aerodynamic design.",
      topic: "aerodynamics",
    },
    {
      id: "f-22-propulsion-placeholder",
      status: "placeholder",
      summary:
        "Placeholder: compare installed thrust, supercruise objectives, and propulsion integration tradeoffs.",
      topic: "propulsion",
    },
  ],
  firstFlight: "1997-09-07",
  id: "f-22-raptor",
  manufacturer: "Lockheed Martin and Boeing",
  name: "F-22 Raptor",
  performance: {
    maxSpeed: {
      qualifier: "approximate",
      unit: "Mach",
      value: 2,
    },
    range: {
      qualifier: "minimum",
      unit: "mi",
      value: 1850,
    },
    serviceCeiling: {
      qualifier: "minimum",
      unit: "ft",
      value: 50000,
    },
  },
  propulsion: {
    engines: [
      {
        id: "pratt-whitney-f119-pw-100",
        manufacturer: "Pratt & Whitney",
        name: "F119-PW-100",
        quantity: 2,
        thrust: {
          afterburner: {
            qualifier: "approximate",
            unit: "kN",
            value: 156,
          },
        },
        type: "low-bypass-turbofan",
      },
    ],
  },
  roles: ["air-superiority", "multirole"],
  variants: [
    {
      designation: "F-22A",
      firstFlight: "1997-09-07",
      id: "f-22a",
      name: "F-22A Raptor",
      notes: "Primary production variant represented by this example record.",
      status: "in-service",
    },
  ],
  weights: {
    empty: {
      qualifier: "approximate",
      unit: "lb",
      value: 43340,
    },
    maximumTakeoff: {
      qualifier: "approximate",
      unit: "lb",
      value: 83500,
    },
  },
} satisfies Aircraft;
