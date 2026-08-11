import { Flame, Globe2, Layers3, Orbit, Ruler, Weight } from "lucide-react";

import { ProfileSection } from "@/features/rockets/components/profile-section";
import { SpecificationGrid } from "@/features/rockets/components/specification-grid";
import { formatRocketMeasurement } from "@/features/rockets/utils";
import type { Rocket } from "@/features/vehicles/types";

interface RocketTechnicalDashboardProps {
  rocket: Rocket;
}

export function RocketTechnicalDashboard({
  rocket,
}: RocketTechnicalDashboardProps) {
  return (
    <ProfileSection
      description="A dense launch-control summary assembled only from the selected registry configuration."
      eyebrow="Systems board"
      mode="data"
      id="technical-dashboard"
      title="Technical Dashboard"
    >
      <SpecificationGrid
        items={[
          {
            icon: Ruler,
            label: "Vehicle height",
            ...formatRocketMeasurement(rocket.dimensions.height),
          },
          {
            icon: Weight,
            label: "Liftoff mass",
            ...formatRocketMeasurement(rocket.mass.liftoff),
          },
          {
            icon: Flame,
            label: "Liftoff thrust",
            ...formatRocketMeasurement(rocket.performance.liftoffThrust),
          },
          {
            icon: Layers3,
            label: "Stage elements",
            note: "Elements represented in this configuration",
            value: String(rocket.stages.length).padStart(2, "0"),
          },
          {
            icon: Globe2,
            label: "Country of origin",
            note: rocket.country.isoCode,
            value: rocket.country.name,
          },
          {
            icon: Orbit,
            label: "Mission regimes",
            note: "Supported orbit classes in the registry",
            value: String(rocket.performance.supportedOrbits.length).padStart(
              2,
              "0",
            ),
          },
        ]}
      />
    </ProfileSection>
  );
}
