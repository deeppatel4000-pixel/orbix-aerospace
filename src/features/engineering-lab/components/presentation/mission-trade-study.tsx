import { cn } from "@/lib/cn";
import { EmptyState } from "@/components/ui/empty-state";
import type { MissionScenario } from "@/features/engineering-lab/missions";
import type {
  MissionProfileAnalysis,
  MissionReport,
} from "@/features/engineering-lab/types";

import { TradeStudyCard } from "./trade-study-card";
import {
  TradeStudyMetrics,
  type MissionTradeStudyEntry,
} from "./trade-study-metrics";
import { LabHeading } from "../visualization/lab-heading";

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

  return (
    <article
      aria-label="Mission architecture trade study"
      className="min-w-0 text-foreground"
    >
      {/* The tool card already titles and describes the study, so the body
       * starts with the architectures; the one disclaimer is the foot note. */}
      <div className="space-y-8">
        {entries.length === 0 ? (
          <EmptyState
            description="Supply saved scenarios and optional completed reports or analyses to open an architecture comparison review."
            title="No mission scenarios selected"
          />
        ) : (
          <>
            <section
              aria-labelledby="trade-study-scenarios-title"
              className="@container/trade"
            >
              <LabHeading id="trade-study-scenarios-title">
                Mission architectures
              </LabHeading>
              {/* Open hairline grid: each architecture sits on a top
               * rule; no outer box inside the tool frame. */}
              <div
                className={cn(
                  // Rows: label, title, description, systems. Each card
                  // spans them through subgrid; the description row takes
                  // the slack so the systems rules share one line.
                  "mt-3 grid items-stretch gap-x-8 @[30rem]/trade:grid-rows-[auto_auto_1fr_auto]",
                  // One column per architecture up to three, matching the
                  // mission columns of the table below, with no orphan.
                  entries.length % 3 === 0
                    ? "@[44rem]/trade:grid-cols-3"
                    : entries.length % 2 === 0
                      ? "@[30rem]/trade:grid-cols-2"
                      : "@[30rem]/trade:grid-cols-2 @[44rem]/trade:grid-cols-3",
                )}
              >
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
          </>
        )}

        <p aria-live="polite" className="sr-only" role="status">
          Trade study contains {entries.length} supplied mission scenarios.
        </p>

        <footer className="border-t border-border-subtle pt-4 text-[0.8125rem] leading-5 text-muted">
          This comparison keeps the supplied values and scenario order. It
          provides no feasibility assessment, optimization, ranking, or winner
          selection.
        </footer>
      </div>
    </article>
  );
}
