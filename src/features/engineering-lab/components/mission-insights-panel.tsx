import {
  AlertTriangle,
  ChevronDown,
  FileSearch,
  Flame,
  Gauge,
  Lightbulb,
  Orbit,
  Plane,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import type {
  MissionInsightCategory,
  MissionInsightsAnalysis,
} from "@/features/engineering-lab/types";

export interface MissionInsightsPanelProps {
  readonly analysis?: MissionInsightsAnalysis | null;
}

const insightIcons: Readonly<Record<MissionInsightCategory, LucideIcon>> = {
  "engineering-tradeoffs": Lightbulb,
  limitations: AlertTriangle,
  "mission-overview": FileSearch,
  "orbital-analysis": Orbit,
  "thermal-analysis": Flame,
  "vehicle-analysis": Plane,
};

export function MissionInsightsPanel({ analysis }: MissionInsightsPanelProps) {
  if (!analysis) {
    return (
      <section
        aria-label="Aerospace mission analyst"
        className="rounded-2xl border border-dashed border-white/15 bg-[#061015] p-6"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-accent">
            <FileSearch aria-hidden="true" size={18} />
          </span>
          <div>
            <p className="font-mono text-[0.61rem] tracking-[0.14em] text-accent uppercase">
              Engineering briefing
            </p>
            <h3 className="mt-1 text-lg font-semibold">
              Mission insights unavailable
            </h3>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-[#81969b]">
          Completed mission-profile and report objects are required to produce
          deterministic engineering explanations.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="mission-insights-title"
      aria-live="polite"
      className="overflow-hidden rounded-2xl border border-white/12 bg-[#061015]"
      role="region"
    >
      <header className="technical-grid border-b border-white/10 p-5 sm:p-6">
        <p className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.16em] text-accent uppercase">
          <FileSearch aria-hidden="true" size={15} />
          Aerospace Mission Analyst // Deterministic briefing
        </p>
        <h3
          className="mt-2 text-2xl font-semibold tracking-[-0.03em]"
          id="mission-insights-title"
        >
          Mission Engineering Insights
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#91a5aa]">
          Structured interpretation of completed Orbix results. Source
          calculations, selections, and recommendations remain unchanged.
        </p>
      </header>

      <div className="space-y-6 p-5 sm:p-6">
        <dl className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-[#081419] p-4">
            <dt className="font-mono text-[0.56rem] tracking-[0.1em] text-[#71878d] uppercase">
              Mission
            </dt>
            <dd className="mt-2">
              <output className="text-sm font-semibold text-[#dce6e7]">
                {analysis.missionName}
              </output>
            </dd>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#081419] p-4">
            <dt className="font-mono text-[0.56rem] tracking-[0.1em] text-[#71878d] uppercase">
              Insight sections
            </dt>
            <dd className="mt-2">
              <output className="font-mono text-lg font-semibold text-accent">
                {analysis.insights.length}
              </output>
            </dd>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#081419] p-4">
            <dt className="font-mono text-[0.56rem] tracking-[0.1em] text-[#71878d] uppercase">
              Systems interpreted
            </dt>
            <dd className="mt-2">
              <output className="font-mono text-lg font-semibold text-accent">
                {analysis.systemsInterpreted.length}
              </output>
            </dd>
          </div>
        </dl>

        <div className="space-y-3">
          {analysis.insights.map((insight, index) => {
            const Icon = insightIcons[insight.category];
            const isTradeoff = insight.category === "engineering-tradeoffs";
            const isLimitation = insight.category === "limitations";

            return (
              <details
                className={
                  "group rounded-xl border bg-[#081419] transition-colors open:bg-[#0a171c] motion-reduce:transition-none " +
                  (isTradeoff
                    ? "border-accent/20"
                    : isLimitation
                      ? "border-signal/20"
                      : "border-white/10")
                }
                key={insight.id}
                open={index === 0}
              >
                <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-4 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset [&::-webkit-details-marker]:hidden">
                  <span
                    className={
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl " +
                      (isLimitation
                        ? "bg-signal/10 text-signal"
                        : "bg-accent/10 text-accent")
                    }
                  >
                    <Icon aria-hidden="true" size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-[0.55rem] tracking-[0.1em] text-[#71878d] uppercase">
                      Insight {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="mt-0.5 block text-sm font-semibold text-[#dce6e7]">
                      {insight.title}
                    </span>
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className="shrink-0 text-[#748a90] transition-transform group-open:rotate-180 motion-reduce:transition-none"
                    size={17}
                  />
                </summary>

                <div className="border-t border-white/8 px-4 py-4 sm:px-6">
                  <p className="text-sm leading-6 text-[#a3b5b9]">
                    {insight.summary}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {insight.details.map((detail) => (
                      <li
                        className="flex gap-3 text-xs leading-5 text-[#82979c]"
                        key={detail}
                      >
                        <span
                          aria-hidden="true"
                          className={
                            isLimitation ? "text-signal" : "text-accent"
                          }
                        >
                          —
                        </span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            );
          })}
        </div>

        <section
          aria-labelledby="mission-insights-assumptions-title"
          className="rounded-xl border border-signal/20 bg-signal/5 p-4"
        >
          <div className="flex items-center gap-2 text-signal">
            <ShieldCheck aria-hidden="true" size={16} />
            <h4
              className="font-mono text-[0.63rem] tracking-[0.1em] uppercase"
              id="mission-insights-assumptions-title"
            >
              Source assumptions
            </h4>
          </div>
          <ul className="mt-3 grid gap-2 text-xs leading-5 text-[#91a5aa] sm:grid-cols-2">
            {analysis.assumptions.map((assumption) => (
              <li className="flex gap-2" key={assumption}>
                <Gauge
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-signal"
                  size={13}
                />
                {assumption}
              </li>
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
