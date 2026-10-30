import { MeasurementTable } from "@/features/vehicles/components/measurement-table";
import { VehicleProfileSection } from "@/features/vehicles/components/vehicle-profile-section";
import type { AircraftPerformance } from "@/features/vehicles/types";

interface PerformancePanelProps {
  name: string;
  performance: AircraftPerformance;
}

/** Performance (spec 9): speed, range and ceiling as published. */
export function PerformancePanel({ name, performance }: PerformancePanelProps) {
  return (
    <VehicleProfileSection
      description="Published figures for the baseline aircraft. Range depends on load and fuel, so it is a reference value rather than a mission figure."
      id="performance"
      title="Performance"
    >
      <MeasurementTable
        caption={`${name} performance`}
        note={
          performance.rangeBasis
            ? `Range basis: ${performance.rangeBasis.charAt(0).toLowerCase()}${performance.rangeBasis.slice(1)}.`
            : "The source gives no basis for the range, such as fuel load or tanks."
        }
        rows={[
          { label: "Maximum speed", measurement: performance.maxSpeed },
          { label: "Range", measurement: performance.range },
          { label: "Service ceiling", measurement: performance.serviceCeiling },
        ]}
      />
    </VehicleProfileSection>
  );
}
