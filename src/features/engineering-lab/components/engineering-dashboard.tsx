import {
  CircleDot,
  CloudSun,
  FileText,
  Flame,
  FlaskConical,
  Gauge,
  Layers,
  MoveRight,
  Orbit,
  Plane,
  Radar,
  Scale,
  Shield,
  Sigma,
  Wind,
} from "lucide-react";

import { Container } from "@/components/layout/container";
import { OrbixEnvironmentBackdrop } from "@/components/brand/orbix-environment";
import { OrbixWordmark } from "@/components/brand/orbix-wordmark";
import { analyzeMissionProfile } from "@/features/engineering-lab/analysis";
import { AtmosphereCalculator } from "@/features/engineering-lab/components/atmosphere-calculator";
import { CalculatorCard } from "@/features/engineering-lab/components/calculator-card";
import { DragEquationCalculator } from "@/features/engineering-lab/components/drag-equation-calculator";
import { EngineeringContextNote } from "@/features/engineering-lab/components/engineering-context-note";
import { FlightConditionAnalyzer } from "@/features/engineering-lab/components/flight-condition-analyzer";
import { HohmannTransferAnalyzer } from "@/features/engineering-lab/components/hohmann-transfer-analyzer";
import { HypersonicHeatingAnalyzer } from "@/features/engineering-lab/components/hypersonic-heating-analyzer";
import { InletCompressionAnalyzer } from "@/features/engineering-lab/components/inlet-compression-analyzer";
import { LiftEquationCalculator } from "@/features/engineering-lab/components/lift-equation-calculator";
import { LaboratoryShell } from "@/features/engineering-lab/components/laboratory-shell";
import type { LaboratoryToolNavigationItem } from "@/features/engineering-lab/components/laboratory-tool-navigation";
import { LaboratoryWorkflowSection } from "@/features/engineering-lab/components/laboratory-workflow-section";
import { MaterialTPSSizingAnalyzer } from "@/features/engineering-lab/components/material-tps-sizing-analyzer";
import {
  MissionPresetIntegration,
  MissionPresetLauncher,
  MissionPresetProfileTarget,
} from "@/features/engineering-lab/components/mission-preset-launcher";
import { MissionReportViewer } from "@/features/engineering-lab/components/mission-report-viewer";
import { DemoMode } from "@/features/engineering-lab/components/presentation/demo-mode";
import { MissionBriefing } from "@/features/engineering-lab/components/presentation/mission-briefing";
import { MissionShowcase } from "@/features/engineering-lab/components/presentation/mission-showcase";
import { MissionTradeStudy } from "@/features/engineering-lab/components/presentation/mission-trade-study";
import { MultiShockRecoveryAnalyzer } from "@/features/engineering-lab/components/multi-shock-recovery-analyzer";
import { ObliqueShockConditionAnalyzer } from "@/features/engineering-lab/components/oblique-shock-condition-analyzer";
import { OrbitalPlaneChangeAnalyzer } from "@/features/engineering-lab/components/orbital-plane-change-analyzer";
import { ReentryDecelerationAnalyzer } from "@/features/engineering-lab/components/reentry-deceleration-analyzer";
import { ReentryTrajectoryAnalyzer } from "@/features/engineering-lab/components/reentry-trajectory-analyzer";
import { RocketEquationCalculator } from "@/features/engineering-lab/components/rocket-equation-calculator";
import { MissionGallery } from "@/features/engineering-lab/components/showcase/mission-gallery";
import {
  ScenarioLibrary,
  ScenarioLibraryBuilderTarget,
  ScenarioLibraryIntegration,
} from "@/features/engineering-lab/components/scenario-library";
import { ShockConditionAnalyzer } from "@/features/engineering-lab/components/shock-condition-analyzer";
import { ShockPressureLossAnalyzer } from "@/features/engineering-lab/components/shock-pressure-loss-analyzer";
import { StagnationConditionAnalyzer } from "@/features/engineering-lab/components/stagnation-condition-analyzer";
import { ThrustToWeightCalculator } from "@/features/engineering-lab/components/thrust-to-weight-calculator";
import { TPSMaterialComparisonAnalyzer } from "@/features/engineering-lab/components/tps-material-comparison-analyzer";
import { VehicleReentryComparisonAnalyzer } from "@/features/engineering-lab/components/vehicle-reentry-comparison-analyzer";
import { VehicleReentryEvaluationAnalyzer } from "@/features/engineering-lab/components/vehicle-reentry-evaluation-analyzer";
import {
  MissionControlDashboard,
  MissionOrbitVisualization,
  MissionViewer,
  ReentryProfileVisualization,
} from "@/features/engineering-lab/components/visualization";
import {
  getMissionPresetById,
  listMissionPresets,
  type MissionScenario,
} from "@/features/engineering-lab/missions";
import { generateMissionReport } from "@/features/engineering-lab/reports";

