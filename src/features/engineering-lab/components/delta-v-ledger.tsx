import { DataTable } from "@/components/ui/data-table";
import { formatFigure } from "@/components/ui/readout";
import { cn } from "@/lib/cn";
import { formatSpeed } from "@/features/orbits/transfer-model";

import {
  type MissionPlan,
  type PlanStep,
  shownTotalDeltaV,
  totalDecimals,
} from "./mission-plan";

/** Axis steps tried in order; the first giving at most four ticks wins. */
const AXIS_STEPS = [100, 200, 500, 1_000, 2_000, 5_000, 10_000] as const;
const MAX_TICK_INTERVALS = 3;

/**
 * Segment color by step: burn 1 in the first data color, burn 2 in a
 * darker mix of it, the plane change in the second data color, and preset
 * allowances, which are not computed, in the muted ink. The key above the
 * bars names each one.
 */
const SEGMENTS = [
  { className: "bg-[var(--orbix-data-1)]", label: "Burn 1" },
  {
    className: "bg-[color-mix(in_srgb,var(--orbix-data-1)_60%,var(--ink))]",
    label: "Burn 2",
  },
  { className: "bg-[var(--orbix-data-2)]", label: "Plane change" },
  { className: "bg-[var(--orbix-data-4)]", label: "Preset allowance" },
] as const;

type SegmentLabel = (typeof SEGMENTS)[number]["label"];

function segmentFor(step: PlanStep): SegmentLabel | undefined {
  if (step.kind === "allowance") return "Preset allowance";
  if (step.kind === "plane-change") return "Plane change";
  if (step.id === "burn-1") return "Burn 1";
  if (step.id === "burn-2") return "Burn 2";
  return undefined;
}

function segmentClass(step: PlanStep): string | undefined {
  const label = segmentFor(step);
  return SEGMENTS.find((segment) => segment.label === label)?.className;
}

/** Room kept right of the bars for the total, so the longest still fits. */
const TOTAL_GUTTER = "pr-[7.5rem]";

export function ledgerAxis(maxMetresPerSecond: number): {
  max: number;
  ticks: number[];
} {
  const step: number =
    AXIS_STEPS.find(
      (candidate) =>
        Math.ceil(maxMetresPerSecond / candidate) <= MAX_TICK_INTERVALS,
    ) ?? 10_000;
  const max = Math.max(step, Math.ceil(maxMetresPerSecond / step) * step);
  const ticks: number[] = [];
  for (let tick = 0; tick <= max; tick += step) ticks.push(tick);
  return { max, ticks };
}

interface LedgerRow {
  readonly key: string;
  readonly mission: string;
  readonly step: string;
  readonly deltaV: string;
}

function costSteps(plan: MissionPlan): (PlanStep & {
  deltaVMetresPerSecond: number;
})[] {
  return plan.steps.filter(
    (step): step is PlanStep & { deltaVMetresPerSecond: number } =>
      step.deltaVMetresPerSecond !== undefined,
  );
}

function tableRows(plans: readonly MissionPlan[]): LedgerRow[] {
  return plans.flatMap((plan) => [
    ...costSteps(plan).map((step) => ({
      deltaV: formatSpeed(step.deltaVMetresPerSecond, step.decimals),
      key: `${plan.id}-${step.id}`,
      mission: plan.name,
      step:
        step.kind === "allowance" ? `${step.label} (allowance)` : step.label,
    })),
    {
      deltaV: formatSpeed(shownTotalDeltaV(plan), totalDecimals(plan)),
      key: `${plan.id}-total`,
      mission: plan.name,
      step: "Total",
    },
  ]);
}

interface DeltaVLedgerProps {
  readonly plans: readonly MissionPlan[];
  /** The plan shown in the planner, drawn in the ink color. */
  readonly currentPlanId?: string;
}

/**
 * V3 delta-v ledger (v4 plan, section 5): one bar per mission on one shared
 * m/s axis, segments in flight order, with a key above the bars, the total
 * at the end of each bar, and the numbers in a table. Allowance-only
 * missions are marked as not computed. The current plan is marked with a
 * rule on its left.
 */
