"use client";

import { useId, useMemo, useState } from "react";

import { formatFigure } from "@/components/ui/readout";
import { cn } from "@/lib/cn";
import {
  craftStateAt,
  formatStretchFactor,
  TransferCanvas,
  transferCanvasMap,
} from "@/features/orbits";
import {
  formatAltitudeKm,
  formatSpeed,
} from "@/features/orbits/transfer-model";

import { DeltaVLedger } from "./delta-v-ledger";
import {
  buildMissionPlan,
  type MissionPlan,
  PRESET_PLANS,
  shownTotalDeltaV,
  totalDecimals,
} from "./mission-plan";
import {
  CalculatorNumberField,
  focusFirstInvalidFieldOnEnter,
  LAB_CHOICE_INPUT,
  LAB_CHOICE_LIST,
  LAB_CHOICE_ROW,
  LAB_GROUP,
  LAB_GROUP_LEGEND,
  ValidationErrorSummary,
} from "./shared";

const CUSTOM_ID = "custom";

type CustomField = "inclinationDegrees" | "startKm" | "targetKm";
type CustomValues = Readonly<Record<CustomField, string>>;

const INITIAL_CUSTOM: CustomValues = {
  inclinationDegrees: "0",
  startKm: "200",
  targetKm: "1000",
};

function parse(value: string): number {
  return value.trim() === "" ? Number.NaN : Number(value);
}

type CustomErrors = Readonly<Partial<Record<CustomField | "form", string>>>;

const FIELD_LABELS: Readonly<Record<CustomField, string>> = {
  inclinationDegrees: "Plane change",
  startKm: "Start altitude",
  targetKm: "Target altitude",
};

/** The same rule the analyses apply: a finite number, not negative. */
function fieldError(field: CustomField, value: number): string | undefined {
  const label = FIELD_LABELS[field];
  if (!Number.isFinite(value)) {
    return `Enter a number for ${label.toLowerCase()}.`;
  }
  if (value < 0) return `${label} must not be negative.`;
  return undefined;
}

/**
 * The reader's own mission: a Hohmann transfer between two altitudes and an
 * optional plane change at the target, run through the same analyses as
 * the presets. Each field is checked on its own, so an error names the
 * field it belongs to; anything else the analyses reject is shown as a
 * form error.
 */
export function planCustom(values: CustomValues): {
  plan: MissionPlan | null;
  errors: CustomErrors;
} {
  const parsed: Readonly<Record<CustomField, number>> = {
    inclinationDegrees: parse(values.inclinationDegrees),
    startKm: parse(values.startKm),
    targetKm: parse(values.targetKm),
  };
  const errors: Partial<Record<CustomField | "form", string>> = {};
  for (const field of Object.keys(FIELD_LABELS) as CustomField[]) {
    const error = fieldError(field, parsed[field]);
    if (error) errors[field] = error;
  }
  if (Object.keys(errors).length > 0) return { errors, plan: null };

  const start = parsed.startKm * 1_000;
  const target = parsed.targetKm * 1_000;
  const inclination = parsed.inclinationDegrees;
  const transfer = start !== target;
  const turn = inclination !== 0;

  if (!transfer && !turn) {
    return {
      errors: {
        targetKm:
          "Target altitude matches the start. Change it, or set a plane change.",
      },
      plan: null,
    };
  }

  try {
    return {
      errors: {},
      plan: buildMissionPlan({
        budget: {
          ...(transfer
            ? {
                hohmannTransfer: {
                  finalAltitudeMetres: target,
                  initialAltitudeMetres: start,
                },
              }
            : {}),
          missionName: "Your mission",
          ...(turn
            ? {
                orbitalPlaneChange: {
                  inclinationChangeDegrees: inclination,
                  orbitalAltitudeMetres: target,
                },
              }
            : {}),
        },
        description: "",
        id: CUSTOM_ID,
        name: "Your mission",
      }),
    };
  } catch (error) {
    if (error instanceof RangeError) {
      return { errors: { form: error.message }, plan: null };
    }
    throw error;
  }
}

/**
 * V2 Mission Planner (v4 plan, section 5) with the V3 ledger under it. Pick
 * a preset or set your own altitudes; every step is listed in order, the
 * selected one is drawn on the Transfer Explorer's canvas, and steps the
 * models do not cover are listed as not modelled.
 */
