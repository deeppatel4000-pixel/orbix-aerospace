import { DataTable } from "@/components/ui/data-table";
import {
  formatLaunchConfiguration,
  formatOrbitType,
} from "@/features/rockets/utils";
import {
  basisNote,
  joinTableNotes,
  renderDualMeasurement,
} from "@/features/vehicles/components/measurement-display";
import { VehicleProfileSection } from "@/features/vehicles/components/vehicle-profile-section";
import type { OrbitType, RocketPerformance } from "@/features/vehicles/types";

interface PerformancePanelProps {
  index?: number;
  name: string;
  performance: RocketPerformance;
}

/**
 * "Low Earth orbit (LEO)", or just "Earth escape" where the code only
 * repeats a word of the name (ESCAPE).
 */
function orbitName(orbit: OrbitType) {
  const name = formatOrbitType(orbit);
  const code = orbit.toLocaleUpperCase("en-US");
  return name.toLocaleUpperCase("en-US").split(/\s+/).includes(code)
    ? name
    : `${name} (${orbit})`;
}

/** "A, B and C". */
function formatList(items: readonly string[]) {
  return items.length > 1
    ? `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`
    : (items[0] ?? "");
}

/**
 * Performance (spec 9): payload to each published destination as a spec
 * sheet (destination, payload, configuration, so the figure is the second
 * column and in view on a phone), with any supported destination the
 * record gives no payload figure for named in the table's note.
 */
export function PerformancePanel({
  index,
  name,
  performance,
}: PerformancePanelProps) {
  const { payloadCapabilities, supportedOrbits } = performance;
  const withPayload = new Set(payloadCapabilities.map((row) => row.orbit));
  const otherOrbits = supportedOrbits
    .filter((orbit) => !withPayload.has(orbit))
    .map((orbit) => orbitName(orbit));
  const destinations =
    otherOrbits.length === 1
      ? "a supported destination"
      : "supported destinations";
  // Set in the table-note style, under the table when there is one, like
  // the basis note it follows.
  const otherNote =
    otherOrbits.length > 0
      ? payloadCapabilities.length > 0
        ? `The record also lists ${formatList(otherOrbits)} as ${destinations}, with no published payload figure.`
        : `The record lists ${formatList(otherOrbits)} as ${destinations}.`
      : undefined;

  return (
    <VehicleProfileSection
      description="Payload mass depends on the destination orbit and on whether boosters are recovered, so each figure is tied to both."
      id="performance"
      index={index}
      title="Performance"
    >
      {payloadCapabilities.length > 0 ? (
        <DataTable
          singleLineCells
          caption={`${name} payload capability`}
          columns={[
            {
              cell: (capability) => orbitName(capability.orbit),
              header: "Destination",
              key: "destination",
            },
            {
              cell: (capability) => renderDualMeasurement(capability.mass),
              header: "Payload",
              key: "payload",
              numeric: true,
            },
            {
              cell: (capability) =>
                formatLaunchConfiguration(capability.configuration),
              header: "Configuration",
              key: "configuration",
            },
          ]}
          getRowKey={(capability) =>
            `${capability.orbit}-${capability.configuration}`
          }
          note={joinTableNotes(
            basisNote(payloadCapabilities.map((row) => row.mass)),
            otherNote,
          )}
          rows={payloadCapabilities}
        />
      ) : (
        <>
          <p className="text-muted">No payload figures are published.</p>
          {otherNote ? (
            <p className="orbix-data-table__note max-w-[68ch]">{otherNote}</p>
          ) : null}
        </>
      )}
    </VehicleProfileSection>
  );
}
