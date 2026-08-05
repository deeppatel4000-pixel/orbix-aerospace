import {
  BookOpen,
  ClipboardList,
  Database,
  FileWarning,
  Flame,
  Layers3,
  Orbit,
  Plane,
} from "lucide-react";

import type {
  MissionInsightsAnalysis,
  MissionPresetCategory,
  MissionProfileAnalysis,
  MissionReport,
} from "@/features/engineering-lab/types";

import { DesignConstraintCard } from "./design-constraint-card";
import { ReviewCategory } from "./review-category";

export interface MissionDesignReviewProps {
  readonly insights?: MissionInsightsAnalysis | null;
  readonly missionCategory?: MissionPresetCategory;
  readonly missionProfile?: MissionProfileAnalysis | null;
  readonly report?: MissionReport | null;
}

const categoryLabels: Readonly<Record<MissionPresetCategory, string>> = {
  "deep-space-concept": "Deep-space concept",
  "lunar-transfer": "Lunar transfer",
  "orbital-deployment": "Orbital deployment",
  "orbital-logistics": "Orbital logistics",
  "reentry-demonstration": "Reentry demonstration",
};

function ReviewList({
  emptyMessage,
  items,
}: {
  readonly emptyMessage: string;
  readonly items: readonly string[];
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-white/10 bg-black/10 p-4 text-sm text-[#71868c]">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="grid gap-2 lg:grid-cols-2">
      {items.map((item) => (
        <li
          className="flex gap-3 rounded-xl border border-white/8 bg-[#081419] p-4 text-sm leading-6 text-[#9eb0b4]"
          key={item}
        >
          <span aria-hidden="true" className="mt-0.5 text-accent">
            —
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function MissionDesignReview({
  insights,
  missionCategory,
  missionProfile,
  report,
}: MissionDesignReviewProps) {
  const resolvedProfile = missionProfile ?? report?.sourceAnalysis;

  if (!resolvedProfile && !report && !insights) {
    return (
      <section
        aria-label="Mission design review"
        className="rounded-2xl border border-dashed border-white/15 bg-[#061015] p-6"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-accent">
            <ClipboardList aria-hidden="true" size={18} />
          </span>
          <div>
            <p className="font-mono text-[0.61rem] tracking-[0.14em] text-accent uppercase">
              Engineering review workspace
            </p>
            <h3 className="mt-1 text-lg font-semibold">
              Mission design review unavailable
            </h3>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-[#81969b]">
          Completed mission-profile, report, or insight objects are required to
          organize existing design considerations. No replacement parameters
          have been generated.
        </p>
      </section>
    );
  }

  const deltaVBudget = resolvedProfile?.sourceAnalyses.deltaVBudget;
  const transfer =
    report?.orbitalAnalysis?.hohmannTransfer ??
    deltaVBudget?.sourceAnalyses.hohmannTransfer;
  const vehicleEvaluation =
    resolvedProfile?.sourceAnalyses.vehicleReentryEvaluation ??
    resolvedProfile?.selectedVehicleRecommendation?.evaluation;
  const selectedVehicle =
    report?.vehicleAnalysis?.selectedVehicle ?? vehicleEvaluation?.vehicle;
  const vehicleSummary =
    report?.vehicleAnalysis?.performanceSummary ?? vehicleEvaluation?.summary;
  const reportedTps = report?.thermalAnalysis?.tpsRecommendation;
  const evaluationTps = vehicleEvaluation?.summary.tps;
  const systems =
    report?.missionSummary.systemsUsed ?? insights?.systemsInterpreted ?? [];
  const assumptions =
    report?.missionAssessment.modelAssumptions ?? insights?.assumptions ?? [];
  const limitations =
    report?.missionAssessment.limitations ?? insights?.limitations ?? [];
  const missionName =
    report?.missionSummary.missionName ??
    resolvedProfile?.missionName ??
    insights?.missionName ??
    "Not Reported";

  return (
    <article
      aria-labelledby="mission-design-review-title"
      className="technical-grid overflow-hidden rounded-2xl border border-white/12 bg-[#030a0e] text-[#e1eaeb]"
    >
      <header className="border-b border-white/10 bg-[#061116]/95 p-5 sm:p-7">
        <p className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.18em] text-accent uppercase">
          <ClipboardList aria-hidden="true" size={15} />
          ORBIX // Mission Design Review
        </p>
        <h2
          className="mt-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl"
          id="mission-design-review-title"
        >
          {missionName}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#8ba0a5]">
          Structured presentation of reported mission parameters, source
          assumptions, and known modeling limitations. No feasibility decision
          is produced.
        </p>
      </header>

      <div className="space-y-5 p-5 sm:p-7">
        <ReviewCategory
          description="Mission identity, supplied system coverage, and available review objects."
          icon={Layers3}
          id="architecture"
          title="Mission Architecture"
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <DesignConstraintCard
              description="Category supplied by the Mission Control context."
              label="Mission category"
              value={
                missionCategory ? categoryLabels[missionCategory] : undefined
              }
            />
            <DesignConstraintCard
              description="Count reported by the completed mission profile."
              label="Analysis systems"
              unit="reported"
              value={resolvedProfile?.missionSummaryState.analysesResolved}
            />
            <DesignConstraintCard
              description="Completed report object available to this review."
              label="Mission report"
              value={report ? "Supplied" : undefined}
            />
            <DesignConstraintCard
              description="Deterministic insight object available to this review."
              label="Mission insights"
              value={insights ? "Supplied" : undefined}
            />
          </div>

          <section
            aria-labelledby="design-review-active-systems-title"
            className="mt-5 rounded-xl border border-white/10 bg-black/10 p-4"
          >
            <div className="flex items-center gap-2">
              <Database aria-hidden="true" className="text-accent" size={14} />
              <h4
                className="font-mono text-[0.58rem] tracking-[0.11em] text-[#a9b9bc] uppercase"
                id="design-review-active-systems-title"
              >
                Active systems
              </h4>
            </div>
            {systems.length ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {systems.map((system) => (
                  <li
                    className="rounded-full border border-accent/15 bg-accent/5 px-3 py-1.5 text-xs text-[#aabbbc]"
                    key={system}
                  >
                    {system}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-[#71868c]">Not Reported</p>
            )}
          </section>
        </ReviewCategory>

        <ReviewCategory
          description="Existing orbital transfer and maneuver-budget outputs presented as mission parameters."
          icon={Orbit}
          id="orbital"
          title="Orbital Considerations"
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <DesignConstraintCard
              label="Transfer delta-v"
              unit="m/s"
              value={transfer?.transfer.totalDeltaVMetresPerSecond}
            />
            <DesignConstraintCard
              label="Initial orbit altitude"
              unit="m"
              value={transfer?.initialOrbit.altitudeMetres}
            />
            <DesignConstraintCard
              label="Final orbit altitude"
              unit="m"
              value={transfer?.finalOrbit.altitudeMetres}
            />
            <DesignConstraintCard
              label="Maneuver count"
              value={
                report?.orbitalAnalysis?.maneuvers.length ??
                deltaVBudget?.numberOfManeuvers
              }
            />
          </div>
        </ReviewCategory>

        <ReviewCategory
          description="Reported vehicle identity and atmospheric-entry performance outputs."
          icon={Plane}
          id="vehicle"
          title="Vehicle Considerations"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <DesignConstraintCard
              label="Vehicle name"
              value={selectedVehicle?.vehicleName}
            />
            <DesignConstraintCard
              label="Initial reentry velocity"
              unit="m/s"
              value={vehicleSummary?.flight.initialVelocityMetersPerSecond}
            />
            <DesignConstraintCard
              label="Peak deceleration"
              unit="g"
              value={vehicleSummary?.dynamics.peakDeceleration.decelerationGs}
            />
          </div>
        </ReviewCategory>

        <ReviewCategory
          description="Reported thermal-protection selection and heat-load margin outputs."
          icon={Flame}
          id="thermal"
          title="Thermal Considerations"
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <DesignConstraintCard
              label="TPS material"
              value={
                reportedTps?.material.name ??
                evaluationTps?.recommendedMaterial.name
              }
            />
            <DesignConstraintCard
              label="TPS mass"
              unit="kg"
              value={
                reportedTps?.estimatedTPSMassKilograms ??
                evaluationTps?.estimatedTPSMassKilograms
              }
            />
            <DesignConstraintCard
              label="Thermal margin"
              value={
                reportedTps?.thermalMargin.classification ??
                evaluationTps?.thermalMargin.classification
              }
            />
            <DesignConstraintCard
              label="Heat-load margin"
              unit="MJ/m²"
              value={
                reportedTps?.thermalMargin
                  .heatLoadMarginMegajoulesPerSquareMetre ??
                evaluationTps?.thermalMargin
                  .heatLoadMarginMegajoulesPerSquareMetre
              }
            />
          </div>
        </ReviewCategory>

        <ReviewCategory
          description="Assumptions preserved from the supplied mission report or insight object."
          icon={BookOpen}
          id="assumptions"
          title="Modeling Assumptions"
        >
          <ReviewList
            emptyMessage="No modeling assumptions were reported."
            items={assumptions}
          />
        </ReviewCategory>

        <ReviewCategory
          description="Known modeling boundaries preserved from supplied review sources."
          icon={FileWarning}
          id="limitations"
          title="Limitations"
        >
          <ReviewList
            emptyMessage="No modeling limitations were reported."
            items={limitations}
          />
        </ReviewCategory>
      </div>

      <footer className="border-t border-white/10 bg-[#040c10] px-5 py-4 text-xs leading-5 text-[#71868c] sm:px-7">
        This workspace organizes existing mission information for educational
        review. It does not evaluate feasibility or make design decisions.
      </footer>
    </article>
  );
}
