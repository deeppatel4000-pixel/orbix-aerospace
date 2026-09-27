import { ArrowRight, CircleCheck, CircleMinus } from "lucide-react";

import { buttonClass } from "@/components/ui/button-class";

import type {
  MissionPreset,
  MissionPresetCategory,
  MissionProfileAnalysis,
  MissionReport,
} from "@/features/engineering-lab/types";

export interface MissionCardProps {
  readonly analysis?: MissionProfileAnalysis;
  readonly missionControlHref?: string;
  readonly preset: MissionPreset;
  readonly report?: MissionReport;
}

const categoryLabels: Readonly<Record<MissionPresetCategory, string>> = {
  "deep-space-concept": "Deep-space concept",
  "lunar-transfer": "Lunar transfer",
  "orbital-deployment": "Orbital deployment",
  "orbital-logistics": "Orbital logistics",
  "reentry-demonstration": "Reentry demonstration",
};

export function MissionCard({
  analysis,
  missionControlHref = "#mission-control-dashboard",
  preset,
  report,
}: MissionCardProps) {
  const hasOrbitalSystem = Boolean(
    report?.orbitalAnalysis ||
    analysis?.sourceAnalyses.deltaVBudget ||
    preset.missionProfileInputs.deltaVBudget,
  );
  const hasVehicleSystem = Boolean(
    report?.vehicleAnalysis ||
    analysis?.sourceAnalyses.vehicleComparison ||
    analysis?.sourceAnalyses.vehicleReentryEvaluation ||
    preset.missionProfileInputs.vehicleComparison ||
    preset.missionProfileInputs.vehicleReentryEvaluation,
  );
  const hasThermalSystem = Boolean(
    report?.thermalAnalysis ||
    analysis?.tpsRecommendation ||
    analysis?.sourceAnalyses.vehicleReentryEvaluation,
  );
  const hasVisualizationSystem = Boolean(analysis || report);
  const systems = [
    { available: hasOrbitalSystem, label: "Orbital" },
    { available: hasVehicleSystem, label: "Vehicle" },
    { available: hasThermalSystem, label: "Thermal" },
    { available: hasVisualizationSystem, label: "Visualization" },
  ] as const;

  return (
    <article
      aria-labelledby={`mission-card-${preset.id}-title`}
      className="flex min-h-full flex-col rounded-md border border-border p-4"
    >
      <p className="orbix-label">{categoryLabels[preset.category]}</p>
      <h3
        className="orbix-h4 mt-1 text-foreground"
        id={`mission-card-${preset.id}-title`}
      >
        {preset.name}
      </h3>

      <p className="mt-2 flex-1 text-sm leading-6 text-muted">
        {preset.description}
      </p>

      <section
        aria-labelledby={`mission-card-${preset.id}-systems-title`}
        className="mt-4 border-t border-border-subtle pt-3"
      >
        <h4
          className="text-sm font-semibold text-foreground"
          id={`mission-card-${preset.id}-systems-title`}
        >
          Available systems
        </h4>
        <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          {systems.map((system) => (
            <li
              className={
                "flex items-center gap-2 " +
                (system.available ? "text-foreground" : "text-muted")
              }
              data-system-availability={
                system.available ? "available" : "not-included"
              }
              key={system.label}
            >
              {system.available ? (
                <CircleCheck
                  aria-hidden="true"
                  className="shrink-0 text-status-success"
                  size={14}
                />
              ) : (
                <CircleMinus
                  aria-hidden="true"
                  className="shrink-0 text-muted"
                  size={14}
                />
              )}
              <span>{system.label}</span>
              <span className="sr-only">
                {system.available ? " available" : " not included"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <a
        aria-label={`Enter Mission control from ${preset.name}`}
        className={buttonClass({
          className: "mt-4 self-start",
          variant: "secondary",
        })}
        href={missionControlHref}
      >
        Enter Mission control
        <ArrowRight aria-hidden="true" size={16} />
      </a>
    </article>
  );
}
