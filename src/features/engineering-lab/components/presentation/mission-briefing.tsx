import { ArrowDown, RadioTower } from "lucide-react";

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
      className="technical-grid overflow-hidden rounded-2xl border border-white/12 bg-[#03090d] text-[#e2eaeb] shadow-[0_28px_80px_rgba(0,0,0,0.28)]"
    >
      <BriefingHeader
        category={preset?.category}
        missionName={missionProfile.missionName}
      />

      <div className="space-y-10 p-5 sm:p-8">
        <BriefingOverview
          analysesResolved={missionProfile.missionSummaryState.analysesResolved}
          purpose={purpose}
          systems={systems}
        />

        <div className="border-t border-white/10 pt-9">
          <BriefingObjectives missionProfile={missionProfile} report={report} />
        </div>

        <div className="border-t border-white/10 pt-9">
          <BriefingSystemSummary
            missionProfile={missionProfile}
            report={report}
          />
        </div>

        <section
          aria-labelledby="mission-architecture-timeline-title"
          className="border-t border-white/10 pt-9"
        >
          <p className="flex items-center gap-2 font-mono text-[0.6rem] tracking-[0.16em] text-accent uppercase">
            <RadioTower aria-hidden="true" size={14} />
            Educational sequence // Not simulated
          </p>
          <h3
            className="mt-1 text-xl font-semibold"
            id="mission-architecture-timeline-title"
          >
            Mission Architecture Timeline
          </h3>
          <ol className="mt-5 grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
            {architecturePhases.map((phase, index) => (
              <li
                className="relative rounded-xl border border-white/10 bg-[#071318] px-4 py-4"
                key={phase}
              >
                <span className="font-mono text-[0.57rem] text-accent">
                  T+{String(index).padStart(2, "0")}
                </span>
                <p className="mt-2 font-mono text-[0.66rem] font-semibold tracking-[0.08em] text-[#c8d5d7] uppercase">
                  {phase}
                </p>
                {index < architecturePhases.length - 1 ? (
                  <ArrowDown
                    aria-hidden="true"
                    className="mt-3 text-[#60777d] motion-safe:animate-bounce motion-reduce:animate-none motion-reduce:transition-none sm:hidden"
                    size={14}
                  />
                ) : null}
              </li>
            ))}
          </ol>
        </section>

        {insights?.insights.length ? (
          <section
            aria-labelledby="mission-briefing-insights-title"
            className="border-t border-white/10 pt-9"
          >
            <p className="font-mono text-[0.6rem] tracking-[0.16em] text-accent uppercase">
              Analyst notes // Supplied explanations
            </p>
            <h3
              className="mt-1 text-xl font-semibold"
              id="mission-briefing-insights-title"
            >
              Engineering Briefing Notes
            </h3>
            <ul className="mt-5 grid gap-3 lg:grid-cols-2">
              {insights.insights.map((insight) => (
                <li
                  className="rounded-xl border border-white/10 bg-black/15 p-4 text-sm leading-6 text-[#a6b8bc]"
                  key={insight.id}
                >
                  {insight.summary}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <footer className="border-t border-white/10 pt-6 text-xs leading-5 text-[#71868c]">
          Presentation status describes briefing availability only. It does not
          assess mission feasibility, readiness, safety, or certification.
        </footer>
      </div>
    </article>
  );
}
