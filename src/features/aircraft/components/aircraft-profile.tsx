import { ButtonLink } from "@/components/ui/button-link";
import { EngineeringNotesPanel } from "@/features/aircraft/components/engineering-notes-panel";
import { PerformancePanel } from "@/features/aircraft/components/performance-panel";
import { PropulsionPanel } from "@/features/aircraft/components/propulsion-panel";
import { RelatedAircraft } from "@/features/aircraft/components/related-aircraft";
import { VariantsPanel } from "@/features/aircraft/components/variants-panel";
import { getAircraftVisual, listAircraft } from "@/features/aircraft/data";
import type { AircraftVisual } from "@/features/aircraft/data/aircraft-visuals";
import {
  formatAircraftFleetStatus,
  formatAircraftRoles,
  formatFirstFlight,
} from "@/features/aircraft/utils";
import {
  CONVERSION_NOTE,
  joinTableNotes,
  UNMARKED_NOTE,
  measurementFigure,
  measurementParts,
} from "@/features/vehicles/components/measurement-display";
import { MeasurementTable } from "@/features/vehicles/components/measurement-table";
import {
  VehicleFactsTable,
  type VehicleFact,
} from "@/features/vehicles/components/vehicle-facts-table";
import { VehicleGallery } from "@/features/vehicles/components/vehicle-gallery";
import {
  VehicleProfileHero,
  type VehicleHeroVisual,
} from "@/features/vehicles/components/vehicle-profile-hero";
import { VehicleProfileLayout } from "@/features/vehicles/components/vehicle-profile-layout";
import { VehicleProfileSection } from "@/features/vehicles/components/vehicle-profile-section";
import { getVehiclePhoto } from "@/features/vehicles/data/gallery";
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

/**
 * The profile hero's photograph: the `profile` slot. When it is the
 * aircraft's identity photograph, the art-directed crops in
 * `aircraft-visuals.ts` frame it; a profile's own photograph (the B-2
 * takeoff) runs as a band at its recorded center.
 */
function heroPhoto(
  aircraft: Aircraft,
  visual: AircraftVisual | undefined,
): { layout: "band" | "split"; visual?: VehicleHeroVisual } {
  const photo = getVehiclePhoto(aircraft.id, "profile");
  if (!photo) return { layout: "band" };
  const isIdentity = visual?.src === photo.src;
  const layout =
    isIdentity && visual?.profileHeroLayout === "split" ? "split" : "band";
  const crop =
    isIdentity && visual
      ? {
          base: visual.objectPosition,
          lg:
            layout === "split"
              ? (visual.profileHeroObjectPosition ?? visual.objectPosition)
              : visual.heroObjectPosition,
        }
      : { base: photo.objectPosition, lg: photo.objectPosition };
  return {
    layout,
    visual: {
      alt: photo.alt,
      caption: photo.caption,
      credit: photo.credit,
      crop,
      height: photo.height,
      license: photo.license,
      licenseUrl: photo.licenseUrl,
      sourceUrl: photo.sourceUrl,
      src: photo.src,
      width: photo.width,
    },
  };
}

/** Engineering analysis follows Overview (v4 plan section 8). */
const navigation = [
  { id: "overview", label: "Overview" },
  { id: "engineering-notes", label: "Engineering analysis" },
  { id: "specifications", label: "Specifications" },
  { id: "propulsion", label: "Propulsion" },
  { id: "performance", label: "Performance" },
  { id: "variants", label: "History and variants" },
  { id: "photographs", label: "Photographs" },
] as const;

/** The `/aircraft/[id]` profile (spec 11). */
export function AircraftProfile({ aircraft }: AircraftProfileProps) {
  const hero = heroPhoto(aircraft, getAircraftVisual(aircraft.id));
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
            {
              label: "Maximum speed",
              ...measurementFigure(maxSpeed, "text-[0.8em]"),
            },
            { label: "Service ceiling", ...measurementParts(serviceCeiling) },
            { label: "Range", ...measurementParts(range) },
            {
              label: "First flight",
              value: aircraft.firstFlight.slice(0, 4),
            },
          ]}
          photo={hero.layout}
          visual={hero.visual}
        />
      }
      gallery={<VehicleGallery vehicleId={aircraft.id} />}
      navigation={navigation}
      related={<RelatedAircraft aircraft={related} />}
    >
      {/* The hero shows the photograph large, so it is not repeated. */}
      <VehicleProfileSection id="overview" title="Overview">
        <VehicleFactsTable facts={overviewFacts(aircraft)} />
      </VehicleProfileSection>

      <EngineeringNotesPanel notes={aircraft.engineeringAnalysis} />

      <VehicleProfileSection
        description="Dimensions and weights as published, with the basis of each figure."
        id="specifications"
        title="Specifications"
      >
        <MeasurementTable
          caption={`${aircraft.name} dimensions and weights`}
          note={joinTableNotes(CONVERSION_NOTE, UNMARKED_NOTE)}
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
      <VariantsPanel name={aircraft.name} variants={aircraft.variants} />
    </VehicleProfileLayout>
  );
}
