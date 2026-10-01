import type { ReactNode } from "react";

import { Container } from "@/components/layout/container";
import { siteLegal } from "@/config/site-legal";
import { cn } from "@/lib/cn";
import { ButtonArrowIcon } from "@/components/ui/button-arrow";
import { buttonClass } from "@/components/ui/button-class";
import { ButtonLink } from "@/components/ui/button-link";
import { formatIndexNumber } from "@/components/ui/section-index";
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
import { MissionPlanner } from "@/features/engineering-lab/components/mission-planner";
import { ObliqueShockConditionAnalyzer } from "@/features/engineering-lab/components/oblique-shock-condition-analyzer";
import { OrbitalPlaneChangeAnalyzer } from "@/features/engineering-lab/components/orbital-plane-change-analyzer";
import { RocketEquationCalculator } from "@/features/engineering-lab/components/rocket-equation-calculator";
import { ShockConditionAnalyzer } from "@/features/engineering-lab/components/shock-condition-analyzer";
import { StagnationConditionAnalyzer } from "@/features/engineering-lab/components/stagnation-condition-analyzer";
import { ThrustToWeightCalculator } from "@/features/engineering-lab/components/thrust-to-weight-calculator";
import { STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES } from "@/features/engineering-lab/types";
import { TARGET_STOPS, TransferExplorer } from "@/features/orbits";

const ATMOSPHERE_LIMIT_KM = new Intl.NumberFormat("en-US").format(
  STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES / 1_000,
);

/**
 * Every tool on the page, keyed by its DOM id (which is also its deep-link
 * anchor, so ids never change). The index, the compact select, each
 * tool's heading and the tool count all read from here, so they cannot
 * drift apart. Intros stay at 30 words or fewer (v4 plan, section 8).
 *
 * Off the page for now (v4 plan, section 6), code and tests kept: the
 * reentry deceleration, reentry trajectory, TPS material selection and
 * comparison, vehicle reentry evaluation and comparison analyzers, and the
 * mission profile analyzer with its presets, scenario builder and library.
 * Their models run only in the standard troposphere, so they cannot start
 * an entry from orbit.
 */
const MODULES = {
  "rocket-equation": {
    description:
      "Gives the ideal velocity change of a rocket stage from its mass ratio and specific impulse.",
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
      "Finds lift force from air density, airspeed, reference wing area and lift coefficient.",
    kind: "Aerodynamics",
    title: "Lift equation",
  },
  "drag-equation": {
    description:
      "Works out aerodynamic drag from dynamic pressure, reference area and drag coefficient.",
    kind: "Aerodynamics",
    title: "Drag equation",
  },
  "standard-atmosphere": {
    description:
      "Returns temperature, pressure and density at an altitude in the troposphere, using the standard-atmosphere model.",
    kind: "Atmosphere",
    title: "Standard atmosphere",
  },
  "flight-condition-analyzer": {
    description:
      "Combines atmosphere, dynamic pressure, lift and drag into one flight-condition calculation.",
    kind: "Flight performance",
    title: "Flight condition",
  },
  "stagnation-condition-analyzer": {
    description:
      "Converts static atmospheric properties into stagnation conditions with isentropic-flow ratios.",
    kind: "Compressible flow",
    title: "Stagnation condition",
  },
  "shock-condition-analyzer": {
    description:
      "Shows the flow state downstream of a one-dimensional normal shock.",
    kind: "Normal shock",
    title: "Normal shock",
  },
  "oblique-shock-condition-analyzer": {
    description:
      "Solves an attached weak oblique shock from upstream atmosphere, Mach number and deflection angle.",
    kind: "Oblique shock",
    title: "Oblique shock",
  },
  "inlet-compression-analyzer": {
    description:
      "Models staged external compression followed by a terminal normal shock, with the recovery after each stage, and compares the inlet with one normal shock at the same Mach number.",
    kind: "Supersonic inlet",
    title: "Supersonic inlet compression",
  },
  "hypersonic-heating-analyzer": {
    description: `Estimates convective heating at the stagnation point from velocity, nose radius and standard-atmosphere density. The atmosphere model stops at ${ATMOSPHERE_LIMIT_KM} km, so this is not an entry heating history.`,
    kind: "Aerothermal heating",
    title: "Stagnation-point heating estimate",
  },
  "hohmann-transfer-analyzer": {
    description:
      "For two circular orbits in one plane, finds both burns and the coast time of a Hohmann transfer, and draws the transfer.",
    kind: "Orbital mechanics",
    title: "Hohmann transfer",
  },
  "orbital-plane-change-analyzer": {
    description:
      "Uses the circular-orbit speed at an altitude to find the delta-v for an impulsive inclination change.",
    kind: "Orbital mechanics",
    title: "Orbital plane change",
  },
  "mission-planner": {
    description:
      "Pick a preset mission or your own altitudes. The planner lists each step in flight order with its delta-v, computed or preset, and compares the presets on one axis.",
    kind: "Mission planning",
    title: "Mission planner",
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
      tool("inlet-compression-analyzer"),
      tool("hypersonic-heating-analyzer"),
    ],
  },
  {
    id: "orbital-mission-workflow",
    title: "Orbits and missions",
    tools: [
      tool("hohmann-transfer-analyzer"),
      tool("orbital-plane-change-analyzer"),
      tool("mission-planner"),
    ],
  },
] as const satisfies readonly LaboratoryToolGroup[];

