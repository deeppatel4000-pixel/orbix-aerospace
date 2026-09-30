import { RocketImage } from "@/features/rockets/components/rocket-image";
import { getRocketVisual } from "@/features/rockets/data/rocket-visuals";
import {
  countRocketEngines,
  maxPayloadTo,
  payloadConfiguration,
  payloadLabel,
  thrustText,
} from "@/features/rockets/components/rocket-figures";
import { formatRocketClassification } from "@/features/rockets/utils";
import {
  qualifiedFigure,
  recordText,
} from "@/features/vehicles/components/measurement-display";
import { VehicleMediaFrame } from "@/features/vehicles/components/vehicle-media-frame";
import {
  VehicleRecordCard,
  type VehicleRecordCardLayout,
  type VehicleRecordCardVariant,
} from "@/features/vehicles/components/vehicle-record-card";
import type { Rocket } from "@/features/vehicles/types";

interface RocketCardProps {
  className?: string;
  /**
   * `feature` for the first registry card, which spans two columns: from
   * 64rem the photograph fills the left half at the row's height, beside
   * the text.
   */
  layout?: Extract<VehicleRecordCardLayout, "feature" | "stacked">;
  priority?: boolean;
  rocket: Rocket;
  sizes?: string;
  variant?: VehicleRecordCardVariant;
}

/**
 * "Two-stage launch vehicle" over "Partially reusable": two deliberate
 * lines rather than one slash-joined line that wraps at the slash.
 */
function classificationLines(rocket: Rocket) {
  return formatRocketClassification(rocket.stages)
    .split(/\s*,\s*/)
    .map((part) => part.charAt(0).toLocaleUpperCase("en-US") + part.slice(1));
}

/**
 * Launch vehicle card link (spec 8): a 3:4 portrait photograph framed so the
 * whole vehicle shows, the stage arrangement, the name, the one-line
 * `cardSummary` from the visual record and a two-spec row of liftoff thrust
 * (in the published unit) and height, both required fields on `Rocket`.
 * The feature card adds the record's description (from 64rem, in place of
 * the summary), the payload to LEO and to GTO (where published) with their configurations,
 * the first-flight year and the engine count across all stages; the
 * classification line already gives the stage count.
 */
export function RocketCard({
  className,
  layout = "stacked",
  priority = false,
  rocket,
  sizes,
  variant = "default",
}: RocketCardProps) {
  const isFeature = layout === "feature";
  const visual = getRocketVisual(rocket.id);
  const leo = maxPayloadTo(rocket, "LEO");
  const gto = maxPayloadTo(rocket, "GTO");
  const hasSolidMotors = rocket.stages.some((stage) =>
    stage.engines.some((engine) => engine.cycle === "solid"),
  );

  return (
    <VehicleRecordCard
      className={className}
      classification={classificationLines(rocket)}
      description={isFeature ? rocket.description : undefined}
      href={`/rockets/${rocket.id}`}
      layout={isFeature ? "feature-portrait" : "stacked"}
      media={
        <VehicleMediaFrame aspect="tall" settle>
          <RocketImage
            decorative
            fillContainer
            framing={isFeature ? "feature" : "card"}
            priority={priority}
            rocket={rocket}
            sizes={
              // The feature photograph is half of a two-column card from
              // 64rem, about as wide as one column.
              sizes ??
              "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 23rem"
            }
          />
        </VehicleMediaFrame>
      }
      name={rocket.name}
      shortName={visual?.cardName}
      specs={[
        {
          label: "Liftoff thrust",
          value: thrustText(rocket.performance.liftoffThrust),
        },
        { label: "Height", value: recordText(rocket.dimensions.height) },
        // The feature card's further figures, from 64rem.
        ...(leo
          ? [
              {
                label: payloadLabel(leo),
                value: qualifiedFigure(
                  recordText(leo.mass),
                  undefined,
                  payloadConfiguration(leo),
                ),
              },
            ]
          : []),
        { label: "First flight", value: rocket.firstFlight.slice(0, 4) },
        // The fifth and sixth, only in the feature card.
        ...(gto
          ? [
              {
                label: payloadLabel(gto),
                value: qualifiedFigure(
                  recordText(gto.mass),
                  undefined,
                  payloadConfiguration(gto),
                ),
              },
            ]
          : []),
        {
          label: hasSolidMotors ? "Engines and motors" : "Engines",
          value: String(countRocketEngines(rocket)),
        },
      ]}
      summary={visual?.cardSummary}
      variant={variant}
    />
  );
}
