import { analyzeMissionProfile } from "@/features/engineering-lab/analysis";
import { MISSION_PRESETS } from "@/features/engineering-lab/missions";
import {
  type DeltaVBudgetInputs,
  type MissionPreset,
  STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES,
} from "@/features/engineering-lab/types";
import { MOON_MEAN_DISTANCE_METRES } from "@/features/orbits/target-scale";
import {
  burnDecimals,
  computeTransferModel,
  formatAltitudeKm,
  formatDuration,
  formatSpeed,
  type TransferModel,
} from "@/features/orbits/transfer-model";

/**
 * The Mission Planner's model (v4 plan, section 5, V2 and V3): a mission
 * as an ordered list of steps. Every delta-v comes from
 * `analyzeMissionProfile` (through the delta-v budget, the Hohmann and the
 * plane change analyses); the burn sentences use the Transfer Explorer's
 * model, which runs the same Hohmann analysis. Every number in a plan is
 * shown with one decimals value, so the shown steps add up to the shown
 * total. Steps the
 * models do not cover are listed as "not modelled" and carry no number.
 * Nothing here judges whether a mission is feasible.
 */

const NBSP = " ";

const degrees = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

export type PlanStepKind =
  "allowance" | "burn" | "coast" | "not-modelled" | "plane-change";

export interface PlanStep {
  readonly id: string;
  readonly kind: PlanStepKind;
  /** Short name, used in the step list, the ledger and the table. */
  readonly label: string;
  /** One sentence, filled only from computed or preset values. */
  readonly text: string;
  readonly deltaVMetresPerSecond?: number;
  /** Decimal places the delta-v is shown with: the same for every step. */
  readonly decimals: 0 | 1;
  /**
   * Where the craft is drawn on the transfer when this step is selected,
   * as a fraction of the coast in time; absent when no craft is drawn.
   */
  readonly craftFraction?: number;
}

export interface MissionPlan {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly steps: readonly PlanStep[];
  readonly totalDeltaVMetresPerSecond: number;
  /** The Hohmann transfer, when the mission has one, for the drawing. */
  readonly transfer: TransferModel | null;
  /** True when every delta-v is a preset allowance, none computed. */
  readonly allowancesOnly: boolean;
}

export interface MissionPlanSource {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly budget: DeltaVBudgetInputs;
  /** The preset also asks for an entry analysis (deferred tools). */
  readonly hasEntry?: boolean;
}

function ms(value: number, decimals: 0 | 1): string {
  return `${formatSpeed(value, decimals)}${NBSP}m/s`;
}

function km(altitudeMetres: number): string {
  return `${formatAltitudeKm(altitudeMetres)}${NBSP}km`;
}

const ENTRY_LIMIT_KM = formatAltitudeKm(
  STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES,
);

/**
 * One sentence per transfer step, from the Transfer Explorer's model, with
 * every speed in the plan's decimals. The step's label is shown beside the
 * sentence, so the sentence does not repeat it.
 */
function narrate(
  model: TransferModel,
  decimals: 0 | 1,
): { burn1: string; coast: string; burn2: string } {
  const start = km(model.initial.altitudeMetres);
  const end = km(model.target.altitudeMetres);
  const time = formatDuration(model.transferTimeSeconds);
  const speeds = (by: number, from: number, to: number) =>
    `by ${ms(by, decimals)}, from ${ms(from, decimals)} to ${ms(to, decimals)}`;
  const burn1 = speeds(
    model.firstBurnDeltaVMetresPerSecond,
    model.initial.circularSpeedMetresPerSecond,
    model.departureSpeedMetresPerSecond,
  );
  const burn2 = speeds(
    model.secondBurnDeltaVMetresPerSecond,
    model.arrivalSpeedMetresPerSecond,
    model.target.circularSpeedMetresPerSecond,
  );
  const arrival = ms(model.arrivalSpeedMetresPerSecond, decimals);

  if (model.raising) {
    return {
      burn1: `At ${start}, speed up ${burn1}. The circle stretches into an ellipse that reaches ${end}.`,
      burn2: `At ${end}, speed up ${burn2}, the speed of a circular orbit at that height.`,
      coast: `Drift for ${time} to the far side of the ellipse, slowing to ${arrival} on the climb.`,
    };
  }

  return {
    burn1: `At ${start}, slow down ${burn1}. The circle becomes an ellipse that dips to ${end}.`,
    burn2: `At ${end}, slow down ${burn2}, the speed of a circular orbit at that height.`,
    coast: `Drift for ${time} to the far side of the ellipse, speeding up to ${arrival} on the way down.`,
  };
}

