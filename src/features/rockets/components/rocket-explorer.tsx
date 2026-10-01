import Link from "next/link";

import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";
import { PhotoHero } from "@/components/ui/photo-hero";
import { SpecPanel, type SpecPanelItem } from "@/components/ui/spec-panel";
import { cn } from "@/lib/cn";
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
import {
  heroCrop,
  portraitPlate,
} from "@/features/vehicles/components/hero-crop";
import {
  CONVERSION_NOTE,
  MINIMUM_NOTE,
  measurementParts,
  panelSecondary,
} from "@/features/vehicles/components/measurement-display";
import { ProfileLink } from "@/features/vehicles/components/profile-link";
import { VehicleRegistry } from "@/features/vehicles/components/vehicle-registry";
import { RocketHeightLineup, toMetres } from "@/features/vehicles/drawings";
import type { Rocket } from "@/features/vehicles/types";
import { formatCountWord } from "@/features/vehicles/utils/format-measurement";
import { keepDesignations } from "@/lib/designations";

interface RocketExplorerProps {
  rockets: readonly Rocket[];
}

/** The launch vehicle in the hero photograph and its figures. */
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
 * The pictured launch vehicle, set in the hero's text column under the
 * actions (beside the tall portrait plate from 64rem, so the column is not
 * left empty below the buttons), with three published figures as an open
 * definition list and a link to its profile. Each figure keeps its
 * conversion and qualifier; thrust is shown in the published unit.
 */
function PicturedRocket({ rocket }: { rocket: Rocket }) {
  const leo = maxPayloadTo(rocket, "LEO");
  const { height } = rocket.dimensions;
  const thrust = rocket.performance.liftoffThrust;
  const summary = getRocketVisual(rocket.id)?.cardSummary;
  const items: SpecPanelItem[] = [
    {
      label: "Height",
      primary: true,
      ...measurementParts(height),
      secondary: panelSecondary(height),
    },
    {
      label: "Liftoff thrust",
      primary: true,
      ...thrustParts(thrust),
      secondary: panelSecondary(thrust),
    },
  ];
  if (leo) {
    items.push({
      label: payloadLabel(leo),
      primary: true,
      ...measurementParts(leo.mass),
      secondary: panelSecondary(leo.mass, payloadConfiguration(leo)),
    });
  }

  return (
    <section aria-labelledby="pictured-rocket-title">
      <div>
        <p className="orbix-kicker">Pictured</p>
        <h2
          className="font-display mt-2 text-[2rem] leading-none tracking-[-0.035em] text-foreground"
          id="pictured-rocket-title"
        >
          {rocket.name}
        </h2>
        {summary ? (
          <p className="mt-3 text-muted">{keepDesignations(summary)}</p>
        ) : null}
      </div>
      <SpecPanel className="mt-6" columns={3} items={items} />
      <div className="mt-6">
        <ProfileLink href={`/rockets/${rocket.id}`} name={rocket.name} />
      </div>
    </section>
  );
}

/**
 * "Starship stands 54.4 m taller than Falcon 9", worked out from the
 * recorded heights, or nothing when there are fewer than two.
 */
function heightSpread(rockets: readonly Rocket[]) {
  const byHeight = [...rockets].sort(
    (a, b) => toMetres(a.dimensions.height) - toMetres(b.dimensions.height),
  );
  const shortest = byHeight[0];
  const tallest = byHeight.at(-1);
  if (!shortest || !tallest || shortest === tallest) return "";
  const difference =
    toMetres(tallest.dimensions.height) - toMetres(shortest.dimensions.height);
  const text = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(difference);
  return `${tallest.name} stands ${text} m taller than ${shortest.name}. `;
}

/** The `/rockets` registry page. */
export function RocketExplorer({ rockets }: RocketExplorerProps) {
  const featured =
    rockets.find((rocket) => rocket.id === FEATURED_ROCKET_ID) ?? rockets[0];
  const heroVisual = featured ? getRocketVisual(featured.id) : undefined;
  const crop = heroVisual
    ? heroCrop({
        base: heroVisual.heroPhoneObjectPosition,
        lg: heroVisual.heroObjectPosition,
      })
    : undefined;

  const plate = portraitPlate(heroVisual ?? { height: 3, width: 2 });

  const heroText = (
    <>
      <h1 className="orbix-h1 text-foreground">Launch vehicle registry</h1>
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
      {heroVisual && crop && featured ? (
        <PhotoHero
          aside={<PicturedRocket rocket={featured} />}
          className={cn(crop.className, plate.className)}
          plate="portrait"
          style={{ ...crop.style, ...plate.style }}
          visual={{ ...heroVisual, objectPosition: crop.objectPosition }}
        >
          {heroText}
        </PhotoHero>
      ) : (
        <Container className="py-16">{heroText}</Container>
      )}

      <Container>
        {rockets.length === 0 ? (
          <EmptyState
            description="No launch vehicle records are available right now."
            title="No launch vehicle records"
          />
        ) : (
          <VehicleRegistry
            description="Each entry opens a full profile. Height is the published figure; liftoff thrust is the published figure converted to meganewtons, for the configuration each record describes."
            entries={rockets.map((rocket) => ({
              card: <RocketCard rocket={rocket} />,
              id: rocket.id,
              keywords: rocketKeywords(rocket),
            }))}
            id="launch-vehicle-registry"
            layout="grid"
            noun={{ plural: "launch vehicles", singular: "launch vehicle" }}
            searchHelp="Matches name, manufacturer, engine, or an orbit such as LEO."
            searchLabel="Search launch vehicles"
            title="Every launch vehicle on record"
          />
        )}

        {rockets.length > 0 ? (
          <section
            aria-labelledby="rocket-scale-title"
            className="mt-20 grid gap-10 border-t border-border pt-12 lg:mt-28 lg:grid-cols-12 lg:gap-6"
          >
            <div className="lg:col-span-4">
              <h2 className="orbix-h2 text-foreground" id="rocket-scale-title">
                Heights to one scale
              </h2>
              <p className="mt-5 max-w-[46ch] text-pretty text-muted">
                {heightSpread(rockets)}Each launch vehicle is drawn from the
                height in its record, on one ground line at one scale.
              </p>
            </div>
            <RocketHeightLineup
              className="lg:col-span-8 lg:col-start-5"
              figureNumber="1"
              rockets={rockets}
            />
          </section>
        ) : null}

        <section
          aria-labelledby="rocket-sources-title"
          className="mt-16 grid gap-3 border-t border-border pt-8 pb-16 lg:grid-cols-12 lg:gap-6 lg:pb-24"
        >
          <h2
            className="text-base font-semibold text-foreground lg:col-span-4"
            id="rocket-sources-title"
          >
            About these figures
          </h2>
          <p className="max-w-[68ch] text-sm leading-6 text-muted lg:col-span-8">
            Figures are publicly released specifications. Payload figures are
            tied to a destination orbit and to whether boosters are recovered,
            and a qualifier such as approximate or maximum stays beside the
            number. {MINIMUM_NOTE} {CONVERSION_NOTE} In the registry, liftoff
            thrust is converted to meganewtons and rounded to one decimal place
            so the entries read in one unit; each profile gives it as published.
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
