import {
  calculateEscapeVelocity,
  calculateHohmannTransfer,
  calculateIsentropicFlow,
  calculateNormalShock,
  calculateObliqueShock,
  calculateOrbitalPlaneChange,
  calculateRocketEquation,
  calculateStandardAtmosphere,
  calculateTotalPressureRecovery,
  calculateVisViva,
} from "@/features/engineering-lab/calculators";

import { keplerVerificationCase } from "./kepler-case";

/**
 * Published reference values for the /verification page.
 *
 * Every reference value below was read directly from the cited document on
 * 2026-09-28. `printed` records the value exactly as the source prints it;
 * `value` is the same number in the unit shown on the page; `resolution` is
 * the unit of the last printed digit in that unit.
 *
 * ORBIX values are never typed in here: each `orbix` is the return value of
 * the Engineering Lab calculator, called with the inputs listed alongside it.
 */

export type VerificationSourceId =
  "braeunig" | "brennen" | "naca1135" | "ussa1976";

export interface VerificationSource {
  readonly id: string;
  readonly title: string;
  readonly publisher: string;
  readonly url: string;
}

export interface ReferenceValue {
  readonly printed: string;
  readonly resolution: number;
  readonly value: number;
}

export interface VerificationRow {
  readonly id: string;
  readonly orbix: number;
  readonly quantity: string;
  readonly reference: ReferenceValue;
  readonly unit: string;
}

export interface VerificationCase {
  readonly id: string;
  /** Name of the ORBIX calculation function the values come from. */
  readonly calculator: string;
  readonly title: string;
  readonly inputs: readonly string[];
  readonly sourceId: VerificationSourceId;
  /** Where in the source the values are printed. */
  readonly location: string;
  readonly rows: readonly VerificationRow[];
  /** Model assumptions or the reason for any disagreement. */
  readonly notes: readonly string[];
}

export interface VerificationGroup {
  readonly id: string;
  /** A note that applies to every case in the group, said once above them. */
  readonly intro?: string;
  readonly title: string;
  readonly cases: readonly VerificationCase[];
}

export const verificationSources = {
  braeunig: {
    id: "braeunig",
    publisher: "Robert A. Braeunig, Rocket and Space Technology",
    title: "Example Problems",
    url: "http://www.braeunig.us/space/problem.htm",
  },
  brennen: {
    id: "brennen",
    publisher: "An Internet Book on Fluid Dynamics, brennen.caltech.edu",
    title: "Oblique Shock Wave",
    url: "http://brennen.caltech.edu/fluidbook/basicfluiddynamics/compressibleflow/obliqueshock.pdf",
  },
  naca1135: {
    id: "naca1135",
    publisher:
      "Ames Research Staff, NACA Report 1135 (NASA Technical Reports Server)",
    title: "Equations, Tables, and Charts for Compressible Flow",
    url: "https://ntrs.nasa.gov/citations/19930091059",
  },
  ussa1976: {
    id: "ussa1976",
    publisher:
      "NOAA, NASA and U.S. Air Force, NASA-TM-X-74335 (NASA Technical Reports Server)",
    title: "U.S. Standard Atmosphere, 1976",
    url: "https://ntrs.nasa.gov/citations/19770009539",
  },
} as const satisfies Record<VerificationSourceId, VerificationSource>;

/* ------------------------------------------------------------------ *
 * Inputs. Exported so the test suite can call the calculators again.
 * ------------------------------------------------------------------ */

/** Gravitational parameter used by every Braeunig orbital problem. */
export const BRAEUNIG_EARTH_GM = 3.986005e14;

