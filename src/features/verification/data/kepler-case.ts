import { calculateKeplerPosition } from "@/features/engineering-lab/calculators";

import type { VerificationCase } from "./verification-cases";

/**
 * Kepler's equation, checked against Braeunig problem 4.14 (read from
 * http://www.braeunig.us/space/problem.htm on 2026-10-01). Problem 4.13
 * sets the orbit (a = 7,500 km, e = 0.1) and problem 4.14 asks for the true
 * anomaly 20 minutes after the satellite passes a true anomaly of 90°,
 * solving M = E - e sin E "by iteration".
 *
 * Listed last in the orbital mechanics group of `verificationGroups`.
 */

export const keplerVerificationInputs = {
  eccentricity: 0.1,
  elapsedTimeSeconds: 1_200,
  gravitationalParameter: 3.986005e14,
  initialTrueAnomalyRadians: Math.PI / 2,
  semiMajorAxisMetres: 7_500_000,
} as const;

const kepler = calculateKeplerPosition(keplerVerificationInputs);

/** Rows that fall outside the source's printed rounding (see the note). */
export const keplerOutsideRoundingRowIds = [
  "kepler-braeunig-4-14-mean-anomaly",
  "kepler-braeunig-4-14-eccentric-anomaly",
] as const;

export const keplerVerificationCase: VerificationCase = {
  calculator: "calculateKeplerPosition",
  id: "kepler-braeunig-4-14",
  inputs: [
    "Semi-major axis 7,500,000 m, eccentricity 0.1",
    "Starting true anomaly 90°, time elapsed 1,200 s (20 minutes)",
    "GM = 3.986005 × 10¹⁴ m³/s²",
  ],
  location:
    "Problem 4.14, true anomaly 20 minutes later (orbit from problem 4.13), method 2",
  notes: [
    "The source rounds the mean motion to 0.00097202 rad/s and the starting mean anomaly to 1.37113 rad before adding them, so its M is 2.537554 rad. ORBIX keeps full precision and gets 2.537559 rad, which puts M and E just outside the printed rounding. Solving Kepler's equation from the source's own M gives E = 2.58996 rad, the printed value. The true anomaly agrees within rounding either way.",
  ],
  rows: [
    {
      id: "kepler-braeunig-4-14-mean-anomaly",
      orbix: kepler.meanAnomalyRadians,
      quantity: "Mean anomaly M",
      reference: { printed: "2.53755", resolution: 0.00001, value: 2.53755 },
      unit: "rad",
    },
    {
      id: "kepler-braeunig-4-14-eccentric-anomaly",
      orbix: kepler.eccentricAnomalyRadians,
      quantity: "Eccentric anomaly E",
      reference: {
        printed: "2.58996 radians",
        resolution: 0.00001,
        value: 2.58996,
      },
      unit: "rad",
    },
    {
      id: "kepler-braeunig-4-14-true-anomaly",
      orbix: kepler.trueAnomalyRadians,
      quantity: "True anomaly ν",
      reference: { printed: "2.64034", resolution: 0.00001, value: 2.64034 },
      unit: "rad",
    },
  ],
  sourceId: "braeunig",
  title: "Position on an elliptical orbit from Kepler's equation",
};
