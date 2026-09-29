import { ChevronDown } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import type { MissionInsightsAnalysis } from "@/features/engineering-lab/types";
import { LabHeading } from "./visualization/lab-heading";

export interface MissionInsightsPanelProps {
  readonly analysis?: MissionInsightsAnalysis | null;
}

/**
 * Plain-language notes generated from completed mission results. Each insight
 * is a native disclosure so the list stays short until a reader opens one.
 */
export function MissionInsightsPanel({ analysis }: MissionInsightsPanelProps) {
  if (!analysis) {
    return (
      <EmptyState
        description="Insights need a completed mission-profile calculation and its report. Run the mission profile analyzer first."
        title="Mission insights unavailable"
      />
    );
  }

  return (
    <section
      aria-labelledby="mission-insights-title"
      aria-live="polite"
      className="min-w-0"
      role="region"
    >
      <header className="border-b border-border-subtle pb-4">
        <LabHeading id="mission-insights-title">
          Mission engineering insights
        </LabHeading>
        <p className="mt-2 max-w-[68ch] text-sm leading-6 text-muted">
          Plain-language notes generated from the completed results. They
          explain the numbers; they do not change any calculation or
          recommendation.
        </p>
      </header>

      <div className="space-y-6 pt-6">
        <dl className="grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="orbix-label">Mission</dt>
            <dd className="mt-1 text-foreground">{analysis.missionName}</dd>
          </div>
          <div>
            <dt className="orbix-label">Insight sections</dt>
            <dd className="orbix-data mt-1 text-foreground">
              {analysis.insights.length}
            </dd>
          </div>
          <div>
            <dt className="orbix-label">Systems interpreted</dt>
            <dd className="orbix-data mt-1 text-foreground">
              {analysis.systemsInterpreted.length}
            </dd>
          </div>
        </dl>

        <div className="divide-y divide-border-subtle border-y border-border-subtle">
          {analysis.insights.map((insight, index) => (
            <details className="group" key={insight.id} open={index === 0}>
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 py-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                {insight.title}
                <ChevronDown
                  aria-hidden="true"
                  className="shrink-0 text-muted transition-transform group-open:rotate-180"
                  size={16}
                />
              </summary>
              <div className="pb-4">
                <p className="max-w-[68ch] text-sm leading-6 text-text-secondary">
                  {insight.summary}
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-muted">
                  {insight.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </div>
            </details>
          ))}
        </div>

        <section aria-labelledby="mission-insights-assumptions-title">
          <LabHeading offset={1} id="mission-insights-assumptions-title">
            Source assumptions
          </LabHeading>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-muted md:columns-2 md:gap-8">
            {analysis.assumptions.map((assumption) => (
              <li key={assumption}>{assumption}</li>
            ))}
          </ul>
        </section>
      </div>

      <p className="sr-only" role="status">
        Generated {analysis.insights.length} deterministic mission insight
        sections for {analysis.missionName}.
      </p>
    </section>
  );
}
