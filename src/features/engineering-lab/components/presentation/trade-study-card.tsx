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

export function TradeStudyCard({ index, scenario }: TradeStudyCardProps) {
  const systems = getIncludedSystems(scenario);

  return (
    <article
      aria-labelledby={`trade-study-scenario-${scenario.id}-title`}
      className="min-w-0 border-t border-border-subtle py-4"
    >
      <p className="orbix-label">
        Architecture {index + 1}: {formatCategory(scenario.category)}
      </p>
      <LabHeading
        offset={2}
        className="mt-1"
        id={`trade-study-scenario-${scenario.id}-title`}
      >
        {scenario.name}
      </LabHeading>
      <p className="mt-2 text-sm leading-6 text-muted">
        {scenario.description}
      </p>
      <p className="mt-3 border-t border-border-subtle pt-3 text-sm text-text-secondary">
        <span className="text-muted">Included systems: </span>
        {systems.length > 0 ? systems.join(", ") : "Mission identity only"}
      </p>
    </article>
  );
}
