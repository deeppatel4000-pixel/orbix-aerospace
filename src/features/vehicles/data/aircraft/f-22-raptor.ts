import type { Aircraft } from "../../types";

export const f22Raptor = {
  category: "military-aircraft",
  country: {
    isoCode: "US",
    name: "United States",
  },
  description:
    "A stealth air-dominance fighter combining supercruise, advanced avionics and high maneuverability for contested airspace.",
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
      status: "reviewed",
      summary:
        "The F-22 combines aerodynamic shaping, digital flight controls and two-dimensional thrust vectoring. These keep it controllable and maneuverable at high angles of attack without giving up its low-observable planform.",
      topic: "aerodynamics",
    },
    {
      id: "f-22-propulsion-placeholder",
      status: "reviewed",
      summary:
        "Two F119-PW-100 engines, each in the 35,000-pound-thrust class, let the F-22 cruise above Mach 1.5 without afterburner. Supercruise gives it speed and range without the fuel cost of running the afterburner continuously.",
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
      notes:
        "Single-seat production Raptor and the U.S. Air Force's operational F-22 variant.",
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
