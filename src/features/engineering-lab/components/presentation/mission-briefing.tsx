import type {
  MissionInsightsAnalysis,
  MissionPreset,
  MissionProfileAnalysis,
  MissionReport,
} from "@/features/engineering-lab/types";

import { BriefingHeader } from "./briefing-header";
import { BriefingObjectives } from "./briefing-objectives";
import { BriefingOverview } from "./briefing-overview";
import { BriefingSystemSummary } from "./briefing-system-summary";

export interface MissionBriefingProps {
  readonly insights?: MissionInsightsAnalysis;
  readonly missionProfile: MissionProfileAnalysis;
  readonly preset?: MissionPreset;
  readonly report?: MissionReport;
}

const architecturePhases = [
  "Launch",
  "Orbit insertion",
  "Transfer",
  "Arrival",
  "Reentry",
  "Recovery review",
] as const;

function getIntegratedSystems(
  missionProfile: MissionProfileAnalysis,
  report?: MissionReport,
): readonly string[] {
  if (report?.missionSummary.systemsUsed.length) {
    return report.missionSummary.systemsUsed;
  }

  return [
    missionProfile.missionSummaryState.hasDeltaVBudget
      ? "Orbital mechanics"
      : null,
    missionProfile.missionSummaryState.hasVehicleReentryEvaluation
      ? "Vehicle analysis"
      : null,
    missionProfile.missionSummaryState.hasVehicleComparison
      ? "Vehicle comparison"
      : null,
  ].filter((system): system is string => system !== null);
}

export function MissionBriefing({
  insights,
  missionProfile,
  preset,
  report,
}: MissionBriefingProps) {
  const purpose =
    preset?.description ??
    report?.missionSummary.description ??
    "Review the supplied educational mission profile and its completed analysis coverage.";
  const systems = getIntegratedSystems(missionProfile, report);

  return (
    <article
      aria-label={`Mission briefing for ${missionProfile.missionName}`}
      className="min-w-0 text-foreground"
    >
      <BriefingHeader
        category={preset?.category}
        missionName={missionProfile.missionName}
      />

      <div className="space-y-8 pt-6">
        <BriefingOverview
          analysesResolved={missionProfile.missionSummaryState.analysesResolved}
          purpose={purpose}
          systems={systems}
        />

        <div className="border-t border-border-subtle pt-8">
          <BriefingObjectives missionProfile={missionProfile} report={report} />
        </div>

        <div className="border-t border-border-subtle pt-8">
          <BriefingSystemSummary
            missionProfile={missionProfile}
            report={report}
          />
        </div>

        <section
          aria-labelledby="mission-architecture-timeline-title"
          className="border-t border-border-subtle pt-8"
        >
          <h4
            className="orbix-h4 text-foreground"
            id="mission-architecture-timeline-title"
          >
            Typical mission phases
          </h4>
          <p className="mt-1 text-sm leading-6 text-muted">
            The usual order of phases for a mission like this. Not simulated;
            shown for context only.
          </p>
          <ol className="mt-3 list-decimal space-y-1 pl-6 text-sm leading-6 text-text-secondary sm:columns-2 sm:gap-8">
            {architecturePhases.map((phase) => (
              <li key={phase}>{phase}</li>
            ))}
          </ol>
        </section>

        {insights?.insights.length ? (
          <section
            aria-labelledby="mission-briefing-insights-title"
            className="border-t border-border-subtle pt-8"
          >
            <h4
              className="orbix-h4 text-foreground"
              id="mission-briefing-insights-title"
            >
              Engineering notes
            </h4>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-text-secondary">
              {insights.insights.map((insight) => (
                <li key={insight.id}>{insight.summary}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <footer className="border-t border-border-subtle pt-4 text-sm leading-6 text-muted">
          This briefing restates computed results. It does not assess mission
          feasibility, readiness, safety, or certification.
        </footer>
      </div>
    </article>
  );
}
