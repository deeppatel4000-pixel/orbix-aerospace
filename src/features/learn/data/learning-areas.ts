import type { LearningArea, LearnReference } from "@/features/learn/types";

/**
 * Reading pathways. Every string is general, textbook-level aerospace
 * theory: no vehicle specification, telemetry, or computed mission result is
 * stated in this module. Numbers are only calculated behind the `labAnchors`
 * links, inside the Engineering Lab.
 *
 * `labAnchors` are deep links reachable at `/engineering-lab#<anchorId>`;
 * their labels match the module headings on that page. `explorationLinks`
 * point at real ORBIX routes only. `furtherReading` lists published
 * references; links go to NASA and NACA pages that were checked to resolve
 * when this file was written (September 2026).
 */

const GLENN_GUIDE =
  "NASA Glenn Research Center, Beginner's Guide to Aeronautics";

const naca1135: LearnReference = {
  href: "https://ntrs.nasa.gov/citations/19930091059",
  source:
    "Ames Research Staff, NACA Report 1135, 1953. NASA Technical Reports Server",
  title: "Equations, Tables, and Charts for Compressible Flow",
};

const allLearningAreas: readonly LearningArea[] = [
  {
    explorationLinks: [
      {
        description: "Aircraft records with their published specifications.",
        href: "/aircraft",
        label: "Aircraft registry",
      },
    ],
    furtherReading: [
      {
        href: "https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/lift-equation/",
        source: GLENN_GUIDE,
        title: "Lift Equation",
      },
      {
        href: "https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/drag-equation/",
        source: GLENN_GUIDE,
        title: "Drag Equation",
      },
      {
        href: "https://ntrs.nasa.gov/citations/19770009539",
        source:
          "NOAA, NASA and U.S. Air Force, NASA-TM-X-74335, 1976. NASA Technical Reports Server",
        title: "U.S. Standard Atmosphere, 1976",
      },
      {
        source: "John D. Anderson Jr., McGraw-Hill",
        title: "Introduction to Flight",
      },
    ],
    id: "aerodynamics-flight-fundamentals",
    keyIdeas: [
      {
        equation: "L = ½ · ρ · V² · S · C_L",
        equationLabel: "Lift equation",
        spokenAs:
          "L equals one half times rho times V squared times S times C L",
        variables: [
          { meaning: "Lift", symbol: "L", unit: "N" },
          { meaning: "Air density", symbol: "ρ", unit: "kg/m³" },
          { meaning: "True airspeed", symbol: "V", unit: "m/s" },
          { meaning: "Wing reference area", symbol: "S", unit: "m²" },
          { meaning: "Lift coefficient", symbol: "C_L" },
        ],
        text: "Lift is dynamic pressure, ½ ρ V², times the wing's reference area and its lift coefficient.",
      },
      {
        equation: "D = ½ · ρ · V² · S · C_D",
        equationLabel: "Drag equation",
        spokenAs:
          "D equals one half times rho times V squared times S times C D",
        variables: [
          { meaning: "Drag", symbol: "D", unit: "N" },
          { meaning: "Air density", symbol: "ρ", unit: "kg/m³" },
          { meaning: "True airspeed", symbol: "V", unit: "m/s" },
          { meaning: "Wing reference area", symbol: "S", unit: "m²" },
          { meaning: "Drag coefficient", symbol: "C_D" },
        ],
        text: "Drag has the same form. Its coefficient C_D covers skin friction, pressure drag and the drag that comes with producing lift.",
      },
      {
        text: "In steady, level, unaccelerated flight, lift equals weight and thrust equals drag.",
      },
      {
        text: "The lift coefficient rises with angle of attack until the wing stalls. Past the stall angle, lift falls.",
      },
      {
        text: "A standard atmosphere model gives reference values of temperature, pressure and density at each altitude. Conditions on a given day differ from it.",
      },
    ],
    labAnchors: [
      { anchorId: "standard-atmosphere", label: "Standard atmosphere" },
      { anchorId: "lift-equation", label: "Lift equation" },
      { anchorId: "drag-equation", label: "Drag equation" },
      {
        anchorId: "flight-condition-analyzer",
        label: "Flight condition",
      },
    ],
    summary:
      "An aircraft in flight is acted on by four forces: lift, weight, thrust and drag. Lift and drag come from the pressure and friction of air moving over the vehicle. Both grow in proportion to air density and to the square of airspeed. Air density falls with altitude, so the same wing at the same speed produces less lift higher up.",
    title: "Aerodynamics and flight fundamentals",
    whyItMatters:
      "These relationships set a winged vehicle's flight envelope: the minimum speed for level flight, the thrust needed to overcome drag, and how both change with altitude. Sizing a wing and choosing a cruise altitude both start from them.",
  },
  {
    explorationLinks: [
      {
        description:
          "Launch vehicle records with their published specifications.",
        href: "/rockets",
        label: "Launch vehicle registry",
      },
    ],
    furtherReading: [
      {
        href: "https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/thrust-to-weight-ratio/",
        source: GLENN_GUIDE,
        title: "Thrust to Weight Ratio",
      },
      {
        href: "https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/ideal-rocket-equation/",
        source: GLENN_GUIDE,
        title: "Ideal Rocket Equation",
      },
      {
        source: "George P. Sutton and Oscar Biblarz, Wiley",
        title: "Rocket Propulsion Elements",
      },
    ],
    id: "propulsion-vehicle-performance",
    keyIdeas: [
      {
        equation: "T / W > 1",
        equationLabel: "Thrust-to-weight ratio for vertical liftoff",
        spokenAs: "T over W is greater than 1",
        variables: [
          { meaning: "Thrust", symbol: "T", unit: "N" },
          { meaning: "Weight", symbol: "W", unit: "N" },
        ],
        text: "A rocket needs a thrust-to-weight ratio above 1 at liftoff to rise vertically. An aircraft can fly with a ratio below 1 because its wings carry its weight.",
      },
      {
        equation: "Δv = v_e · ln(m_0 / m_f)",
        equationLabel: "Ideal rocket equation",
        spokenAs: "delta v equals v e times the natural log of m zero over m f",
        variables: [
          {
            meaning: "Velocity change of the stage",
            symbol: "Δv",
            unit: "m/s",
          },
          { meaning: "Effective exhaust velocity", symbol: "v_e", unit: "m/s" },
          { meaning: "Mass at ignition", symbol: "m_0", unit: "kg" },
          { meaning: "Mass at burnout", symbol: "m_f", unit: "kg" },
        ],
        text: "In the ideal case, a stage's velocity change comes from two numbers: its effective exhaust velocity and its mass ratio, the mass at ignition over the mass at burnout.",
      },
      {
        equation: "v_e = I_sp · g_0",
        equationLabel: "Specific impulse",
        spokenAs: "v e equals I s p times g zero",
        variables: [
          { meaning: "Effective exhaust velocity", symbol: "v_e", unit: "m/s" },
          { meaning: "Specific impulse", symbol: "I_sp", unit: "s" },
          {
            meaning: "Standard gravity, 9.80665 by definition",
            symbol: "g_0",
            unit: "m/s²",
          },
        ],
        text: "Specific impulse is quoted in seconds. A higher value gives more velocity change from the same propellant mass.",
      },
      {
        text: "Because the mass ratio sits inside a logarithm, each additional unit of velocity costs more propellant than the last. Staging discards empty tanks and engines so each later stage starts with a better mass ratio.",
      },
      {
        text: "The ideal equation ignores gravity and drag losses. A real ascent to orbit needs more velocity change than the final orbital speed.",
      },
    ],
    labAnchors: [
      { anchorId: "thrust-to-weight", label: "Thrust-to-weight ratio" },
      { anchorId: "rocket-equation", label: "Tsiolkovsky rocket equation" },
    ],
    summary:
      "A vehicle accelerates when its thrust exceeds the forces resisting it. For a rocket, the ideal rocket equation links the velocity change a stage can deliver to two quantities: the exhaust velocity of its engines and the ratio of its mass before and after the burn.",
    title: "Propulsion and vehicle performance",
    whyItMatters:
      "Thrust-to-weight ratio affects how quickly an aircraft can climb. Most of a launch vehicle's mass at liftoff is propellant, which is why rocket designs push for high exhaust velocity and drop empty stages on the way up.",
  },
  {
    explorationLinks: [
      {
        description:
          "Profile of an aircraft designed for sustained flight above Mach 3.",
        href: "/aircraft/sr-71-blackbird",
        label: "SR-71 Blackbird",
      },
      {
        description:
          "Profile of a fighter designed for sustained supersonic flight.",
        href: "/aircraft/f-22-raptor",
        label: "F-22 Raptor",
      },
    ],
    furtherReading: [
      naca1135,
      {
        href: "https://www.grc.nasa.gov/www/k-12/airplane/isentrop.html",
        source: GLENN_GUIDE,
        title: "Isentropic Flow Equations",
      },
      {
        href: "https://www.grc.nasa.gov/www/k-12/airplane/normal.html",
        source: GLENN_GUIDE,
        title: "Normal Shock Wave Equations",
      },
      {
        href: "https://www.grc.nasa.gov/www/k-12/airplane/oblique.html",
        source: GLENN_GUIDE,
        title: "Oblique Shock Waves",
      },
    ],
    id: "high-speed-compressible-flow",
    keyIdeas: [
      {
        equation: "M = V / a\na = √(γ · R · T)",
        equationLabel: "Mach number",
        spokenAs:
          "M equals V over a. a equals the square root of gamma times R times T",
        variables: [
          { meaning: "Mach number", symbol: "M" },
          { meaning: "Flow speed", symbol: "V", unit: "m/s" },
          { meaning: "Local speed of sound", symbol: "a", unit: "m/s" },
          {
            meaning: "Ratio of specific heats, about 1.4 for air",
            symbol: "γ",
          },
          { meaning: "Specific gas constant", symbol: "R", unit: "J/(kg K)" },
          { meaning: "Static temperature", symbol: "T", unit: "K" },
        ],
        text: "The speed of sound depends on the air's temperature, so the same flight speed gives a different Mach number in colder or warmer air.",
      },
      {
        text: "Changes in air density are usually ignored below about Mach 0.3. Above that, the compressible flow relations are needed.",
      },
      {
        text: "Stagnation (total) temperature and pressure are the values the flow would reach if it were slowed to rest without losses. They are the reference values for the isentropic flow relations.",
      },
      {
        text: "A normal shock turns supersonic flow subsonic. Static pressure, temperature and density rise across it, and total pressure falls.",
      },
      {
        text: "An oblique shock turns the flow through an angle and is weaker than a normal shock at the same Mach number. Supersonic inlets use one or more oblique shocks before a final normal shock, which loses less total pressure than a single normal shock.",
      },
    ],
    labAnchors: [
      {
        anchorId: "stagnation-condition-analyzer",
        label: "Stagnation condition",
      },
      {
        anchorId: "shock-condition-analyzer",
        label: "Normal shock",
      },
      {
        anchorId: "oblique-shock-condition-analyzer",
        label: "Oblique shock",
      },
      {
        anchorId: "inlet-compression-analyzer",
        label: "Supersonic inlet compression",
      },
    ],
    summary:
      "At low speed, air density barely changes as air flows around a body. Near and above the speed of sound, air compresses noticeably. Where the flow is supersonic it adjusts to an obstacle through shock waves: thin regions across which pressure, temperature and density change abruptly.",
    title: "High-speed and compressible flow",
    whyItMatters:
      "Supersonic aircraft and their engine inlets are shaped to control where shocks form and how strong they are. A strong shock loses total pressure, which lowers the pressure at the engine face and adds drag.",
  },
  {
    explorationLinks: [
      {
        description:
          "Launch vehicle records, for the vehicles that carry spacecraft to orbit.",
        href: "/rockets",
        label: "Launch vehicle registry",
      },
    ],
    furtherReading: [
      {
        href: "https://ntrs.nasa.gov/citations/19930091020",
        source:
          "H. Julian Allen and A. J. Eggers Jr., NACA Report 1381, 1958. NASA Technical Reports Server",
        title:
          "A Study of the Motion and Aerodynamic Heating of Ballistic Missiles Entering the Earth's Atmosphere at High Supersonic Speeds",
      },
      {
        source: "John D. Anderson Jr., AIAA",
        title: "Hypersonic and High-Temperature Gas Dynamics",
      },
    ],
    id: "atmospheric-entry-thermal-protection",
    keyIdeas: [
      {
        text: "Entry converts kinetic energy into heat. At close to 8 km/s, each kilogram of vehicle carries about 30 megajoules. Most of that heat goes into the surrounding air; the part that reaches the vehicle is what the thermal protection system must handle.",
      },
      {
        text: "A blunt shape holds a strong bow shock away from its surface, so more of the heat stays in the air. Allen and Eggers published this result in NACA Report 1381.",
      },
      {
        equation: "q̇ ≈ k · √(ρ / r_n) · V³",
        equationLabel: "Sutton-Graves stagnation-point heating",
        spokenAs:
          "q dot is approximately k times the square root of rho over r n, times V cubed",
        variables: [
          {
            meaning: "Heat flux at the stagnation point",
            symbol: "q̇",
            unit: "W/m²",
          },
          {
            meaning:
              "Sutton-Graves constant, set by the atmosphere's composition",
            symbol: "k",
            unit: "kg^1/2/m",
          },
          { meaning: "Free-stream air density", symbol: "ρ", unit: "kg/m³" },
          { meaning: "Nose radius", symbol: "r_n", unit: "m" },
          { meaning: "Velocity", symbol: "V", unit: "m/s" },
        ],
        text: "For first estimates, heat flux at the stagnation point scales with the square root of air density over nose radius r_n, times velocity cubed. This is the Sutton-Graves form, with k a constant for the atmosphere's composition.",
      },
      {
        equation: "β = m / (C_D · A)",
        equationLabel: "Ballistic coefficient",
        spokenAs: "beta equals m over C D times A",
        variables: [
          { meaning: "Ballistic coefficient", symbol: "β", unit: "kg/m²" },
          { meaning: "Vehicle mass", symbol: "m", unit: "kg" },
          { meaning: "Drag coefficient", symbol: "C_D" },
          { meaning: "Reference area", symbol: "A", unit: "m²" },
        ],
        text: "Ballistic coefficient β is mass divided by drag coefficient times reference area. A vehicle with a lower β slows down higher in the atmosphere, where the air is thinner.",
      },
      {
        text: "A shallow entry lowers peak deceleration but lengthens the heating period, which raises the total heat load. A steep entry does the reverse. Ablative heat shields absorb heat as the material chars and erodes; reusable tiles insulate the structure and radiate heat away from the hot surface.",
      },
    ],
    labAnchors: [
      {
        anchorId: "hypersonic-heating-analyzer",
        label: "Hypersonic heating analyzer",
      },
      {
        anchorId: "reentry-deceleration-analyzer",
        label: "Reentry deceleration analyzer",
      },
      {
        anchorId: "reentry-trajectory-analyzer",
        label: "Reentry trajectory analyzer",
      },
      {
        anchorId: "material-tps-sizing-analyzer",
        label: "TPS material selection analyzer",
      },
      {
        anchorId: "tps-material-comparison-analyzer",
        label: "TPS material comparison analyzer",
      },
      {
        anchorId: "vehicle-reentry-evaluation-analyzer",
        label: "Vehicle reentry evaluation analyzer",
      },
      {
        anchorId: "vehicle-reentry-comparison-analyzer",
        label: "Vehicle reentry comparison analyzer",
      },
    ],
    summary:
      "A spacecraft returning from orbit must lose almost all of its orbital speed in the atmosphere. Compression of the air ahead of the vehicle turns that kinetic energy into heat. Heating models estimate how intense the heating becomes, and a thermal protection system (TPS) is sized so the structure underneath stays within its temperature limits.",
    title: "Atmospheric entry and thermal protection",
    whyItMatters:
      "Entry heating and deceleration drive a spacecraft's shape, its heat shield and the trajectory it flies. Peak heating and peak deceleration come at different points, and the vehicle and its crew or payload must stay within limits at both.",
  },
  {
    explorationLinks: [
      {
        description:
          "The lab's Hohmann transfer function, run on a published worked example and compared with its printed burns.",
        href: "/verification#case-hohmann-leo-geo",
        label: "Hohmann transfer checked against a published example",
      },
    ],
    furtherReading: [
      {
        href: "https://science.nasa.gov/learn/basics-of-space-flight/chapter4-1/",
        source: "NASA Science, Basics of Space Flight",
        title: "Chapter 4: Trajectories",
      },
      {
        source: "Howard D. Curtis, Butterworth-Heinemann",
        title: "Orbital Mechanics for Engineering Students",
      },
      {
        source: "Roger R. Bate, Donald D. Mueller and Jerry E. White, Dover",
        title: "Fundamentals of Astrodynamics",
      },
    ],
    id: "orbital-mechanics-mission-design",
    keyIdeas: [
      {
        equation: "v = √(μ / r)",
        equationLabel: "Circular orbital speed",
        spokenAs: "v equals the square root of mu over r",
        variables: [
          { meaning: "Circular orbital speed", symbol: "v", unit: "m/s" },
          {
            meaning: "Gravitational parameter of the central body",
            symbol: "μ",
            unit: "m³/s²",
          },
          {
            meaning: "Orbit radius, from the centre of the central body",
            symbol: "r",
            unit: "m",
          },
        ],
        text: "The larger the orbit, the slower a spacecraft in it moves.",
      },
      {
        text: "A Hohmann transfer moves between two circular, coplanar orbits with two burns: one to enter an elliptical transfer orbit, and one to circularise at the far end. For most pairs of orbits it is the two-burn transfer with the lowest delta-v.",
      },
      {
        equation: "Δv = 2v · sin(Δi / 2)",
        equationLabel: "Plane change",
        spokenAs: "delta v equals 2 v times the sine of delta i over 2",
        variables: [
          { meaning: "Velocity change of the burn", symbol: "Δv", unit: "m/s" },
          { meaning: "Orbital speed at the burn", symbol: "v", unit: "m/s" },
          { meaning: "Change in orbit plane angle", symbol: "Δi" },
        ],
        text: "The cost of tilting the orbit grows with speed, so plane changes are cheapest where the spacecraft moves slowest, such as at apoapsis.",
      },
      {
        text: "Burns can be combined. A plane change made during a transfer burn usually costs less than the two made separately.",
      },
    ],
    labAnchors: [
      {
        anchorId: "hohmann-transfer-analyzer",
        label: "Hohmann transfer",
      },
      {
        anchorId: "orbital-plane-change-analyzer",
        label: "Orbital plane change",
      },
      { anchorId: "mission-planner", label: "Mission planner" },
    ],
    summary:
      "A spacecraft changes orbit by firing its engines to change its velocity. The total velocity change a mission needs, its delta-v budget, is the main measure of how demanding the mission is, because the rocket equation converts it directly into propellant mass.",
    title: "Orbital mechanics and mission design",
    whyItMatters:
      "Mission designers order and combine maneuvers to keep the delta-v budget within what the vehicle can deliver. Raising a satellite to its operating orbit and departing for another planet are both planned this way.",
  },
  {
    explorationLinks: [
      {
        description: "How ORBIX itself is structured and checked.",
        href: "/build-log#structure",
        label: "How ORBIX is organised",
      },
    ],
    furtherReading: [
      {
        href: "https://ntrs.nasa.gov/citations/20170001761",
        source: "NASA, NASA/SP-2016-6105 Rev 2. NASA Technical Reports Server",
        title: "NASA Systems Engineering Handbook",
      },
    ],
    id: "mission-operations-engineering-communication",
    keyIdeas: [
      {
        text: "A trade study scores competing options against criteria agreed in advance, so the choice can be traced back to its reasons.",
      },
      {
        text: "A mission timeline lists events in order with their times, so each phase can be checked against the conditions left by the one before it.",
      },
      {
        text: "An engineering report states its inputs, assumptions, method, results with units, and limits, so a reader can repeat the work.",
      },
      {
        text: "A briefing summarises a report for a decision: what was analysed, what was found, and what remains uncertain.",
      },
    ],
    labAnchors: [
      {
        anchorId: "mission-control-dashboard",
        label: "Mission control dashboard",
      },
      { anchorId: "scenario-library", label: "Scenario library" },
      { anchorId: "mission-report-viewer", label: "Mission report viewer" },
      { anchorId: "mission-briefing", label: "Mission briefing" },
      { anchorId: "mission-trade-study", label: "Mission trade study" },
      { anchorId: "demo-mode", label: "Guided demo" },
    ],
    summary:
      "An analysis is only useful if someone else can check it and act on it. That means stating the inputs, the method and its assumptions, the results with units and the limits of those results, and comparing alternatives against the same criteria.",
    title: "Mission operations and engineering communication",
    whyItMatters:
      "Aerospace programs review designs at set milestones, and each review depends on analysis presented this way. The Engineering Lab's mission tools follow the same structure, using the lab's simplified models, not flight data.",
  },
];

/**
 * Pathways kept in the data but not shown on /learn (v4 plan sections 3
 * and 8). Entry and thermal protection waits for the lab's entry tools,
 * which are deferred because their atmosphere stops at 11 km; mission
 * operations waits for the mission tools it links to. Check every
 * `labAnchors` entry against the lab before showing either again.
 */
export const DEFERRED_PATHWAY_IDS: ReadonlySet<string> = new Set([
  "atmospheric-entry-thermal-protection",
  "mission-operations-engineering-communication",
]);

/** The pathways shown on /learn, in page order. */
export function listLearningAreas(): readonly LearningArea[] {
  return allLearningAreas.filter((area) => !DEFERRED_PATHWAY_IDS.has(area.id));
}

/** The deferred pathways, kept for when their lab tools return. */
export function listDeferredLearningAreas(): readonly LearningArea[] {
  return allLearningAreas.filter((area) => DEFERRED_PATHWAY_IDS.has(area.id));
}
