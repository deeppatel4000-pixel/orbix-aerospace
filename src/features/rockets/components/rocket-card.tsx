import { RocketImage } from "@/features/rockets/components/rocket-image";
import {
  formatOrbitType,
  formatRocketMeasurement,
} from "@/features/rockets/utils";
import { VehicleMediaFrame } from "@/features/vehicles/components/vehicle-media-frame";
import { VehicleRecordCard } from "@/features/vehicles/components/vehicle-record-card";
import type { Rocket } from "@/features/vehicles/types";

interface RocketCardProps {
  className?: string;
  priority?: boolean;
  rocket: Rocket;
  sizes?: string;
}

/**
 * Launch-vehicle adapter over the shared vehicle record card.
 *
 * Same card architecture as aircraft, two domain differences:
 *
 * 1. A PORTRAIT media frame. Launch vehicles are vertical subjects and their
 *    sources measure 0.67-1.00; the landscape frame used for aircraft cropped
 *    them through the middle.
 * 2. Domain-appropriate specs — liftoff thrust and stage count, rather than
 *    an aircraft's speed and ceiling. Both are required fields on `Rocket`,
 *    so neither can render as absent or zero.
 *
 * The classification line uses supported orbits, which is what actually
 * separates one launch vehicle from another during discovery.
 */
export function RocketCard({
  className,
  priority = false,
  rocket,
  sizes = "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw",
}: RocketCardProps) {
  const liftoffThrust = formatRocketMeasurement(
    rocket.performance.liftoffThrust,
  );
  const stageCount = rocket.stages.length;

  return (
    <VehicleRecordCard
      className={className}
      classification={rocket.performance.supportedOrbits
        .map(formatOrbitType)
        .join(" · ")}
      description={rocket.description}
      href={`/rockets/${rocket.id}`}
      media={
        <VehicleMediaFrame aspect="portrait">
          <RocketImage
            fillContainer
            imageClassName="saturate-[0.85]"
            priority={priority}
            rocket={rocket}
            sizes={sizes}
          />
        </VehicleMediaFrame>
      }
      name={rocket.name}
      specs={[
        { label: "Liftoff thrust", value: liftoffThrust.value },
        {
          label: "Stages",
          value: `${stageCount}`,
        },
      ]}
    />
  );
}
