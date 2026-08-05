import { ArrowRight, Flame, Orbit, Plane, Radar } from "lucide-react";

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
    { available: hasOrbitalSystem, icon: Orbit, label: "Orbital" },
    { available: hasVehicleSystem, icon: Plane, label: "Vehicle" },
    { available: hasThermalSystem, icon: Flame, label: "Thermal" },
    {
      available: hasVisualizationSystem,
      icon: Radar,
      label: "Visualization",
    },
  ] as const;

  return (
    <article
      aria-labelledby={`mission-card-${preset.id}-title`}
      className="group relative flex min-h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#071318]/88 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.16)] transition-[border-color,transform] hover:-translate-y-0.5 hover:border-accent/25 motion-reduce:transform-none motion-reduce:transition-none sm:p-6"
    >
      <div
        aria-hidden="true"
        className="absolute -top-16 -right-16 h-40 w-40 rounded-full border border-accent/10"
      />
      <div
        aria-hidden="true"
        className="absolute -top-8 -right-8 h-24 w-24 rounded-full border border-white/6"
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[0.54rem] tracking-[0.14em] text-accent uppercase">
            Mission archive // {categoryLabels[preset.category]}
          </p>
          <h3
            className="mt-2 text-xl font-semibold tracking-[-0.025em] text-[#e0e9ea]"
            id={`mission-card-${preset.id}-title`}
          >
            {preset.name}
          </h3>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/6 text-accent">
          <Orbit aria-hidden="true" size={16} />
        </span>
      </div>

      <p className="relative mt-4 flex-1 text-sm leading-6 text-[#91a5aa]">
        {preset.description}
      </p>

      <section
        aria-labelledby={`mission-card-${preset.id}-systems-title`}
        className="relative mt-6 border-t border-white/10 pt-4"
      >
        <h4
          className="font-mono text-[0.55rem] tracking-[0.12em] text-[#71868c] uppercase"
          id={`mission-card-${preset.id}-systems-title`}
        >
          Available systems
        </h4>
        <ul className="mt-3 grid grid-cols-2 gap-2">
          {systems.map((system) => {
            const Icon = system.icon;

            return (
              <li
                className={
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs " +
                  (system.available
                    ? "border-accent/15 bg-accent/5 text-[#b9c9cb]"
                    : "border-white/8 bg-black/10 text-[#61777d]")
                }
                data-system-availability={
                  system.available ? "available" : "not-included"
                }
                key={system.label}
              >
                <Icon
                  aria-hidden="true"
                  className={
                    system.available ? "text-accent" : "text-[#536a70]"
                  }
                  size={13}
                />
                <span>{system.label}</span>
                <span className="sr-only">
                  {system.available ? " available" : " not included"}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <a
        aria-label={`Enter Mission Control from ${preset.name}`}
        className="relative mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-5 py-2.5 text-sm font-semibold text-accent transition-colors outline-none hover:bg-accent/15 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#071318] motion-reduce:transition-none"
        href={missionControlHref}
      >
        Enter Mission Control
        <ArrowRight aria-hidden="true" size={15} />
      </a>
    </article>
  );
}
