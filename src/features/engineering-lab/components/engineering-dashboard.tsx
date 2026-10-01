import type { ReactNode } from "react";

import { Container } from "@/components/layout/container";
import { ButtonArrowIcon } from "@/components/ui/button-arrow";
import { buttonClass } from "@/components/ui/button-class";
import { ButtonLink } from "@/components/ui/button-link";
import { RecordRow } from "@/components/ui/record-row";
import { formatIndexNumber } from "@/components/ui/section-index";
import {
  analyzeHohmannTransfer,
  analyzeMissionProfile,
} from "@/features/engineering-lab/analysis";
import { AtmosphereCalculator } from "@/features/engineering-lab/components/atmosphere-calculator";
import { CalculatorCard } from "@/features/engineering-lab/components/calculator-card";
import { DragEquationCalculator } from "@/features/engineering-lab/components/drag-equation-calculator";
import { FlightConditionAnalyzer } from "@/features/engineering-lab/components/flight-condition-analyzer";
import { HohmannTransferAnalyzer } from "@/features/engineering-lab/components/hohmann-transfer-analyzer";
import { HypersonicHeatingAnalyzer } from "@/features/engineering-lab/components/hypersonic-heating-analyzer";
import { InletCompressionAnalyzer } from "@/features/engineering-lab/components/inlet-compression-analyzer";
import { LiftEquationCalculator } from "@/features/engineering-lab/components/lift-equation-calculator";
import { LaboratoryShell } from "@/features/engineering-lab/components/laboratory-shell";
import type {
  LaboratoryToolGroup,
  LaboratoryToolNavigationItem,
} from "@/features/engineering-lab/components/laboratory-tool-navigation";
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
  OrbitDiagram,
  ReentryProfileVisualization,
} from "@/features/engineering-lab/components/visualization";
import {
  getMissionPresetById,
  type MissionScenario,
} from "@/features/engineering-lab/missions";
import { generateMissionReport } from "@/features/engineering-lab/reports";

/**
 * The example mission the report, diagrams, viewer, mission control and
 * presentation tools open with. It is the lab's own example, not a preset:
 * the orbit raise of the ISS Style Resupply preset (200 km to 408 km) and the
 * entry case of the Reentry Demonstrator preset (10 km at 750 m/s), because
 * the entry models run in the standard troposphere (0 to 11 km) and that is
 * the strongest entry case they can represent.
 */
const EXAMPLE_MISSION = {
  category: "orbital-logistics",
  description:
    "A Hohmann transfer from a 200 km to a 408 km circular orbit, then a 5,000 kg entry vehicle's descent from 10 km at 750 m/s. The entry models cover the standard troposphere only (0 to 11 km).",
  id: "lab-example-orbit-raise-and-entry",
  name: "Orbit Raise and Entry",
  profile: {
    deltaVBudget: {
      hohmannTransfer: {
        finalAltitudeMetres: 408_000,
        initialAltitudeMetres: 200_000,
      },
      missionName: "Orbit Raise and Entry Budget",
    },
    missionName: "Orbit Raise and Entry",
    vehicleReentryEvaluation: {
      initialAltitudeMeters: 10_000,
      initialVelocityMetersPerSecond: 750,
      safetyFactor: 1.5,
      vehicle: {
        dragCoefficient: 1.5,
        massKilograms: 5_000,
        noseRadiusMetres: 1,
        referenceAreaSquareMetres: 12,
        vehicleName: "Example Entry Vehicle",
      },
    },
  },
} as const;

function createMissionPreview() {
  const analysis = analyzeMissionProfile(EXAMPLE_MISSION.profile);
  const report = generateMissionReport({
    description: EXAMPLE_MISSION.description,
    missionProfileAnalysis: analysis,
  });
  const scenario = {
    category: EXAMPLE_MISSION.category,
    createdAt: "2026-08-04T00:00:00.000Z",
    description: EXAMPLE_MISSION.description,
    id: EXAMPLE_MISSION.id,
    name: EXAMPLE_MISSION.name,
    profile: EXAMPLE_MISSION.profile,
    updatedAt: "2026-08-04T00:00:00.000Z",
  } satisfies MissionScenario;

  return { analysis, category: EXAMPLE_MISSION.category, report, scenario };
}

const missionPreview = createMissionPreview();

