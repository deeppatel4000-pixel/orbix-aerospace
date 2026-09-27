import Link from "next/link";

import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/ui/empty-state";
import { RocketCard } from "@/features/rockets/components/rocket-card";
import {
  formatOrbitType,
  formatRocketClassification,
  formatRocketEngineCycle,
} from "@/features/rockets/utils";
import { VehiclePageIntro } from "@/features/vehicles/components/vehicle-page-intro";
import { VehicleRegistry } from "@/features/vehicles/components/vehicle-registry";
import type { Rocket } from "@/features/vehicles/types";

interface RocketExplorerProps {
  rockets: readonly Rocket[];
}

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

/** The `/rockets` registry page (spec 14). */
export function RocketExplorer({ rockets }: RocketExplorerProps) {
  return (
    <>
      <VehiclePageIntro
        lead="Launch vehicles described from their published specifications: stages, engines, liftoff thrust and payload to each destination, each with a photograph and its source."
        title="Launch vehicles"
      />

      <Container className="py-12">
        {rockets.length === 0 ? (
          <EmptyState
            description="No launch vehicle records are available right now."
            title="No launch vehicle records"
          />
        ) : (
          <VehicleRegistry
            entries={rockets.map((rocket, index) => ({
              card: <RocketCard priority={index === 0} rocket={rocket} />,
              id: rocket.id,
              keywords: rocketKeywords(rocket),
            }))}
            id="launch-vehicle-registry"
            noun={{ plural: "launch vehicles", singular: "launch vehicle" }}
            searchHelp="Matches name, manufacturer, engine, or an orbit such as LEO."
            searchLabel="Search launch vehicles"
          />
        )}

        <section
          aria-labelledby="rocket-sources-title"
          className="mt-16 border-t border-border-subtle pt-8"
        >
          <h2 className="orbix-h3 text-foreground" id="rocket-sources-title">
            About these figures
          </h2>
          <p className="mt-3 max-w-prose text-sm leading-6 text-muted">
            Figures are publicly released specifications. Payload figures are
            tied to a destination orbit and to whether boosters are recovered,
            and a qualifier such as approximate or maximum stays beside the
            number. Photographs are credited on each profile and on the{" "}
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
