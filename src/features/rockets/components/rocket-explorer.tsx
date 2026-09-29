import Link from "next/link";

import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PhotoHero } from "@/components/ui/photo-hero";
import { SpecPanel, type SpecPanelItem } from "@/components/ui/spec-panel";
import { RocketCard } from "@/features/rockets/components/rocket-card";
import {
  maxPayloadTo,
  payloadConfiguration,
  payloadLabel,
  thrustParts,
} from "@/features/rockets/components/rocket-figures";
import { getRocketVisual } from "@/features/rockets/data/rocket-visuals";
import {
  formatOrbitType,
  formatRocketClassification,
  formatRocketEngineCycle,
} from "@/features/rockets/utils";
import { ProfileLink } from "@/features/vehicles/components/profile-link";
import {
  CONVERSION_NOTE,
  MINIMUM_NOTE,
  measurementParts,
  panelSecondary,
} from "@/features/vehicles/components/measurement-display";
import {
  STOPGAP_HERO_SPEC_PANEL,
  STOPGAP_HERO_SPEC_PANEL_STRIP,
  STOPGAP_PHOTO_HERO_ASIDE_BELOW,
  STOPGAP_PHOTO_HERO_RIGHT,
} from "@/features/vehicles/components/primitive-stopgaps";
import { VehicleRegistry } from "@/features/vehicles/components/vehicle-registry";
import type { Rocket } from "@/features/vehicles/types";
import { formatCountWord } from "@/features/vehicles/utils/format-measurement";

interface RocketExplorerProps {
  rockets: readonly Rocket[];
}

/** The launch vehicle shown in the hero and its spec panel. */
const FEATURED_ROCKET_ID = "saturn-v";

/** Words the registry search matches for one launch vehicle. */
function rocketKeywords(rocket: Rocket) {
  return [
    rocket.name,
    rocket.manufacturer,
    rocket.country.name,
    formatRocketClassification(rocket.stages),
    ...rocket.performance.supportedOrbits.flatMap((orbit) => [
      orbit,
      formatOrbitType(orbit),
    ]),
    ...rocket.stages.flatMap((stage) =>
      stage.engines.flatMap((engine) => [
        engine.name,
        formatRocketEngineCycle(engine.cycle),
      ]),
    ),
  ].join(" ");
}

function capitalise(text: string) {
  return text.charAt(0).toLocaleUpperCase("en-US") + text.slice(1);
}

/**
 * The featured launch vehicle's published figures, each with its
 * conversion and qualifier, and a link to its profile. Thrust is shown in
 * MN, as on the cards. The conversion note is given once, in "About these
 * figures".
 */
function FeaturedPanel({ rocket }: { rocket: Rocket }) {
  const leo = maxPayloadTo(rocket, "LEO");
  const { height } = rocket.dimensions;
  const thrust = rocket.performance.liftoffThrust;
  const items: SpecPanelItem[] = [
    {
      label: "Height",
      ...measurementParts(height),
      secondary: panelSecondary(height),
    },
    {
      label: "Liftoff thrust",
      ...thrustParts(thrust),
      secondary: panelSecondary(thrust),
    },
  ];
  if (leo) {
    items.push({
      label: payloadLabel(leo),
      ...measurementParts(leo.mass),
      secondary: panelSecondary(leo.mass, payloadConfiguration(leo)),
    });
  }
  items.push({ label: "First flight", value: rocket.firstFlight.slice(0, 4) });

  return (
    <SpecPanel
      // From 64rem one strip of four figures under the text that ends
      // where the photo plate begins, so Saturn V stands whole beside it.
      className={`${STOPGAP_HERO_SPEC_PANEL} ${STOPGAP_HERO_SPEC_PANEL_STRIP}`}
      footnote={
        <ProfileLink href={`/rockets/${rocket.id}`} name={rocket.name} />
      }
      items={items}
      kicker="Featured launch vehicle"
      title={rocket.name}
    />
  );
}

/** The `/rockets` registry page (spec 9). */
export function RocketExplorer({ rockets }: RocketExplorerProps) {
  const featured =
    rockets.find((rocket) => rocket.id === FEATURED_ROCKET_ID) ?? rockets[0];
  const heroVisual = featured ? getRocketVisual(featured.id) : undefined;

  const heroText = (
    <>
      <Eyebrow>Launch vehicle registry</Eyebrow>
      <h1 className="orbix-display mt-5 text-foreground">
        Launch Vehicle <span className="orbix-accent-word">Explorer</span>
      </h1>
      <p className="orbix-lead mt-6">
        {capitalise(formatCountWord(rockets.length))} launch vehicles set out
        from their published specifications: stages, engines, liftoff thrust and
        payload to each destination, each with a credited photograph.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
        <ButtonLink arrow="down" href="#launch-vehicle-registry" size="lg">
          Browse the registry
        </ButtonLink>
        <ButtonLink
          arrow="right"
          href="/compare?category=rockets"
          variant="tertiary"
        >
          Compare launch vehicles
        </ButtonLink>
      </div>
    </>
  );

  return (
    <>
      {heroVisual && featured ? (
        <PhotoHero
          aside={<FeaturedPanel rocket={featured} />}
          // Saturn V on the right, as on the launch vehicle profiles, so the
          // lead never runs into the rocket.
          className={`${STOPGAP_PHOTO_HERO_RIGHT} ${STOPGAP_PHOTO_HERO_ASIDE_BELOW}`}
          plate="portrait"
          visual={{
            ...heroVisual,
            objectPosition: heroVisual.heroObjectPosition,
          }}
        >
          {heroText}
        </PhotoHero>
      ) : (
        <Container className="py-16">{heroText}</Container>
      )}

      <Container className="py-16 lg:py-24">
        {rockets.length === 0 ? (
          <EmptyState
            description="No launch vehicle records are available right now."
            title="No launch vehicle records"
          />
        ) : (
          <VehicleRegistry
            description="Each card opens a full profile. Liftoff thrust and height are the published figures for the configuration each record describes."
            entries={rockets.map((rocket, index) => ({
              card: (
                <RocketCard
                  layout={index === 0 ? "feature" : "stacked"}
                  rocket={rocket}
                />
              ),
              featured: index === 0,
              id: rocket.id,
              keywords: rocketKeywords(rocket),
            }))}
            eyebrow="The registry"
            id="launch-vehicle-registry"
            noun={{ plural: "launch vehicles", singular: "launch vehicle" }}
            searchHelp="Matches name, manufacturer, engine, or an orbit such as LEO."
            searchLabel="Search launch vehicles"
            title="Every launch vehicle on record"
          />
        )}

        <section
          aria-labelledby="rocket-sources-title"
          className="mt-16 grid gap-4 border-t border-border pt-8 lg:grid-cols-12 lg:gap-6"
        >
          <h2
            className="orbix-caps text-muted lg:col-span-4"
            id="rocket-sources-title"
          >
            About these figures
          </h2>
          <p className="max-w-[68ch] text-sm leading-6 text-text-secondary lg:col-span-8">
            Figures are publicly released specifications. Payload figures are
            tied to a destination orbit and to whether boosters are recovered,
            and a qualifier such as approximate or maximum stays beside the
            number. {MINIMUM_NOTE} {CONVERSION_NOTE} Photographs are credited on
            each profile and on the{" "}
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
