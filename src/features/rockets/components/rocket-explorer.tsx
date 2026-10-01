import Link from "next/link";

import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";
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
import {
  heroCrop,
  portraitPlate,
} from "@/features/vehicles/components/hero-crop";
import {
  measurementParts,
  panelSecondary,
} from "@/features/vehicles/components/measurement-display";
import { ProfileLink } from "@/features/vehicles/components/profile-link";
import { VehicleRegistry } from "@/features/vehicles/components/vehicle-registry";
import { getVehiclePhoto } from "@/features/vehicles/data/gallery";
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
 * The pictured launch vehicle, with three published figures as an open
 * definition list and a link to its profile. It sits once in the hero's
 * text column under the actions: from 64rem beside the tall portrait
 * plate, so the column is not left empty below the buttons, and below
 * 64rem before the plate. Each figure keeps its conversion and qualifier;
 * thrust is shown in the published unit.
 */
function PicturedRocket({
  className,
  headingId,
  rocket,
}: {
  className?: string;
  headingId: string;
  rocket: Rocket;
}) {
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
    <section aria-labelledby={headingId} className={className}>
      <p className="orbix-kicker">Pictured</p>
      <h2
        className="font-display mt-2 text-[2rem] leading-none tracking-[-0.035em] text-foreground"
        id={headingId}
      >
        {rocket.name}
      </h2>
      {summary ? (
        <p className="mt-3 text-muted">{keepDesignations(summary)}</p>
      ) : null}
      {/* From 64rem each figure takes its own width, so the payload figure
          never runs past its column toward the plate. */}
      <SpecPanel
        className="mt-6 lg:[&_dl]:grid-cols-[repeat(3,auto)] lg:[&_dl]:justify-start lg:[&_dl]:gap-x-10"
        columns={3}
        items={items}
      />
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

/** "About these figures": what a figure's marks mean, in 30 words or fewer. */
function FiguresNote() {
  return (
    <section
      aria-labelledby="rocket-sources-title"
      className="mt-16 border-t border-border pt-8 pb-16 lg:pb-24"
    >
      <h2
        className="text-base font-semibold text-foreground"
        id="rocket-sources-title"
      >
        About these figures
      </h2>
      <p className="mt-3 max-w-[60ch] text-sm leading-6 text-muted">
        Figures are published specifications. A figure set under another is an
        ORBIX conversion, and thrust is shown in MN. See{" "}
        <Link className="orbix-link" href="/about#sources">
          sources
        </Link>{" "}
        and{" "}
        <Link className="orbix-link" href="/credits">
          image credits
        </Link>
        .
      </p>
    </section>
  );
}

/**
 * Below 64rem the hero stacks the headline, the plate, then the pictured
 * figures, as /aircraft does, so the first phone screen shows the
 * photograph. The text column (the hero's first child) is unwrapped there,
 * so its two blocks, the lede and the facts, sit in the hero's own column
 * around the figure, each with the column's side padding.
 */
const PLATE_FIRST = [
  "max-lg:flex max-lg:flex-col",
  "max-lg:[&>div:first-child]:contents",
  "max-lg:[&>div:first-child>div:first-child]:px-(--hero-gutter) max-lg:[&>div:first-child>div:first-child]:pt-(--space-7) max-lg:[&>div:first-child>div:first-child]:pb-(--space-6)",
  "max-lg:[&>div:first-child>div:nth-child(2)]:order-1 max-lg:[&>div:first-child>div:nth-child(2)]:px-(--hero-gutter) max-lg:[&>div:first-child>div:nth-child(2)]:pb-(--space-6)",
].join(" ");

/** The `/rockets` registry page. */
export function RocketExplorer({ rockets }: RocketExplorerProps) {
  const featured =
    rockets.find((rocket) => rocket.id === FEATURED_ROCKET_ID) ?? rockets[0];
  // The `featured` photograph (the Apollo 11 Saturn V on its rollout), not
  // the launch photograph its registry entry and profile use.
  const heroPhoto = featured
    ? getVehiclePhoto(featured.id, "featured")
    : undefined;
  const crop = heroPhoto
    ? heroCrop({ base: heroPhoto.objectPosition, lg: heroPhoto.objectPosition })
    : undefined;

  const plate = portraitPlate(heroPhoto ?? { height: 3, width: 2 });

  const heroText = (
    <>
      <h1 className="orbix-h1 text-foreground">Launch vehicle registry</h1>
      <p className="orbix-lead mt-6">
        {capitalise(formatCountWord(rockets.length))} launch vehicles with their
        published stages, engines, liftoff thrust and payload to each
        destination.
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
      {heroPhoto && crop && featured ? (
        <PhotoHero
          aside={
            <PicturedRocket
              className="lg:pr-8"
              headingId="pictured-rocket-title"
              rocket={featured}
            />
          }
          caption={heroPhoto.caption.replace(/\.$/, "")}
          className={`${crop.className} ${plate.className} ${PLATE_FIRST}`}
          plate="portrait"
          style={{ ...crop.style, ...plate.style }}
          visual={{ ...heroPhoto, objectPosition: crop.objectPosition }}
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
            description="Height is as published. Liftoff thrust is converted to meganewtons, for the configuration each record describes."
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
            className="mt-20 border-t border-border pt-12 lg:mt-28"
          >
            <h2 className="orbix-h2 text-foreground" id="rocket-scale-title">
              Heights to one scale
            </h2>
            <p className="mt-5 max-w-[60ch] text-pretty text-muted">
              {heightSpread(rockets)}Each outline is traced from a published
              drawing and scaled to the height in its record.
            </p>
            <RocketHeightLineup
              className="mt-10"
              figureNumber="1"
              rockets={rockets}
            />
          </section>
        ) : null}

        <FiguresNote />
      </Container>
    </>
  );
}