/**
 * Three presets that all report an orbital budget (delta-v, transfer time,
 * maneuvers), ordered by target altitude, so every table row compares all
 * three. Only the resupply preset has an entry case; its vehicle rows are
 * named under the table rather than filled with "Not reported".
 */
function createTradeStudyPreview() {
  const presetIds = [
    "iss-style-resupply",
    "leo-satellite-deployment",
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

/**
 * The hero figure: the Hohmann transfer analyzer's own default case, a
 * 400 km circular orbit raised to geostationary altitude, computed with the
 * same analysis the tool runs, so every figure beside the drawing is real.
 */
const HERO_TRANSFER_INPUTS = {
  finalAltitudeMetres: 35_786_000,
  initialAltitudeMetres: 400_000,
} as const;

const heroTransfer = analyzeHohmannTransfer(HERO_TRANSFER_INPUTS);

const metresPerSecond = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});
const hours = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

/**
 * Every module in the lab, keyed by its DOM id (which is also its deep-link
 * anchor, so ids never change). The index, the compact select and each
 * module's heading all read from here, so they cannot drift apart.
 */
const MODULES = {
  "rocket-equation": {
    description:
      "Calculates the ideal velocity change of a rocket stage from its mass ratio and specific impulse.",
    kind: "Rocket propulsion",
    title: "Tsiolkovsky rocket equation",
  },
  "thrust-to-weight": {
    description:
      "Compares available thrust with vehicle weight at a given instantaneous mass.",
    kind: "Force balance",
    title: "Thrust-to-weight ratio",
  },
  "lift-equation": {
    description:
      "Calculates lift force from air density, airspeed, reference wing area and lift coefficient.",
    kind: "Aerodynamics",
    title: "Lift equation",
  },
  "drag-equation": {
    description:
      "Calculates aerodynamic drag from dynamic pressure, reference area and drag coefficient.",
    kind: "Aerodynamics",
    title: "Drag equation",
  },
  "standard-atmosphere": {
    description:
      "Calculates temperature, pressure and density in the troposphere using the standard-atmosphere model.",
    kind: "Atmosphere",
    title: "Standard atmosphere",
  },
  "flight-condition-analyzer": {
    description:
      "Combines atmosphere, dynamic pressure, lift and drag into one flight-condition calculation.",
    kind: "Flight performance",
    title: "Flight condition analyzer",
  },
  "stagnation-condition-analyzer": {
    description:
      "Converts static atmospheric properties into stagnation conditions with isentropic-flow ratios.",
    kind: "Compressible flow",
    title: "Stagnation condition analyzer",
  },
  "shock-condition-analyzer": {
    description:
      "Calculates the flow state downstream of a one-dimensional normal shock.",
    kind: "Normal shock",
    title: "Normal shock analyzer",
  },
  "oblique-shock-condition-analyzer": {
    description:
      "Calculates an attached weak oblique shock from upstream atmosphere, Mach number and deflection angle.",
    kind: "Oblique shock",
    title: "Oblique shock analyzer",
  },
  "shock-pressure-loss-analyzer": {
    description:
      "Compares stagnation-pressure recovery across a normal shock and an attached weak oblique shock.",
    kind: "Pressure recovery",
    title: "Shock pressure loss analyzer",
  },
  "multi-shock-recovery-analyzer": {
    description:
      "Calculates cumulative total-pressure recovery through an ordered sequence of shocks.",
    kind: "Staged compression",
    title: "Multi-shock recovery analyzer",
  },
  "inlet-compression-analyzer": {
    description:
      "Models staged external compression followed by a terminal normal shock and reports inlet pressure recovery.",
    kind: "Supersonic inlet",
    title: "Supersonic inlet compression analyzer",
  },
  "hypersonic-heating-analyzer": {
    description:
      "Estimates stagnation-point convective heating from standard-atmosphere conditions and local Mach number.",
    kind: "Hypersonic heating",
    title: "Hypersonic heating analyzer",
  },
  "reentry-deceleration-analyzer": {
    description:
      "Estimates instantaneous drag deceleration from atmosphere, ballistic coefficient and dynamic pressure.",
    kind: "Entry dynamics",
    title: "Reentry deceleration analyzer",
  },
  "reentry-trajectory-analyzer": {
    description:
      "Integrates a simplified point-mass descent and reports velocity, altitude, dynamic pressure and deceleration over time.",
    kind: "Entry trajectory",
    title: "Reentry trajectory analyzer",
  },
  "material-tps-sizing-analyzer": {
    description:
      "Links the educational TPS material catalog to a reentry heating history for preliminary thickness sizing.",
    kind: "Thermal protection",
    title: "TPS material selection analyzer",
  },
  "tps-material-comparison-analyzer": {
    description:
      "Compares catalog TPS materials under one shared reentry scenario.",
    kind: "Thermal protection",
    title: "TPS material comparison analyzer",
  },
  "vehicle-reentry-evaluation-analyzer": {
    description:
      "Runs one vehicle configuration through the reentry trajectory, heating history and TPS comparison.",
    kind: "Vehicle entry",
    title: "Vehicle reentry evaluation analyzer",
  },
  "vehicle-reentry-comparison-analyzer": {
    description:
      "Compares up to five vehicle configurations under identical reentry conditions.",
    kind: "Vehicle entry",
    title: "Vehicle reentry comparison analyzer",
  },
  "hohmann-transfer-analyzer": {
    description:
      "Calculates the delta-v for a Hohmann transfer between two circular, coplanar orbits.",
    kind: "Orbital mechanics",
    title: "Hohmann transfer analyzer",
  },
  "orbital-plane-change-analyzer": {
    description:
      "Calculates circular-orbit velocity from altitude and the delta-v for an impulsive inclination change.",
    kind: "Orbital mechanics",
    title: "Orbital plane change analyzer",
  },
  "mission-profile-analyzer": {
    description:
      "Combines a delta-v budget, vehicle reentry evaluation, vehicle comparison and TPS selection into one mission profile.",
    kind: "Mission profile",
    title: "Mission profile analyzer",
  },
  "mission-preset-launcher": {
    description:
      "Loads the inputs of a fixed educational mission preset into the mission profile analyzer.",
    kind: "Mission presets",
    title: "Mission presets",
  },
  "mission-report-viewer": {
    description:
      "Shows the structured report generated from a completed mission-profile calculation.",
    kind: "Mission report",
    title: "Mission report viewer",
  },
  "mission-visualization": {
    description:
      "Draws the orbital transfer and the reentry profile from a completed mission-profile calculation.",
    kind: "Diagrams",
    title: "Mission diagrams",
  },
  "interactive-mission-viewer": {
    description:
      "Steps through the reported mission sequence with the matching orbital and reentry diagrams and values.",
    kind: "Mission viewer",
    title: "Mission viewer",
  },
  "mission-control-dashboard": {
    description:
      "Brings the mission profile, diagrams, replay and report for one example mission together on one page.",
    kind: "Mission overview",
    title: "Mission control dashboard",
  },
  "mission-scenario-builder": {
    description:
      "Builds a custom mission-profile input from orbital, vehicle, reentry and TPS parameters, then runs the mission profile analyzer on it.",
    kind: "Scenario input",
    title: "Mission scenario builder",
  },
  "scenario-library": {
    description:
      "Saves mission scenarios in this browser so they can be reloaded, duplicated or deleted later.",
    kind: "Saved scenarios",
    title: "Scenario library",
  },
  "mission-briefing": {
    description:
      "Summarizes one completed mission-profile calculation and its report as a readable briefing.",
    kind: "Presentation",
    title: "Mission briefing",
  },
  "mission-trade-study": {
    description:
      "Places the orbital, vehicle and thermal results of several missions side by side, without scoring them.",
    kind: "Comparison",
    title: "Mission trade study",
  },
  "mission-showcase": {
    description:
      "Walks through a completed mission phase by phase with the values computed for each phase.",
    kind: "Presentation",
    title: "Mission walkthrough",
  },
  "demo-mode": {
    description:
      "A guided tour of the mission workflow, from inputs to report, using one example mission.",
    kind: "Guided tour",
    title: "Guided demo",
  },
} as const satisfies Record<
  string,
  Omit<LaboratoryToolNavigationItem, "id"> & { description: string }