type WorkflowIndex = 0 | 1 | 2;

/** Every tool on the page, in index order. */
export const LAB_TOOLS: readonly LaboratoryToolNavigationItem[] =
  WORKFLOWS.flatMap((workflow) => workflow.tools);

/** The tools that are single calculators: every tool but the planner. */
const CALCULATOR_COUNT = LAB_TOOLS.filter(
  (entry) => entry.id !== "mission-planner",
).length;

/**
 * Old anchors that now open another tool: merged and replaced modules and
 * workflows from earlier releases, so links from elsewhere still land.
 * The shock pressure loss and multi-shock recovery anchors need no entry:
 * they are ids inside the inlet compression tool.
 */
const LEGACY_ANCHORS: Readonly<Record<string, ModuleId>> = {
  "demo-mode": "mission-planner",
  "entry-systems-workflow": "hypersonic-heating-analyzer",
  "interactive-mission-viewer": "mission-planner",
  "mission-briefing": "mission-planner",
  "mission-control-dashboard": "mission-planner",
  "mission-operations-workflow": "mission-planner",
  "mission-preset-launcher": "mission-planner",
  "mission-profile-analyzer": "mission-planner",
  "mission-report-viewer": "mission-planner",
  "mission-scenario-builder": "mission-planner",
  "mission-showcase": "mission-planner",
  "mission-trade-study": "mission-planner",
  "mission-visualization": "mission-planner",
  "review-presentation-workflow": "mission-planner",
  "scenario-library": "mission-planner",
};

/** Each tool's index number, so the card and the index agree. */
const TOOL_NUMBERS: ReadonlyMap<string, string> = new Map(
  LAB_TOOLS.map((entry, index) => [entry.id, formatIndexNumber(index + 1)]),
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
  return (
    <>
      <header>
        <Container className="pt-8 pb-12 sm:pt-10 lg:pb-16">
          <h1 className="orbix-display text-foreground">Engineering Lab</h1>
          <div className="mt-5 grid gap-x-14 gap-y-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
            <div className="min-w-0">
              <p className="orbix-lead max-w-[44rem]">
                {CALCULATOR_COUNT} calculators for propulsion, aerodynamics,
                compressible flow and orbits, each with its equation, units and
                assumptions, plus a mission planner.
              </p>
              <p className="mt-3 max-w-[58ch] text-[0.9375rem] leading-6 text-pretty text-text-secondary">
                Idea and research by {siteLegal.operatorName}, a 12th grader. AI
                coding assistants wrote the code under his direction.{" "}
                <ButtonLink href="/build-log" variant="link">
                  How I built it
                </ButtonLink>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 lg:justify-end">
              {/* Plain anchors: both targets are on this page. The tool
                  select does the index's job on a phone. */}
              <a
                className={cn(
                  buttonClass({ variant: "secondary" }),
                  "max-sm:hidden",
                )}
                href="#laboratory-tools"
              >
                Browse the tools
                <ButtonArrowIcon direction="down" />
              </a>
              <a
                className={buttonClass({ variant: "tertiary" })}
                href="#mission-planner"
              >
                Plan a mission
                <ButtonArrowIcon direction="down" />
              </a>
              <ButtonLink arrow="right" href="/verification" variant="tertiary">
                See how it is checked
              </ButtonLink>
            </div>
          </div>

          {/* The Hohmann tool links here to drag the target orbit. It opens
              on the ISS stop, so it does not repeat the home page's GEO
              case. */}
          <div
            className="mt-8 scroll-mt-[calc(var(--header-height)+1rem)] border-t border-border pt-8"
            id="transfer-explorer"
          >
            <TransferExplorer
              defaultTargetAltitudeMetres={
                TARGET_STOPS.find((stop) => stop.id === "iss")?.altitudeMetres
              }
            />
          </div>

          <p className="mt-8 max-w-[68ch] text-sm leading-6 text-muted">
            For education only: the models are simplified and are not for
            operational or safety decisions. See the{" "}
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
        <LaboratoryShell aliases={LEGACY_ANCHORS} workflows={WORKFLOWS}>
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
            <Module id="inlet-compression-analyzer">
              <InletCompressionAnalyzer />
            </Module>
            <Module id="hypersonic-heating-analyzer">
              <HypersonicHeatingAnalyzer />
            </Module>
          </Workflow>

          <Workflow index={2}>
            <Module id="hohmann-transfer-analyzer">
              <HohmannTransferAnalyzer />
            </Module>
            <Module id="orbital-plane-change-analyzer">
              <OrbitalPlaneChangeAnalyzer />
            </Module>
            <Module id="mission-planner">
              <MissionPlanner />
            </Module>
          </Workflow>
        </LaboratoryShell>
      </Container>
    </>
  );
}
