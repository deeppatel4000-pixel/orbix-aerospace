import { StatusBadge } from "@/components/ui/status-badge";
import { ButtonLink } from "@/components/ui/button-link";
import { AircraftImage } from "@/features/aircraft/components/aircraft-image";
import { EngineeringNotesPanel } from "@/features/aircraft/components/engineering-notes-panel";
import { HistoricalTimeline } from "@/features/aircraft/components/historical-timeline";
import { PerformancePanel } from "@/features/aircraft/components/performance-panel";
import { PropulsionPanel } from "@/features/aircraft/components/propulsion-panel";
import { RelatedAircraft } from "@/features/aircraft/components/related-aircraft";
import { VariantsPanel } from "@/features/aircraft/components/variants-panel";
import { getAircraftVisual, listAircraft } from "@/features/aircraft/data";
import {
  formatAircraftFleetStatus,
  formatAircraftRole,
  formatAircraftRoles,
  formatFirstFlight,
} from "@/features/aircraft/utils";
import { MeasurementTable } from "@/features/vehicles/components/measurement-table";
import { VehicleFigure } from "@/features/vehicles/components/vehicle-figure";
import { VehicleMediaFrame } from "@/features/vehicles/components/vehicle-media-frame";
import { VehiclePageIntro } from "@/features/vehicles/components/vehicle-page-intro";
import { VehicleProfileLayout } from "@/features/vehicles/components/vehicle-profile-layout";
import { VehicleProfileSection } from "@/features/vehicles/components/vehicle-profile-section";
import type { Aircraft } from "@/features/vehicles/types";
import { formatCountWord } from "@/features/vehicles/utils/format-measurement";

interface AircraftProfileProps {
  aircraft: Aircraft;
}

/** "an air superiority and multirole", with the right article. */
function formatRoleSentence(roles: Aircraft["roles"]) {
  const words = roles.map((role) =>
    formatAircraftRole(role).toLocaleLowerCase("en-US"),
  );
  const phrase =
    words.length > 1
      ? `${words.slice(0, -1).join(", ")} and ${words.at(-1)}`
      : (words[0] ?? "a military");
  return /^[aeiou]/.test(phrase) ? `an ${phrase}` : `a ${phrase}`;
}

function formatVariantSentence(variants: Aircraft["variants"]) {
  if (variants.length === 0) return "No variants are recorded.";
  if (variants.length === 1) {
    return `The record covers one variant, the ${variants[0]?.name}.`;
  }
  const designations = variants.map((variant) => variant.designation);
  return `The record covers ${formatCountWord(variants.length)} variants: ${designations.slice(0, -1).join(", ")} and ${designations.at(-1)}.`;
}

const navigation = [
  { id: "overview", label: "Overview" },
  { id: "specifications", label: "Key specifications" },
  { id: "propulsion", label: "Propulsion" },
  { id: "performance", label: "Performance" },
  { id: "history", label: "History" },
  { id: "variants", label: "Variants" },
  { id: "engineering-notes", label: "Engineering analysis" },
] as const;

/** The `/aircraft/[id]` profile (spec 14). */
export function AircraftProfile({ aircraft }: AircraftProfileProps) {
  const visual = getAircraftVisual(aircraft.id);
  const status = formatAircraftFleetStatus(aircraft.variants);
  const related = listAircraft()
    .filter((candidate) => candidate.id !== aircraft.id)
    .slice(0, 3);

  return (
    <VehicleProfileLayout
      action={
        <ButtonLink
          className="w-full"
          href={`/compare?category=aircraft&vehicles=${aircraft.id}`}
          variant="secondary"
        >
          Compare the {aircraft.name} with other aircraft
        </ButtonLink>
      }
      figure={
        <VehicleFigure name={aircraft.name} visual={visual}>
          <VehicleMediaFrame aspect="landscape">
            <AircraftImage
              aircraft={aircraft}
              fillContainer
              priority
              sizes="(max-width: 1023px) 100vw, 22rem"
            />
          </VehicleMediaFrame>
        </VehicleFigure>
      }
      intro={
        <VehiclePageIntro
          breadcrumbs={[
            { href: "/", label: "Home" },
            { href: "/aircraft", label: "Aircraft" },
            { label: aircraft.name },
          ]}
          eyebrow={formatAircraftRoles(aircraft.roles)}
          lead={aircraft.description}
          title={aircraft.name}
        >
          {status ? (
            <StatusBadge
              tone={status === "In service" ? "positive" : "neutral"}
            >
              {status}
            </StatusBadge>
          ) : null}
        </VehiclePageIntro>
      }
      navigation={navigation}
      related={<RelatedAircraft aircraft={related} />}
    >
      <VehicleProfileSection id="overview" title="Overview">
        <div className="orbix-prose">
          <p>
            The {aircraft.name} was developed by {aircraft.manufacturer} (
            {aircraft.country.name}) and first flew on{" "}
            <time dateTime={aircraft.firstFlight}>
              {formatFirstFlight(aircraft.firstFlight)}
            </time>
            . It is classed as {formatRoleSentence(aircraft.roles)} aircraft.
          </p>
          <p>{formatVariantSentence(aircraft.variants)}</p>
        </div>
      </VehicleProfileSection>

      <VehicleProfileSection
        description="Dimensions and weights as published, with the basis of each figure."
        id="specifications"
        title="Key specifications"
      >
        <MeasurementTable
          caption={`${aircraft.name} dimensions and weights`}
          rows={[
            { label: "Length", measurement: aircraft.dimensions.length },
            { label: "Wingspan", measurement: aircraft.dimensions.wingspan },
            { label: "Empty weight", measurement: aircraft.weights.empty },
            {
              label: "Maximum takeoff weight",
              measurement: aircraft.weights.maximumTakeoff,
            },
          ]}
        />
      </VehicleProfileSection>

      <PropulsionPanel name={aircraft.name} propulsion={aircraft.propulsion} />
      <PerformancePanel
        name={aircraft.name}
        performance={aircraft.performance}
      />
      <HistoricalTimeline aircraft={aircraft} />
      <VariantsPanel name={aircraft.name} variants={aircraft.variants} />
      <EngineeringNotesPanel notes={aircraft.engineeringAnalysis} />
    </VehicleProfileLayout>
  );
}
