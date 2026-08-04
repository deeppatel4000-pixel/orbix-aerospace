import { MoveHorizontal, Ruler, Weight } from "lucide-react";

import { ProfileSection } from "@/features/aircraft/components/profile-section";
import { SpecificationGrid } from "@/features/aircraft/components/specification-grid";
import { formatAircraftMeasurement } from "@/features/aircraft/utils";
import type {
  AircraftDimensions,
  AircraftWeights,
} from "@/features/vehicles/types";

interface DimensionsPanelProps {
  dimensions: AircraftDimensions;
  weights: AircraftWeights;
}

export function DimensionsPanel({ dimensions, weights }: DimensionsPanelProps) {
  return (
    <ProfileSection
      description="Airframe geometry and mass properties represented with explicit source units."
      eyebrow="04 // Airframe"
      id="dimensions"
      title="Dimensions"
    >
      <SpecificationGrid
        items={[
          {
            icon: Ruler,
            label: "Length",
            ...formatAircraftMeasurement(dimensions.length),
          },
          {
            icon: MoveHorizontal,
            label: "Wingspan",
            ...formatAircraftMeasurement(dimensions.wingspan),
          },
          {
            icon: Weight,
            label: "Empty weight",
            ...formatAircraftMeasurement(weights.empty),
          },
          {
            icon: Weight,
            label: "Maximum takeoff",
            ...formatAircraftMeasurement(weights.maximumTakeoff),
          },
        ]}
      />
    </ProfileSection>
  );
}
