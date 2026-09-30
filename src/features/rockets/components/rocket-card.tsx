import { RocketImage } from "@/features/rockets/components/rocket-image";
import { getRocketVisual } from "@/features/rockets/data/rocket-visuals";
import {
  cardThrustText,
  maxPayloadTo,
  payloadConfiguration,
  payloadLabel,
  rocketClassification,
  thrustText,
} from "@/features/rockets/components/rocket-figures";
import {
  measurementParts,
  panelSecondary,
  qualifiedFigure,
} from "@/features/vehicles/components/measurement-display";
import { VehicleMediaFrame } from "@/features/vehicles/components/vehicle-media-frame";
import {
  VehicleRecordCard,
  type VehicleRecordCardLayout,
  type VehicleRecordCardVariant,
  type VehicleSpec,
} from "@/features/vehicles/components/vehicle-record-card";
import type { PayloadCapability, Rocket } from "@/features/vehicles/types";

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
  return rocketClassification(rocket)
    .split(/\s*,\s*/)
    .map((part) => part.charAt(0).toLocaleUpperCase("en-US") + part.slice(1));
}

/** Card thrust in MN split into value and unit: "22.8" and "MN". */
function thrustSpecParts(thrust: Rocket["performance"]["liftoffThrust"]) {
  const [value, unit] = cardThrustText(thrust).split(" ");
  return { unit, value: value ?? "" };
}

/**
 * The two-spec row of a stacked card: thrust in MN and height, value and
 * unit apart as on the feature card, so every figure on the registry has
 * one unit treatment.
 */
function stackedSpecs(rocket: Rocket): VehicleSpec[] {
  return [
    {
      label: "Liftoff thrust",
      ...thrustSpecParts(rocket.performance.liftoffThrust),
    },
    { label: "Height", ...measurementParts(rocket.dimensions.height) },
  ];
}

function payloadSpec(capability: PayloadCapability): VehicleSpec {
  return {
    label: payloadLabel(capability),
    ...measurementParts(capability.mass),
    secondary: panelSecondary(
      capability.mass,
      payloadConfiguration(capability),
    ),
  };
}

/**
 * The feature card's readouts, value and unit apart (as on the stacked
 * cards) with the other unit and the qualifier under each: thrust in MN over the published figure,
 * height, payload to LEO and GTO with their configuration, liftoff mass
 * and the first-flight year. Kept to an even count, so the 2x2 or 2x3
 * block has no empty cell.
 */
function featureSpecs(rocket: Rocket): VehicleSpec[] {
  const thrust = rocket.performance.liftoffThrust;
  const leo = maxPayloadTo(rocket, "LEO");
  const gto = maxPayloadTo(rocket, "GTO");
  const specs: VehicleSpec[] = [
    {
      label: "Liftoff thrust",
      // The figure as the source published it, with its qualifier.
      secondary: qualifiedFigure(thrustText(thrust), thrust),
      ...thrustSpecParts(thrust),
    },
    {
      label: "Height",
      ...measurementParts(rocket.dimensions.height),
      secondary: panelSecondary(rocket.dimensions.height),
    },
    ...(leo ? [payloadSpec(leo)] : []),
    ...(gto ? [payloadSpec(gto)] : []),
    {
      label: "Liftoff mass",
      ...measurementParts(rocket.mass.liftoff),
      secondary: panelSecondary(rocket.mass.liftoff),
    },
    { label: "First flight", value: rocket.firstFlight.slice(0, 4) },
  ];
  return specs.length % 2 === 0 ? specs : specs.slice(0, -1);
}

/**
 * Launch vehicle card link (spec 8): a 3:4 portrait photograph framed so the
 * whole vehicle shows, the stage arrangement, the name, the one-line
 * `cardSummary` from the visual record and a two-spec row of liftoff thrust
 * (in meganewtons, so every card in a grid reads in one unit) and height,
 * both required fields on `Rocket`. The feature card adds the record's
 * description (from 48rem, in place of the summary) and up to six
 * readouts (`featureSpecs`). Stacked cards may crop their portrait
 * photograph at the sides to fill a taller row (`mediaStretch`).
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

  return (
    <VehicleRecordCard
      className={className}
      classification={classificationLines(rocket)}
      description={isFeature ? rocket.description : undefined}
      href={`/rockets/${rocket.id}`}
      layout={isFeature ? "feature-portrait" : "stacked"}
      mediaStretch
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
      specs={isFeature ? featureSpecs(rocket) : stackedSpecs(rocket)}
      summary={visual?.cardSummary}
      variant={variant}
    />
  );
}
