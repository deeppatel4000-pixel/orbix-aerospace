import { EmptyState } from "@/components/ui/empty-state";
import type { MissionScenario } from "@/features/engineering-lab/missions";
import type {
  MissionProfileAnalysis,
  MissionReport,
} from "@/features/engineering-lab/types";

import { TradeStudyCard } from "./trade-study-card";
import {
  buildTradeStudyExplanations,
  TradeStudyMetrics,
  type MissionTradeStudyEntry,
} from "./trade-study-metrics";

export interface MissionTradeStudyProps {
  readonly analyses?: readonly MissionProfileAnalysis[];
  readonly reports?: readonly MissionReport[];
  readonly scenarios: readonly MissionScenario[];
}

export function MissionTradeStudy({
  analyses,
  reports,
  scenarios,
}: MissionTradeStudyProps) {
  const entries: readonly MissionTradeStudyEntry[] = scenarios.map(
    (scenario, index) => ({
      analysis: analyses?.[index],
      report: reports?.[index],
      scenario,
    }),
  );
  const explanations = buildTradeStudyExplanations(entries);

  return (
    <article
      aria-label="Mission architecture trade study"
      className="min-w-0 text-foreground"
    >
      <header className="border-b border-border-subtle pb-4">
        <h3 className="orbix-h3 text-foreground">
          Architecture comparison review
        </h3>
        <p className="mt-2 max-w-[68ch] text-sm leading-6 text-muted">
          Mission trade study of saved architectures, using completed results
          only. It does not score, rank, or pick a preferred mission.
        </p>
      </header>

      <div className="space-y-8 pt-6">
        {entries.length === 0 ? (
          <EmptyState
            description="Supply saved scenarios and optional completed reports or analyses to open an architecture comparison review."
            title="No mission scenarios selected"
          />
        ) : (
          <>
            <section aria-labelledby="trade-study-scenarios-title">
              <h4
                className="orbix-h4 text-foreground"
                id="trade-study-scenarios-title"
              >
                Mission architectures
              </h4>
              <div className="mt-3 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                {entries.map(({ scenario }, index) => (
                  <TradeStudyCard
                    index={index}
                    key={scenario.id}
                    scenario={scenario}
                  />
                ))}
              </div>
            </section>

            <div className="border-t border-border-subtle pt-8">
              <TradeStudyMetrics entries={entries} />
            </div>

            <section
              aria-labelledby="trade-study-insights-title"
              className="border-t border-border-subtle pt-8"
            >
              <h4
                className="orbix-h4 text-foreground"
                id="trade-study-insights-title"
              >
                Trade study notes
              </h4>
              <p className="mt-1 text-sm leading-6 text-muted">
                Factual differences only. No recommendation.
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-text-secondary">
                {explanations.map((explanation) => (
                  <li key={explanation}>{explanation}</li>
                ))}
              </ul>
            </section>
          </>
        )}

        <p aria-live="polite" className="sr-only" role="status">
          Trade study contains {entries.length} supplied mission scenarios.
        </p>

        <footer className="border-t border-border-subtle pt-4 text-sm leading-6 text-muted">
          This comparison keeps the supplied values and scenario order. It
          provides no feasibility assessment, optimization, ranking, or winner
          selection.
        </footer>
      </div>
    </article>
  );
}
