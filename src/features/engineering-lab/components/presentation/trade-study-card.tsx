import { CheckCircle2, Layers3 } from "lucide-react";

import type { MissionScenario } from "@/features/engineering-lab/missions";

export interface TradeStudyCardProps {
  readonly index: number;
  readonly scenario: MissionScenario;
}

function formatCategory(category: MissionScenario["category"]): string {
  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getIncludedSystems(scenario: MissionScenario): readonly string[] {
  return [
    scenario.profile.deltaVBudget ? "Orbital mechanics" : null,
    scenario.profile.vehicleReentryEvaluation ? "Vehicle analysis" : null,
    scenario.profile.vehicleComparison ? "Vehicle comparison" : null,
  ].filter((system): system is string => system !== null);
}

export function TradeStudyCard({ index, scenario }: TradeStudyCardProps) {
  const systems = getIncludedSystems(scenario);

  return (
    <article
      aria-labelledby={`trade-study-scenario-${scenario.id}-title`}
      className="rounded-2xl border border-white/10 bg-[#081419]/90 p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[0.58rem] tracking-[0.16em] text-accent uppercase">
            Architecture {String(index + 1).padStart(2, "0")}
          </p>
          <h3
            className="mt-2 text-xl font-semibold tracking-[-0.025em]"
            id={`trade-study-scenario-${scenario.id}-title`}
          >
            {scenario.name}
          </h3>
          <p className="mt-2 font-mono text-[0.62rem] tracking-[0.1em] text-[#7e9499] uppercase">
            {formatCategory(scenario.category)}
          </p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/6 text-accent">
          <Layers3 aria-hidden="true" size={18} />
        </span>
      </div>

      <p className="mt-4 min-h-18 text-sm leading-6 text-[#9fb1b5]">
        {scenario.description}
      </p>

      <div className="mt-5 border-t border-white/10 pt-4">
        <p className="font-mono text-[0.57rem] tracking-[0.13em] text-[#71878c] uppercase">
          Included systems
        </p>
        {systems.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {systems.map((system) => (
              <li
                className="flex items-center gap-2 text-xs text-[#bdcbcd]"
                key={system}
              >
                <CheckCircle2
                  aria-hidden="true"
                  className="shrink-0 text-accent"
                  size={14}
                />
                {system}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-xs leading-5 text-[#71878c]">
            Mission identity only
          </p>
        )}
      </div>
    </article>
  );
}
