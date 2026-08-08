import Link from "next/link";
import { ArrowUpRight, GitCompareArrows } from "lucide-react";

import { ProfileSection } from "@/features/rockets/components/profile-section";
import { RocketImage } from "@/features/rockets/components/rocket-image";
import { formatRocketMeasurement } from "@/features/rockets/utils";
import type { Rocket } from "@/features/vehicles/types";

interface RelatedRocketsProps {
  currentRocket: Rocket;
  rockets: readonly Rocket[];
}

export function RelatedRockets({
  currentRocket,
  rockets,
}: RelatedRocketsProps) {
  return (
    <ProfileSection
      description="Continue through the launch-vehicle registry or open the existing comparison workflow with this vehicle preselected."
      eyebrow="08 // Registry navigation"
      id="registry-vehicles"
      title="Continue the Registry"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {rockets.map((rocket) => {
          const thrust = formatRocketMeasurement(
            rocket.performance.liftoffThrust,
          );

          return (
            <Link
              aria-label={`Open ${rocket.name} launch vehicle profile`}
              className="group orbix-frame overflow-hidden border-atmosphere/25 bg-[#070c14] transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-1 hover:border-signal/45 hover:shadow-[0_18px_45px_rgb(0_0_0/0.32)] focus-visible:border-signal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal motion-reduce:transform-none motion-reduce:transition-none"
              href={`/rockets/${rocket.id}`}
              key={rocket.id}
            >
              <RocketImage
                className="aspect-[16/10] border-b border-atmosphere/20"
                imageClassName="saturate-[0.86] contrast-[1.04]"
                rocket={rocket}
                sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 22vw"
              />
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[0.56rem] tracking-[0.12em] text-signal uppercase">
                      Launch vehicle
                    </p>
                    <h3 className="font-display mt-1.5 text-lg font-semibold">
                      {rocket.name}
                    </h3>
                  </div>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="mt-1 text-muted transition-colors group-hover:text-signal group-focus-visible:text-signal"
                    size={16}
                  />
                </div>
                <p className="orbix-telemetry-value mt-4 border-t border-atmosphere/15 pt-3 text-xs text-muted">
                  {thrust.value} liftoff
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <Link
        className="mt-5 inline-flex min-h-11 items-center gap-2 border border-accent/35 bg-accent/8 px-4 py-2.5 text-sm font-semibold text-accent transition-colors hover:border-accent hover:bg-accent/14 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        href={`/compare?category=rockets&vehicles=${currentRocket.id}`}
      >
        <GitCompareArrows aria-hidden="true" size={16} />
        Compare {currentRocket.name}
      </Link>
    </ProfileSection>
  );
}
