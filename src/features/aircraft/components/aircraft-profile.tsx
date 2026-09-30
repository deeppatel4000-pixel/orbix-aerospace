import { ButtonLink } from "@/components/ui/button-link";
import { EngineeringNotesPanel } from "@/features/aircraft/components/engineering-notes-panel";
import { PerformancePanel } from "@/features/aircraft/components/performance-panel";
import { PropulsionPanel } from "@/features/aircraft/components/propulsion-panel";
import { RelatedAircraft } from "@/features/aircraft/components/related-aircraft";
import { VariantsPanel } from "@/features/aircraft/components/variants-panel";
import { getAircraftVisual, listAircraft } from "@/features/aircraft/data";
import {
  formatAircraftFleetStatus,
  formatAircraftRoles,
  formatFirstFlight,
} from "@/features/aircraft/utils";
import {
  CONVERSION_NOTE,
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
import type { Aircraft } from "@/features/vehicles/types";

interface AircraftProfileProps {
  aircraft: Aircraft;
}

/**
 * "In service" or "Retired", only when the variant records say so. With
 * several variants and only some in service, it says so.
 */
function formatStatus(variants: Aircraft["variants"]) {
  const status = formatAircraftFleetStatus(variants);
  if (
    status === "In service" &&
    variants.some((variant) => variant.status !== "in-service")
  ) {
    return "At least one variant in service";
  }
  return status;
}

/** The Overview facts, each taken from the record. */
function overviewFacts(aircraft: Aircraft): VehicleFact[] {
  const status = formatStatus(aircraft.variants);
  return [
    { label: "Manufacturer", value: aircraft.manufacturer },
    { label: "Country", value: aircraft.country.name },
    {
      label: "First flight",
      value: (
        <time dateTime={aircraft.firstFlight}>
          {formatFirstFlight(aircraft.firstFlight)}
        </time>
      ),
    },
    ...(aircraft.variants.length > 0
      ? [
          {
            label:
              aircraft.variants.length === 1
                ? "Variant recorded"
                : "Variants recorded",
            value: aircraft.variants
              .map((variant) => variant.designation)
              .join(", "),
          },
        ]
      : []),
    ...(status ? [{ label: "Status", value: status }] : []),
  ];
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
              ? {
                  ...visual,
                  // From 64rem the photograph is shown whole beside the
                  // text, so only the phone plate and the tablet banner
                  // crop it.
                  position: {
                    base: visual.heroObjectPosition,
                    lg: "50% 50%",
                    md: visual.heroObjectPosition,
                  },
                }
              : undefined
          }
        />
      }
      navigation={navigation}
      related={<RelatedAircraft aircraft={related} />}
    >
      {/*
       * The hero shows the photograph large, the airframe clear of the
       * text, so it is not repeated here (as on the launch vehicle
       * profiles). The Overview is a short spec sheet of the record's
       * facts, in the same 4/8 split as every section after it.
       */}
      <VehicleProfileSection id="overview" index={1} title="Overview">
        <VehicleFactsTable
          caption={`${aircraft.name} record`}
          facts={overviewFacts(aircraft)}
        />
      </VehicleProfileSection>

      <VehicleProfileSection
        description="Dimensions and weights as published, with the basis of each figure."
        id="specifications"
        index={2}
        title="Specifications"
      >
        <MeasurementTable
          caption={`${aircraft.name} dimensions and weights`}
          note={CONVERSION_NOTE}
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
