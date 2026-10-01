import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { analyzeHohmannTransfer } from "@/features/engineering-lab/analysis";
import { MISSION_PRESETS } from "@/features/engineering-lab/missions";

import { DeltaVLedger, ledgerAxis } from "./delta-v-ledger";
import {
  buildMissionPlan,
  PRESET_PLANS,
  shownTotalDeltaV,
  totalDecimals,
} from "./mission-plan";
import { MissionPlanner, planCustom } from "./mission-planner";

describe("mission plan", () => {
  it("plans every preset that has a delta-v budget, and no other", () => {
    const expected = MISSION_PRESETS.filter(
      (preset) => preset.missionProfileInputs.deltaVBudget !== undefined,
    ).map((preset) => preset.id);
    expect(PRESET_PLANS.map((plan) => plan.id)).toEqual(expected);
  });

  it("takes each burn from the Hohmann analysis and sums to the budget", () => {
    const iss = PRESET_PLANS.find((plan) => plan.id === "iss-style-resupply");
    expect(iss).toBeDefined();
    const analysis = analyzeHohmannTransfer({
      finalAltitudeMetres: 408_000,
      initialAltitudeMetres: 200_000,
    });
    const burns = iss!.steps.filter((step) => step.kind === "burn");
    expect(burns.map((step) => step.deltaVMetresPerSecond)).toEqual([
      analysis.transfer.firstBurnDeltaVMetresPerSecond,
      analysis.transfer.secondBurnDeltaVMetresPerSecond,
    ]);
    expect(iss!.totalDeltaVMetresPerSecond).toBeCloseTo(
      analysis.transfer.totalDeltaVMetresPerSecond,
      9,
    );
  });

  it("lists launch and entry as not modelled, with no number", () => {
    const iss = PRESET_PLANS.find((plan) => plan.id === "iss-style-resupply")!;
    const unmodelled = iss.steps.filter((step) => step.kind === "not-modelled");
    expect(unmodelled.map((step) => step.id)).toEqual(["launch", "entry"]);
    for (const step of unmodelled) {
      expect(step.deltaVMetresPerSecond).toBeUndefined();
      expect(step.text.toLowerCase()).toContain("not modelled");
    }
  });

  it("marks allowance-only missions as not computed", () => {
    const mars = PRESET_PLANS.find(
      (plan) => plan.id === "mars-transfer-concept",
    )!;
    expect(mars.allowancesOnly).toBe(true);
    expect(mars.transfer).toBeNull();
    const lunar = PRESET_PLANS.find(
      (plan) => plan.id === "lunar-transfer-concept",
    )!;
    expect(lunar.allowancesOnly).toBe(false);
    expect(lunar.steps.map((step) => step.id)).toContain("moon-arrival");
  });

  it("shows every step of a plan with one decimals value, so the parts add up", () => {
    for (const plan of PRESET_PLANS) {
      const decimals = totalDecimals(plan);
      const costs = plan.steps.filter(
        (step) => step.deltaVMetresPerSecond !== undefined,
      );
      for (const step of plan.steps) expect(step.decimals).toBe(decimals);
      const shown = costs.reduce(
        (sum, step) =>
          sum + Number(step.deltaVMetresPerSecond!.toFixed(decimals)),
        0,
      );
      expect(shown.toFixed(decimals)).toBe(
        plan.totalDeltaVMetresPerSecond.toFixed(decimals),
      );
    }
  });

  it("does not repeat a step's label in its sentence", () => {
    for (const plan of PRESET_PLANS) {
      for (const step of plan.steps) {
        expect(step.text.startsWith(step.label)).toBe(false);
      }
    }
  });

  it("never claims feasibility", () => {
    for (const plan of PRESET_PLANS) {
      for (const step of plan.steps) {
        expect(step.text.toLowerCase()).not.toMatch(/feasib|validated/);
      }
    }
  });

  it("rejects a mission the analyses reject", () => {
    expect(() =>
      buildMissionPlan({
        budget: {
          hohmannTransfer: {
            finalAltitudeMetres: Number.NaN,
            initialAltitudeMetres: 200_000,
          },
          missionName: "Bad",
        },
        description: "",
        id: "bad",
        name: "Bad",
      }),
    ).toThrow(RangeError);
  });
});