export function buildMissionPlan(source: MissionPlanSource): MissionPlan {
  const analysis = analyzeMissionProfile({
    deltaVBudget: source.budget,
    missionName: source.name,
  });
  const budget = analysis.sourceAnalyses.deltaVBudget;
  if (budget === undefined) {
    throw new RangeError("The mission has no delta-v budget.");
  }

  const hohmannInputs = source.budget.hohmannTransfer;
  const hohmann = budget.sourceAnalyses.hohmannTransfer;
  const planeChange = budget.sourceAnalyses.orbitalPlaneChange;
  const transfer = hohmannInputs
    ? computeTransferModel(
        hohmannInputs.initialAltitudeMetres,
        hohmannInputs.finalAltitudeMetres,
      )
    : null;

  const steps: PlanStep[] = [];
  const launchAltitude =
    hohmannInputs?.initialAltitudeMetres ??
    source.budget.orbitalPlaneChange?.orbitalAltitudeMetres;
  steps.push({
    decimals: 0,
    id: "launch",
    kind: "not-modelled",
    label: "Launch",
    text:
      launchAltitude === undefined
        ? "Not modelled."
        : `To a ${km(launchAltitude)} circular orbit. Not modelled.`,
  });

  for (const allowance of source.budget.maneuvers ?? []) {
    steps.push({
      decimals: 0,
      deltaVMetresPerSecond: allowance.deltaVMetresPerSecond,
      id: `allowance-${allowance.id}`,
      kind: "allowance",
      label: allowance.name,
      text: "Preset allowance, not computed.",
    });
  }

  // One decimals value for the whole plan, so the parts add up to the total.
  const decimals: 0 | 1 = [
    hohmann?.transfer.firstBurnDeltaVMetresPerSecond,
    hohmann?.transfer.secondBurnDeltaVMetresPerSecond,
    planeChange?.deltaVMetresPerSecond,
    ...(source.budget.maneuvers ?? []).map(
      (allowance) => allowance.deltaVMetresPerSecond,
    ),
  ].some((value) => value !== undefined && burnDecimals(value) === 1)
    ? 1
    : 0;

  if (hohmann && transfer) {
    const narration = narrate(transfer, decimals);
    steps.push(
      {
        craftFraction: 0,
        decimals,
        deltaVMetresPerSecond: hohmann.transfer.firstBurnDeltaVMetresPerSecond,
        id: "burn-1",
        kind: "burn",
        label: "Burn 1",
        text: narration.burn1,
      },
      {
        craftFraction: 0.5,
        decimals,
        id: "coast",
        kind: "coast",
        label: "Coast",
        text: narration.coast,
      },
      {
        craftFraction: 1,
        decimals,
        deltaVMetresPerSecond: hohmann.transfer.secondBurnDeltaVMetresPerSecond,
        id: "burn-2",
        kind: "burn",
        label: "Burn 2",
        text: narration.burn2,
      },
    );
  }

  if (planeChange) {
    const altitude =
      source.budget.orbitalPlaneChange?.orbitalAltitudeMetres ?? 0;
    steps.push({
      ...(transfer ? { craftFraction: 1 } : {}),
      decimals,
      deltaVMetresPerSecond: planeChange.deltaVMetresPerSecond,
      id: "plane-change",
      kind: "plane-change",
      label: "Plane change",
      text: `Turn the orbit's plane by ${degrees.format(planeChange.inclinationChangeDegrees)}° at ${km(altitude)}, where the circular speed is ${ms(planeChange.orbitalVelocityMetresPerSecond, decimals)}.${transfer ? " It is counted as a separate burn; combining it with burn 2 would cost less." : ""}`,
    });
  }

  if (hohmannInputs?.finalAltitudeMetres === MOON_MEAN_DISTANCE_METRES) {
    steps.push({
      decimals: 0,
      id: "moon-arrival",
      kind: "not-modelled",
      label: "Arrival at the Moon",
      text: "Not modelled. The preset uses the Moon's mean distance from Earth's centre as an altitude, and the Moon's gravity is ignored.",
    });
  }

  if (source.hasEntry) {
    steps.push({
      decimals: 0,
      id: "entry",
      kind: "not-modelled",
      label: "Entry and landing",
      text: `Not modelled here. The entry tools cover only the lowest ${ENTRY_LIMIT_KM}${NBSP}km of the atmosphere, so they are set aside for now.`,
    });
  }

  for (const [index, step] of steps.entries()) {
    steps[index] = { ...step, decimals };
  }

  const computedSteps = steps.filter(
    (step) => step.deltaVMetresPerSecond !== undefined,
  );

  return {
    allowancesOnly:
      computedSteps.length > 0 &&
      computedSteps.every((step) => step.kind === "allowance"),
    description: source.description,
    id: source.id,
    name: source.name,
    steps,
    totalDeltaVMetresPerSecond: budget.totalDeltaVMetresPerSecond,
    transfer,
  };
}

