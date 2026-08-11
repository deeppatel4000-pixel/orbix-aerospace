import { AircraftImage } from "@/features/aircraft/components/aircraft-image";
import {
  formatAircraftMeasurement,
  formatAircraftRoles,
} from "@/features/aircraft/utils";
import { VehicleMediaFrame } from "@/features/vehicles/components/vehicle-media-frame";
import { VehicleRecordCard } from "@/features/vehicles/components/vehicle-record-card";
import type { Aircraft } from "@/features/vehicles/types";

interface AircraftCardProps {
  aircraft: Aircraft;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

/**
 * Aircraft adapter over the shared vehicle record card.
 *
 * The card architecture is shared; only the domain slots differ. Discovery
 * specs are maximum speed and service ceiling — the two figures that most
 * distinguish one airframe from another at a glance, and both are REQUIRED
 * fields on `Aircraft`, so nothing here can render an absent value.
 *
 * The previous card additionally showed manufacturer, origin, first flight,
 * powerplant, and a hardcoded "Generation: Not recorded" row. That last one
 * displayed a placeholder for a field the dataset does not model at all;
 * it is removed rather than reproduced. The rest belong on the profile, which
 * is where they already appear.
 */
export function AircraftCard({
  aircraft,
  className,
  priority = false,
  sizes = "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw",
}: AircraftCardProps) {
  const maxSpeed = formatAircraftMeasurement(aircraft.performance.maxSpeed);
  const ceiling = formatAircraftMeasurement(
    aircraft.performance.serviceCeiling,
  );

  return (
    <VehicleRecordCard
      className={className}
      classification={formatAircraftRoles(aircraft.roles)}
      description={aircraft.description}
      href={`/aircraft/${aircraft.id}`}
      media={
        <VehicleMediaFrame aspect="landscape">
          <AircraftImage
            aircraft={aircraft}
            fillContainer
            imageClassName="saturate-[0.85]"
            priority={priority}
            sizes={sizes}
          />
        </VehicleMediaFrame>
      }
      name={aircraft.name}
      specs={[
        { label: "Maximum speed", value: maxSpeed.value },
        { label: "Service ceiling", value: ceiling.value },
      ]}
    />
  );
}
