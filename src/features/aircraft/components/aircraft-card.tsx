import { AircraftImage } from "@/features/aircraft/components/aircraft-image";
import { getAircraftVisual } from "@/features/aircraft/data/aircraft-visuals";
import { formatAircraftRoles } from "@/features/aircraft/utils";
import { recordText } from "@/features/vehicles/components/measurement-display";
import { VehicleMediaFrame } from "@/features/vehicles/components/vehicle-media-frame";
import {
  VehicleRecordCard,
  type VehicleRecordCardLayout,
  type VehicleRecordCardVariant,
} from "@/features/vehicles/components/vehicle-record-card";
import type { Aircraft } from "@/features/vehicles/types";

interface AircraftCardProps {
  aircraft: Aircraft;
  className?: string;
  /** `feature` for the first registry card, which spans two columns. */
  layout?: VehicleRecordCardLayout;
  priority?: boolean;
  sizes?: string;
  variant?: VehicleRecordCardVariant;
}

/**
 * Aircraft card link (spec 8): a 16:10 photograph, the roles, the name, the
 * one-line `cardSummary` from the visual record and a two-spec row of
 * maximum speed and service ceiling. Both are required fields on
 * `Aircraft`, so neither can be missing. The feature card (a 16:10
 * photograph across two columns, the text and figures below it) adds range
 * and the first-flight year. A published minimum carries a plus sign.
 */
export function AircraftCard({
  aircraft,
  className,
  layout = "stacked",
  priority = false,
  sizes,
  variant = "default",
}: AircraftCardProps) {
  const isFeature = layout === "feature";

  return (
    <VehicleRecordCard
      className={className}
      classification={formatAircraftRoles(aircraft.roles)}
      description={isFeature ? aircraft.description : undefined}
      href={`/aircraft/${aircraft.id}`}
      layout={layout}
      media={
        <VehicleMediaFrame aspect="wide">
          <AircraftImage
            aircraft={aircraft}
            decorative
            fillContainer
            framing={isFeature ? "feature" : "card"}
            priority={priority}
            sizes={
              sizes ??
              (isFeature
                ? "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 48rem"
                : "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 23rem")
            }
          />
        </VehicleMediaFrame>
      }
      name={aircraft.name}
      specs={[
        {
          label: "Maximum speed",
          value: recordText(aircraft.performance.maxSpeed),
        },
        {
          label: "Service ceiling",
          value: recordText(aircraft.performance.serviceCeiling),
        },
        // The feature card's third and fourth figures, from 64rem.
        { label: "Range", value: recordText(aircraft.performance.range) },
        { label: "First flight", value: aircraft.firstFlight.slice(0, 4) },
      ]}
      summary={getAircraftVisual(aircraft.id)?.cardSummary}
      variant={variant}
    />
  );
}
