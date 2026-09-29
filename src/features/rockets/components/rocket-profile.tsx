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
  thrustParts,
} from "@/features/rockets/components/rocket-figures";
import { getRocketVisual, listRockets } from "@/features/rockets/data";
import {
  countRocketStages,
  formatRocketClassification,
  formatRocketFirstFlight,
} from "@/features/rockets/utils";
import {
  CONVERSION_NOTE,
  MINIMUM_NOTE,
  measurementParts,
  qualifiedFigure,
} from "@/features/vehicles/components/measurement-display";
import { MeasurementTable } from "@/features/vehicles/components/measurement-table";
import { VehicleProfileHero } from "@/features/vehicles/components/vehicle-profile-hero";
import { VehicleProfileLayout } from "@/features/vehicles/components/vehicle-profile-layout";
import { VehicleProfileSection } from "@/features/vehicles/components/vehicle-profile-section";
import type { PayloadCapability, Rocket } from "@/features/vehicles/types";
import { formatCountWord } from "@/features/vehicles/utils/format-measurement";

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
 * published for on a line under the value, so the label stays "Payload to
 * LEO" on one line. STOPGAP: `RecordRow` has no second line under a value
 * (raised with T1), so the value and unit are passed as one node, the unit
 * set as `RecordRow` sets its own units.
 */
function payloadRecord(leo: PayloadCapability) {
  const { unit, value } = measurementParts(leo.mass);
  return {
    label: payloadLabel(leo),
    value: qualifiedFigure(
      <>
        {value}
        {unit ? (
          <span className="ml-[0.3em] text-[0.8em] text-muted">{unit}</span>
        ) : null}
      </>,
      undefined,
      payloadConfiguration(leo),
    ),
  };
}

/** The `/rockets/[id]` profile (spec 9). */
export function RocketProfile({ rocket }: RocketProfileProps) {
  const visual = getRocketVisual(rocket.id);
  const stageCount = countRocketStages(rocket.stages);
  const engineCount = countRocketEngines(rocket);
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
              {/* Shortened below 40rem so the button stays on one line; the
                  hidden words leave the accessible name with it. */}
              <span>
                Compare {rocket.name}
                <span className="max-sm:hidden">
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
          classification={formatRocketClassification(rocket.stages)}
          lead={rocket.description}
          name={rocket.name}
          photoPlacement="right"
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
              ? { ...visual, objectPosition: visual.heroObjectPosition }
              : undefined
          }
        />
      }
      navigation={navigation}
      related={<RelatedRockets rockets={related} />}
    >
      {/*
       * The hero already shows the whole rocket, large and unobscured, so
       * the Overview does not repeat the photograph. Overview and
       * Specifications use the same spec-sheet split and full-width rule
       * as every section after them.
       */}
      <VehicleProfileSection
        className="border-t-0"
        id="overview"
        index={1}
        title="Overview"
      >
        <div className="orbix-prose max-w-[68ch]">
          <p>
            {rocket.name} was developed by {rocket.manufacturer} (
            {rocket.country.name}) and first flew on{" "}
            <time dateTime={rocket.firstFlight}>
              {formatRocketFirstFlight(rocket.firstFlight)}
            </time>
            .
          </p>
          <p>
            It flies in {formatCountWord(stageCount)}{" "}
            {stageCount === 1 ? "stage" : "stages"} with{" "}
            {formatCountWord(engineCount)} engines or motors in total across{" "}
            {rocket.stages.length === 1
              ? "one stage element"
              : `${formatCountWord(rocket.stages.length)} stage elements`}
            .
          </p>
        </div>
      </VehicleProfileSection>

      <VehicleProfileSection
        description="Size, mass and thrust at liftoff as published, with the basis of each figure."
        id="specifications"
        index={2}
        title="Specifications"
      >
        <MeasurementTable
          caption={`${rocket.name} key specifications`}
          note={`${CONVERSION_NOTE} ${MINIMUM_NOTE}`}
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

      <ArchitecturePanel index={3} name={rocket.name} stages={rocket.stages} />
      <PropulsionPanel index={4} name={rocket.name} stages={rocket.stages} />
      <PerformancePanel
        index={5}
        name={rocket.name}
        performance={rocket.performance}
      />
      <EngineeringNotesPanel index={6} notes={rocket.engineeringAnalysis} />
    </VehicleProfileLayout>
  );
}
