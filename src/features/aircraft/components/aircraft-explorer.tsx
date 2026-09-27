import Link from "next/link";

import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/ui/empty-state";
import { AircraftCard } from "@/features/aircraft/components/aircraft-card";
import {
  formatAircraftEngineType,
  formatAircraftRoles,
} from "@/features/aircraft/utils";
import { VehiclePageIntro } from "@/features/vehicles/components/vehicle-page-intro";
import { VehicleRegistry } from "@/features/vehicles/components/vehicle-registry";
import type { Aircraft } from "@/features/vehicles/types";

interface AircraftExplorerProps {
  aircraft: readonly Aircraft[];
}

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

/** The `/aircraft` registry page (spec 14). */
export function AircraftExplorer({ aircraft }: AircraftExplorerProps) {
  return (
    <>
      <VehiclePageIntro
        lead="Military aircraft described from their published specifications: dimensions, weights, propulsion, performance and variants, each with a photograph and its source."
        title="Aircraft"
      />

      <Container className="py-12">
        {aircraft.length === 0 ? (
          <EmptyState
            description="No aircraft records are available right now."
            title="No aircraft records"
          />
        ) : (
          <VehicleRegistry
            entries={aircraft.map((item, index) => ({
              card: <AircraftCard aircraft={item} priority={index === 0} />,
              id: item.id,
              keywords: aircraftKeywords(item),
            }))}
            id="available-aircraft"
            noun={{ plural: "aircraft", singular: "aircraft" }}
            searchHelp="Matches name, manufacturer, role, variant or engine."
            searchLabel="Search aircraft"
          />
        )}

        <section
          aria-labelledby="aircraft-sources-title"
          className="mt-16 border-t border-border-subtle pt-8"
        >
          <h2 className="orbix-h3 text-foreground" id="aircraft-sources-title">
            About these figures
          </h2>
          <p className="mt-3 max-w-prose text-sm leading-6 text-muted">
            Figures are publicly released specifications. Where a source gives a
            value as approximate, a minimum or a maximum, the profile keeps that
            qualifier beside the number. Photographs are credited on each
            profile and on the{" "}
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
