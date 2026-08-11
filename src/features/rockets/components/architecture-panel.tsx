import { Boxes, Layers3, Recycle, Route } from "lucide-react";

import { ProfileSection } from "@/features/rockets/components/profile-section";
import { formatRocketPropellant } from "@/features/rockets/utils";
import type { RocketStage } from "@/features/vehicles/types";

interface ArchitecturePanelProps {
  stages: readonly RocketStage[];
}

export function ArchitecturePanel({ stages }: ArchitecturePanelProps) {
  return (
    <ProfileSection
      description="An ordered launch timeline of propulsion elements and parallel booster assemblies represented by this vehicle configuration."
      eyebrow="Staging"
      mode="configuration"
      id="architecture"
      title="Launch Vehicle Architecture"
    >
      <ol className="relative space-y-5 before:absolute before:top-5 before:bottom-5 before:left-[1.35rem] before:w-px before:bg-gradient-to-b before:from-signal/65 before:via-atmosphere/35 before:to-transparent">
        {stages.map((stage, index) => (
          <li
            className="relative grid grid-cols-[2.75rem_minmax(0,1fr)] gap-4"
            key={stage.id}
          >
            <span className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-signal/45 bg-[#080d17] font-mono text-xs text-signal shadow-[0_0_24px_rgb(242_188_104/0.12)]">
              {String(index + 1).padStart(2, "0")}
            </span>

            <article className="orbix-frame overflow-hidden border-atmosphere/20 bg-surface/70">
              <div className="flex flex-col gap-5 border-b border-atmosphere/20 bg-[#080d17] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 items-center justify-center border border-atmosphere/25 bg-atmosphere/8 text-accent">
                    <Layers3 aria-hidden="true" size={21} strokeWidth={1.7} />
                  </span>
                  <div>
                    <p className="font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                      Flight phase {String(stage.stageNumber).padStart(2, "0")}
                    </p>
                    <h3 className="font-display mt-1 text-xl font-semibold sm:text-2xl">
                      {stage.name}
                    </h3>
                  </div>
                </div>
                <span className="orbix-status orbix-status--info self-start sm:self-auto">
                  {stage.reusable ? "Reusable" : "Expendable"}
                </span>
              </div>

              <dl className="grid gap-px bg-atmosphere/20 sm:grid-cols-3">
                <div className="bg-surface p-5 sm:p-6">
                  <dt className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                    <Boxes aria-hidden="true" size={14} /> Propellants
                  </dt>
                  <dd className="mt-3 text-sm font-medium">
                    {formatRocketPropellant(stage.propellant)}
                  </dd>
                </div>
                <div className="bg-surface p-5 sm:p-6">
                  <dt className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                    <Route aria-hidden="true" size={14} /> Flight phase
                  </dt>
                  <dd className="mt-3 text-sm font-medium">
                    Phase {stage.stageNumber}
                  </dd>
                </div>
                <div className="bg-surface p-5 sm:p-6">
                  <dt className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                    <Recycle aria-hidden="true" size={14} /> Recovery design
                  </dt>
                  <dd className="mt-3 text-sm font-medium">
                    {stage.reusable ? "Designed for recovery" : "Not recovered"}
                  </dd>
                </div>
              </dl>

              <div className="p-5 sm:p-6">
                <p className="font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                  Installed propulsion
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {stage.engines.map((engine) => (
                    <li
                      className="border border-signal/25 bg-signal/8 px-3 py-1.5 text-xs text-signal"
                      key={engine.id}
                    >
                      {engine.quantity} × {engine.name}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </li>
        ))}
      </ol>
    </ProfileSection>
  );
}
