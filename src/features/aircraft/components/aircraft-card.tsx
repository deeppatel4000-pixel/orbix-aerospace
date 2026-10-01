import { AircraftImage } from "@/features/aircraft/components/aircraft-image";
import { getAircraftVisual } from "@/features/aircraft/data/aircraft-visuals";
import { formatAircraftRoles } from "@/features/aircraft/utils";
import { measurementFigure } from "@/features/vehicles/components/measurement-display";
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
  /** `row` in the registry and related lists; `stacked` elsewhere. */
  layout?: VehicleRecordCardLayout;
  /**
   * `photo` (default): the registry photograph. `none`: a text row, where
   * the photograph is already on the page or a page away (the related list
   * on a profile), so no photograph repeats.
   */
  media?: "none" | "photo";
  priority?: boolean;
  sizes?: string;
  variant?: VehicleRecordCardVariant;
}

/**
 * An aircraft entry (spec 6): a 16:10 photograph, the roles, the name, the
 * one-line `cardSummary` from the visual record, and maximum speed and
 * service ceiling. Both are required fields on `Aircraft`, so neither can
 * be missing. A published minimum carries a plus sign.
 */
export function AircraftCard({
  aircraft,
  className,
  layout = "row",
  media = "photo",
  priority = false,
  sizes,
  variant = "default",
}: AircraftCardProps) {
  const { maxSpeed, serviceCeiling } = aircraft.performance;
  const isRow = layout === "row";

  return (
    <VehicleRecordCard
      className={className}
      classification={formatAircraftRoles(aircraft.roles)}
      href={`/aircraft/${aircraft.id}`}
      layout={layout}
      media={
        media === "none" ? null : (
          <VehicleMediaFrame aspect="wide" settle>
            <AircraftImage
              aircraft={aircraft}
              decorative
              fillContainer
              framing="card"
              priority={priority}
              sizes={
                sizes ??
                (isRow
                  ? "(min-width: 48rem) 11rem, (min-width: 40rem) 9rem, 6.5rem"
                  : "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 23rem")
              }
            />
          </VehicleMediaFrame>
        )
      }
      name={aircraft.name}
      specs={[
        {
          label: "Maximum speed",
          ...measurementFigure(maxSpeed, "text-[0.875em]"),
        },
        { label: "Service ceiling", ...measurementFigure(serviceCeiling) },
      ]}
      summary={getAircraftVisual(aircraft.id)?.cardSummary}
      variant={variant}
    />
  );
}
