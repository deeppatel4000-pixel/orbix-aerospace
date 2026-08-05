import { GitCompareArrows, Scale, ShieldCheck } from "lucide-react";

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
      className="technical-grid overflow-hidden rounded-2xl border border-white/12 bg-[#03090d] text-[#e2eaeb] shadow-[0_28px_80px_rgba(0,0,0,0.28)]"
    >
      <header className="relative overflow-hidden border-b border-white/10 px-5 py-8 sm:px-8 sm:py-10">
        <div
          aria-hidden="true"
          className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-accent/8 blur-3xl"
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-2 font-mono text-[0.64rem] tracking-[0.22em] text-accent uppercase">
              <GitCompareArrows aria-hidden="true" size={15} />
              Mission trade study
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-5xl">
              Architecture Comparison Review
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-[#91a6ab]">
              Compare saved mission architectures using completed, supplied
              outputs. This presentation does not score, rank, or select a
              preferred mission.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-signal/20 bg-signal/5 px-4 py-3 text-signal">
            <ShieldCheck aria-hidden="true" size={16} />
            <span className="font-mono text-[0.61rem] tracking-[0.08em] uppercase">
              Educational analysis
            </span>
          </div>
        </div>
      </header>

      <div className="space-y-10 p-5 sm:p-8">
        {entries.length === 0 ? (
          <section
            aria-labelledby="mission-trade-study-empty-title"
            className="rounded-2xl border border-dashed border-white/15 bg-black/15 px-6 py-14 text-center"
          >
            <Scale
              aria-hidden="true"
              className="mx-auto text-accent"
              size={28}
            />
            <h3
              className="mt-4 text-xl font-semibold"
              id="mission-trade-study-empty-title"
            >
              No mission scenarios selected
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#80959a]">
              Supply saved scenarios and optional completed reports or analyses
              to open an architecture comparison review.
            </p>
          </section>
        ) : (
          <>
            <section aria-labelledby="trade-study-scenarios-title">
              <p className="font-mono text-[0.6rem] tracking-[0.16em] text-accent uppercase">
                Scenario set // Preserved order
              </p>
              <h3
                className="mt-1 text-xl font-semibold"
                id="trade-study-scenarios-title"
              >
                Mission Architectures
              </h3>
              <div className="mt-5 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                {entries.map(({ scenario }, index) => (
                  <TradeStudyCard
                    index={index}
                    key={scenario.id}
                    scenario={scenario}
                  />
                ))}
              </div>
            </section>

            <div className="border-t border-white/10 pt-9">
              <TradeStudyMetrics entries={entries} />
            </div>

            <section
              aria-labelledby="trade-study-insights-title"
              className="border-t border-white/10 pt-9"
            >
              <p className="font-mono text-[0.6rem] tracking-[0.16em] text-accent uppercase">
                Factual review // No recommendation
              </p>
              <h3
                className="mt-1 text-xl font-semibold"
                id="trade-study-insights-title"
              >
                Trade Study Explanations
              </h3>
              <div className="mt-5 grid gap-3 lg:grid-cols-2">
                {explanations.map((explanation) => (
                  <article
                    className="rounded-xl border border-white/10 bg-[#081419]/80 p-4 text-sm leading-6 text-[#a8b9bc]"
                    key={explanation}
                  >
                    {explanation}
                  </article>
                ))}
              </div>
            </section>
          </>
        )}

        <p aria-live="polite" className="sr-only" role="status">
          Trade study contains {entries.length} supplied mission scenarios.
        </p>

        <footer className="border-t border-white/10 pt-6 text-xs leading-5 text-[#71868c]">
          This educational comparison preserves supplied values and scenario
          order. It provides no feasibility assessment, optimization, ranking,
          or winner selection.
        </footer>
      </div>
    </article>
  );
}
