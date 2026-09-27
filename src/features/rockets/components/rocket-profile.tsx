import { ButtonLink } from "@/components/ui/button-link";
import { ArchitecturePanel } from "@/features/rockets/components/architecture-panel";
import { EngineeringNotesPanel } from "@/features/rockets/components/engineering-notes-panel";
import { PerformancePanel } from "@/features/rockets/components/performance-panel";
import { PropulsionPanel } from "@/features/rockets/components/propulsion-panel";
import { RelatedRockets } from "@/features/rockets/components/related-rockets";
import { RocketImage } from "@/features/rockets/components/rocket-image";
import { getRocketVisual, listRockets } from "@/features/rockets/data";
import {
  countRocketStages,
  formatRocketClassification,
  formatRocketFirstFlight,
} from "@/features/rockets/utils";
import { MeasurementTable } from "@/features/vehicles/components/measurement-table";
import { VehicleFigure } from "@/features/vehicles/components/vehicle-figure";
import { VehicleMediaFrame } from "@/features/vehicles/components/vehicle-media-frame";
import { VehiclePageIntro } from "@/features/vehicles/components/vehicle-page-intro";
import { VehicleProfileLayout } from "@/features/vehicles/components/vehicle-profile-layout";
import { VehicleProfileSection } from "@/features/vehicles/components/vehicle-profile-section";
import type { Rocket } from "@/features/vehicles/types";
import { formatCountWord } from "@/features/vehicles/utils/format-measurement";

interface RocketProfileProps {
  rocket: Rocket;
}

const navigation = [
  { id: "overview", label: "Overview" },
  { id: "specifications", label: "Key specifications" },
  { id: "stages", label: "Stages" },
  { id: "propulsion", label: "Propulsion" },
  { id: "performance", label: "Performance" },
  { id: "engineering-notes", label: "Engineering analysis" },
] as const;

/** The `/rockets/[id]` profile (spec 14). */
export function RocketProfile({ rocket }: RocketProfileProps) {
  const visual = getRocketVisual(rocket.id);
  const stageCount = countRocketStages(rocket.stages);
  const engineCount = rocket.stages.reduce(
    (total, stage) =>
      total + stage.engines.reduce((sum, engine) => sum + engine.quantity, 0),
    0,
  );
  const related = listRockets()
    .filter((candidate) => candidate.id !== rocket.id)
    .slice(0, 3);

  return (
    <VehicleProfileLayout
      action={
        <ButtonLink
          className="w-full"
          href={`/compare?category=rockets&vehicles=${rocket.id}`}
          variant="secondary"
        >
          Compare {rocket.name} with other launch vehicles
        </ButtonLink>
      }
      figure={
        <VehicleFigure name={rocket.name} visual={visual}>
          <VehicleMediaFrame aspect="portrait">
            <RocketImage
              fillContainer
              priority
              rocket={rocket}
              sizes="(max-width: 1023px) 100vw, 22rem"
            />
          </VehicleMediaFrame>
        </VehicleFigure>
      }
      intro={
        <VehiclePageIntro
          breadcrumbs={[
            { href: "/", label: "Home" },
            { href: "/rockets", label: "Launch vehicles" },
            { label: rocket.name },
          ]}
          eyebrow={formatRocketClassification(rocket.stages)}
          lead={rocket.description}
          title={rocket.name}
        />
      }
      navigation={navigation}
      related={<RelatedRockets rockets={related} />}
    >
      <VehicleProfileSection id="overview" title="Overview">
        <div className="orbix-prose">
          <p>
            {rocket.name} was developed by {rocket.manufacturer} (
            {rocket.country.name}) and first flew on{" "}
            <time dateTime={rocket.firstFlight}>
              {formatRocketFirstFlight(rocket.firstFlight)}
            </time>
            . It flies in {formatCountWord(stageCount)}{" "}
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
        title="Key specifications"
      >
        <MeasurementTable
          caption={`${rocket.name} key specifications`}
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
