import type { MissionScenario } from "@/features/engineering-lab/missions";
import { LabHeading } from "../visualization/lab-heading";

export interface TradeStudyCardProps {
  readonly index: number;
  readonly scenario: MissionScenario;
}

function formatCategory(category: MissionScenario["category"]): string {
  const text = category.replaceAll("-", " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function getIncludedSystems(scenario: MissionScenario): readonly string[] {
  return [
    scenario.profile.deltaVBudget ? "Orbital mechanics" : null,
    scenario.profile.vehicleReentryEvaluation ? "Vehicle analysis" : null,
    scenario.profile.vehicleComparison ? "Vehicle comparison" : null,
  ].filter((system): system is string => system !== null);
}

/**
 * One row of the ruled architecture list: name and category, description,
 * and included systems side by side from 44rem, stacked below it. A single
 * rule above each row separates them; there is no per-row chrome.
 */
export function TradeStudyCard({ index, scenario }: TradeStudyCardProps) {
  const systems = getIncludedSystems(scenario);

  return (
    <li
      aria-labelledby={`trade-study-scenario-${scenario.id}-title`}
      className="grid min-w-0 gap-x-8 gap-y-2 border-t border-border-subtle py-4 @[44rem]/trade:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_minmax(0,11rem)]"
    >
      <div className="min-w-0">
        <p className="orbix-label">
          Architecture {index + 1}, {formatCategory(scenario.category)}
        </p>
        <LabHeading
          offset={1}
          className="mt-1"
          id={`trade-study-scenario-${scenario.id}-title`}
        >
          {scenario.name}
        </LabHeading>
      </div>
      <p className="min-w-0 text-sm leading-6 text-muted">
        {scenario.description}
      </p>
      <p className="min-w-0 text-sm leading-6 text-text-secondary">
        <span className="text-muted">Included systems: </span>
        {systems.length > 0 ? systems.join(", ") : "Mission identity only"}
      </p>
    </li>
  );
}
