import { DataTable } from "@/components/ui/data-table";
import { Tag } from "@/components/ui/tag";
import {
  formatLaunchConfiguration,
  formatOrbitType,
} from "@/features/rockets/utils";
import { renderDualMeasurement } from "@/features/vehicles/components/measurement-display";
import { VehicleProfileSection } from "@/features/vehicles/components/vehicle-profile-section";
import type { OrbitType, RocketPerformance } from "@/features/vehicles/types";
import { formatQualifierLabel } from "@/features/vehicles/utils/format-measurement";

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

/**
 * Performance (spec 9): payload to each published destination as a spec
 * sheet, then the orbit classes the record lists as supported.
 */
export function PerformancePanel({
  index,
  name,
  performance,
}: PerformancePanelProps) {
  return (
    <VehicleProfileSection
      description="Payload mass depends on the destination orbit and on whether boosters are recovered, so each figure is tied to both."
      id="performance"
      index={index}
      title="Performance"
    >
      {performance.payloadCapabilities.length > 0 ? (
        <DataTable
          caption={`${name} payload capability`}
          columns={[
            {
              cell: (capability) => (
                <span className="whitespace-nowrap">
                  {orbitName(capability.orbit)}
                </span>
              ),
              header: "Destination",
              key: "destination",
            },
            {
              cell: (capability) =>
                formatLaunchConfiguration(capability.configuration),
              header: "Configuration",
              key: "configuration",
            },
            {
              cell: (capability) => renderDualMeasurement(capability.mass),
              header: "Payload",
              key: "payload",
              numeric: true,
            },
            {
              cell: (capability) => (
                <span className="text-muted">
                  {formatQualifierLabel(capability.mass.qualifier)}
                </span>
              ),
              header: "Basis",
              key: "basis",
            },
          ]}
          getRowKey={(capability) =>
            `${capability.orbit}-${capability.configuration}`
          }
          rows={performance.payloadCapabilities}
        />
      ) : (
        <p className="text-muted">No payload figures are published.</p>
      )}

      {/* Set like the table caption above: a label for the list, not a
          heading larger than the tables' own. */}
      <h3 className="mt-10 text-sm leading-[1.4] font-medium text-foreground">
        Supported destinations
      </h3>
      <ul className="mt-4 flex flex-wrap gap-2">
        {performance.supportedOrbits.map((orbit) => (
          <li key={orbit}>
            {/* Allowed to wrap: "Geostationary transfer orbit (GTO)" is wider
                than a 320px screen's column. */}
            <Tag className="whitespace-normal">{orbitName(orbit)}</Tag>
          </li>
        ))}
      </ul>
    </VehicleProfileSection>
  );
}
