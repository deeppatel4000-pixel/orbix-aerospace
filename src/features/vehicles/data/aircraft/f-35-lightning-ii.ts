import type { Aircraft } from "../../types";

export const f35LightningII = {
  category: "military-aircraft",
  country: {
    isoCode: "US",
    name: "United States",
  },
  description:
    "A single-engine multirole fighter family. The baseline measurements in this record represent the conventional-takeoff F-35A variant.",
  dimensions: {
    length: {
      qualifier: "nominal",
      unit: "ft",
      value: 51,
    },
    wingspan: {
      qualifier: "nominal",
      unit: "ft",
      value: 35,
    },
  },
  engineeringAnalysis: [
    {
      id: "f-35-systems-placeholder",
      status: "reviewed",
      summary:
        "The F-35 treats sensors, avionics and networking as one mission system. Onboard fusion combines data before presenting it to the pilot, while the aircraft can share that picture with other forces—making information integration a vehicle-level design requirement.",
      topic: "systems-engineering",
    },
    {
      id: "f-35-variant-aerodynamics-placeholder",
      status: "reviewed",
      summary:
        "A common F-35 design supports three very different basing modes. The F-35B adds short-takeoff/vertical-landing hardware, while the F-35C uses a larger wing, stronger structure and more robust landing gear for catapult launches and arrested carrier recoveries.",
      topic: "aerodynamics",
    },
  ],
  firstFlight: "2006-12-15",
  id: "f-35-lightning-ii",
  manufacturer: "Lockheed Martin",
  name: "F-35 Lightning II",
  performance: {
    maxSpeed: {
      qualifier: "maximum",
      unit: "Mach",
      value: 1.6,
    },
    range: {
      qualifier: "minimum",
      unit: "mi",
      value: 1350,
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
        id: "pratt-whitney-f135-pw-100",
        manufacturer: "Pratt & Whitney",
        name: "F135-PW-100",
        quantity: 1,
        thrust: {
          maximum: {
            qualifier: "nominal",
            unit: "lbf",
            value: 43000,
          },
        },
        type: "low-bypass-turbofan",
      },
    ],
  },
  roles: ["multirole"],
  variants: [
    {
      designation: "F-35A",
      firstFlight: "2006-12-15",
      id: "f-35a",
      name: "F-35A Lightning II",
      notes:
        "Conventional-takeoff variant represented by the baseline measurements in this record.",
      status: "in-service",
    },
    {
      designation: "F-35B",
      firstFlight: "2008-06-11",
      id: "f-35b",
      name: "F-35B Lightning II",
      notes: "Short-takeoff and vertical-landing variant.",
      status: "in-service",
    },
    {
      designation: "F-35C",
      firstFlight: "2010-06-07",
      id: "f-35c",
      name: "F-35C Lightning II",
      notes: "Carrier variant with a larger wing and navalized structure.",
      status: "in-service",
    },
  ],
  weights: {
    empty: {
      qualifier: "nominal",
      unit: "lb",
      value: 29300,
    },
    maximumTakeoff: {
      qualifier: "approximate",
      unit: "lb",
      value: 70000,
    },
  },
} satisfies Aircraft;