function createMissionPreview() {
  const preset = getMissionPresetById("iss-style-resupply");

  if (preset === undefined) {
    throw new Error("Mission report preview preset is unavailable.");
  }

  const analysis = analyzeMissionProfile(preset.missionProfileInputs);
  const report = generateMissionReport({
    description: preset.description,
    missionProfileAnalysis: analysis,
  });
  const scenario = {
    category: preset.category,
    createdAt: "2026-08-04T00:00:00.000Z",
    description: preset.description,
    id: `demo-${preset.id}`,
    name: preset.name,
    profile: preset.missionProfileInputs,
    updatedAt: "2026-08-04T00:00:00.000Z",
  } satisfies MissionScenario;

  return { analysis, category: preset.category, preset, report, scenario };
}

const missionPreview = createMissionPreview();

function createTradeStudyPreview() {
  const presetIds = [
    "leo-satellite-deployment",
    "iss-style-resupply",
    "lunar-transfer-concept",
  ] as const;
  const entries = presetIds.map((presetId) => {
    const preset = getMissionPresetById(presetId);
    if (preset === undefined) {
      throw new Error(`Mission trade-study preset is unavailable: ${presetId}`);
    }

    const analysis = analyzeMissionProfile(preset.missionProfileInputs);
    const report = generateMissionReport({
      description: preset.description,
      missionProfileAnalysis: analysis,
    });
    const scenario = {
      category: preset.category,
      createdAt: "2026-08-04T00:00:00.000Z",
      description: preset.description,
      id: `trade-study-${preset.id}`,
      name: preset.name,
      profile: preset.missionProfileInputs,
      updatedAt: "2026-08-04T00:00:00.000Z",
    } satisfies MissionScenario;

    return { analysis, report, scenario };
  });

  return {
    analyses: entries.map(({ analysis }) => analysis),
    reports: entries.map(({ report }) => report),
    scenarios: entries.map(({ scenario }) => scenario),
  };
}

const tradeStudyPreview = createTradeStudyPreview();
const missionArchivePresets = listMissionPresets();
const missionArchiveAnalyses = [
  missionPreview.analysis,
  ...tradeStudyPreview.analyses,
];
const missionArchiveReports = [
  missionPreview.report,
  ...tradeStudyPreview.reports,
];

const laboratoryWorkflows = [
  {
    code: "WF-01",
    description: "Propulsion, force balance, aerodynamics, and atmosphere",
    href: "#foundations-workflow",
    title: "Engineering foundations",
  },
  {
    code: "WF-02",
    description: "Stagnation states, shocks, recovery, and inlet compression",
    href: "#compressible-flow-workflow",
    title: "Compressible flow",
  },
  {
    code: "WF-03",
    description: "Heating, reentry dynamics, TPS sizing, and vehicle studies",
    href: "#entry-systems-workflow",
    title: "Entry systems",
  },
  {
    code: "WF-04",
    description: "Transfers, plane changes, profiles, presets, and reports",
    href: "#orbital-mission-workflow",
    title: "Orbital and mission design",
  },
  {
    code: "WF-05",
    description: "Mission visualization, integrated viewing, and control",
    href: "#mission-operations-workflow",
    title: "Mission operations",
  },
  {
    code: "WF-06",
    description: "Scenario management, briefings, trade studies, and demos",
    href: "#review-presentation-workflow",
    title: "Review and presentation",
  },
] as const;

