import { RocketImage } from "@/features/rockets/components/rocket-image";
import {
  countRocketStages,
  formatRocketClassification,
  formatRocketMeasurement,
} from "@/features/rockets/utils";
import { VehicleMediaFrame } from "@/features/vehicles/components/vehicle-media-frame";
import {
  VehicleRecordCard,
  type VehicleRecordCardVariant,
} from "@/features/vehicles/components/vehicle-record-card";
import type { Rocket } from "@/features/vehicles/types";

interface RocketCardProps {
  className?: string;
  priority?: boolean;
  rocket: Rocket;
  sizes?: string;
  variant?: VehicleRecordCardVariant;
}

/**
 * Launch vehicle card link. Key values are liftoff thrust, height and the
 * number of stages in the flight sequence: all derived from required fields
 * on `Rocket`. The compact variant shows liftoff thrust only.
 */
export function RocketCard({
  className,
  priority = false,
  rocket,
  sizes = "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 22rem",
  variant = "default",
}: RocketCardProps) {
  return (
    <VehicleRecordCard
      className={className}
      classification={formatRocketClassification(rocket.stages)}
      href={`/rockets/${rocket.id}`}
      media={
        <VehicleMediaFrame aspect="landscape">
          <RocketImage
            fillContainer
            priority={priority}
            rocket={rocket}
            sizes={sizes}
          />
        </VehicleMediaFrame>
      }
      name={rocket.name}
      specs={[
        {
          label: "Liftoff thrust",
          value: formatRocketMeasurement(rocket.performance.liftoffThrust)
            .value,
        },
        {
          label: "Height",
          value: formatRocketMeasurement(rocket.dimensions.height).value,
        },
        { label: "Stages", value: String(countRocketStages(rocket.stages)) },
      ]}
      variant={variant}
    />
  );
}