>;

type ModuleId = keyof typeof MODULES;

function tool(id: ModuleId): LaboratoryToolNavigationItem {
  const { kind, title } = MODULES[id];
  return { id, kind, title };
}

/**
 * The workflows in render order, each with its modules in render order.
 * Workflow ids are kept from earlier releases so existing deep links resolve.
 */
const WORKFLOWS = [
  {
    id: "foundations-workflow",
    title: "Foundations",
    tools: [
      tool("rocket-equation"),
      tool("thrust-to-weight"),
      tool("lift-equation"),
      tool("drag-equation"),
      tool("standard-atmosphere"),
      tool("flight-condition-analyzer"),
    ],
  },
  {
    id: "compressible-flow-workflow",
    title: "Compressible flow",
    tools: [
      tool("stagnation-condition-analyzer"),
      tool("shock-condition-analyzer"),
      tool("oblique-shock-condition-analyzer"),
      tool("shock-pressure-loss-analyzer"),
      tool("multi-shock-recovery-analyzer"),
      tool("inlet-compression-analyzer"),
    ],
  },
  {
    id: "entry-systems-workflow",
    title: "Atmospheric entry",
    tools: [
      tool("hypersonic-heating-analyzer"),
      tool("reentry-deceleration-analyzer"),
      tool("reentry-trajectory-analyzer"),
      tool("material-tps-sizing-analyzer"),
      tool("tps-material-comparison-analyzer"),
      tool("vehicle-reentry-evaluation-analyzer"),
      tool("vehicle-reentry-comparison-analyzer"),
    ],
  },
  {
    id: "orbital-mission-workflow",
    title: "Orbits and missions",
    tools: [
      tool("hohmann-transfer-analyzer"),
      tool("orbital-plane-change-analyzer"),
      tool("mission-profile-analyzer"),
      tool("mission-preset-launcher"),
      tool("mission-report-viewer"),
    ],
  },
  {
    id: "mission-operations-workflow",
    title: "Mission visualization",
    tools: [
      tool("mission-visualization"),
      tool("interactive-mission-viewer"),
      tool("mission-control-dashboard"),
    ],
  },
  {
    id: "review-presentation-workflow",
    title: "Scenarios and review",
    tools: [
      tool("mission-scenario-builder"),
      tool("scenario-library"),
      tool("mission-briefing"),
      tool("mission-trade-study"),
      tool("mission-showcase"),
      tool("demo-mode"),
    ],
  },
] as const satisfies readonly LaboratoryToolGroup[];

