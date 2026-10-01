import Link from "next/link";

import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";
import { PhotoHero } from "@/components/ui/photo-hero";
import { SpecPanel } from "@/components/ui/spec-panel";
import { AircraftCard } from "@/features/aircraft/components/aircraft-card";
import { getAircraftVisual } from "@/features/aircraft/data/aircraft-visuals";
import {
  formatAircraftEngineType,
  formatAircraftRoles,
} from "@/features/aircraft/utils";
import { AircraftSizeComparison, toMetres } from "@/features/vehicles/drawings";
import {
  CONVERSION_NOTE,
  MINIMUM_NOTE,
  measurementFigure,
  panelSecondary,
} from "@/features/vehicles/components/measurement-display";
import { ProfileLink } from "@/features/vehicles/components/profile-link";
import { VehicleRegistry } from "@/features/vehicles/components/vehicle-registry";
import type { Aircraft } from "@/features/vehicles/types";
import { formatCountWord } from "@/features/vehicles/utils/format-measurement";

interface AircraftExplorerProps {
  aircraft: readonly Aircraft[];
}

/**
 * The aircraft in the hero photograph and the figures under it: the B-2,
 * whose photograph puts the whole airframe across the upper half of the
 * frame, so a wide band keeps both wingtips. Not the SR-71, whose
 * photograph opens the home page.
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

function capitalise(text: string) {
  return text.charAt(0).toLocaleUpperCase("en-US") + text.slice(1);
}

/**
 * The pictured aircraft, named on the ground under the photograph's
 * caption, with three published figures as an open definition list and a
 * link to its profile.
 */
function PicturedAircraft({ aircraft }: { aircraft: Aircraft }) {
  const { maxSpeed, range, serviceCeiling } = aircraft.performance;
  const summary = getAircraftVisual(aircraft.id)?.cardSummary;

  return (
    <section
      aria-labelledby="pictured-aircraft-title"
      className="grid gap-8 pb-16 lg:grid-cols-12 lg:gap-6 lg:pb-20"
    >
      <div className="lg:col-span-4">
        <p className="orbix-kicker">Pictured above</p>
        <h2
          className="font-display mt-2 text-[2rem] leading-none tracking-[-0.035em] text-foreground"
          id="pictured-aircraft-title"
        >
          {aircraft.name}
        </h2>
        {summary ? <p className="mt-3 text-muted">{summary}</p> : null}
        <div className="mt-5">
          <ProfileLink href={`/aircraft/${aircraft.id}`} name={aircraft.name} />
        </div>
      </div>
      <SpecPanel
        className="lg:col-span-8"
        columns={3}
        items={[
          { label: "Maximum speed", measurement: maxSpeed },
          { label: "Range", measurement: range },
          { label: "Service ceiling", measurement: serviceCeiling },
        ].map(({ label, measurement }) => ({
          label,
          primary: true,
          secondary: panelSecondary(measurement),
          ...measurementFigure(measurement),
        }))}
      />
    </section>
  );
}

/**
 * "The B-2 Spirit spans almost five F-35 Lightning IIs set wingtip to
 * wingtip. ", worked out from the recorded wingspans, or nothing when the
 * widest is not at least twice the narrowest. The count is the nearest
 * true phrasing: "as much as" for a whole ratio, "almost" when the ratio
 * falls short of the next whole number by a quarter or less (172 ft over
 * 35 ft is 4.91), otherwise "more than" the whole part.
 */
function spanComparison(aircraft: readonly Aircraft[]) {
  const bySpan = [...aircraft].sort(
    (a, b) => toMetres(b.dimensions.wingspan) - toMetres(a.dimensions.wingspan),
  );
  const widest = bySpan[0];
  const narrowest = bySpan.at(-1);
  if (!widest || !narrowest || widest === narrowest) return "";
  const ratio =
    toMetres(widest.dimensions.wingspan) /
    toMetres(narrowest.dimensions.wingspan);
  if (ratio < 2) return "";
  const whole = Math.floor(ratio);
  const next = Math.ceil(ratio);
  const phrase =
    whole === ratio
      ? `as much as ${formatCountWord(whole)}`
      : next - ratio <= 0.25
        ? `almost ${formatCountWord(next)}`
        : `more than ${formatCountWord(whole)}`;
  return `The ${widest.name} spans ${phrase} ${narrowest.name}s set wingtip to wingtip. `;
}

/** The `/aircraft` registry page. */
export function AircraftExplorer({ aircraft }: AircraftExplorerProps) {
  const featured =
    aircraft.find((item) => item.id === FEATURED_AIRCRAFT_ID) ?? aircraft[0];
  const heroVisual = featured ? getAircraftVisual(featured.id) : undefined;

  const heroText = (
    <>
      <h1 className="orbix-h1 text-foreground">Aircraft registry</h1>
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
      {heroVisual && featured ? (
        <PhotoHero
          // A band under the text at every width: the flying wing spans
          // nearly the whole frame, and a plate beside the text would crop
          // both wingtips.
          layout="band"
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

      <Container>
        {featured && heroVisual ? (
          <PicturedAircraft aircraft={featured} />
        ) : null}

        {aircraft.length === 0 ? (
          <EmptyState
            description="No aircraft records are available right now."
            title="No aircraft records"
          />
        ) : (
          <VehicleRegistry
            description="Each entry opens a full profile. Maximum speed and service ceiling are the published figures for the baseline aircraft."
            entries={aircraft.map((item) => ({
              card: <AircraftCard aircraft={item} />,
              id: item.id,
              keywords: aircraftKeywords(item),
            }))}
            id="available-aircraft"
            noun={{ plural: "aircraft", singular: "aircraft" }}
            searchHelp="Matches name, manufacturer, role, variant or engine."
            searchLabel="Search aircraft"
            title="Every aircraft on record"
          />
        )}

        {aircraft.length > 0 ? (
          <section
            aria-labelledby="aircraft-scale-title"
            className="mt-20 grid gap-10 border-t border-border pt-12 lg:mt-28 lg:grid-cols-12 lg:gap-6"
          >
            <div className="lg:col-span-4">
              <h2
                className="orbix-h2 text-foreground"
                id="aircraft-scale-title"
              >
                Side by side, to scale
              </h2>
              <p className="mt-5 max-w-[46ch] text-pretty text-muted">
                {spanComparison(aircraft)}Each aircraft is drawn from the length
                and wingspan in its record, and nothing else, at one scale.
              </p>
            </div>
            <AircraftSizeComparison
              aircraft={aircraft}
              className="lg:col-span-8 lg:col-start-5"
              figureNumber="1"
            />
          </section>
        ) : null}

        <section
          aria-labelledby="aircraft-sources-title"
          className="mt-16 grid gap-3 border-t border-border pt-8 pb-16 lg:grid-cols-12 lg:gap-6 lg:pb-24"
        >
          <h2
            className="text-base font-semibold text-foreground lg:col-span-4"
            id="aircraft-sources-title"
          >
            About these figures
          </h2>
          <p className="max-w-[68ch] text-sm leading-6 text-muted lg:col-span-8">
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
