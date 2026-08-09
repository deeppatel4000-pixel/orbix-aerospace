import type { LearningArea } from "@/features/learn/types";

/**
 * Six conceptual learning pathways. Every `concept`, `whyItMatters`, and
 * `realWorldContext` string is general, textbook-level aerospace theory —
 * no vehicle specification, telemetry, or computed mission result is
 * stated anywhere in this module. Numeric and computed output only exists
 * behind the `labAnchors` links, inside the Engineering Laboratory.
 *
 * `labAnchors` are real, verified deep links reachable at
 * `/engineering-lab#<anchorId>`. `explorationLinks` point at real ORBIX
 * routes only.
 */
const learningAreas: readonly LearningArea[] = [
  {
    accent: "tactical",
    code: "Pathway 01",
    concept:
      "Every aircraft balances four forces: lift, drag, weight, and thrust. Lift and drag emerge from how air pressure and density act on a wing at a given speed, while a standard-atmosphere model describes how pressure, temperature, and density change with altitude.",
    explorationLinks: [
      {
        description:
          "See these concepts applied across ORBIX's published aircraft profiles.",
        href: "/aircraft",
        label: "Browse the aircraft fleet",
      },
    ],
    id: "aerodynamics-flight-fundamentals",
    labAnchors: [
      { anchorId: "standard-atmosphere", label: "Standard Atmosphere" },
      { anchorId: "lift-equation", label: "Lift Equation" },
      { anchorId: "drag-equation", label: "Drag Equation" },
      {
        anchorId: "flight-condition-analyzer",
        label: "Flight Condition Analyzer",
      },
    ],
    realWorldContext:
      "Wing design, cruise-altitude selection, and the flight-envelope charts published by aircraft manufacturers all trace back to these same governing relationships.",
    surfaceVariant: "vehicle",
    title: "Aerodynamics & Flight Fundamentals",
    whyItMatters:
      "These relationships set the operating envelope for any winged vehicle: how fast it must fly to sustain level flight, how much power it needs to overcome drag, and how performance shifts with altitude.",
  },
  {
    accent: "atmosphere",
    code: "Pathway 02",
    concept:
      "A vehicle only accelerates when its engines produce more thrust than its weight and drag resist. The rocket equation formalizes this trade for launch vehicles, relating the velocity a stage can gain to its mass ratio and how efficiently its engines convert propellant into exhaust velocity.",
    explorationLinks: [
      {
        description:
          "See these concepts applied across ORBIX's published launch vehicle profiles.",
        href: "/rockets",
        label: "Browse the rocket fleet",
      },
    ],
    id: "propulsion-vehicle-performance",
    labAnchors: [
      { anchorId: "thrust-to-weight", label: "Thrust-to-Weight Ratio" },
      { anchorId: "rocket-equation", label: "Tsiolkovsky Rocket Equation" },
    ],
    realWorldContext:
      "Every multistage launch vehicle exists because of this equation: each stage sheds mass so the remaining stages can convert their own propellant into velocity gain more efficiently.",
    surfaceVariant: "mission",
    title: "Propulsion & Vehicle Performance",
    whyItMatters:
      "Thrust-to-weight ratio determines whether a vehicle can lift off or accelerate as intended, while the rocket equation explains why staging — discarding empty propellant tanks — is central to reaching orbit.",
  },
  {
    accent: "laboratory",
    code: "Pathway 03",
    concept:
      "At high speed, air can no longer be treated as an incompressible fluid — it compresses, and shock waves form where the flow adjusts abruptly to an obstacle or intake. Oblique and normal shocks change a flow's pressure, temperature, and Mach number in distinct, calculable ways.",
    explorationLinks: [
      {
        description:
          "A sustained high-speed aircraft profile relevant to compressible-flow effects.",
        href: "/aircraft/sr-71-blackbird",
        label: "SR-71 Blackbird",
      },
      {
        description:
          "A supersonic fighter profile relevant to shock and inlet behavior.",
        href: "/aircraft/f-22-raptor",
        label: "F-22 Raptor",
      },
    ],
    id: "high-speed-compressible-flow",
    labAnchors: [
      {
        anchorId: "stagnation-condition-analyzer",
        label: "Stagnation Condition Analyzer",
      },
      {
        anchorId: "shock-condition-analyzer",
        label: "Shock Condition Analyzer",
      },
      {
        anchorId: "oblique-shock-condition-analyzer",
        label: "Oblique Shock Condition Analyzer",
      },
      {
        anchorId: "shock-pressure-loss-analyzer",
        label: "Shock Pressure Loss Analyzer",
      },
      {
        anchorId: "multi-shock-recovery-analyzer",
        label: "Multi-Shock Recovery Analyzer",
      },
      {
        anchorId: "inlet-compression-analyzer",
        label: "Supersonic Inlet Compression Analyzer",
      },
    ],
    realWorldContext:
      "Sustained high-speed flight and staged supersonic inlet compression are hallmark engineering problems for fast aircraft, where inlet geometry manages a sequence of shocks before air reaches the engine face.",
    surfaceVariant: "engineering",
    title: "High-Speed & Compressible Flow",
    whyItMatters:
      "Supersonic aircraft and their engine inlets are shaped specifically to manage shock structure — poorly controlled shocks waste energy, generate drag, and can disrupt airflow into the engine.",
  },
  {
    accent: "signal",
    code: "Pathway 04",
    concept:
      "Returning from orbit means shedding enormous kinetic energy in the atmosphere, most of it as heat. Hypersonic heating models estimate how intense that heating becomes, while a thermal protection system is sized to absorb or radiate it without letting structural temperatures become unsafe.",
    explorationLinks: [
      {
        description:
          "Review ORBIX launch vehicle profiles for additional vehicle context.",
        href: "/rockets",
        label: "Rocket vehicle profiles",
      },
    ],
    id: "atmospheric-entry-thermal-protection",
    labAnchors: [
      {
        anchorId: "hypersonic-heating-analyzer",
        label: "Hypersonic Heating Analyzer",
      },
      {
        anchorId: "reentry-deceleration-analyzer",
        label: "Reentry Deceleration Analyzer",
      },
      {
        anchorId: "reentry-trajectory-analyzer",
        label: "Reentry Trajectory Analyzer",
      },
      {
        anchorId: "material-tps-sizing-analyzer",
        label: "TPS Material Selection Analyzer",
      },
      {
        anchorId: "tps-material-comparison-analyzer",
        label: "TPS Material Comparison Analyzer",
      },
      {
        anchorId: "vehicle-reentry-evaluation-analyzer",
        label: "Vehicle Reentry Evaluation Analyzer",
      },
      {
        anchorId: "vehicle-reentry-comparison-analyzer",
        label: "Vehicle Reentry Comparison Analyzer",
      },
    ],
    realWorldContext:
      "Every crewed or robotic spacecraft returning from orbit carries some form of thermal protection sized against its expected reentry heating.",
    surfaceVariant: "report",
    title: "Atmospheric Entry & Thermal Protection",
    whyItMatters:
      "Reentry heating and deceleration profiles drive some of the most consequential design decisions on a spacecraft: thermal protection material choice, vehicle shape, and the trajectory flown through the atmosphere.",
  },
  {
    accent: "plasma",
    code: "Pathway 05",
    concept:
      "Moving between orbits costs propellant, measured as delta-v. A Hohmann transfer is the fuel-efficient two-burn path between two circular orbits, while a plane change adjusts orbital inclination — a maneuver that becomes expensive at high orbital speeds.",
    explorationLinks: [
      {
        description:
          "Compare published rocket characteristics side by side while exploring transfer and plane-change concepts.",
        href: "/compare?category=rockets",
        label: "Compare launch vehicles",
      },
    ],
    id: "orbital-mechanics-mission-design",
    labAnchors: [
      {
        anchorId: "hohmann-transfer-analyzer",
        label: "Hohmann Transfer Analyzer",
      },
      {
        anchorId: "orbital-plane-change-analyzer",
        label: "Orbital Plane Change Analyzer",
      },
      {
        anchorId: "mission-profile-analyzer",
        label: "Mission Profile Analyzer",
      },
    ],
    realWorldContext:
      "Orbital transfers and plane changes are basic building blocks of real mission planning, from placing satellites in their operational orbits to sequencing multi-burn trajectories toward another body.",
    surfaceVariant: "gallery",
    title: "Orbital Mechanics & Mission Design",
    whyItMatters:
      "Mission designers sequence these maneuvers deliberately because propellant is finite: choosing an efficient transfer, and combining plane changes with other burns when possible, is often the difference between reaching a destination and falling short of it.",
  },
  {
    accent: "accent",
    code: "Pathway 06",
    concept:
      "Engineering results only matter if they can be reviewed, compared, and communicated clearly. Mission control views, structured reports, and briefings translate raw analysis into a form that supports real decisions.",
    explorationLinks: [
      {
        description:
          "See completed mission narratives that demonstrate how ORBIX communicates finished analysis.",
        href: "/showcase",
        label: "Mission showcase",
      },
    ],
    id: "mission-operations-engineering-communication",
    labAnchors: [
      {
        anchorId: "mission-control-dashboard",
        label: "Mission Control Dashboard",
      },
      { anchorId: "scenario-library", label: "Mission Scenario Library" },
      { anchorId: "mission-report-viewer", label: "Mission Report Viewer" },
      { anchorId: "mission-briefing", label: "Mission Briefing" },
      { anchorId: "mission-trade-study", label: "Mission Trade Study Center" },
      { anchorId: "demo-mode", label: "Orbix Demo Mode" },
    ],
    realWorldContext:
      "Mission control centers, trade studies comparing competing designs, and formal design-review briefings are standard practice across real aerospace programs, from single-vehicle missions to large agency-led projects.",
    surfaceVariant: "telemetry",
    title: "Mission Operations & Engineering Communication",
    whyItMatters:
      "Aerospace missions are reviewed at every stage by engineers, stakeholders, and safety boards — presenting analysis clearly, comparing alternative mission architectures, and tracking a mission profile end to end is as essential as the analysis itself.",
  },
] as const;

export function listLearningAreas(): readonly LearningArea[] {
  return learningAreas;
}
