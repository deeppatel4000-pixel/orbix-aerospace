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
      description="The ordered propulsion elements and parallel booster assemblies represented by this vehicle configuration."
      eyebrow="02 // Staging"
      id="architecture"
      title="Launch Vehicle Architecture"
    >
      <ol className="space-y-4">
        {stages.map((stage, index) => (
          <li
            className="overflow-hidden rounded-2xl border border-border bg-surface/65"
            key={stage.id}
          >
            <div className="flex flex-col gap-5 border-b border-border bg-background/35 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/20 bg-accent/8 text-accent">
                  <Layers3 aria-hidden="true" size={21} strokeWidth={1.7} />
                </span>
                <div>
                  <p className="font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                    Architecture element {String(index + 1).padStart(2, "0")}
                    {" // "}Flight phase{" "}
                    {String(stage.stageNumber).padStart(2, "0")}
                  </p>
                  <h3 className="mt-1 text-xl font-semibold">{stage.name}</h3>
                </div>
              </div>
              <span className="self-start rounded-full border border-border px-3 py-1.5 font-mono text-[0.65rem] text-accent sm:self-auto">
                {stage.reusable ? "Reusable" : "Expendable"}
              </span>
            </div>

            <dl className="grid gap-px bg-border sm:grid-cols-3">
              <div className="bg-surface p-5 sm:p-6">
                <dt className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                  <Boxes aria-hidden="true" size={14} />
                  Propellants
                </dt>
                <dd className="mt-3 text-sm font-medium">
                  {formatRocketPropellant(stage.propellant)}
                </dd>
              </div>
              <div className="bg-surface p-5 sm:p-6">
                <dt className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                  <Route aria-hidden="true" size={14} />
                  Flight phase
                </dt>
                <dd className="mt-3 text-sm font-medium">
                  Phase {stage.stageNumber}
                </dd>
              </div>
              <div className="bg-surface p-5 sm:p-6">
                <dt className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                  <Recycle aria-hidden="true" size={14} />
                  Recovery design
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
                    className="rounded-full border border-accent/20 bg-accent/8 px-3 py-1.5 text-xs text-accent"
                    key={engine.id}
                  >
                    {engine.quantity} × {engine.name}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </ProfileSection>
  );
}
