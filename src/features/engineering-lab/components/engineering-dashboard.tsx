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
import { FlightConditionAnalyzer } from "@/features/engineering-lab/components/flight-condition-analyzer";
import { HohmannTransferAnalyzer } from "@/features/engineering-lab/components/hohmann-transfer-analyzer";
import { HypersonicHeatingAnalyzer } from "@/features/engineering-lab/components/hypersonic-heating-analyzer";
import { InletCompressionAnalyzer } from "@/features/engineering-lab/components/inlet-compression-analyzer";
import { LiftEquationCalculator } from "@/features/engineering-lab/components/lift-equation-calculator";
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
                    Laboratory status
                  </p>
                  <p className="mt-1 text-sm font-semibold">Module online</p>
                </div>
              </div>
              <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
                <span className="text-sm text-muted">Active calculators</span>
                <span className="font-mono text-2xl text-accent">33</span>
              </div>
            </aside>
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

      <section
        aria-labelledby="laboratory-modules-title"
        className="py-16 sm:py-20"
      >
        <Container>
          <div className="mb-8 max-w-3xl">
            <p className="font-mono text-xs tracking-[0.18em] text-accent uppercase">
              Module registry // Propulsion + Aerodynamics + Atmosphere
            </p>
            <h2
              className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl"
              id="laboratory-modules-title"
            >
              Engineering calculators
            </h2>
            <p className="mt-4 text-base leading-7 text-muted">
              Each module isolates its engineering model from the interface so
              equations can be verified, tested, and reused independently.
            </p>
          </div>

          <div className="space-y-8">
            <CalculatorCard
              description="Estimate the ideal velocity change available from a rocket stage using mass ratio and propulsion efficiency."
              eyebrow="Calculator 01 // Rocket propulsion"
              icon={Sigma}
              id="rocket-equation"
              title="Tsiolkovsky Rocket Equation"
            >
              <RocketEquationCalculator />
            </CalculatorCard>

            <CalculatorCard
              description="Evaluate whether available thrust exceeds vehicle weight at a specified instantaneous mass."
              eyebrow="Calculator 02 // Force balance"
              icon={Scale}
              id="thrust-to-weight"
              title="Thrust-to-Weight Ratio"
            >
              <ThrustToWeightCalculator />
            </CalculatorCard>

            <CalculatorCard
              description="Estimate lift force from atmospheric density, airspeed, reference wing area, and lift coefficient."
              eyebrow="Calculator 03 // Aerodynamics"
              icon={Wind}
              id="lift-equation"
              title="Lift Equation"
            >
              <LiftEquationCalculator />
            </CalculatorCard>

            <CalculatorCard
              description="Estimate aerodynamic drag from dynamic pressure, reference area, and drag coefficient."
              eyebrow="Calculator 04 // Aerodynamics"
              icon={MoveRight}
              id="drag-equation"
              title="Drag Equation"
            >
              <DragEquationCalculator />
            </CalculatorCard>

            <CalculatorCard
              description="Estimate temperature, pressure, and density through the standard-atmosphere troposphere model."
              eyebrow="Calculator 05 // Atmospheric modeling"
              icon={CloudSun}
              id="standard-atmosphere"
              title="Standard Atmosphere"
            >
              <AtmosphereCalculator />
            </CalculatorCard>

            <CalculatorCard
              description="Compose atmosphere, dynamic pressure, lift, and drag into one integrated flight-condition analysis."
              eyebrow="Analyzer 06 // Integrated flight performance"
              icon={Plane}
              id="flight-condition-analyzer"
              title="Flight Condition Analyzer"
            >
              <FlightConditionAnalyzer />
            </CalculatorCard>

            <CalculatorCard
              description="Convert static atmospheric properties into stagnation conditions using validated isentropic-flow ratios."
              eyebrow="Analyzer 07 // Compressible flow"
              icon={Gauge}
              id="stagnation-condition-analyzer"
              title="Stagnation Condition Analyzer"
            >
              <StagnationConditionAnalyzer />
            </CalculatorCard>

            <CalculatorCard
              description="Resolve upstream atmospheric properties through a one-dimensional normal shock into the downstream flow state."
              eyebrow="Analyzer 08 // Normal shock"
              icon={MoveRight}
              id="shock-condition-analyzer"
              title="Shock Condition Analyzer"
            >
              <ShockConditionAnalyzer />
            </CalculatorCard>

            <CalculatorCard
              description="Analyze an attached weak oblique shock using upstream atmosphere, Mach number, and flow-deflection geometry."
              eyebrow="Analyzer 09 // Oblique shock"
              icon={Wind}
              id="oblique-shock-condition-analyzer"
              title="Oblique Shock Condition Analyzer"
            >
              <ObliqueShockConditionAnalyzer />
            </CalculatorCard>

            <CalculatorCard
              description="Compare stagnation-pressure recovery across normal and attached weak oblique shocks using validated shock geometry."
              eyebrow="Analyzer 10 // Pressure recovery"
              icon={Gauge}
              id="shock-pressure-loss-analyzer"
              title="Shock Pressure Loss Analyzer"
            >
              <ShockPressureLossAnalyzer />
            </CalculatorCard>

            <CalculatorCard
              description="Construct an ordered sequence of normal and attached weak oblique shocks to inspect cumulative total-pressure recovery."
              eyebrow="Analyzer 11 // Staged compression"
              icon={Layers}
              id="multi-shock-recovery-analyzer"
              title="Multi-Shock Recovery Analyzer"
            >
              <MultiShockRecoveryAnalyzer />
            </CalculatorCard>

            <CalculatorCard
              description="Model staged external compression followed by a terminal normal shock and inspect complete inlet pressure recovery."
              eyebrow="Analyzer 12 // Supersonic inlet"
              icon={Wind}
              id="inlet-compression-analyzer"
              title="Supersonic Inlet Compression Analyzer"
            >
              <InletCompressionAnalyzer />
            </CalculatorCard>

            <CalculatorCard
              description="Combine standard-atmosphere conditions, local Mach classification, and stagnation-point convective heating in one thermal workflow."
              eyebrow="Analyzer 13 // Hypersonic thermal analysis"
              icon={Flame}
              id="hypersonic-heating-analyzer"
              title="Hypersonic Heating Analyzer"
            >
              <HypersonicHeatingAnalyzer />
            </CalculatorCard>

            <CalculatorCard
              description="Combine atmosphere, ballistic coefficient, and dynamic pressure to estimate instantaneous spacecraft drag deceleration."
              eyebrow="Analyzer 14 // Reentry dynamics"
              icon={Gauge}
              id="reentry-deceleration-analyzer"
              title="Reentry Deceleration Analyzer"
            >
              <ReentryDecelerationAnalyzer />
            </CalculatorCard>

            <CalculatorCard
              description="Integrate a simplified point-mass descent and inspect velocity, altitude, dynamic pressure, and deceleration throughout the trajectory."
              eyebrow="Analyzer 15 // Reentry trajectory"
              icon={Plane}
              id="reentry-trajectory-analyzer"
              title="Reentry Trajectory Analyzer"
            >
              <ReentryTrajectoryAnalyzer />
            </CalculatorCard>

            <CalculatorCard
              description="Connect the educational TPS material catalog to reentry thermal history and preliminary protection-system sizing."
              eyebrow="Analyzer 16 // Thermal protection"
              icon={Shield}
              id="material-tps-sizing-analyzer"
              title="TPS Material Selection Analyzer"
            >
              <MaterialTPSSizingAnalyzer />
            </CalculatorCard>

            <CalculatorCard
              description="Compare catalog TPS materials under one shared reentry scenario using the existing educational ranking analysis."
              eyebrow="Analyzer 17 // TPS comparison"
              icon={Shield}
              id="tps-material-comparison-analyzer"
              title="TPS Material Comparison Analyzer"
            >
              <TPSMaterialComparisonAnalyzer />
            </CalculatorCard>

            <CalculatorCard
              description="Evaluate one vehicle configuration through the integrated reentry trajectory, thermal history, and TPS material-comparison workflow."
              eyebrow="Analyzer 18 // Vehicle reentry"
              icon={Plane}
              id="vehicle-reentry-evaluation-analyzer"
              title="Vehicle Reentry Evaluation Analyzer"
            >
              <VehicleReentryEvaluationAnalyzer />
            </CalculatorCard>

            <CalculatorCard
              description="Compare up to five vehicle configurations under identical reentry conditions using the existing evaluation and ranking workflow."
              eyebrow="Analyzer 19 // Vehicle comparison"
              icon={Scale}
              id="vehicle-reentry-comparison-analyzer"
              title="Vehicle Reentry Comparison Analyzer"
            >
              <VehicleReentryComparisonAnalyzer />
            </CalculatorCard>

            <CalculatorCard
              description="Resolve an ideal two-impulse transfer between circular, coplanar orbits using altitude-based orbital context."
              eyebrow="Analyzer 20 // Orbital mechanics"
              icon={CircleDot}
              id="hohmann-transfer-analyzer"
              title="Hohmann Transfer Analyzer"
            >
              <HohmannTransferAnalyzer />
            </CalculatorCard>

            <CalculatorCard
              description="Resolve circular-orbit velocity from altitude and estimate the ideal delta-v for an impulsive inclination change."
              eyebrow="Analyzer 21 // Orbital mechanics"
              icon={Orbit}
              id="orbital-plane-change-analyzer"
              title="Orbital Plane Change Analyzer"
            >
              <OrbitalPlaneChangeAnalyzer />
            </CalculatorCard>

            <MissionPresetIntegration>
              <CalculatorCard
                description="Integrate orbital maneuver budgeting, vehicle reentry evaluation, comparison, and TPS recommendations into one educational mission profile."
                eyebrow="Analyzer 22 // Mission integration"
                icon={Layers}
                id="mission-profile-analyzer"
                title="Mission Profile Analyzer"
              >
                <MissionPresetProfileTarget />
              </CalculatorCard>

              <CalculatorCard
                description="Select an immutable educational mission template and load its existing input configuration into the Mission Profile Analyzer."
                eyebrow="Launcher 23 // Mission presets"
                icon={Orbit}
                id="mission-preset-launcher"
                title="Mission Preset Launcher"
              >
                <MissionPresetLauncher />
              </CalculatorCard>
            </MissionPresetIntegration>

            <CalculatorCard
              description="Review a structured engineering report produced by the existing mission-report domain from completed mission-profile results."
              eyebrow="Viewer 24 // Mission reporting"
              icon={FileText}
              id="mission-report-viewer"
              title="Mission Report Viewer"
            >
              <MissionReportViewer report={missionPreview.report} />
            </CalculatorCard>

            <CalculatorCard
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
                  missionPreview.analysis.sourceAnalyses
                    .vehicleReentryEvaluation
                }
              />
            </CalculatorCard>

            <CalculatorCard
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
                  missionPreview.analysis.sourceAnalyses
                    .vehicleReentryEvaluation
                }
              />
            </CalculatorCard>

            <ScenarioLibraryIntegration>
              <CalculatorCard
                description="Assemble existing orbital, vehicle, reentry, and TPS inputs into a custom educational mission profile without introducing a separate analysis path."
                eyebrow="Builder 28 // Mission planning"
                icon={Layers}
                id="mission-scenario-builder"
                title="Mission Scenario Builder"
              >
                <ScenarioLibraryBuilderTarget />
              </CalculatorCard>

              <CalculatorCard
                description="Save, browse, duplicate, delete, and reload educational mission-profile inputs through a persistent device library."
                eyebrow="Library 29 // Scenario management"
                icon={FileText}
                id="scenario-library"
                title="Mission Scenario Library"
              >
                <ScenarioLibrary />
              </CalculatorCard>
            </ScenarioLibraryIntegration>

            <CalculatorCard
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
          </div>
        </Container>
      </section>
    </>
  );
}
