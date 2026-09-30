import Link from "next/link";

import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import { ProfileLink } from "@/features/vehicles/components/profile-link";
import { EmptyState } from "@/components/ui/empty-state";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PhotoHero } from "@/components/ui/photo-hero";
import { SpecPanel } from "@/components/ui/spec-panel";
import { AircraftCard } from "@/features/aircraft/components/aircraft-card";
import { getAircraftVisual } from "@/features/aircraft/data/aircraft-visuals";
import {
  formatAircraftEngineType,
  formatAircraftRoles,
} from "@/features/aircraft/utils";
import {
  CONVERSION_NOTE,
  MINIMUM_NOTE,
  measurementParts,
  panelSecondary,
} from "@/features/vehicles/components/measurement-display";
import {
  responsiveHeroPosition,
  STOPGAP_HERO_SPEC_PANEL,
  STOPGAP_PHOTO_HERO_BANNER_TABLET,
} from "@/features/vehicles/components/primitive-stopgaps";
import { VehicleRegistry } from "@/features/vehicles/components/vehicle-registry";
import type { Aircraft } from "@/features/vehicles/types";
import { formatCountWord } from "@/features/vehicles/utils/format-measurement";

interface AircraftExplorerProps {
  aircraft: readonly Aircraft[];
}

/**
 * The aircraft shown in the hero and its spec panel: the B-2, whose
 * photograph puts the whole airframe across the upper half of the frame
 * over open ocean, so neither the text nor the spec panel at the bottom
 * right covers it (the F-22 photograph fills the middle of the frame and
 * sat behind both). Not the SR-71, whose photograph opens the home page,
 * nor the F-22, pictured in the home page's aircraft card. The registry's
 * wide first card is then the next aircraft in the record order, so the
 * hero photograph is not repeated directly below it.
 */
const FEATURED_AIRCRAFT_ID = "b-2-spirit";

/** Words the registry search matches for one aircraft. */
function aircraftKeywords(aircraft: Aircraft) {
  return [
    aircraft.name,
    aircraft.manufacturer,
    aircraft.country.name,
    formatAircraftRoles(aircraft.roles),
    ...aircraft.variants.map((variant) => variant.designation),
    ...aircraft.propulsion.engines.flatMap((engine) => [
      engine.name,
      formatAircraftEngineType(engine.type),
    ]),
  ].join(" ");
}

/**
 * The record order, except that the aircraft featured in the hero does not
 * also lead the grid as its wide first card: the first other aircraft does.
 */
function registryOrder(aircraft: readonly Aircraft[], featuredId?: string) {
  const lead = aircraft.find((item) => item.id !== featuredId);
  return lead
    ? [lead, ...aircraft.filter((item) => item !== lead)]
    : [...aircraft];
}

function capitalise(text: string) {
  return text.charAt(0).toLocaleUpperCase("en-US") + text.slice(1);
}

/**
 * The featured aircraft's maximum speed and range, each with its conversion
 * and qualifier, and a link to its profile. Two figures, one row: a second
 * row made the panel tall enough to reach the airframe at 1024 to 1279px.
 * The conversion note is given once, in "About these figures".
 */
function FeaturedPanel({ aircraft }: { aircraft: Aircraft }) {
  const { maxSpeed, range } = aircraft.performance;
  const rows = [
    { label: "Maximum speed", measurement: maxSpeed },
    { label: "Range", measurement: range },
  ];

  return (
    <SpecPanel
      className={STOPGAP_HERO_SPEC_PANEL}
      footnote={
        <ProfileLink href={`/aircraft/${aircraft.id}`} name={aircraft.name} />
      }
      items={rows.map(({ label, measurement }) => {
        const { unit, value } = measurementParts(measurement);
        return {
          label,
          secondary: panelSecondary(measurement),
          unit,
          value,
        };
      })}
      kicker="Featured aircraft"
      title={aircraft.name}
    />
  );
}