type WorkflowIndex = 0 | 1 | 2 | 3 | 4 | 5;

/** Each tool's index number, so the card and the index agree. */
const TOOL_NUMBERS: ReadonlyMap<string, string> = new Map(
  WORKFLOWS.flatMap((workflow) => workflow.tools).map((entry, index) => [
    entry.id,
    formatIndexNumber(index + 1),
  ]),
);

function Module({ children, id }: { children: ReactNode; id: ModuleId }) {
  const { description, title } = MODULES[id];

  return (
    <CalculatorCard
      description={description}
      id={id}
      number={TOOL_NUMBERS.get(id)}
      title={title}
    >
      {children}
    </CalculatorCard>
  );
}

function Workflow({
  children,
  index,
}: {
  children: ReactNode;
  index: WorkflowIndex;
}) {
  const workflow = WORKFLOWS[index];

  return (
    <LaboratoryWorkflowSection
      id={workflow.id}
      title={workflow.title}
      tools={workflow.tools}
    >
      {children}
    </LaboratoryWorkflowSection>
  );
}

export function EngineeringDashboard() {
  const reentryEvaluation =
    missionPreview.analysis.sourceAnalyses.vehicleReentryEvaluation;

  return (
    <>
      <header>
        <Container className="grid gap-10 pt-10 pb-12 sm:pt-14 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:grid-rows-[auto_1fr] lg:items-start lg:gap-x-14 lg:gap-y-8 lg:pt-14">
          {/* Top-aligned with the drawing's inset, so the H1 does not sink
           * to mid-height. */}
          <div className="min-w-0 lg:pt-6">
            <h1 className="orbix-display text-foreground">Engineering Lab</h1>
            <p className="orbix-lead mt-6">
              Calculators for rocket propulsion, aerodynamics, compressible
              flow, atmospheric entry and orbital mechanics, each with its
              equation, units and stated assumptions, and mission tools that
              combine them.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              {/* A plain anchor: the index is on this page. */}
              <a
                className={buttonClass({ variant: "secondary" })}
                href="#laboratory-tools"
              >
                Browse the tools
                <ButtonArrowIcon direction="down" />
              </a>
              <ButtonLink
                arrow="right"
                className="w-fit text-left [text-wrap:balance]"
                href="/verification"
                variant="tertiary"
              >
                See how ORBIX compares with published values
              </ButtonLink>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[26rem] min-w-0 sm:max-w-[30rem] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mr-0 lg:max-w-[28rem]">
            <OrbitDiagram
              caption={
                <>
                  {metresPerSecond.format(
                    HERO_TRANSFER_INPUTS.initialAltitudeMetres / 1000,
                  )}{" "}
                  km to{" "}
                  {metresPerSecond.format(
                    HERO_TRANSFER_INPUTS.finalAltitudeMetres / 1000,
                  )}{" "}
                  km, drawn to scale: the Hohmann transfer analyzer&apos;s
                  default case.{" "}
                  <a
                    className={buttonClass({ variant: "link" })}
                    href="#hohmann-transfer-analyzer"
                  >
                    Open it in the analyzer
                  </a>
                  .
                </>
              }
              description={`A circular orbit at ${metresPerSecond.format(
                HERO_TRANSFER_INPUTS.initialAltitudeMetres / 1000,
              )} km, a circular orbit at ${metresPerSecond.format(
                HERO_TRANSFER_INPUTS.finalAltitudeMetres / 1000,
              )} km, and the half ellipse that joins them, drawn to scale around Earth. Marks show the first burn at the low orbit and the second at the high orbit, and a dimension line gives the high orbit's radius.`}
              finalAltitudeMetres={HERO_TRANSFER_INPUTS.finalAltitudeMetres}
              initialAltitudeMetres={HERO_TRANSFER_INPUTS.initialAltitudeMetres}
              size="large"
              title="Hohmann transfer from low Earth orbit to geostationary altitude"
            />
            {/* Always three columns; on a phone the readout steps down to
             * 16px with a tighter inset, so each unit stays on its value's
             * line rather than wrapping 2 + 1 or under the figure. */}
            <RecordRow
              className="mt-6 max-[30rem]:[--record-inset:0.75rem] max-[30rem]:[&_dd]:text-base [&_dl]:grid-cols-3"
              items={[
                {
                  label: "First burn",
                  unit: "m/s",
                  value: metresPerSecond.format(
                    heroTransfer.transfer.firstBurnDeltaVMetresPerSecond,
                  ),
                },
                {
                  label: "Second burn",
                  unit: "m/s",
                  value: metresPerSecond.format(
                    heroTransfer.transfer.secondBurnDeltaVMetresPerSecond,
                  ),
                },
                {
                  label: "Transfer time",
                  unit: "h",
                  value: hours.format(heroTransfer.transfer.transferTimeHours),
                },
              ]}
            />
          </div>

          {/* After the figure in the DOM, so a phone reads the one visual
           * before the fine print; at lg it drops to the foot of the text
           * column so its last line meets the readout row. */}
          <p className="max-w-[60ch] text-sm leading-6 text-muted lg:col-start-1 lg:row-start-2 lg:self-end">
            For education only. The models are simplified and must not be used
            for operational, safety or certification decisions. See the{" "}
            <ButtonLink href="/terms" variant="link">
              terms of use
            </ButtonLink>
            .
          </p>
        </Container>
      </header>

      <Container
        className="pt-0 pb-12 lg:pt-[4.5rem] lg:pb-12"
        id="laboratory-tools"
        tabIndex={-1}
      >
        <LaboratoryShell workflows={WORKFLOWS}>
          <Workflow index={0}>
            <Module id="rocket-equation">
              <RocketEquationCalculator />
            </Module>
            <Module id="thrust-to-weight">
              <ThrustToWeightCalculator />
            </Module>
            <Module id="lift-equation">
              <LiftEquationCalculator />
            </Module>
            <Module id="drag-equation">
              <DragEquationCalculator />
            </Module>
            <Module id="standard-atmosphere">
              <AtmosphereCalculator />
            </Module>
            <Module id="flight-condition-analyzer">
              <FlightConditionAnalyzer />
            </Module>
          </Workflow>

          <Workflow index={1}>
            <Module id="stagnation-condition-analyzer">
              <StagnationConditionAnalyzer />
            </Module>
            <Module id="shock-condition-analyzer">
              <ShockConditionAnalyzer />
            </Module>
            <Module id="oblique-shock-condition-analyzer">
              <ObliqueShockConditionAnalyzer />
            </Module>
            <Module id="shock-pressure-loss-analyzer">
              <ShockPressureLossAnalyzer />
            </Module>
            <Module id="multi-shock-recovery-analyzer">
              <MultiShockRecoveryAnalyzer />
            </Module>
            <Module id="inlet-compression-analyzer">
              <InletCompressionAnalyzer />
            </Module>
          </Workflow>

          <Workflow index={2}>
            <Module id="hypersonic-heating-analyzer">
              <HypersonicHeatingAnalyzer />
            </Module>
            <Module id="reentry-deceleration-analyzer">
              <ReentryDecelerationAnalyzer />
            </Module>
            <Module id="reentry-trajectory-analyzer">
              <ReentryTrajectoryAnalyzer />
            </Module>
            <Module id="material-tps-sizing-analyzer">
              <MaterialTPSSizingAnalyzer />
            </Module>
            <Module id="tps-material-comparison-analyzer">
              <TPSMaterialComparisonAnalyzer />
            </Module>
            <Module id="vehicle-reentry-evaluation-analyzer">
              <VehicleReentryEvaluationAnalyzer />
            </Module>
            <Module id="vehicle-reentry-comparison-analyzer">
              <VehicleReentryComparisonAnalyzer />
            </Module>
          </Workflow>

          {/* The preset/profile handoff is a context provider with no markup
              of its own, hoisted above the section so every module stays a
              direct child of the workspace and can be shown on its own. */}
          <MissionPresetIntegration>
            <Workflow index={3}>
              <Module id="hohmann-transfer-analyzer">
                <HohmannTransferAnalyzer />
              </Module>
              <Module id="orbital-plane-change-analyzer">
                <OrbitalPlaneChangeAnalyzer />
              </Module>
              <Module id="mission-profile-analyzer">
                <MissionPresetProfileTarget />
              </Module>
              <Module id="mission-preset-launcher">
                <MissionPresetLauncher />
              </Module>
              <Module id="mission-report-viewer">
                <MissionReportViewer
                  category={missionPreview.category}
                  report={missionPreview.report}
                />
              </Module>
            </Workflow>
          </MissionPresetIntegration>

          <Workflow index={4}>
            <Module id="mission-visualization">
              {/* Same section rule as the viewer and Mission control. */}
              <div className="space-y-8">
                <MissionOrbitVisualization analysis={missionPreview.analysis} />
                <div className="border-t border-border-subtle pt-8">
                  <ReentryProfileVisualization analysis={reentryEvaluation} />
                </div>
              </div>
            </Module>
            <Module id="interactive-mission-viewer">
              <MissionViewer
                category={missionPreview.category}
                missionProfileAnalysis={missionPreview.analysis}
                missionReport={missionPreview.report}
                vehicleReentryEvaluation={reentryEvaluation}
              />
            </Module>
            <Module id="mission-control-dashboard">
              <MissionControlDashboard
                missionCategory={missionPreview.category}
                missionProfileAnalysis={missionPreview.analysis}
                missionReport={missionPreview.report}
                missionScenario={missionPreview.scenario}
                tradeStudyAnalyses={tradeStudyPreview.analyses}
                tradeStudyReports={tradeStudyPreview.reports}
                tradeStudyScenarios={tradeStudyPreview.scenarios}
                vehicleReentryEvaluation={reentryEvaluation}
              />
            </Module>
          </Workflow>

          {/* Same reason as the preset provider above. */}
          <ScenarioLibraryIntegration>
            <Workflow index={5}>
              <Module id="mission-scenario-builder">
                <ScenarioLibraryBuilderTarget />
              </Module>
              <Module id="scenario-library">
                <ScenarioLibrary />
              </Module>
              <Module id="mission-briefing">
                <MissionBriefing
                  category={missionPreview.category}
                  missionProfile={missionPreview.analysis}
                  report={missionPreview.report}
                />
              </Module>
              <Module id="mission-trade-study">
                <MissionTradeStudy
                  analyses={tradeStudyPreview.analyses}
                  reports={tradeStudyPreview.reports}
                  scenarios={tradeStudyPreview.scenarios}
                />
              </Module>
              <Module id="mission-showcase">
                <MissionShowcase
                  category={missionPreview.category}
                  missionProfile={missionPreview.analysis}
                  report={missionPreview.report}
                />
              </Module>
              <Module id="demo-mode">
                <DemoMode
                  missionProfile={missionPreview.analysis}
                  missionScenario={missionPreview.scenario}
                  report={missionPreview.report}
                />
              </Module>
            </Workflow>
          </ScenarioLibraryIntegration>
        </LaboratoryShell>
      </Container>
    </>
  );
}
