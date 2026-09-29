import { MeasurementTable } from "@/features/vehicles/components/measurement-table";
import { VehicleProfileSection } from "@/features/vehicles/components/vehicle-profile-section";
import type { AircraftPerformance } from "@/features/vehicles/types";

interface PerformancePanelProps {
  index?: number;
  name: string;
  performance: AircraftPerformance;
}

/** Performance (spec 9): speed, range and ceiling as published. */
export function PerformancePanel({
  index,
  name,
  performance,
}: PerformancePanelProps) {
  return (
    <VehicleProfileSection
      description="Published figures for the baseline aircraft. Range depends on load and fuel, so it is a reference value rather than a mission figure."
      id="performance"
      index={index}
      title="Performance"
    >
      <MeasurementTable
        caption={`${name} performance`}
        rows={[
          { label: "Maximum speed", measurement: performance.maxSpeed },
          { label: "Range", measurement: performance.range },
          { label: "Service ceiling", measurement: performance.serviceCeiling },
        ]}
      />
    </VehicleProfileSection>
  );
}