/**
 * Sentence-case names for the preset missions, as the rest of the UI is
 * written. The preset data keeps its own names.
 */
const PRESET_DISPLAY_NAMES: Readonly<Record<string, string>> = {
  "iss-style-resupply": "ISS-style resupply",
  "leo-satellite-deployment": "LEO satellite deployment",
  "lunar-transfer-concept": "Lunar transfer concept",
  "mars-transfer-concept": "Mars transfer concept",
};

/** The presets that carry a delta-v budget, in catalogue order. */
export function plannablePresets(
  presets: readonly MissionPreset[] = MISSION_PRESETS,
): MissionPlanSource[] {
  return presets.flatMap((preset) => {
    const budget = preset.missionProfileInputs.deltaVBudget;
    if (budget === undefined) return [];
    const inputs = preset.missionProfileInputs;
    return [
      {
        budget,
        description: preset.description,
        hasEntry:
          inputs.vehicleReentryEvaluation !== undefined ||
          inputs.vehicleComparison !== undefined,
        id: preset.id,
        name: PRESET_DISPLAY_NAMES[preset.id] ?? preset.name,
      },
    ];
  });
}

/** Every plannable preset, planned: the rows of the delta-v ledger. */
export const PRESET_PLANS: readonly MissionPlan[] =
  plannablePresets().map(buildMissionPlan);

/** Total delta-v in the decimals its steps use. */
export function totalDecimals(plan: MissionPlan): 0 | 1 {
  return plan.steps.some((step) => step.decimals === 1) ? 1 : 0;
}

/**
 * The total as shown: the sum of each step's delta-v rounded the way the
 * step is displayed, so the listed steps always add up to the listed total
 * (the Hohmann tool follows the same rule).
 */
export function shownTotalDeltaV(plan: MissionPlan): number {
  const decimals = totalDecimals(plan);
  const sum = plan.steps.reduce(
    (total, step) =>
      step.deltaVMetresPerSecond === undefined
        ? total
        : total + Number(step.deltaVMetresPerSecond.toFixed(step.decimals)),
    0,
  );
  return Number(sum.toFixed(decimals));
}