describe("delta-v ledger", () => {
  it("puts every mission on one axis with at most four ticks", () => {
    const max = Math.max(
      ...PRESET_PLANS.map((plan) => plan.totalDeltaVMetresPerSecond),
    );
    const axis = ledgerAxis(max);
    expect(axis.max).toBeGreaterThanOrEqual(max);
    expect(axis.ticks.length).toBeLessThanOrEqual(4);
    expect(axis.ticks[0]).toBe(0);
  });

  it("renders a row per mission and a table twin", () => {
    const html = renderToStaticMarkup(<DeltaVLedger plans={PRESET_PLANS} />);
    for (const plan of PRESET_PLANS) expect(html).toContain(plan.name);
    expect(html).toContain("preset allowances, not computed");
    expect(html).toContain("<table");
  });
});

describe("mission planner", () => {
  it("names the preset missions in sentence case", () => {
    expect(PRESET_PLANS.map((plan) => plan.name)).toContain(
      "ISS-style resupply",
    );
  });

  it("renders the first preset's flight plan as an ordered list of buttons", () => {
    const html = renderToStaticMarkup(<MissionPlanner />);
    expect(html).toContain("Flight plan");
    expect(html).toMatch(/<ol[^>]*>\s*<li/);
    expect(html).toContain('aria-current="step"');
    expect(html).toContain("To a 200");
  });

  it("puts each custom-mission error on the field it belongs to", () => {
    const bad = planCustom({
      inclinationDegrees: "0",
      startKm: "-5",
      targetKm: "1000",
    });
    expect(bad.plan).toBeNull();
    expect(bad.errors.startKm).toBe("Start altitude must not be negative.");
    expect(bad.errors.targetKm).toBeUndefined();

    const same = planCustom({
      inclinationDegrees: "0",
      startKm: "400",
      targetKm: "400",
    });
    expect(same.errors.targetKm).toBeDefined();
    expect(same.errors.startKm).toBeUndefined();

    const good = planCustom({
      inclinationDegrees: "0",
      startKm: "200",
      targetKm: "1000",
    });
    expect(good.plan?.steps.map((step) => step.id)).toContain("burn-2");
  });
});

describe("shown total", () => {
  it("adds up the steps exactly as they are displayed", () => {
    // 400 to 600 km: burns of about 55.6 and 55.2 m/s whose unrounded sum
    // rounds to 110.9, while the displayed steps add to 110.8.
    const { plan } = planCustom({
      inclinationDegrees: "0",
      startKm: "400",
      targetKm: "600",
    });
    expect(plan).not.toBeNull();
    const shownSteps = plan!.steps
      .filter((step) => step.deltaVMetresPerSecond !== undefined)
      .map((step) =>
        Number(step.deltaVMetresPerSecond!.toFixed(step.decimals)),
      );
    const expected = Number(
      shownSteps
        .reduce((sum, value) => sum + value, 0)
        .toFixed(totalDecimals(plan!)),
    );
    expect(shownTotalDeltaV(plan!)).toBe(expected);
  });

  it("matches every preset's steps", () => {
    for (const plan of PRESET_PLANS) {
      const sum = plan.steps.reduce(
        (total, step) =>
          step.deltaVMetresPerSecond === undefined
            ? total
            : total + Number(step.deltaVMetresPerSecond.toFixed(step.decimals)),
        0,
      );
      expect(shownTotalDeltaV(plan)).toBe(
        Number(sum.toFixed(totalDecimals(plan))),
      );
    }
  });
});
