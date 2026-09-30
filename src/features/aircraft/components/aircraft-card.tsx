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
 * `Aircraft`, so neither can be missing. The feature card (the photograph
 * on the left half of a two-column card, the text on the right) adds the
 * description, range and the first-flight year from 64rem. A published
 * minimum carries a plus sign.
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
        <VehicleMediaFrame aspect="wide" settle>
          <AircraftImage
            aircraft={aircraft}
            decorative
            fillContainer
            framing={isFeature ? "feature" : "card"}
            priority={priority}
            sizes={
              // The feature photograph is half of a two-column card from
              // 40rem, about as wide as one column.
              sizes ??
              "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 23rem"
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
          // "Service ceiling" wraps in a 1024px three-column card; the
          // profile and the hero give the full term.
          label: "Ceiling",
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
