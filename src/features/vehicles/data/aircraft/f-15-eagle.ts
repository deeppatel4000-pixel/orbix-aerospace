import type { Aircraft } from "../../types";

export const f15Eagle = {
  category: "military-aircraft",
  country: {
    isoCode: "US",
    name: "United States",
  },
  description:
    "A twin-engine tactical fighter family. The baseline measurements use publicly released F-15C and F-15D characteristics where configuration matters.",
  dimensions: {
    length: {
      qualifier: "nominal",
      unit: "ft",
      value: 63.8,
    },
    wingspan: {
      qualifier: "nominal",
      unit: "ft",
      value: 42.8,
    },
  },
  engineeringAnalysis: [
    {
      id: "f-15-aerodynamics-placeholder",
      status: "placeholder",
      summary:
        "Placeholder: examine how wing loading, control authority, and thrust-to-weight ratio influence maneuvering performance.",
      topic: "aerodynamics",
    },
    {
      id: "f-15-propulsion-placeholder",
      status: "placeholder",
      summary:
        "Placeholder: compare engine selection, installed thrust, external stores, and mission-range tradeoffs across the aircraft family.",
      topic: "propulsion",
    },
  ],
  firstFlight: "1972-07-27",
  id: "f-15-eagle",
  manufacturer: "McDonnell Douglas (now Boeing)",
  name: "F-15 Eagle",
  performance: {
    maxSpeed: {
      qualifier: "maximum",
      unit: "mph",
      value: 1875,
    },
    range: {
      qualifier: "maximum",
      unit: "mi",
      value: 3450,
    },
    serviceCeiling: {
      qualifier: "nominal",
      unit: "ft",
      value: 65000,
    },
  },
  propulsion: {
    engines: [
      {
        id: "pratt-whitney-f100-pw-220",
        manufacturer: "Pratt & Whitney",
        name: "F100-PW-220",
        quantity: 2,
        thrust: {
          afterburner: {
            qualifier: "nominal",
            unit: "lbf",
            value: 23450,
          },
        },
        type: "low-bypass-turbofan",
      },
    ],
  },
  roles: ["air-superiority", "multirole"],
  variants: [
    {
      designation: "F-15A",
      firstFlight: "1972-07-27",
      id: "f-15a",
      name: "F-15A Eagle",
      notes: "Original single-seat air-superiority production variant.",
      status: "retired",
    },
    {
      designation: "F-15C",
      id: "f-15c",
      name: "F-15C Eagle",
      notes:
        "Improved single-seat air-superiority variant represented by the baseline performance data.",
      status: "in-service",
    },
    {
      designation: "F-15E",
      id: "f-15e",
      name: "F-15E Strike Eagle",
      notes: "Two-seat dual-role strike variant.",
      status: "in-service",
    },
    {
      designation: "F-15EX",
      id: "f-15ex",
      name: "F-15EX Eagle II",
      notes: "Current advanced production variant for the U.S. Air Force.",
      status: "in-service",
    },
  ],
  weights: {
    empty: {
      qualifier: "approximate",
      unit: "lb",
      value: 31700,
    },
    maximumTakeoff: {
      qualifier: "maximum",
      unit: "lb",
      value: 68000,
    },
  },
} satisfies Aircraft;
