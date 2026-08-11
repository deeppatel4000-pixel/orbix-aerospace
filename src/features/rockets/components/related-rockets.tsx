import { GitCompareArrows } from "lucide-react";
import Link from "next/link";

import { ProfileSection } from "@/features/rockets/components/profile-section";
import { RocketImage } from "@/features/rockets/components/rocket-image";
import {
  formatOrbitType,
  formatRocketMeasurement,
} from "@/features/rockets/utils";
import { VehicleMediaFrame } from "@/features/vehicles/components/vehicle-media-frame";
import { VehicleRecordCard } from "@/features/vehicles/components/vehicle-record-card";
import type { Rocket } from "@/features/vehicles/types";

interface RelatedRocketsProps {
  /** Used only for the compare link; never listed among the related cards. */
  currentRocket: Rocket;
  rockets: readonly Rocket[];
}

/**
 * Related launch vehicles, in the Vehicle Discovery language.
 *
 * Same compact primitive as related aircraft, with the portrait media frame
 * and rocket-domain metric — the domains share the card architecture, not the
 * specification schema.
 */
export function RelatedRockets({
  currentRocket,
  rockets,
}: RelatedRocketsProps) {
  return (
    <ProfileSection
      description="Continue into other launch vehicles recorded in the same public registry."
      eyebrow="Registry links"
      id="registry-vehicles"
      mode="media"
      title="Related Launch Vehicles"
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {rockets.map((item) => (
          <VehicleRecordCard
            classification={item.performance.supportedOrbits
              .map(formatOrbitType)
              .join(" · ")}
            description={item.description}
            href={`/rockets/${item.id}`}
            key={item.id}
            media={
              <VehicleMediaFrame aspect="portrait">
                <RocketImage
                  fillContainer
                  imageClassName="saturate-[0.85]"
                  rocket={item}
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 24vw"
                />
              </VehicleMediaFrame>
            }
            name={item.name}
            specs={[
              {
                label: "Liftoff thrust",
                value: formatRocketMeasurement(item.performance.liftoffThrust)
                  .value,
              },
            ]}
            variant="compact"
          />
        ))}
      </div>

      {/* Preserved from the previous implementation: a direct route into the
          comparison workspace, seeded with this vehicle. */}
      <Link
        className="orbix-vehicle-card__cta mt-8 min-h-11"
        href={`/compare?category=rockets&vehicles=${currentRocket.id}`}
      >
        <GitCompareArrows aria-hidden="true" size={16} />
        Compare {currentRocket.name}
      </Link>
    </ProfileSection>
  );
}
