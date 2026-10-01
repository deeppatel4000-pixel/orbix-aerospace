import { ButtonLink } from "@/components/ui/button-link";
import { ArchitecturePanel } from "@/features/rockets/components/architecture-panel";
import { EngineeringNotesPanel } from "@/features/rockets/components/engineering-notes-panel";
import { PerformancePanel } from "@/features/rockets/components/performance-panel";
import { PropulsionPanel } from "@/features/rockets/components/propulsion-panel";
import { RelatedRockets } from "@/features/rockets/components/related-rockets";
import {
  countRocketEngines,
  maxPayloadTo,
  payloadConfiguration,
  payloadLabel,
  rocketClassification,
  thrustParts,
} from "@/features/rockets/components/rocket-figures";
import { getRocketVisual, listRockets } from "@/features/rockets/data";
import {
  countRocketStages,
  formatRocketFirstFlight,
} from "@/features/rockets/utils";
import {
  CONVERSION_NOTE,
  joinTableNotes,
  UNMARKED_NOTE,
  measurementParts,
} from "@/features/vehicles/components/measurement-display";
import { MeasurementTable } from "@/features/vehicles/components/measurement-table";
import {
  VehicleFactsTable,
  type VehicleFact,
} from "@/features/vehicles/components/vehicle-facts-table";
import { VehicleProfileHero } from "@/features/vehicles/components/vehicle-profile-hero";
import { VehicleProfileLayout } from "@/features/vehicles/components/vehicle-profile-layout";
import { VehicleProfileSection } from "@/features/vehicles/components/vehicle-profile-section";
import type { PayloadCapability, Rocket } from "@/features/vehicles/types";

interface RocketProfileProps {
  rocket: Rocket;
}

const navigation = [
  { id: "overview", label: "Overview" },
  { id: "specifications", label: "Specifications" },
  { id: "stages", label: "Stages" },
  { id: "propulsion", label: "Propulsion" },
  { id: "performance", label: "Performance" },
  { id: "engineering-notes", label: "Engineering analysis" },
] as const;

/**
 * The payload figure for the hero record row, with the configuration it was
 * published for on the line under the value, so the label stays "Payload
 * to LEO" on one line.
 */
function payloadRecord(leo: PayloadCapability) {
  return {
    label: payloadLabel(leo),
    ...measurementParts(leo.mass),
    secondary: payloadConfiguration(leo),
  };
}

/**
 * The Overview facts, each taken from the record. The engine count covers
 * every stage element, boosters included, and says "engines and motors"
 * when a stage burns solid motors.
 */
function overviewFacts(rocket: Rocket): VehicleFact[] {
  const stageCount = countRocketStages(rocket.stages);
  const hasSolidMotors = rocket.stages.some((stage) =>
    stage.engines.some((engine) => engine.cycle === "solid"),
  );
  return [
    { label: "Manufacturer", value: rocket.manufacturer },
    { label: "Country", value: rocket.country.name },
    {
      label: "First flight",
      value: (
        <time dateTime={rocket.firstFlight}>
          {formatRocketFirstFlight(rocket.firstFlight)}
        </time>
      ),
    },
    { label: "Stages", value: String(stageCount) },
    {
      label: hasSolidMotors ? "Engines and motors" : "Engines",
      value: `${countRocketEngines(rocket)} in total`,
    },
  ];
}

/** The `/rockets/[id]` profile (spec 11). */
export function RocketProfile({ rocket }: RocketProfileProps) {
  const visual = getRocketVisual(rocket.id);
  const leo = maxPayloadTo(rocket, "LEO");
  const related = listRockets()
    .filter((candidate) => candidate.id !== rocket.id)
    .slice(0, 3);

  return (
    <VehicleProfileLayout
      hero={
        <VehicleProfileHero
          action={
            <ButtonLink
              arrow="right"
              href={`/compare?category=rockets&vehicles=${rocket.id}`}
              variant="secondary"
              className="max-sm:w-full max-sm:justify-between"
            >
              {/* Shortened below 64rem so the button stays on one line; the
                  hidden words leave the accessible name with it. */}
              <span>
                Compare {rocket.name}
                <span className="max-lg:hidden">
                  {" "}
                  with other launch vehicles
                </span>
              </span>
            </ButtonLink>
          }
          breadcrumbs={[
            { href: "/", label: "Home" },
            { href: "/rockets", label: "Launch vehicles" },
            { label: rocket.name },
          ]}
          classification={rocketClassification(rocket)}
          lead={rocket.description}
          name={rocket.name}
          photo="portrait"
          record={[
            { label: "Height", ...measurementParts(rocket.dimensions.height) },
            {
              label: "Liftoff thrust",
              ...thrustParts(rocket.performance.liftoffThrust),
            },
            ...(leo ? [payloadRecord(leo)] : []),
            { label: "First flight", value: rocket.firstFlight.slice(0, 4) },
          ]}
          visual={
            visual
              ? {
                  ...visual,
                  ...visual.profilePlate,
                  crop: {
                    base: visual.heroPhoneObjectPosition,
                    lg: visual.heroObjectPosition,
                  },
                }
              : undefined
          }
        />
      }
      navigation={navigation}
      related={<RelatedRockets rockets={related} />}
    >
      {/* The hero shows the whole rocket, so it is not repeated. */}
      <VehicleProfileSection id="overview" title="Overview">
        <VehicleFactsTable facts={overviewFacts(rocket)} />
      </VehicleProfileSection>

      <VehicleProfileSection
        description="Size, mass and thrust at liftoff as published, with the basis of each figure."
        id="specifications"
        title="Specifications"
      >
        <MeasurementTable
          caption={`${rocket.name} key specifications`}
          note={joinTableNotes(CONVERSION_NOTE, UNMARKED_NOTE)}
          rows={[
            { label: "Height", measurement: rocket.dimensions.height },
            { label: "Liftoff mass", measurement: rocket.mass.liftoff },
            {
              label: "Liftoff thrust",
              measurement: rocket.performance.liftoffThrust,
            },
          ]}
        />
      </VehicleProfileSection>

      <ArchitecturePanel name={rocket.name} stages={rocket.stages} />
      <PropulsionPanel name={rocket.name} stages={rocket.stages} />
      <PerformancePanel name={rocket.name} performance={rocket.performance} />
      <EngineeringNotesPanel notes={rocket.engineeringAnalysis} />
    </VehicleProfileLayout>
  );
}