export function DeltaVLedger({ currentPlanId, plans }: DeltaVLedgerProps) {
  const axis = ledgerAxis(
    Math.max(...plans.map((plan) => plan.totalDeltaVMetresPerSecond)),
  );
  const percent = (value: number) => `${(value / axis.max) * 100}%`;
  const used = new Set(
    plans.flatMap((plan) => costSteps(plan).map((step) => segmentFor(step))),
  );

  return (
    <figure className="m-0 min-w-0">
      <figcaption className="text-base font-semibold text-foreground">
        Delta-v by mission, on one axis
      </figcaption>
      <ul
        aria-label="Key"
        className="m-0 mt-3 flex list-none flex-wrap gap-x-5 gap-y-1 p-0 text-[0.8125rem] leading-5 text-muted"
      >
        {SEGMENTS.filter((segment) => used.has(segment.label)).map(
          (segment) => (
            <li className="flex items-center gap-2" key={segment.label}>
              <span
                aria-hidden="true"
                className={cn("block h-3 w-3", segment.className)}
              />
              {segment.label}
            </li>
          ),
        )}
      </ul>
      <ul className="m-0 mt-5 list-none space-y-5 p-0">
        {plans.map((plan) => {
          const steps = costSteps(plan);
          const current = plan.id === currentPlanId;
          return (
            <li key={plan.id}>
              <p
                className={cn(
                  "text-sm",
                  current
                    ? "font-semibold text-foreground"
                    : "font-medium text-muted",
                )}
              >
                {plan.name}
                {current ? (
                  <span className="sr-only"> (shown above)</span>
                ) : null}
                {plan.allowancesOnly ? (
                  <span className="font-normal text-muted">
                    {" "}
                    (preset allowances, not computed)
                  </span>
                ) : null}
              </p>
              <div className={cn("mt-2 flex items-center", TOTAL_GUTTER)}>
                <div
                  className="flex h-3 shrink-0 gap-[2px]"
                  style={{ width: percent(plan.totalDeltaVMetresPerSecond) }}
                >
                  {steps.map((step) => (
                    <span
                      className={cn("block h-full", segmentClass(step))}
                      key={step.id}
                      style={{
                        flexBasis: 0,
                        flexGrow: step.deltaVMetresPerSecond,
                        minWidth: "2px",
                      }}
                    />
                  ))}
                </div>
                <span className="ml-2 shrink-0 font-mono text-sm whitespace-nowrap text-foreground tabular-nums">
                  {formatFigure(
                    formatSpeed(shownTotalDeltaV(plan), totalDecimals(plan)),
                  )}
                  <span className="ml-1 text-muted">m/s</span>
                </span>
              </div>
            </li>
          );
        })}
      </ul>
      <div className={cn("mt-4", TOTAL_GUTTER)}>
        <div
          aria-hidden="true"
          className="relative h-5 border-t border-rule-strong font-mono text-[0.8125rem] text-muted"
        >
          {axis.ticks.map((tick, index) => {
            const last = index === axis.ticks.length - 1;
            return (
              <span
                className={cn(
                  "absolute top-1 whitespace-nowrap",
                  index > 0 && !last && "-translate-x-1/2",
                )}
                key={tick}
                // The last tick carries the unit; its number stays centered
                // on the tick and the unit runs into the gutter.
                style={
                  last
                    ? {
                        left: percent(tick),
                        transform: `translateX(-${formatSpeed(tick).length / 2}ch)`,
                      }
                    : { left: percent(tick) }
                }
              >
                {formatFigure(formatSpeed(tick))}
                {last ? " m/s" : ""}
              </span>
            );
          })}
        </div>
      </div>
      <details className="mt-6">
        <summary className="cursor-pointer text-sm font-medium text-muted underline decoration-1 underline-offset-[3px] hover:text-foreground">
          Show the numbers as a table
        </summary>
        <DataTable
          caption="Delta-v by mission and step"
          className="mt-4"
          columns={[
            {
              cell: (row: LedgerRow) => row.mission,
              header: "Mission",
              key: "mission",
            },
            { cell: (row: LedgerRow) => row.step, header: "Step", key: "step" },
            {
              cell: (row: LedgerRow) => row.deltaV,
              header: "Delta-v",
              key: "deltaV",
              numeric: true,
              unit: "m/s",
            },
          ]}
          getRowKey={(row) => row.key}
          rows={tableRows(plans)}
        />
      </details>
    </figure>
  );
}
