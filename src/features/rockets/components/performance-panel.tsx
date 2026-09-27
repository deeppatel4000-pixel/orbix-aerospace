import {
  formatLaunchConfiguration,
  formatOrbitType,
} from "@/features/rockets/utils";
import { DataTable } from "@/features/vehicles/components/data-table";
import { VehicleProfileSection } from "@/features/vehicles/components/vehicle-profile-section";
import type { RocketPerformance } from "@/features/vehicles/types";
import {
  formatMeasurementParts,
  formatQualifierLabel,
} from "@/features/vehicles/utils/format-measurement";

interface PerformancePanelProps {
  name: string;
  performance: RocketPerformance;
}

/**
 * Performance (spec 14): payload to each published destination, then the
 * orbit classes the record lists as supported.
 */
export function PerformancePanel({ name, performance }: PerformancePanelProps) {
  return (
    <VehicleProfileSection
      description="Payload mass depends on the destination orbit and on whether boosters are recovered, so each figure is tied to both."
      id="performance"
      title="Performance"
    >
      {performance.payloadCapabilities.length > 0 ? (
        <DataTable
          caption={`${name} payload capability`}
          columns={[
            { label: "Destination" },
            { label: "Configuration" },
            { label: "Payload", numeric: true },
            { label: "Unit" },
            { label: "Basis" },
          ]}
          rows={performance.payloadCapabilities.map((capability) => {
            const { unit, value } = formatMeasurementParts(capability.mass);

            return {
              cells: [
                formatLaunchConfiguration(capability.configuration),
                value,
                <span className="orbix-table-unit" key="unit">
                  {unit}
                </span>,
                <span className="text-muted" key="basis">
                  {formatQualifierLabel(capability.mass.qualifier)}
                </span>,
              ],
              header: (
                <span className="whitespace-nowrap">
                  {formatOrbitType(capability.orbit)} ({capability.orbit})
                </span>
              ),
              key: `${capability.orbit}-${capability.configuration}`,
            };
          })}
        />
      ) : (
        <p className="text-muted">No payload figures are published.</p>
      )}

      <h3 className="orbix-h4 mt-8 text-foreground">Supported destinations</h3>
      <ul className="mt-3 flex flex-wrap gap-2">
        {performance.supportedOrbits.map((orbit) => (
          <li className="orbix-tag" key={orbit}>
            {formatOrbitType(orbit)} ({orbit})
          </li>
        ))}
      </ul>
    </VehicleProfileSection>
  );
}
