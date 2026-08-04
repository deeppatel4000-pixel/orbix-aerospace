import { Cog, Flame } from "lucide-react";

import { ProfileSection } from "@/features/rockets/components/profile-section";
import {
  formatRocketEngineCycle,
  formatRocketMeasurement,
} from "@/features/rockets/utils";
import type {
  ForceMeasurement,
  RocketEngine,
  RocketStage,
} from "@/features/vehicles/types";

interface PropulsionPanelProps {
  stages: readonly RocketStage[];
}

interface ThrustRating {
  label: string;
  measurement: ForceMeasurement;
}

function getThrustRatings(engine: RocketEngine): readonly ThrustRating[] {
  const ratings: ThrustRating[] = [];

  if (engine.thrust.seaLevel) {
    ratings.push({
      label: "Sea-level thrust",
      measurement: engine.thrust.seaLevel,
    });
  }

  if (engine.thrust.vacuum) {
    ratings.push({
      label: "Vacuum thrust",
      measurement: engine.thrust.vacuum,
    });
  }

  return ratings;
}

export function PropulsionPanel({ stages }: PropulsionPanelProps) {
  return (
    <ProfileSection
      description="Engine families, power cycles, installed quantities, and available per-engine thrust ratings."
      eyebrow="03 // Propulsion"
      id="propulsion"
      title="Propulsion"
    >
      <div className="space-y-4">
        {stages.flatMap((stage) =>
          stage.engines.map((engine) => {
            const thrustRatings = getThrustRatings(engine);

            return (
              <article
                className="overflow-hidden rounded-2xl border border-border bg-surface/65"
                key={stage.id + "-" + engine.id}
              >
                <div className="flex flex-col gap-5 border-b border-border bg-background/35 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <div className="flex items-center gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/20 bg-accent/8 text-accent">
                      <Cog aria-hidden="true" size={21} strokeWidth={1.7} />
                    </span>
                    <div>
                      <p className="font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                        {stage.name}
                      </p>
                      <h3 className="mt-1 text-xl font-semibold">
                        {engine.name}
                      </h3>
                    </div>
                  </div>
                  <span className="self-start rounded-full border border-border px-3 py-1.5 font-mono text-[0.65rem] text-accent sm:self-auto">
                    {engine.quantity} installed
                  </span>
                </div>

                <dl className="grid gap-px bg-border sm:grid-cols-2">
                  <div className="bg-surface px-5 py-4 sm:px-6">
                    <dt className="font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                      Manufacturer
                    </dt>
                    <dd className="mt-2 text-sm font-medium">
                      {engine.manufacturer}
                    </dd>
                  </div>
                  <div className="bg-surface px-5 py-4 sm:px-6">
                    <dt className="font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                      Engine cycle
                    </dt>
                    <dd className="mt-2 text-sm font-medium">
                      {formatRocketEngineCycle(engine.cycle)}
                    </dd>
                  </div>
                </dl>

                <div className="p-5 sm:p-6">
                  <p className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                    <Flame
                      aria-hidden="true"
                      className="text-accent"
                      size={15}
                    />
                    Thrust ratings per engine
                  </p>
                  <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                    {thrustRatings.map((rating) => {
                      const formatted = formatRocketMeasurement(
                        rating.measurement,
                      );

                      return (
                        <div
                          className="rounded-xl border border-border bg-background/40 p-4"
                          key={rating.label}
                        >
                          <dt className="text-xs text-muted">{rating.label}</dt>
                          <dd className="mt-2 text-lg font-semibold">
                            {formatted.value}
                          </dd>
                          <p className="mt-1 text-xs text-muted">
                            {formatted.note}
                          </p>
                        </div>
                      );
                    })}
                  </dl>
                </div>
              </article>
            );
          }),
        )}
      </div>
    </ProfileSection>
  );
}
