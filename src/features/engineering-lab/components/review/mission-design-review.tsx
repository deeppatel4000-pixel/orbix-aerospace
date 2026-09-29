import { EmptyState } from "@/components/ui/empty-state";
import type {
  MissionInsightsAnalysis,
  MissionPresetCategory,
  MissionProfileAnalysis,
  MissionReport,
} from "@/features/engineering-lab/types";

import { DesignConstraintCard } from "./design-constraint-card";
import { ReviewCategory } from "./review-category";
import { LabHeading } from "../visualization/lab-heading";
import { altitudeReadout } from "../visualization/format-lab-value";

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
    return <p className="text-sm text-muted">{emptyMessage}</p>;
  }

  return (
    <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-text-secondary lg:columns-2 lg:gap-8">
      {items.map((item) => (
        <li key={item}>{item}</li>
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
      <EmptyState
        description="A completed mission profile, report or insight set is needed to organize the design considerations. No replacement parameters have been generated."
        title="Mission design review unavailable"
      />
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
    "Not reported";

  return (
    <article
      aria-labelledby="mission-design-review-title"
      className="min-w-0 text-foreground"
    >
      <header className="border-b border-border-subtle pb-4">
        <p className="orbix-label">Mission design review</p>
        <LabHeading className="mt-1" id="mission-design-review-title">
          {missionName}
        </LabHeading>
        <p className="mt-2 max-w-[68ch] text-sm leading-6 text-muted">
          Reported mission parameters, source assumptions and known model
          limits, grouped for review. No feasibility decision is produced.
        </p>
        <a
          className="mt-3 inline-block text-sm text-accent underline underline-offset-4 hover:text-accent-strong"
          href="#design-review-assumptions-title"
        >
          Jump to modeling assumptions
        </a>
      </header>

      <div className="space-y-6 pt-6">
        <ReviewCategory
          description="Mission identity, supplied system coverage, and available review objects."
          id="architecture"
          title="Mission architecture"
        >
          <dl className="grid gap-x-8 sm:grid-cols-2">
            <DesignConstraintCard
              description="Category supplied by the Mission control context."
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
          </dl>

          <section
            aria-labelledby="design-review-active-systems-title"
            className="mt-4"
          >
            <LabHeading
              offset={2}
              variant="sub"
              id="design-review-active-systems-title"
            >
              Active systems
            </LabHeading>
            {systems.length ? (
              <p className="mt-1 text-sm text-text-secondary">
                {systems.join(", ")}
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted">Not reported</p>
            )}
          </section>
        </ReviewCategory>

        <ReviewCategory
          description="Existing orbital transfer and maneuver-budget outputs presented as mission parameters."
          id="orbital"
          title="Orbital considerations"
        >
          <dl className="grid gap-x-8 sm:grid-cols-2">
            <DesignConstraintCard
              label="Transfer delta-v"
              unit="m/s"
              value={transfer?.transfer.totalDeltaVMetresPerSecond}
            />
            <DesignConstraintCard
              label="Initial orbit altitude"
              {...altitudeReadout(transfer?.initialOrbit.altitudeMetres)}
            />
            <DesignConstraintCard
              label="Final orbit altitude"
              {...altitudeReadout(transfer?.finalOrbit.altitudeMetres)}
            />
            <DesignConstraintCard
              label="Maneuver count"
              value={
                report?.orbitalAnalysis?.maneuvers.length ??
                deltaVBudget?.numberOfManeuvers
              }
            />
          </dl>
        </ReviewCategory>

        <ReviewCategory
          description="Reported vehicle identity and atmospheric-entry performance outputs."
          id="vehicle"
          title="Vehicle considerations"
        >
          <dl className="grid gap-x-8 sm:grid-cols-2">
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
          </dl>
        </ReviewCategory>

        <ReviewCategory
          description="Reported thermal-protection selection and heat-load margin outputs."
          id="thermal"
          title="Thermal considerations"
        >
          <dl className="grid gap-x-8 sm:grid-cols-2">
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
          </dl>
        </ReviewCategory>

        <ReviewCategory
          description="Assumptions preserved from the supplied mission report or insight object."
          id="assumptions"
          title="Modeling assumptions"
        >
          <ReviewList
            emptyMessage="No modeling assumptions were reported."
            items={assumptions}
          />
        </ReviewCategory>

        <ReviewCategory
          description="Known modeling boundaries preserved from supplied review sources."
          id="limitations"
          title="Limitations"
        >
          <ReviewList
            emptyMessage="No modeling limitations were reported."
            items={limitations}
          />
        </ReviewCategory>
      </div>

      <footer className="mt-6 border-t border-border-subtle pt-4 text-sm leading-6 text-muted">
        This workspace organizes existing mission information for educational
        review. It does not evaluate feasibility or make design decisions.
      </footer>
    </article>
  );
}