/**
 * The module index for each workflow, in render order.
 *
 * Paired by position with the `CalculatorCard` children below. Kept as data
 * rather than derived from the children so the section stays a plain client
 * component; `engineering-lab-modules.spec.ts` asserts each entry matches the
 * heading of the card it reveals, so the pairing cannot drift unnoticed.
 */
const FOUNDATIONS_MODULES: readonly LaboratoryToolNavigationItem[] = [
  {
    id: "rocket-equation",
    kind: "Rocket propulsion",
    title: "Tsiolkovsky Rocket Equation",
  },
  {
    id: "thrust-to-weight",
    kind: "Force balance",
    title: "Thrust-to-Weight Ratio",
  },
  { id: "lift-equation", kind: "Aerodynamics", title: "Lift Equation" },
  { id: "drag-equation", kind: "Aerodynamics", title: "Drag Equation" },
  {
    id: "standard-atmosphere",
    kind: "Atmospheric modeling",
    title: "Standard Atmosphere",
  },
  {
    id: "flight-condition-analyzer",
    kind: "Integrated flight performance",
    title: "Flight Condition Analyzer",
  },
];

const COMPRESSIBLE_FLOW_MODULES: readonly LaboratoryToolNavigationItem[] = [
  {
    id: "stagnation-condition-analyzer",
    kind: "Compressible flow",
    title: "Stagnation Condition Analyzer",
  },
  {
    id: "shock-condition-analyzer",
    kind: "Normal shock",
    title: "Shock Condition Analyzer",
  },
  {
    id: "oblique-shock-condition-analyzer",
    kind: "Oblique shock",
    title: "Oblique Shock Condition Analyzer",
  },
  {
    id: "shock-pressure-loss-analyzer",
    kind: "Pressure recovery",
    title: "Shock Pressure Loss Analyzer",
  },
  {
    id: "multi-shock-recovery-analyzer",
    kind: "Staged compression",
    title: "Multi-Shock Recovery Analyzer",
  },
  {
    id: "inlet-compression-analyzer",
    kind: "Supersonic inlet",
    title: "Supersonic Inlet Compression Analyzer",
  },
];

const ENTRY_SYSTEMS_MODULES: readonly LaboratoryToolNavigationItem[] = [
  {
    id: "hypersonic-heating-analyzer",
    kind: "Hypersonic thermal analysis",
    title: "Hypersonic Heating Analyzer",
  },
  {
    id: "reentry-deceleration-analyzer",
    kind: "Reentry dynamics",
    title: "Reentry Deceleration Analyzer",
  },
  {
    id: "reentry-trajectory-analyzer",
    kind: "Reentry trajectory",
    title: "Reentry Trajectory Analyzer",
  },
  {
    id: "material-tps-sizing-analyzer",
    kind: "Thermal protection",
    title: "TPS Material Selection Analyzer",
  },
  {
    id: "tps-material-comparison-analyzer",
    kind: "TPS comparison",
    title: "TPS Material Comparison Analyzer",
  },
  {
    id: "vehicle-reentry-evaluation-analyzer",
    kind: "Vehicle reentry",
    title: "Vehicle Reentry Evaluation Analyzer",
  },
  {
    id: "vehicle-reentry-comparison-analyzer",
    kind: "Vehicle comparison",
    title: "Vehicle Reentry Comparison Analyzer",
  },
];

const ORBITAL_MISSION_MODULES: readonly LaboratoryToolNavigationItem[] = [
  {
    id: "hohmann-transfer-analyzer",
    kind: "Orbital mechanics",
    title: "Hohmann Transfer Analyzer",
  },
  {
    id: "orbital-plane-change-analyzer",
    kind: "Orbital mechanics",
    title: "Orbital Plane Change Analyzer",
  },
  {
    id: "mission-profile-analyzer",
    kind: "Mission integration",
    title: "Mission Profile Analyzer",
  },
  {
    id: "mission-preset-launcher",
    kind: "Mission presets",
    title: "Mission Preset Launcher",
  },
  {
    id: "mission-report-viewer",
    kind: "Mission reporting",
    title: "Mission Report Viewer",
  },
];

