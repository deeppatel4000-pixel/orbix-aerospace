import { Cog, Flame } from "lucide-react";

import { ProfileSection } from "@/features/aircraft/components/profile-section";
import {
  formatAircraftEngineType,
  formatAircraftMeasurement,
} from "@/features/aircraft/utils";
import type {
  AircraftEngine,
  AircraftPropulsion,
  ForceMeasurement,
} from "@/features/vehicles/types";

interface PropulsionPanelProps {
  propulsion: AircraftPropulsion;
}

interface ThrustRating {
  label: string;
  measurement: ForceMeasurement;
}

function getThrustRatings(engine: AircraftEngine): readonly ThrustRating[] {
  const ratings: ThrustRating[] = [];

  if (engine.thrust.dry) {
    ratings.push({ label: "Dry thrust", measurement: engine.thrust.dry });
  }

  if (engine.thrust.maximum) {
    ratings.push({
      label: "Maximum thrust",
      measurement: engine.thrust.maximum,
    });
  }

  if (engine.thrust.afterburner) {
    ratings.push({
      label: "Afterburning thrust",
      measurement: engine.thrust.afterburner,
    });
  }

  return ratings;
}

export function PropulsionPanel({ propulsion }: PropulsionPanelProps) {
  return (
    <ProfileSection
      description="Installed engine configuration and the published thrust ratings available in the dataset."
      eyebrow="06 // Powerplant"
      id="powerplant"
      title="Powerplant"
    >
      <div className="space-y-4">
        {propulsion.engines.map((engine) => {
          const thrustRatings = getThrustRatings(engine);

          return (
            <article
              className="orbix-frame overflow-hidden border-tactical/25 bg-[#080d0c]/90"
              key={engine.id}
            >
              <div className="orbix-carbon flex flex-col gap-5 border-b border-tactical/25 bg-black/25 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 items-center justify-center border border-tactical-amber/25 bg-tactical-amber/8 text-tactical-amber">
                    <Cog aria-hidden="true" size={21} strokeWidth={1.7} />
                  </span>
                  <div>
                    <p className="font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                      Installed engine
                    </p>
                    <h3 className="font-display mt-1 text-xl font-semibold sm:text-2xl">
                      {engine.name}
                    </h3>
                  </div>
                </div>
                <span className="self-start border border-tactical-amber/25 px-3 py-1.5 font-mono text-[0.62rem] tracking-[0.1em] text-tactical-amber uppercase sm:self-auto">
                  {engine.quantity} installed
                </span>
              </div>

              <dl className="grid gap-px bg-tactical/20 sm:grid-cols-2">
                <div className="bg-[#0a100f] px-5 py-4 sm:px-6">
                  <dt className="font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                    Manufacturer
                  </dt>
                  <dd className="mt-2 text-sm font-medium">
                    {engine.manufacturer}
                  </dd>
                </div>
                <div className="bg-[#0a100f] px-5 py-4 sm:px-6">
                  <dt className="font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                    Engine type
                  </dt>
                  <dd className="mt-2 text-sm font-medium">
                    {formatAircraftEngineType(engine.type)}
                  </dd>
                </div>
              </dl>

              <div className="p-5 sm:p-6">
                <p className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                  <Flame
                    aria-hidden="true"
                    className="text-tactical-amber"
                    size={15}
                  />
                  Thrust ratings per engine
                </p>
                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  {thrustRatings.map((rating) => {
                    const formatted = formatAircraftMeasurement(
                      rating.measurement,
                    );

                    return (
                      <div
                        className="border border-tactical/20 bg-black/25 p-4"
                        key={rating.label}
                      >
                        <dt className="text-xs text-muted">{rating.label}</dt>
                        <dd className="mt-2 text-lg font-semibold">
                          {formatted.value}
                        </dd>
                        <dd className="mt-1 text-xs text-muted">
                          {formatted.note}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
            </article>
          );
        })}
      </div>
    </ProfileSection>
  );
}
