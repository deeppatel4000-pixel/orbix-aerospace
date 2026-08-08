import { Cloud, Gauge, Navigation } from "lucide-react";

import { ProfileSection } from "@/features/aircraft/components/profile-section";
import { SpecificationGrid } from "@/features/aircraft/components/specification-grid";
import { formatAircraftMeasurement } from "@/features/aircraft/utils";
import type { AircraftPerformance } from "@/features/vehicles/types";

interface PerformancePanelProps {
  performance: AircraftPerformance;
}

export function PerformancePanel({ performance }: PerformancePanelProps) {
  const maxSpeed = formatAircraftMeasurement(performance.maxSpeed);
  const range = formatAircraftMeasurement(performance.range);
  const serviceCeiling = formatAircraftMeasurement(performance.serviceCeiling);

  return (
    <ProfileSection
      description="Published performance characteristics with their source-data qualifiers preserved."
      eyebrow="04 // Flight envelope"
      id="performance"
      title="Performance"
    >
      <SpecificationGrid
        items={[
          {
            icon: Gauge,
            label: "Maximum speed",
            ...maxSpeed,
          },
          {
            icon: Navigation,
            label: "Range",
            ...range,
          },
          {
            icon: Cloud,
            label: "Service ceiling",
            ...serviceCeiling,
          },
        ]}
      />
    </ProfileSection>
  );
}