const MISSION_OPERATIONS_MODULES: readonly LaboratoryToolNavigationItem[] = [
  {
    id: "mission-visualization",
    kind: "Mission telemetry",
    title: "Mission Visualization",
  },
  {
    id: "interactive-mission-viewer",
    kind: "Integrated mission control",
    title: "Interactive Mission Viewer",
  },
  {
    id: "mission-control-dashboard",
    kind: "Mission operations",
    title: "Mission Control Dashboard",
  },
];

const REVIEW_PRESENTATION_MODULES: readonly LaboratoryToolNavigationItem[] = [
  {
    id: "mission-scenario-builder",
    kind: "Mission planning",
    title: "Mission Scenario Builder",
  },
  {
    id: "scenario-library",
    kind: "Scenario management",
    title: "Mission Scenario Library",
  },
  {
    id: "mission-briefing",
    kind: "Mission presentation",
    title: "Mission Briefing",
  },
  {
    id: "mission-trade-study",
    kind: "Architecture review",
    title: "Mission Trade Study Center",
  },
  {
    id: "mission-showcase",
    kind: "Mission presentation",
    title: "Cinematic Mission Showcase",
  },
  { id: "demo-mode", kind: "Guided experience", title: "Orbix Demo Mode" },
];

export function EngineeringDashboard() {
  return (
    <>
      <header className="orbix-brand-glow relative isolate overflow-hidden border-b border-laboratory/20 py-20 sm:py-28">
        <OrbixEnvironmentBackdrop priority theme="laboratory" />
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
            <div className="max-w-4xl">
              <OrbixWordmark className="mb-7 h-10 w-40" priority />
              <p className="flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-accent uppercase">
                <FlaskConical aria-hidden="true" size={16} strokeWidth={1.7} />
                Applied engineering // Laboratory
              </p>
              <h1 className="font-display mt-6 text-5xl leading-[0.98] font-semibold tracking-[-0.05em] text-balance sm:text-6xl lg:text-7xl">
                Engineering Laboratory
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-muted sm:text-xl">
                Work directly with foundational aerospace equations using
                explicit units, transparent assumptions, and validated inputs.
              </p>
            </div>

            <aside className="orbix-premium-card border-laboratory/25 p-5 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center border border-laboratory/25 bg-laboratory/10 text-laboratory">
                  <Gauge aria-hidden="true" size={19} strokeWidth={1.7} />
                </span>
                <div>
                  <p className="font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                    Laboratory scope
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    Educational workspace
                  </p>
                </div>
              </div>
              <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
                <span className="text-sm text-muted">Available modules</span>
                <span className="font-mono text-2xl text-accent">33</span>
              </div>
            </aside>
          </div>

          <div className="mt-10 max-w-4xl">
            <EngineeringContextNote
              label="How to use this laboratory"
              title="Begin with the model closest to your engineering question."
            >
              Follow the workflow index for a guided sequence, or move directly
              to any module. Each analyzer retains its documented assumptions,
              validation behavior, and source calculations.
            </EngineeringContextNote>
          </div>
        </Container>
      </header>

      <section
        aria-label="ORBIX mission archive"
        className="border-b border-border/70 py-16 sm:py-20"
      >
        <Container>
          <MissionGallery
            analyses={missionArchiveAnalyses}
            missionControlHref="#mission-control-dashboard"
            presets={missionArchivePresets}
            reports={missionArchiveReports}
          />
        </Container>
      </section>

      <LaboratoryShell workflows={laboratoryWorkflows}>
        <LaboratoryWorkflowSection
          code="Workflow 01 // Modules 01-06"
          description="Begin with the propulsion, force-balance, aerodynamic, and atmospheric primitives that support later integrated analyses."
          icon={FlaskConical}
          id="foundations-workflow"
          title="Engineering foundations"
          tools={FOUNDATIONS_MODULES}
        >
          <CalculatorCard
            headingLevel={3}
            description="Estimate the ideal velocity change available from a rocket stage using mass ratio and propulsion efficiency."
            eyebrow="Calculator 01 // Rocket propulsion"
            icon={Sigma}
            id="rocket-equation"
            title="Tsiolkovsky Rocket Equation"
          >
            <RocketEquationCalculator />
          </CalculatorCard>

          <CalculatorCard
            headingLevel={3}
            description="Evaluate whether available thrust exceeds vehicle weight at a specified instantaneous mass."
            eyebrow="Calculator 02 // Force balance"
            icon={Scale}
            id="thrust-to-weight"
            title="Thrust-to-Weight Ratio"
          >
            <ThrustToWeightCalculator />
          </CalculatorCard>

          <CalculatorCard
            headingLevel={3}
            description="Estimate lift force from atmospheric density, airspeed, reference wing area, and lift coefficient."
            eyebrow="Calculator 03 // Aerodynamics"
            icon={Wind}
            id="lift-equation"
            title="Lift Equation"
          >
            <LiftEquationCalculator />
          </CalculatorCard>

          <CalculatorCard
            headingLevel={3}
            description="Estimate aerodynamic drag from dynamic pressure, reference area, and drag coefficient."
            eyebrow="Calculator 04 // Aerodynamics"
            icon={MoveRight}
            id="drag-equation"
            title="Drag Equation"
          >
            <DragEquationCalculator />
          </CalculatorCard>

          <CalculatorCard
            headingLevel={3}
            description="Estimate temperature, pressure, and density through the standard-atmosphere troposphere model."
            eyebrow="Calculator 05 // Atmospheric modeling"
            icon={CloudSun}
            id="standard-atmosphere"
            title="Standard Atmosphere"
          >
            <AtmosphereCalculator />
          </CalculatorCard>

          <CalculatorCard
            headingLevel={3}
            description="Compose atmosphere, dynamic pressure, lift, and drag into one integrated flight-condition analysis."
            eyebrow="Analyzer 06 // Integrated flight performance"
            icon={Plane}
            id="flight-condition-analyzer"
            title="Flight Condition Analyzer"
          >
            <FlightConditionAnalyzer />
          </CalculatorCard>
        </LaboratoryWorkflowSection>

        <LaboratoryWorkflowSection
          code="Workflow 02 // Modules 07-12"
          description="Move from static atmospheric conditions through stagnation states, shock systems, pressure recovery, and staged inlet compression."
          icon={Wind}
          id="compressible-flow-workflow"
          title="Compressible flow and shock systems"
          tools={COMPRESSIBLE_FLOW_MODULES}
        >
          <CalculatorCard
            headingLevel={3}
            description="Convert static atmospheric properties into stagnation conditions using validated isentropic-flow ratios."
            eyebrow="Analyzer 07 // Compressible flow"
            icon={Gauge}
            id="stagnation-condition-analyzer"
            title="Stagnation Condition Analyzer"
          >
            <StagnationConditionAnalyzer />
          </CalculatorCard>

          <CalculatorCard
            headingLevel={3}
            description="Resolve upstream atmospheric properties through a one-dimensional normal shock into the downstream flow state."
            eyebrow="Analyzer 08 // Normal shock"
            icon={MoveRight}
            id="shock-condition-analyzer"
            title="Shock Condition Analyzer"
          >
            <ShockConditionAnalyzer />
          </CalculatorCard>

          <CalculatorCard
            headingLevel={3}
            description="Analyze an attached weak oblique shock using upstream atmosphere, Mach number, and flow-deflection geometry."
            eyebrow="Analyzer 09 // Oblique shock"
            icon={Wind}
            id="oblique-shock-condition-analyzer"
            title="Oblique Shock Condition Analyzer"
          >
            <ObliqueShockConditionAnalyzer />
          </CalculatorCard>

          <CalculatorCard
            headingLevel={3}
            description="Compare stagnation-pressure recovery across normal and attached weak oblique shocks using validated shock geometry."
            eyebrow="Analyzer 10 // Pressure recovery"
            icon={Gauge}
            id="shock-pressure-loss-analyzer"
            title="Shock Pressure Loss Analyzer"
          >
            <ShockPressureLossAnalyzer />
          </CalculatorCard>

          <CalculatorCard
            headingLevel={3}
            description="Construct an ordered sequence of normal and attached weak oblique shocks to inspect cumulative total-pressure recovery."
            eyebrow="Analyzer 11 // Staged compression"
            icon={Layers}
            id="multi-shock-recovery-analyzer"
            title="Multi-Shock Recovery Analyzer"
          >
            <MultiShockRecoveryAnalyzer />
          </CalculatorCard>

          <CalculatorCard
            headingLevel={3}
            description="Model staged external compression followed by a terminal normal shock and inspect complete inlet pressure recovery."
            eyebrow="Analyzer 12 // Supersonic inlet"
            icon={Wind}
            id="inlet-compression-analyzer"
            title="Supersonic Inlet Compression Analyzer"
          >
            <InletCompressionAnalyzer />
          </CalculatorCard>
        </LaboratoryWorkflowSection>

        <LaboratoryWorkflowSection
          code="Workflow 03 // Modules 13-19"
          description="Connect hypersonic heating, drag deceleration, trajectory history, thermal protection sizing, and vehicle-level reentry comparisons."
          icon={Flame}
          id="entry-systems-workflow"
          title="Atmospheric entry and thermal systems"
          tools={ENTRY_SYSTEMS_MODULES}
        >
          <CalculatorCard
            headingLevel={3}
            description="Combine standard-atmosphere conditions, local Mach classification, and stagnation-point convective heating in one thermal workflow."
            eyebrow="Analyzer 13 // Hypersonic thermal analysis"
            icon={Flame}
            id="hypersonic-heating-analyzer"
            title="Hypersonic Heating Analyzer"
          >
            <HypersonicHeatingAnalyzer />
          </CalculatorCard>

          <CalculatorCard
            headingLevel={3}
            description="Combine atmosphere, ballistic coefficient, and dynamic pressure to estimate instantaneous spacecraft drag deceleration."
            eyebrow="Analyzer 14 // Reentry dynamics"
            icon={Gauge}
            id="reentry-deceleration-analyzer"
            title="Reentry Deceleration Analyzer"
          >
            <ReentryDecelerationAnalyzer />
          </CalculatorCard>

          <CalculatorCard
            headingLevel={3}
            description="Integrate a simplified point-mass descent and inspect velocity, altitude, dynamic pressure, and deceleration throughout the trajectory."
            eyebrow="Analyzer 15 // Reentry trajectory"
            icon={Plane}
            id="reentry-trajectory-analyzer"
            title="Reentry Trajectory Analyzer"
          >
            <ReentryTrajectoryAnalyzer />
          </CalculatorCard>

          <CalculatorCard
            headingLevel={3}
            description="Connect the educational TPS material catalog to reentry thermal history and preliminary protection-system sizing."
            eyebrow="Analyzer 16 // Thermal protection"
            icon={Shield}
            id="material-tps-sizing-analyzer"
            title="TPS Material Selection Analyzer"
          >
            <MaterialTPSSizingAnalyzer />
          </CalculatorCard>

          <CalculatorCard
            headingLevel={3}
            description="Compare catalog TPS materials under one shared reentry scenario using the existing educational ranking analysis."
            eyebrow="Analyzer 17 // TPS comparison"
            icon={Shield}
            id="tps-material-comparison-analyzer"
            title="TPS Material Comparison Analyzer"
          >
            <TPSMaterialComparisonAnalyzer />
          </CalculatorCard>

          <CalculatorCard
            headingLevel={3}
            description="Evaluate one vehicle configuration through the integrated reentry trajectory, thermal history, and TPS material-comparison workflow."
            eyebrow="Analyzer 18 // Vehicle reentry"
            icon={Plane}
            id="vehicle-reentry-evaluation-analyzer"
            title="Vehicle Reentry Evaluation Analyzer"
          >
            <VehicleReentryEvaluationAnalyzer />
          </CalculatorCard>

          <CalculatorCard
            headingLevel={3}
            description="Compare up to five vehicle configurations under identical reentry conditions using the existing evaluation and ranking workflow."
            eyebrow="Analyzer 19 // Vehicle comparison"
            icon={Scale}
            id="vehicle-reentry-comparison-analyzer"
            title="Vehicle Reentry Comparison Analyzer"
          >
            <VehicleReentryComparisonAnalyzer />
          </CalculatorCard>
        </LaboratoryWorkflowSection>

        {/* The preset/profile handoff is a context provider that renders no
            markup of its own, hoisted above the section so every module is a
            direct child of the workspace and can be revealed individually.
            Wrapping two cards, as it did before, made them one child. */}
        <MissionPresetIntegration>
          <LaboratoryWorkflowSection
            code="Workflow 04 // Modules 20-24"
            description="Build ideal orbital transfers and plane changes into mission profiles, reusable presets, and structured engineering reports."
            icon={Orbit}
            id="orbital-mission-workflow"
            title="Orbital and mission architecture"
            tools={ORBITAL_MISSION_MODULES}
          >
            <CalculatorCard
              headingLevel={3}
              description="Resolve an ideal two-impulse transfer between circular, coplanar orbits using altitude-based orbital context."
              eyebrow="Analyzer 20 // Orbital mechanics"
              icon={CircleDot}
              id="hohmann-transfer-analyzer"
              title="Hohmann Transfer Analyzer"
            >
              <HohmannTransferAnalyzer />
            </CalculatorCard>

            <CalculatorCard
              headingLevel={3}
              description="Resolve circular-orbit velocity from altitude and estimate the ideal delta-v for an impulsive inclination change."
              eyebrow="Analyzer 21 // Orbital mechanics"
              icon={Orbit}
              id="orbital-plane-change-analyzer"
              title="Orbital Plane Change Analyzer"
            >
              <OrbitalPlaneChangeAnalyzer />
            </CalculatorCard>

            <CalculatorCard
              headingLevel={3}
              description="Integrate orbital maneuver budgeting, vehicle reentry evaluation, comparison, and TPS recommendations into one educational mission profile."
              eyebrow="Analyzer 22 // Mission integration"
              icon={Layers}
              id="mission-profile-analyzer"
              title="Mission Profile Analyzer"
            >
              <MissionPresetProfileTarget />
            </CalculatorCard>

            <CalculatorCard
              headingLevel={3}
              description="Select an immutable educational mission template and load its existing input configuration into the Mission Profile Analyzer."
              eyebrow="Launcher 23 // Mission presets"
              icon={Orbit}
              id="mission-preset-launcher"
              title="Mission Preset Launcher"
            >
              <MissionPresetLauncher />
            </CalculatorCard>

            <CalculatorCard
              headingLevel={3}
              description="Review a structured engineering report produced by the existing mission-report domain from completed mission-profile results."
              eyebrow="Viewer 24 // Mission reporting"
              icon={FileText}
              id="mission-report-viewer"
              title="Mission Report Viewer"
            >
              <MissionReportViewer report={missionPreview.report} />
            </CalculatorCard>
          </LaboratoryWorkflowSection>
        </MissionPresetIntegration>

        <LaboratoryWorkflowSection
          code="Workflow 05 // Modules 25-27"
          description="Inspect completed mission outputs through orbital and reentry visualizations, integrated telemetry, and the Mission Control workspace."
          icon={Radar}
          id="mission-operations-workflow"
          title="Mission operations and visualization"
          tools={MISSION_OPERATIONS_MODULES}
        >
          <CalculatorCard
            headingLevel={3}
            description="Inspect existing orbital-transfer and vehicle-reentry outputs through reusable, accessible mission-control visualizations."
            eyebrow="Visualization 25 // Mission telemetry"
            icon={Orbit}
            id="mission-visualization"
            title="Mission Visualization"
          >
            <div className="space-y-6">
              <MissionOrbitVisualization analysis={missionPreview.analysis} />
              <ReentryProfileVisualization
                analysis={
                  missionPreview.analysis.sourceAnalyses
                    .vehicleReentryEvaluation
                }
              />
            </div>
          </CalculatorCard>

          <CalculatorCard
            headingLevel={3}
            description="Unify the reported mission sequence, orbital and reentry views, and engineering telemetry in one interactive mission-control workspace."
            eyebrow="Viewer 26 // Integrated mission control"
            icon={Gauge}
            id="interactive-mission-viewer"
            title="Interactive Mission Viewer"
          >
            <MissionViewer
              missionProfileAnalysis={missionPreview.analysis}
              missionReport={missionPreview.report}
              vehicleReentryEvaluation={
                missionPreview.analysis.sourceAnalyses.vehicleReentryEvaluation
              }
            />
          </CalculatorCard>

          <CalculatorCard
            headingLevel={3}
            description="Review the complete mission-profile, visualization, telemetry, status, and engineering-report workflow in a polished aerospace command interface."
            eyebrow="Dashboard 27 // Mission operations"
            icon={Radar}
            id="mission-control-dashboard"
            title="Mission Control Dashboard"
          >
            <MissionControlDashboard
              missionCategory={missionPreview.category}
              missionProfileAnalysis={missionPreview.analysis}
              missionPreset={missionPreview.preset}
              missionReport={missionPreview.report}
              missionScenario={missionPreview.scenario}
              tradeStudyAnalyses={tradeStudyPreview.analyses}
              tradeStudyReports={tradeStudyPreview.reports}
              tradeStudyScenarios={tradeStudyPreview.scenarios}
              vehicleReentryEvaluation={
                missionPreview.analysis.sourceAnalyses.vehicleReentryEvaluation
              }
            />
          </CalculatorCard>
        </LaboratoryWorkflowSection>

        {/* Same reason as the preset provider above: a markup-free context
            wrapper hoisted out so its two cards become separate modules. */}
        <ScenarioLibraryIntegration>
          <LaboratoryWorkflowSection
            code="Workflow 06 // Modules 28-33"
            description="Manage educational scenarios, compare architectures, and present completed source analyses through briefings, showcases, and guided review."
            icon={FileText}
            id="review-presentation-workflow"
            title="Scenario review and presentation"
            tools={REVIEW_PRESENTATION_MODULES}
          >
            <CalculatorCard
              headingLevel={3}
              description="Assemble existing orbital, vehicle, reentry, and TPS inputs into a custom educational mission profile without introducing a separate analysis path."
              eyebrow="Builder 28 // Mission planning"
              icon={Layers}
              id="mission-scenario-builder"
              title="Mission Scenario Builder"
            >
              <ScenarioLibraryBuilderTarget />
            </CalculatorCard>

            <CalculatorCard
              headingLevel={3}
              description="Save, browse, duplicate, delete, and reload educational mission-profile inputs through a persistent device library."
              eyebrow="Library 29 // Scenario management"
              icon={FileText}
              id="scenario-library"
              title="Mission Scenario Library"
            >
              <ScenarioLibrary />
            </CalculatorCard>

            <CalculatorCard
              headingLevel={3}
              description="Present completed mission-profile and report outputs through a cinematic aerospace briefing without adding calculations or feasibility claims."
              eyebrow="Briefing 30 // Mission presentation"
              icon={Radar}
              id="mission-briefing"
              title="Mission Briefing"
            >
              <MissionBriefing
                missionProfile={missionPreview.analysis}
                preset={missionPreview.preset}
                report={missionPreview.report}
              />
            </CalculatorCard>

            <CalculatorCard
              headingLevel={3}
              description="Compare saved educational mission architectures through supplied orbital, vehicle, and thermal outputs without scoring or selecting a winner."
              eyebrow="Trade study 31 // Architecture review"
              icon={Scale}
              id="mission-trade-study"
              title="Mission Trade Study Center"
            >
              <MissionTradeStudy
                analyses={tradeStudyPreview.analyses}
                reports={tradeStudyPreview.reports}
                scenarios={tradeStudyPreview.scenarios}
              />
            </CalculatorCard>

            <CalculatorCard
              headingLevel={3}
              description="Present completed mission outputs as a cinematic, phase-based aerospace review with direct telemetry and presentation-only controls."
              eyebrow="Showcase 32 // Mission presentation"
              icon={Radar}
              id="mission-showcase"
              title="Cinematic Mission Showcase"
            >
              <MissionShowcase
                missionProfile={missionPreview.analysis}
                report={missionPreview.report}
              />
            </CalculatorCard>

            <CalculatorCard
              headingLevel={3}
              description="Guide reviewers, professors, recruiters, and students through the supplied Orbix mission workflow without requiring manual configuration."
              eyebrow="Demo 33 // Guided experience"
              icon={Radar}
              id="demo-mode"
              title="Orbix Demo Mode"
            >
              <DemoMode
                missionProfile={missionPreview.analysis}
                missionScenario={missionPreview.scenario}
                report={missionPreview.report}
              />
            </CalculatorCard>
          </LaboratoryWorkflowSection>
        </ScenarioLibraryIntegration>
      </LaboratoryShell>
    </>
  );
}