/** The `/aircraft` registry page (spec 9). */
export function AircraftExplorer({ aircraft }: AircraftExplorerProps) {
  const featured =
    aircraft.find((item) => item.id === FEATURED_AIRCRAFT_ID) ?? aircraft[0];
  const heroVisual = featured ? getAircraftVisual(featured.id) : undefined;
  const heroPosition = heroVisual
    ? responsiveHeroPosition(
        heroVisual.registryHeroObjectPosition ?? {
          base: heroVisual.heroObjectPosition,
          lg: heroVisual.heroObjectPosition,
          md: heroVisual.heroObjectPosition,
        },
      )
    : undefined;

  const heroText = (
    <>
      <Eyebrow>Aircraft registry</Eyebrow>
      <h1 className="orbix-display mt-5 text-foreground">
        Aircraft <span className="orbix-accent-word">Explorer</span>
      </h1>
      <p className="orbix-lead mt-6">
        {capitalise(formatCountWord(aircraft.length))} military aircraft set out
        from their published specifications: dimensions, weights, propulsion,
        performance and variants, each with a credited photograph.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
        <ButtonLink arrow="down" href="#available-aircraft" size="lg">
          Browse the registry
        </ButtonLink>
        <ButtonLink
          arrow="right"
          href="/compare?category=aircraft"
          variant="tertiary"
        >
          Compare aircraft
        </ButtonLink>
      </div>
    </>
  );

  return (
    <>
      {heroVisual && heroPosition && featured ? (
        <PhotoHero
          // From 64rem the landscape photograph runs behind the text (spec
          // 8), with the spec panel over the open ocean at the bottom
          // right. From 48rem to 64rem the text column would cross the
          // B-2's centre body, so the photograph is a banner above it.
          aside={<FeaturedPanel aircraft={featured} />}
          className={`${heroPosition.className} ${STOPGAP_PHOTO_HERO_BANNER_TABLET}`}
          style={heroPosition.style}
          visual={{
            ...heroVisual,
            objectPosition: heroPosition.objectPosition,
          }}
        >
          {heroText}
        </PhotoHero>
      ) : (
        <Container className="py-16">{heroText}</Container>
      )}

      <Container className="py-16 lg:py-24">
        {aircraft.length === 0 ? (
          <EmptyState
            description="No aircraft records are available right now."
            title="No aircraft records"
          />
        ) : (
          <VehicleRegistry
            description="Each card opens a full profile. Maximum speed and service ceiling are the published figures for the baseline aircraft."
            entries={registryOrder(aircraft, featured?.id).map(
              (item, index) => ({
                card: (
                  <AircraftCard
                    aircraft={item}
                    layout={index === 0 ? "feature" : "stacked"}
                  />
                ),
                featured: index === 0,
                id: item.id,
                keywords: aircraftKeywords(item),
              }),
            )}
            eyebrow="The registry"
            id="available-aircraft"
            noun={{ plural: "aircraft", singular: "aircraft" }}
            searchHelp="Matches name, manufacturer, role, variant or engine."
            searchLabel="Search aircraft"
            title="Every aircraft on record"
          />
        )}

        <section
          aria-labelledby="aircraft-sources-title"
          className="mt-16 grid gap-4 border-t border-border pt-8 lg:grid-cols-12 lg:gap-6"
        >
          <h2
            className="orbix-caps text-muted lg:col-span-4"
            id="aircraft-sources-title"
          >
            About these figures
          </h2>
          <p className="max-w-[68ch] text-sm leading-6 text-text-secondary lg:col-span-8">
            Figures are publicly released specifications. Where a source gives a
            value as approximate, a minimum or a maximum, the profile keeps that
            qualifier beside the number. {MINIMUM_NOTE} {CONVERSION_NOTE}{" "}
            Photographs are credited on each profile and on the{" "}
            <Link className="orbix-link" href="/credits">
              image credits page
            </Link>
            . Read{" "}
            <Link className="orbix-link" href="/about#sources">
              how ORBIX sources its values
            </Link>
            .
          </p>
        </section>
      </Container>
    </>
  );
}