export const verificationInputs = {
  atmosphereAltitudesMetres: [1_000, 5_000, 11_000],
  escape: {
    gravitationalParameter: BRAEUNIG_EARTH_GM,
    orbitalRadiusMetres: 6_578_140,
  },
  hohmann: {
    finalOrbitRadiusMetres: 42_164_170,
    gravitationalParameter: BRAEUNIG_EARTH_GM,
    initialOrbitRadiusMetres: 6_578_140,
  },
  isentropic: { machNumber: 2 },
  normalShock: { machNumber: 2 },
  obliqueShock: { deflectionAngleDegrees: 12.7, machNumber: 3 },
  planeChange: {
    inclinationChangeDegrees: 8,
    orbitalVelocityMetresPerSecond: 7_558,
  },
  rocketStageOne: {
    finalMassKg: 45_000,
    initialMassKg: 165_000,
    specificImpulseSeconds: 260,
  },
  rocketStageTwo: {
    finalMassKg: 6_000,
    initialMassKg: 36_000,
    specificImpulseSeconds: 320,
  },
  visVivaApogee: {
    gravitationalParameter: BRAEUNIG_EARTH_GM,
    orbitalRadiusMetres: 6_878_140,
    semiMajorAxisMetres: 6_753_140,
  },
  visVivaCircular: {
    gravitationalParameter: BRAEUNIG_EARTH_GM,
    orbitalRadiusMetres: 6_578_140,
    semiMajorAxisMetres: 6_578_140,
  },
  visVivaPerigee: {
    gravitationalParameter: BRAEUNIG_EARTH_GM,
    orbitalRadiusMetres: 6_628_140,
    semiMajorAxisMetres: 6_753_140,
  },
  totalPressureRecovery: { machNumber: 2 },
} as const;

/* ------------------------------------------------------------------ *
 * Calculator runs.
 * ------------------------------------------------------------------ */

const [atmosphere1000, atmosphere5000, atmosphere11000] =
  verificationInputs.atmosphereAltitudesMetres.map((altitudeMetres) =>
    calculateStandardAtmosphere({ altitudeMetres }),
  ) as [
    ReturnType<typeof calculateStandardAtmosphere>,
    ReturnType<typeof calculateStandardAtmosphere>,
    ReturnType<typeof calculateStandardAtmosphere>,
  ];

const isentropic = calculateIsentropicFlow(verificationInputs.isentropic);
const normalShock = calculateNormalShock(verificationInputs.normalShock);
const totalPressureRecovery = calculateTotalPressureRecovery(
  verificationInputs.totalPressureRecovery,
);
const obliqueShock = calculateObliqueShock(verificationInputs.obliqueShock);
const rocketStageOne = calculateRocketEquation(
  verificationInputs.rocketStageOne,
);
const rocketStageTwo = calculateRocketEquation(
  verificationInputs.rocketStageTwo,
);
const hohmann = calculateHohmannTransfer(verificationInputs.hohmann);
const planeChange = calculateOrbitalPlaneChange(verificationInputs.planeChange);
const escape = calculateEscapeVelocity(verificationInputs.escape);
const visVivaCircular = calculateVisViva(verificationInputs.visVivaCircular);
const visVivaPerigee = calculateVisViva(verificationInputs.visVivaPerigee);
const visVivaApogee = calculateVisViva(verificationInputs.visVivaApogee);

function atmosphereRows(
  prefix: string,
  result: ReturnType<typeof calculateStandardAtmosphere>,
  reference: {
    readonly density: ReferenceValue;
    readonly pressure: ReferenceValue;
    readonly temperature: ReferenceValue;
  },
): readonly VerificationRow[] {
  return [
    {
      id: `${prefix}-temperature`,
      orbix: result.temperatureKelvin,
      quantity: "Temperature",
      reference: reference.temperature,
      unit: "K",
    },
    {
      id: `${prefix}-pressure`,
      orbix: result.pressurePascals,
      quantity: "Pressure",
      reference: reference.pressure,
      unit: "Pa",
    },
    {
      id: `${prefix}-density`,
      orbix: result.densityKilogramsPerCubicMetre,
      quantity: "Density",
      reference: reference.density,
      unit: "kg/m³",
    },
  ];
}

/* ------------------------------------------------------------------ *
 * Cases.
 * ------------------------------------------------------------------ */

const USSA_GEOPOTENTIAL_NOTE =
  "ORBIX treats gravity as constant (9.80665 m/s²). In the 1976 standard that form applies to geopotential altitude H, so the cases below are compared with the geopotential columns of Table I, except the last, which reads the same input as geometric altitude to show the size of that error.";

