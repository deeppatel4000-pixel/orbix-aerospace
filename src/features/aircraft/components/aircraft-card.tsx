import { AircraftImage } from "@/features/aircraft/components/aircraft-image";
import {
  formatAircraftMeasurement,
  formatAircraftRoles,
  formatFirstFlight,
} from "@/features/aircraft/utils";
import { VehicleMediaFrame } from "@/features/vehicles/components/vehicle-media-frame";
import {
  VehicleRecordCard,
  type VehicleRecordCardVariant,
} from "@/features/vehicles/components/vehicle-record-card";
import type { Aircraft } from "@/features/vehicles/types";

interface AircraftCardProps {
  aircraft: Aircraft;
  className?: string;
  priority?: boolean;
  sizes?: string;
  variant?: VehicleRecordCardVariant;
}

/**
 * Aircraft card link. Key values are maximum speed, service ceiling and
 * first flight: all required fields on `Aircraft`, so none can be missing.
 * The compact variant shows maximum speed only.
 */
export function AircraftCard({
  aircraft,
  className,
  priority = false,
  sizes = "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 22rem",
  variant = "default",
}: AircraftCardProps) {
  return (
    <VehicleRecordCard
      className={className}
      classification={formatAircraftRoles(aircraft.roles)}
      href={`/aircraft/${aircraft.id}`}
      media={
        <VehicleMediaFrame aspect="landscape">
          <AircraftImage
            aircraft={aircraft}
            fillContainer
            priority={priority}
            sizes={sizes}
          />
        </VehicleMediaFrame>
      }
      name={aircraft.name}
      specs={[
        {
          label: "Maximum speed",
          value: formatAircraftMeasurement(aircraft.performance.maxSpeed).value,
        },
        {
          label: "Service ceiling",
          value: formatAircraftMeasurement(aircraft.performance.serviceCeiling)
            .value,
        },
        {
          label: "First flight",
          value: formatFirstFlight(aircraft.firstFlight),
        },
      ]}
      variant={variant}
    />
  );
}
