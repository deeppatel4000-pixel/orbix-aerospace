import type { Aircraft } from "../../types";

export const b2Spirit = {
  category: "military-aircraft",
  country: {
    isoCode: "US",
    name: "United States",
  },
  description:
    "A four-engine, long-range heavy bomber built around a flying-wing configuration and publicly documented low-observable design principles.",
  dimensions: {
    length: {
      qualifier: "nominal",
      unit: "ft",
      value: 69,
    },
    wingspan: {
      qualifier: "nominal",
      unit: "ft",
      value: 172,
    },
  },
  engineeringAnalysis: [
    {
      id: "b-2-flying-wing-placeholder",
      status: "reviewed",
      summary:
        "The B-2 combines the aerodynamic efficiency of a flying wing with shaping chosen for low observability. Integrating lift, payload volume and stealth into one broad airframe reduces the distinction between aerodynamic and signature design decisions.",
      topic: "aerodynamics",
    },
    {
      id: "b-2-systems-placeholder",
      status: "reviewed",
      summary:
        "B-2 survivability is produced by the whole airframe: flying-wing geometry, composite materials, special coatings and reduced infrared, acoustic, electromagnetic and radar signatures. Even surface-condition maintenance is therefore part of preserving mission performance.",
      topic: "systems-engineering",
    },
  ],
  firstFlight: "1989-07-17",
  id: "b-2-spirit",
  manufacturer: "Northrop Grumman",
  name: "B-2 Spirit",
  performance: {
    maxSpeed: {
      qualifier: "maximum",
      unit: "Mach",
      value: 0.95,
    },
    range: {
      qualifier: "approximate",
      unit: "nmi",
      value: 6000,
    },
    serviceCeiling: {
      qualifier: "nominal",
      unit: "ft",
      value: 50000,
    },
  },
  propulsion: {
    engines: [
      {
        id: "general-electric-f118-ge-100",
        manufacturer: "General Electric",
        name: "F118-GE-100",
        quantity: 4,
        thrust: {
          maximum: {
            qualifier: "nominal",
            unit: "lbf",
            value: 17300,
          },
        },
        type: "low-bypass-turbofan",
      },
    ],
  },
  roles: ["bomber", "multirole"],
  variants: [
    {
      designation: "B-2A",
      firstFlight: "1989-07-17",
      id: "b-2a",
      name: "B-2A Spirit",
      notes: "Operational production configuration represented by this record.",
      status: "in-service",
    },
  ],
  weights: {
    empty: {
      qualifier: "approximate",
      unit: "lb",
      value: 160000,
    },
    maximumTakeoff: {
      qualifier: "maximum",
      unit: "lb",
      value: 336500,
    },
  },
} satisfies Aircraft;