export const verificationGroups: readonly VerificationGroup[] = [
  {
    cases: [
      {
        calculator: "calculateStandardAtmosphere",
        id: "atmosphere-1000",
        inputs: ["Altitude 1,000 m (geopotential)"],
        location:
          "Table I, geopotential altitude, metric units, page 52, row H = 1000 m",
        notes: [
          "Density is just outside the table's rounding. ORBIX divides by the rounded gas constant 287.05 J/(kg·K); the standard's value is R*/M₀ = 8,314.32 / 28.9644 = 287.053 J/(kg·K) (pages 3 and 9). With that value and the same pressure and temperature, the density is 1.11164 kg/m³, which rounds to the printed 1.1116.",
        ],
        rows: atmosphereRows("atmosphere-1000", atmosphere1000, {
          density: {
            printed: "1.1116 + 0 kg/m³",
            resolution: 0.0001,
            value: 1.1116,
          },
          pressure: { printed: "8.9874 + 2 mb", resolution: 1, value: 89_874 },
          temperature: {
            printed: "281.650 K",
            resolution: 0.001,
            value: 281.65,
          },
        }),
        sourceId: "ussa1976",
        title: "Standard atmosphere at 1,000 m",
      },
      {
        calculator: "calculateStandardAtmosphere",
        id: "atmosphere-5000",
        inputs: ["Altitude 5,000 m (geopotential)"],
        location:
          "Table I, geopotential altitude, metric units, page 54, row H = 5000 m",
        notes: [
          "Pressure is 0.55 Pa above the table value, about 0.001 percent. The table itself sits low of its own equation here: the standard's pressure equation for this layer, with its constants R*/M₀ = 8,314.32 / 28.9644, g₀ = 9.80665 m/s² and P₀ = 101,325 Pa, gives 54,019.9 Pa at H = 5,000 m, while the table prints 5.4019 + 2 mb (54,019 Pa). The same happens at 1,000 m, where the equation gives 89,874.6 Pa and the table prints 8.9874 + 2 mb. ORBIX, at 54,019.55 Pa, lies between the table and the equation, so the gap is not an ORBIX error. Why the table's last digit falls low has not been confirmed here.",
        ],
        rows: atmosphereRows("atmosphere-5000", atmosphere5000, {
          density: {
            printed: "7.3612 − 1 kg/m³",
            resolution: 0.00001,
            value: 0.73612,
          },
          pressure: { printed: "5.4019 + 2 mb", resolution: 1, value: 54_019 },
          temperature: {
            printed: "255.650 K",
            resolution: 0.001,
            value: 255.65,
          },
        }),
        sourceId: "ussa1976",
        title: "Standard atmosphere at 5,000 m",
      },
      {
        calculator: "calculateStandardAtmosphere",
        id: "atmosphere-11000",
        inputs: ["Altitude 11,000 m (geopotential)"],
        location:
          "Table I, geopotential altitude, metric units, page 58, row H = 11000 m",
        notes: [
          "11,000 m is the top of the constant-lapse-rate layer and the highest altitude the ORBIX calculator accepts. Above it the standard holds temperature at 216.65 K, which ORBIX does not model, so no higher altitude is compared.",
        ],
        rows: atmosphereRows("atmosphere-11000", atmosphere11000, {
          density: {
            printed: "3.6392 − 1 kg/m³",
            resolution: 0.00001,
            value: 0.36392,
          },
          pressure: { printed: "2.2632 + 2 mb", resolution: 1, value: 22_632 },
          temperature: {
            printed: "216.650 K",
            resolution: 0.001,
            value: 216.65,
          },
        }),
        sourceId: "ussa1976",
        title: "Standard atmosphere at 11,000 m",
      },
      {
        calculator: "calculateStandardAtmosphere",
        id: "atmosphere-11000-geometric",
        inputs: ["Altitude 11,000 m, compared as geometric altitude Z"],
        location:
          "Table I, geometric altitude, metric units, page 59, row Z = 11000 m (H = 10981 m)",
        notes: [
          "The ORBIX atmosphere formula is the geopotential form, so its altitude input is a geopotential altitude. A geometric altitude of 11,000 m is a geopotential altitude of 10,981 m, so reading the input as geometric gives the differences shown. This row records the size of that error rather than hiding it.",
        ],
        rows: atmosphereRows("atmosphere-11000-geometric", atmosphere11000, {
          density: {
            printed: "3.6480 − 1 kg/m³",
            resolution: 0.00001,
            value: 0.3648,
          },
          pressure: { printed: "2.2699 + 2 mb", resolution: 1, value: 22_699 },
          temperature: {
            printed: "216.774 K",
            resolution: 0.001,
            value: 216.774,
          },
        }),
        sourceId: "ussa1976",
        title: "Standard atmosphere at 11,000 m, read as geometric altitude",
      },
    ],
    id: "atmosphere",
    intro: USSA_GEOPOTENTIAL_NOTE,
    title: "Atmosphere",
  },
  {
    cases: [
      {
        calculator: "calculateIsentropicFlow",
        id: "isentropic-m2",
        inputs: ["Mach number 2.00", "γ = 1.4"],
        location: "Table II, supersonic flow, γ = 7/5, page 634, row M = 2.00",
        notes: [
          "ORBIX reports stagnation-to-static ratios (for example T₀/T = 1.8). The table prints static-to-stagnation ratios, so the ORBIX values are shown inverted.",
        ],
        rows: [
          {
            id: "isentropic-m2-pressure",
            orbix: 1 / isentropic.pressureRatio,
            quantity: "p / p₀",
            reference: { printed: ".1278", resolution: 0.0001, value: 0.1278 },
            unit: "",
          },
          {
            id: "isentropic-m2-density",
            orbix: 1 / isentropic.densityRatio,
            quantity: "ρ / ρ₀",
            reference: { printed: ".2300", resolution: 0.0001, value: 0.23 },
            unit: "",
          },
          {
            id: "isentropic-m2-temperature",
            orbix: 1 / isentropic.temperatureRatio,
            quantity: "T / T₀",
            reference: { printed: ".5556", resolution: 0.0001, value: 0.5556 },
            unit: "",
          },
        ],
        sourceId: "naca1135",
        title: "Isentropic flow at Mach 2",
      },
      {
        calculator: "calculateNormalShock",
        id: "normal-shock-m2",
        inputs: ["Upstream Mach number 2.00", "γ = 1.4"],
        location: "Table II, supersonic flow, γ = 7/5, page 634, row M₁ = 2.00",
        notes: [],
        rows: [
          {
            id: "normal-shock-m2-downstream-mach",
            orbix: normalShock.downstreamMach,
            quantity: "Downstream Mach number M₂",
            reference: { printed: ".5774", resolution: 0.0001, value: 0.5774 },
            unit: "",
          },
          {
            id: "normal-shock-m2-pressure",
            orbix: normalShock.pressureRatio,
            quantity: "p₂ / p₁",
            reference: { printed: "4.500", resolution: 0.001, value: 4.5 },
            unit: "",
          },
          {
            id: "normal-shock-m2-density",
            orbix: normalShock.densityRatio,
            quantity: "ρ₂ / ρ₁",
            reference: { printed: "2.667", resolution: 0.001, value: 2.667 },
            unit: "",
          },
          {
            id: "normal-shock-m2-temperature",
            orbix: normalShock.temperatureRatio,
            quantity: "T₂ / T₁",
            reference: { printed: "1.688", resolution: 0.001, value: 1.688 },
            unit: "",
          },
        ],
        sourceId: "naca1135",
        title: "Normal shock at Mach 2",
      },
      {
        calculator: "calculateTotalPressureRecovery",
        id: "total-pressure-recovery-m2",
        inputs: ["Upstream Mach number 2.00", "γ = 1.4"],
        location: "Table II, supersonic flow, γ = 7/5, page 634, row M₁ = 2.00",
        notes: [],
        rows: [
          {
            id: "total-pressure-recovery-m2-ratio",
            orbix: totalPressureRecovery.pressureRecoveryRatio,
            quantity: "Total pressure ratio p₀₂ / p₀₁",
            reference: { printed: ".7209", resolution: 0.0001, value: 0.7209 },
            unit: "",
          },
        ],
        sourceId: "naca1135",
        title: "Total pressure recovery across a normal shock at Mach 2",
      },
      {
        calculator: "calculateObliqueShock",
        id: "oblique-shock-m3",
        inputs: [
          "Upstream Mach number 3.0",
          "Deflection angle 12.7°",
          "γ = 1.4, weak shock",
        ],
        location:
          "Oblique shock reflection example (Figure 6): M₁ = 3.0, shock angle 30°, deflection 12.7°, M₂ = 2.36",
        notes: [
          "The source takes β = 30° as its input and reads the 12.7° deflection from its Figure 4; the exact deflection for M₁ = 3.0 and β = 30° is 12.77°. With β = 30° and 12.7°, the source's M₂ works out to 2.358, printed as 2.36. ORBIX works from deflection to shock angle, so given 12.7° it returns β = 29.93° and M₂ = 2.371. With the exact pair (β = 30°, 12.77°) M₂ is 2.367. M₂ is sensitive to β minus the deflection, so the chart-read deflection alone accounts for the gap.",
        ],
        rows: [
          {
            id: "oblique-shock-m3-shock-angle",
            orbix: obliqueShock.shockAngleDegrees,
            quantity: "Shock angle β",
            reference: { printed: "30°", resolution: 1, value: 30 },
            unit: "°",
          },
          {
            id: "oblique-shock-m3-downstream-mach",
            orbix: obliqueShock.downstreamMach,
            quantity: "Downstream Mach number M₂",
            reference: { printed: "2.36", resolution: 0.01, value: 2.36 },
            unit: "",
          },
        ],
        sourceId: "brennen",
        title: "Oblique shock at Mach 3",
      },
    ],
    id: "compressible-flow",
    title: "Compressible flow",
  },
  {
    cases: [
      {
        calculator: "calculateRocketEquation",
        id: "rocket-two-stage",
        inputs: [
          "Stage 1: initial mass 165,000 kg, final mass 45,000 kg, specific impulse 260 s",
          "Stage 2: initial mass 36,000 kg, final mass 6,000 kg, specific impulse 320 s",
          "Standard gravity 9.80665 m/s²",
        ],
        location: "Problem 1.12, two-stage rocket",
        notes: [
          "The total is the sum of the two ORBIX stage results; ORBIX's rocket equation calculator handles one stage at a time.",
        ],
        rows: [
          {
            id: "rocket-two-stage-stage-one",
            orbix: rocketStageOne.deltaVMetresPerSecond,
            quantity: "Stage 1 delta-v",
            reference: { printed: "3,313 m/s", resolution: 1, value: 3_313 },
            unit: "m/s",
          },
          {
            id: "rocket-two-stage-stage-two",
            orbix: rocketStageTwo.deltaVMetresPerSecond,
            quantity: "Stage 2 delta-v",
            reference: { printed: "5,623 m/s", resolution: 1, value: 5_623 },
            unit: "m/s",
          },
          {
            id: "rocket-two-stage-total",
            orbix:
              rocketStageOne.deltaVMetresPerSecond +
              rocketStageTwo.deltaVMetresPerSecond,
            quantity: "Total delta-v",
            reference: { printed: "8,936 m/s", resolution: 1, value: 8_936 },
            unit: "m/s",
          },
        ],
        sourceId: "braeunig",
        title: "Two-stage rocket delta-v",
      },
    ],
    id: "propulsion",
    title: "Rocket propulsion",
  },
  {
    cases: [
      {
        calculator: "calculateHohmannTransfer",
        id: "hohmann-leo-geo",
        inputs: [
          "Initial circular orbit radius 6,578,140 m (200 km altitude)",
          "Final circular orbit radius 42,164,170 m (geosynchronous)",
          "GM = 3.986005 × 10¹⁴ m³/s²",
        ],
        location:
          "Problem 4.19, Hohmann transfer from a 200 km parking orbit to geosynchronous altitude",
        notes: [
          "The source subtracts speeds it has already rounded to whole meters per second (3,075 − 1,597 m/s for the second burn), then adds the rounded burns. ORBIX keeps full precision, so its second burn and total differ from the printed figures by about 1 m/s.",
        ],
        rows: [
          {
            id: "hohmann-leo-geo-first-burn",
            orbix: hohmann.firstBurnDeltaVMetresPerSecond,
            quantity: "First burn delta-v",
            reference: { printed: "2,455 m/s", resolution: 1, value: 2_455 },
            unit: "m/s",
          },
          {
            id: "hohmann-leo-geo-second-burn",
            orbix: hohmann.secondBurnDeltaVMetresPerSecond,
            quantity: "Second burn delta-v",
            reference: { printed: "1,478 m/s", resolution: 1, value: 1_478 },
            unit: "m/s",
          },
          {
            id: "hohmann-leo-geo-total",
            orbix: hohmann.totalDeltaVMetresPerSecond,
            quantity: "Total delta-v",
            reference: { printed: "3,933 m/s", resolution: 1, value: 3_933 },
            unit: "m/s",
          },
        ],
        sourceId: "braeunig",
        title: "Hohmann transfer, low Earth orbit to geosynchronous orbit",
      },
      {
        calculator: "calculateOrbitalPlaneChange",
        id: "plane-change-8deg",
        inputs: [
          "Orbital velocity 7,558 m/s (600 km circular orbit)",
          "Inclination change 8° (28° to 20°)",
        ],
        location: "Problem 4.21, simple plane change",
        notes: [
          "The orbital velocity is the source's own rounded value, entered as printed.",
        ],
        rows: [
          {
            id: "plane-change-8deg-delta-v",
            orbix: planeChange.deltaVMetresPerSecond,
            quantity: "Plane change delta-v",
            reference: { printed: "1,054 m/s", resolution: 1, value: 1_054 },
            unit: "m/s",
          },
        ],
        sourceId: "braeunig",
        title: "Orbital plane change of 8°",
      },
      {
        calculator: "calculateEscapeVelocity",
        id: "escape-200km",
        inputs: [
          "Orbital radius 6,578,140 m (200 km altitude)",
          "GM = 3.986005 × 10¹⁴ m³/s²",
        ],
        location: "Problem 4.25, escape velocity from a 200 km orbit",
        notes: [],
        rows: [
          {
            id: "escape-200km-velocity",
            orbix: escape.escapeVelocityMetresPerSecond,
            quantity: "Escape velocity",
            reference: { printed: "11,009 m/s", resolution: 1, value: 11_009 },
            unit: "m/s",
          },
        ],
        sourceId: "braeunig",
        title: "Escape velocity at 200 km altitude",
      },
      {
        calculator: "calculateVisViva",
        id: "vis-viva",
        inputs: [
          "Circular orbit: radius and semi-major axis 6,578,140 m",
          "Ellipse: perigee radius 6,628,140 m, apogee radius 6,878,140 m, semi-major axis 6,753,140 m",
          "GM = 3.986005 × 10¹⁴ m³/s²",
        ],
        location:
          "Problem 4.1 (circular orbit at 200 km) and Problem 4.4 (250 km by 500 km ellipse)",
        notes: [
          "The source uses the perigee and apogee velocity equations; the semi-major axis given to ORBIX is the mean of the two radii the source states.",
        ],
        rows: [
          {
            id: "vis-viva-circular",
            orbix: visVivaCircular.orbitalVelocityMetresPerSecond,
            quantity: "Circular orbit speed at 200 km",
            reference: { printed: "7,784 m/s", resolution: 1, value: 7_784 },
            unit: "m/s",
          },
          {
            id: "vis-viva-perigee",
            orbix: visVivaPerigee.orbitalVelocityMetresPerSecond,
            quantity: "Speed at perigee (250 km)",
            reference: { printed: "7,826 m/s", resolution: 1, value: 7_826 },
            unit: "m/s",
          },
          {
            id: "vis-viva-apogee",
            orbix: visVivaApogee.orbitalVelocityMetresPerSecond,
            quantity: "Speed at apogee (500 km)",
            reference: { printed: "7,542 m/s", resolution: 1, value: 7_542 },
            unit: "m/s",
          },
        ],
        sourceId: "braeunig",
        title: "Orbital speed from the vis-viva equation",
      },
      keplerVerificationCase,
    ],
    id: "orbital-mechanics",
    title: "Orbital mechanics",
  },
];

/**
 * ORBIX calculation functions with no published comparison on the page yet.
 * No freely available worked example with identical inputs was found for
 * these on 2026-09-28.
 */
export const uncheckedCalculators: readonly string[] = [
  "calculateLiftEquation",
  "calculateDragEquation",
  "calculateDynamicPressure",
  "calculateStagnationHeating",
  "calculateBallisticCoefficient",
  "calculateThrustToWeightRatio",
  "calculateMachNumber",
  "calculateOrbitalElements",
];
