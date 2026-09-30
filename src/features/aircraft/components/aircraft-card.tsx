import { AircraftImage } from "@/features/aircraft/components/aircraft-image";
import { getAircraftVisual } from "@/features/aircraft/data/aircraft-visuals";
import { formatAircraftRoles } from "@/features/aircraft/utils";
import {
  measurementParts,
  panelSecondary,
} from "@/features/vehicles/components/measurement-display";
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
  /**
   * A stacked card in the feature card's row: four figures from 64rem, so
   * it ends on the same baseline as the feature card beside it.
   */
  leadRow?: boolean;
  priority?: boolean;
  sizes?: string;
  variant?: VehicleRecordCardVariant;
}

/**
 * Aircraft card link (spec 8): a 16:10 photograph, the roles, the name, the
 * one-line `cardSummary` from the visual record and a two-spec row of
 * maximum speed and service ceiling. Both are required fields on
 * `Aircraft`, so neither can be missing. The feature card (the photograph
 * across a two-column card at 2:1, the text in two columns under it) adds
 * the description, range and the first-flight year from 48rem. A published
 * minimum carries a plus sign.
 */
export function AircraftCard({
  aircraft,
  className,
  layout = "stacked",
  leadRow = false,
  priority = false,
  sizes,
  variant = "default",
}: AircraftCardProps) {
  const isFeature = layout === "feature";
  const { maxSpeed, range, serviceCeiling } = aircraft.performance;

  return (
    <VehicleRecordCard
      className={className}
      classification={formatAircraftRoles(aircraft.roles)}
      description={isFeature ? aircraft.description : undefined}
      href={`/aircraft/${aircraft.id}`}
      layout={layout}
      leadRow={leadRow}
      media={
        <VehicleMediaFrame aspect="wide" settle>
          <AircraftImage
            aircraft={aircraft}
            decorative
            fillContainer
            framing={isFeature ? "feature" : "card"}
            priority={priority}
            sizes={
              // The feature photograph runs across a two-column card from
              // 40rem.
              sizes ??
              (isFeature
                ? "(max-width: 1023px) 100vw, 46rem"
                : "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 23rem")
            }
          />
        </VehicleMediaFrame>
      }
      name={aircraft.name}
      specs={[
        {
          label: "Maximum speed",
          secondary: panelSecondary(maxSpeed),
          ...measurementParts(maxSpeed),
        },
        {
          // "Service ceiling" wraps in a 1024px three-column card; the
          // profile and the hero give the full term.
          label: "Ceiling",
          secondary: panelSecondary(serviceCeiling),
          ...measurementParts(serviceCeiling),
        },
        // The third and fourth figures of the feature card (from 48rem)
        // and of the card beside it (from 64rem).
        {
          label: "Range",
          secondary: panelSecondary(range),
          ...measurementParts(range),
        },
        { label: "First flight", value: aircraft.firstFlight.slice(0, 4) },
      ]}
      summary={getAircraftVisual(aircraft.id)?.cardSummary}
      variant={variant}
    />
  );
}
