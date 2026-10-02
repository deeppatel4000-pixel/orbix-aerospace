import { RocketImage } from "@/features/rockets/components/rocket-image";
import { getRocketVisual } from "@/features/rockets/data/rocket-visuals";
import {
  cardThrustText,
  rocketClassification,
} from "@/features/rockets/components/rocket-figures";
import { measurementParts } from "@/features/vehicles/components/measurement-display";
import { VehicleMediaFrame } from "@/features/vehicles/components/vehicle-media-frame";
import {
  VehicleRecordCard,
  type VehicleRecordCardVariant,
  type VehicleSpec,
} from "@/features/vehicles/components/vehicle-record-card";
import type { Rocket } from "@/features/vehicles/types";

interface RocketCardProps {
  className?: string;
  /**
   * `stacked` (default): the registry's open grid, a full 3:4 portrait
   * plate with the caption block under it. `row`: a catalog row, as in
   * the related list at the end of a profile.
   */
  layout?: "row" | "stacked";
  /**
   * `photo` (default): the registry photograph. `none`: a text row, where
   * the photograph is already on the page or a page away (the related list
   * on a profile), so no photograph repeats.
   */
  media?: "none" | "photo";
  priority?: boolean;
  rocket: Rocket;
  sizes?: string;
  variant?: VehicleRecordCardVariant;
}

/** Card thrust in MN split into value and unit: "22.8" and "MN". */
function thrustSpecParts(thrust: Rocket["performance"]["liftoffThrust"]) {
  const [value, unit] = cardThrustText(thrust).split(" ");
  return { unit, value: value ?? "" };
}

/**
 * Liftoff thrust in MN (so every entry reads in one unit; the registry note
 * says it is converted) and height as published. Both are required fields
 * on `Rocket`.
 */
function entrySpecs(rocket: Rocket): VehicleSpec[] {
  return [
    {
      label: "Liftoff thrust",
      ...thrustSpecParts(rocket.performance.liftoffThrust),
    },
    { label: "Height", ...measurementParts(rocket.dimensions.height) },
  ];
}

/**
 * A launch vehicle entry (spec 6, 11): a 3:4 portrait photograph framed so
 * the whole vehicle shows, the stage arrangement and reuse, the name, the
 * one-line `cardSummary` from the visual record, and liftoff thrust and
 * height.
 */
export function RocketCard({
  className,
  layout = "stacked",
  media = "photo",
  priority = false,
  rocket,
  sizes,
  variant = "default",
}: RocketCardProps) {
  const visual = getRocketVisual(rocket.id);
  const classification = rocketClassification(rocket);

  return (
    <VehicleRecordCard
      className={className}
      classification={
        classification.charAt(0).toLocaleUpperCase("en-US") +
        classification.slice(1)
      }
      href={`/rockets/${rocket.id}`}
      layout={layout}
      media={
        media === "none" ? null : (
          <VehicleMediaFrame aspect="tall" settle>
            <RocketImage
              decorative
              fillContainer
              framing="card"
              priority={priority}
              rocket={rocket}
              sizes={
                sizes ??
                (layout === "row"
                  ? "(min-width: 48rem) 5.5rem, 4.5rem"
                  : "(max-width: 639px) 4.5rem, (max-width: 1279px) 33vw, 14rem")
              }
            />
          </VehicleMediaFrame>
        )
      }
      name={rocket.name}
      shortName={visual?.cardName}
      specs={entrySpecs(rocket)}
      summary={visual?.cardSummary}
      thumb="portrait"
      variant={variant}
    />
  );
}
