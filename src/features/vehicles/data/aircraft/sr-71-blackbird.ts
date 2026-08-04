import type { Aircraft } from "../../types";

export const sr71Blackbird = {
  category: "military-aircraft",
  country: {
    isoCode: "US",
    name: "United States",
  },
  description:
    "A twin-engine, long-range strategic reconnaissance aircraft designed for sustained flight above Mach 3 and at very high altitude.",
  dimensions: {
    length: {
      qualifier: "nominal",
      unit: "ft",
      value: 107.4,
    },
    wingspan: {
      qualifier: "nominal",
      unit: "ft",
      value: 55.6,
    },
  },
  engineeringAnalysis: [
    {
      id: "sr-71-aerodynamics-placeholder",
      status: "placeholder",
      summary:
        "Placeholder: examine how slender-body geometry, chines, and the flight envelope shaped high-speed aerodynamic performance.",
      topic: "aerodynamics",
    },
    {
      id: "sr-71-propulsion-placeholder",
      status: "placeholder",
      summary:
        "Placeholder: study the interaction between variable-geometry inlets, the J58 engines, and sustained Mach 3 operation.",
      topic: "propulsion",
    },
    {
      id: "sr-71-structures-placeholder",
      status: "placeholder",
      summary:
        "Placeholder: investigate material selection, thermal expansion, and structural design for prolonged aerodynamic heating.",
      topic: "structures",
    },
  ],
  firstFlight: "1964-12-22",
  id: "sr-71-blackbird",
  manufacturer: "Lockheed",
  name: "SR-71 Blackbird",
  performance: {
    maxSpeed: {
      qualifier: "minimum",
      unit: "Mach",
      value: 3,
    },
    range: {
      qualifier: "minimum",
      unit: "mi",
      value: 2900,
    },
    serviceCeiling: {
      qualifier: "minimum",
      unit: "ft",
      value: 85000,
    },
  },
  propulsion: {
    engines: [
      {
        id: "pratt-whitney-j58",
        manufacturer: "Pratt & Whitney",
        name: "J58",
        quantity: 2,
        thrust: {
          afterburner: {
            qualifier: "nominal",
            unit: "lbf",
            value: 32500,
          },
        },
        type: "turbojet",
      },
    ],
  },
  roles: ["reconnaissance"],
  variants: [
    {
      designation: "SR-71A",
      firstFlight: "1964-12-22",
      id: "sr-71a",
      name: "SR-71A Blackbird",
      notes: "Primary operational reconnaissance variant.",
      status: "retired",
    },
    {
      designation: "SR-71B",
      id: "sr-71b",
      name: "SR-71B Blackbird",
      notes: "Dual-control training variant.",
      status: "retired",
    },
    {
      designation: "SR-71C",
      id: "sr-71c",
      name: "SR-71C Blackbird",
      notes:
        "Single hybrid trainer assembled from existing Blackbird components.",
      status: "retired",
    },
  ],
  weights: {
    empty: {
      qualifier: "approximate",
      unit: "lb",
      value: 67500,
    },
    maximumTakeoff: {
      qualifier: "approximate",
      unit: "lb",
      value: 172000,
    },
  },
} satisfies Aircraft;