export function MissionPlanner() {
  const ids = { choice: useId(), steps: useId() };
  const [choice, setChoice] = useState(PRESET_PLANS[0]?.id ?? CUSTOM_ID);
  const [custom, setCustom] = useState<CustomValues>(INITIAL_CUSTOM);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  const customResult = useMemo(() => planCustom(custom), [custom]);
  const plan =
    choice === CUSTOM_ID
      ? customResult.plan
      : (PRESET_PLANS.find((entry) => entry.id === choice) ?? null);

  // The first step with a drawing opens selected.
  const selectedStep =
    plan?.steps.find((step) => step.id === selectedStepId) ??
    plan?.steps.find((step) => step.craftFraction !== undefined) ??
    plan?.steps[0];

  // Only a plan with a transfer has a drawing, and only then can a step be
  // picked to place the craft on it.
  const drawable = plan?.transfer != null;

  function choose(next: string) {
    setChoice(next);
    setSelectedStepId(null);
  }

  function updateCustom(field: CustomField, value: string) {
    setCustom((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="flex min-w-0 flex-col gap-12">
      <div
        className={cn(
          "grid min-w-0 gap-x-12 gap-y-10",
          drawable && "xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]",
        )}
      >
        <div
          className={cn(
            "flex min-w-0 flex-col gap-8",
            !drawable && "max-w-[44rem]",
          )}
        >
          <fieldset className={LAB_GROUP}>
            <legend className={LAB_GROUP_LEGEND} id={ids.choice}>
              Mission
            </legend>
            <div className={cn(LAB_CHOICE_LIST, "mt-4")}>
              {[
                ...PRESET_PLANS.map((entry) => ({
                  id: entry.id,
                  name: entry.name,
                })),
                { id: CUSTOM_ID, name: "Your own altitudes" },
              ].map((option) => (
                <label className={LAB_CHOICE_ROW} key={option.id}>
                  <input
                    checked={choice === option.id}
                    className={LAB_CHOICE_INPUT}
                    name={ids.choice}
                    onChange={() => choose(option.id)}
                    type="radio"
                    value={option.id}
                  />
                  {option.name}
                </label>
              ))}
            </div>
          </fieldset>

          {choice === CUSTOM_ID ? (
            <form
              noValidate
              onKeyDown={focusFirstInvalidFieldOnEnter}
              onSubmit={(event) => event.preventDefault()}
            >
              <fieldset className={LAB_GROUP}>
                <legend className={LAB_GROUP_LEGEND}>Your mission</legend>
                <div className="mt-4 grid gap-5">
                  <CalculatorNumberField
                    error={customResult.errors.startKm}
                    field="startKm"
                    hint="Circular orbit the mission starts in."
                    idPrefix="mission-planner"
                    label="Start altitude"
                    onChange={updateCustom}
                    unit="km"
                    value={custom.startKm}
                  />
                  <CalculatorNumberField
                    error={customResult.errors.targetKm}
                    field="targetKm"
                    hint="Circular orbit to finish in. Same as the start for a plane change only."
                    idPrefix="mission-planner"
                    label="Target altitude"
                    onChange={updateCustom}
                    unit="km"
                    value={custom.targetKm}
                  />
                  <CalculatorNumberField
                    error={customResult.errors.inclinationDegrees}
                    field="inclinationDegrees"
                    hint="Plane change at the target altitude. 0 for none."
                    idPrefix="mission-planner"
                    label="Plane change"
                    onChange={updateCustom}
                    unit="deg"
                    value={custom.inclinationDegrees}
                  />
                </div>
              </fieldset>
              <ValidationErrorSummary
                errors={[
                  customResult.errors.startKm,
                  customResult.errors.targetKm,
                  customResult.errors.inclinationDegrees,
                  customResult.errors.form,
                ]}
              />
            </form>
          ) : plan?.description ? (
            <p className="text-sm leading-6 text-muted">
              Preset: {plan.description}
            </p>
          ) : null}

          {plan ? (
            <div className="flex flex-col gap-4">
              <h3
                className="text-lg leading-7 font-semibold text-foreground"
                id={ids.steps}
              >
                Flight plan
              </h3>
              <ol
                aria-labelledby={ids.steps}
                className="m-0 list-none border-y border-border p-0"
              >
                {plan.steps.map((step, index) => {
                  const current = drawable && step.id === selectedStep?.id;
                  const muted = step.kind === "not-modelled";
                  const body = (
                    <>
                      <span className="flex w-full items-baseline justify-between gap-4">
                        <span
                          className={cn(
                            "text-sm font-medium",
                            current && "font-semibold text-accent",
                          )}
                        >
                          {step.label}
                        </span>
                        {step.deltaVMetresPerSecond !== undefined ? (
                          <span className="font-mono text-sm whitespace-nowrap tabular-nums">
                            {formatFigure(
                              formatSpeed(
                                step.deltaVMetresPerSecond,
                                step.decimals,
                              ),
                            )}
                            <span className="ml-1 text-muted">m/s</span>
                          </span>
                        ) : null}
                      </span>
                      <span className="text-sm leading-6">{step.text}</span>
                    </>
                  );
                  const tone = cn(
                    "flex w-full flex-col gap-1 py-3 text-left",
                    muted ? "text-muted" : "text-text-secondary",
                    current && "text-foreground",
                  );
                  return (
                    <li
                      className={
                        index > 0 ? "border-t border-border" : undefined
                      }
                      key={step.id}
                    >
                      {drawable ? (
                        <button
                          aria-current={current ? "step" : undefined}
                          className={cn(
                            tone,
                            "min-h-11 cursor-pointer transition-colors focus-visible:outline-offset-2",
                          )}
                          onClick={() => setSelectedStepId(step.id)}
                          type="button"
                        >
                          {body}
                        </button>
                      ) : (
                        <div className={tone}>{body}</div>
                      )}
                    </li>
                  );
                })}
              </ol>
              <dl className="m-0 flex flex-col gap-1">
                <dt className="text-sm font-medium text-muted">
                  Total delta-v
                  {plan.allowancesOnly ? ", preset allowances" : ""}
                </dt>
                <dd className="orbix-readout-lg m-0 whitespace-nowrap text-foreground">
                  {formatFigure(
                    formatSpeed(shownTotalDeltaV(plan), totalDecimals(plan)),
                  )}
                  <span className="ml-1.5 text-base text-muted">m/s</span>
                </dd>
              </dl>
            </div>
          ) : null}
        </div>

        {plan && drawable ? (
          <div className="min-w-0 xl:sticky xl:top-[calc(var(--header-height)+1.5rem)] xl:self-start">
            <PlanDrawing plan={plan} stepId={selectedStep?.id} />
          </div>
        ) : null}
      </div>

      <DeltaVLedger
        currentPlanId={choice === CUSTOM_ID ? undefined : choice}
        plans={PRESET_PLANS}
      />

      <p className="max-w-[68ch] text-sm leading-6 text-muted">
        Assumes circular orbits, instant burns and Earth&apos;s gravity only. A
        plan lists delta-v; it does not say whether a mission is feasible.
      </p>
    </div>
  );
}

function PlanDrawing({
  plan,
  stepId,
}: {
  plan: MissionPlan;
  stepId: string | undefined;
}) {
  const step = plan.steps.find((entry) => entry.id === stepId);
  const model = plan.transfer;

  if (!model) return null;

  const start = model.initial.altitudeMetres;
  const target = model.target.altitudeMetres;
  const map = transferCanvasMap(model.planetRadiusMetres, start, target);
  const craft =
    step?.craftFraction === undefined
      ? undefined
      : craftStateAt(model, step.craftFraction);
  const scale = map.toScale
    ? "Drawn to scale."
    : `Earth is to scale; heights above it are drawn ${formatStretchFactor(map.stretchFactor)} times taller.`;
  const where = craft
    ? ` The craft is marked at ${formatAltitudeKm(craft.altitudeMetres)} km, for ${step?.label.toLowerCase()}.`
    : "";

  return (
    <figure className="m-0 min-w-0">
      <TransferCanvas
        craft={
          craft
            ? {
                radiusMetres: craft.radiusMetres,
                sweptAngleRadians: craft.sweptAngleRadians,
              }
            : undefined
        }
        description={`Earth with a circular orbit at ${formatAltitudeKm(start)} km and one at ${formatAltitudeKm(target)} km, joined by half an ellipse. Burn 1 is on the right and burn 2 on the left.${where} ${scale}`}
        initialAltitudeMetres={start}
        map={map}
        model={model}
        planetRadiusMetres={model.planetRadiusMetres}
        targetAltitudeMetres={target}
        title={`${plan.name}: transfer from ${formatAltitudeKm(start)} km to ${formatAltitudeKm(target)} km`}
      />
      <figcaption className="mt-3 text-sm text-muted">
        {step?.label ? `${step.label}. ` : ""}
        {map.toScale ? (
          "Drawn to scale."
        ) : (
          <>
            Earth is to scale; heights above it are drawn{" "}
            <span className="font-mono">
              {formatFigure(formatStretchFactor(map.stretchFactor))}
            </span>{" "}
            times taller.
          </>
        )}
      </figcaption>
    </figure>
  );
}
