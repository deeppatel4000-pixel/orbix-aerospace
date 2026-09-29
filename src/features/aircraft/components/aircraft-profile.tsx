import { ButtonLink } from "@/components/ui/button-link";
import { EngineeringNotesPanel } from "@/features/aircraft/components/engineering-notes-panel";
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
import {
  CONVERSION_NOTE,
  MINIMUM_NOTE,
  measurementParts,
} from "@/features/vehicles/components/measurement-display";
import { MeasurementTable } from "@/features/vehicles/components/measurement-table";
import { VehiclePhotograph } from "@/features/vehicles/components/vehicle-photograph";
import { VehicleProfileHero } from "@/features/vehicles/components/vehicle-profile-hero";
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

/** "In service" or "Retired", only when the variant records say so. */
function formatStatusSentence(variants: Aircraft["variants"]) {
  const status = formatAircraftFleetStatus(variants);
  if (status === "In service") {
    return "At least one variant is in service.";
  }
  if (status === "Retired") return "Every recorded variant is retired.";
  return undefined;
}

const navigation = [
  { id: "overview", label: "Overview" },
  { id: "specifications", label: "Specifications" },
  { id: "propulsion", label: "Propulsion" },
  { id: "performance", label: "Performance" },
  { id: "variants", label: "History and variants" },
  { id: "engineering-notes", label: "Engineering analysis" },
] as const;

/** The `/aircraft/[id]` profile (spec 9). */
export function AircraftProfile({ aircraft }: AircraftProfileProps) {
  const visual = getAircraftVisual(aircraft.id);
  const related = listAircraft()
    .filter((candidate) => candidate.id !== aircraft.id)
    .slice(0, 3);
  const { maxSpeed, range, serviceCeiling } = aircraft.performance;
  const statusSentence = formatStatusSentence(aircraft.variants);

  return (
    <VehicleProfileLayout
      hero={
        <VehicleProfileHero
          action={
            <ButtonLink
              arrow="right"
              href={`/compare?category=aircraft&vehicles=${aircraft.id}`}
              variant="secondary"
              className="max-sm:w-full max-sm:justify-between"
            >
              {/* Shortened below 40rem so the button stays on one line; the
                  hidden words leave the accessible name with it. */}
              <span>
                Compare the {aircraft.name}
                <span className="max-sm:hidden"> with other aircraft</span>
              </span>
            </ButtonLink>
          }
          breadcrumbs={[
            { href: "/", label: "Home" },
            { href: "/aircraft", label: "Aircraft" },
            { label: aircraft.name },
          ]}
          classification={formatAircraftRoles(aircraft.roles)}
          lead={aircraft.description}
          name={aircraft.name}
          record={[
            { label: "Maximum speed", ...measurementParts(maxSpeed) },
            { label: "Service ceiling", ...measurementParts(serviceCeiling) },
            { label: "Range", ...measurementParts(range) },
            {
              label: "First flight",
              value: aircraft.firstFlight.slice(0, 4),
            },
          ]}
          visual={
            visual
              ? { ...visual, objectPosition: visual.heroObjectPosition }
              : undefined
          }
        />
      }
      navigation={navigation}
      related={<RelatedAircraft aircraft={related} />}
    >
      {/*
       * Overview and the photograph share one row from 64rem: the overview
       * in the left five columns and the photograph, shown large once, in
       * the right seven at a 3:2 crop, as a figure on the sheet
       * rather than a second hero. Below 48rem the hero shows the
       * photograph one scroll earlier, so it is not repeated.
       */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-6">
        <div className="min-w-0 lg:col-span-5">
          <VehicleProfileSection
            className="border-t-0"
            id="overview"
            index={1}
            layout="wide"
            title="Overview"
          >
            <div className="orbix-prose max-w-[68ch]">
              <p>
                The {aircraft.name} was developed by {aircraft.manufacturer} (
                {aircraft.country.name}) and first flew on{" "}
                <time dateTime={aircraft.firstFlight}>
                  {formatFirstFlight(aircraft.firstFlight)}
                </time>
                . It is classed as {formatRoleSentence(aircraft.roles)}{" "}
                aircraft.
              </p>
              <p>
                {formatVariantSentence(aircraft.variants)}
                {statusSentence ? ` ${statusSentence}` : null}
              </p>
            </div>
          </VehicleProfileSection>
        </div>

        {visual ? (
          <VehiclePhotograph
            className="pb-12 max-md:hidden md:max-w-[40rem] lg:col-span-7 lg:max-w-none lg:self-start lg:pt-12"
            // The hero darkens the aircraft under its overlay, so the
            // figure stays, at a tighter 3:2 crop of its own so it does not
            // read as the hero repeated.
            crop={{ aspectRatio: "3 / 2", objectPosition: "30% 50%" }}
            name={aircraft.name}
            sizes="(max-width: 1023px) 40rem, 42rem"
            visual={visual}
          />
        ) : null}
      </div>

      <VehicleProfileSection
        description="Dimensions and weights as published, with the basis of each figure."
        id="specifications"
        index={2}
        title="Specifications"
      >
        <MeasurementTable
          caption={`${aircraft.name} dimensions and weights`}
          note={`${CONVERSION_NOTE} ${MINIMUM_NOTE}`}
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

      <PropulsionPanel
        index={3}
        name={aircraft.name}
        propulsion={aircraft.propulsion}
      />
      <PerformancePanel
        index={4}
        name={aircraft.name}
        performance={aircraft.performance}
      />
      <VariantsPanel
        index={5}
        name={aircraft.name}
        variants={aircraft.variants}
      />
      <EngineeringNotesPanel index={6} notes={aircraft.engineeringAnalysis} />
    </VehicleProfileLayout>
  );
}
