import { Flame, Orbit, PackageOpen, Ruler, Weight } from "lucide-react";

import { ProfileSection } from "@/features/rockets/components/profile-section";
import { SpecificationGrid } from "@/features/rockets/components/specification-grid";
import {
  formatLaunchConfiguration,
  formatOrbitType,
  formatRocketMeasurement,
} from "@/features/rockets/utils";
import type {
  RocketDimensions,
  RocketMass,
  RocketPerformance,
} from "@/features/vehicles/types";

interface PerformancePanelProps {
  dimensions: RocketDimensions;
  mass: RocketMass;
  performance: RocketPerformance;
}

export function PerformancePanel({
  dimensions,
  mass,
  performance,
}: PerformancePanelProps) {
  return (
    <ProfileSection
      description="Configuration-specific vehicle scale, liftoff output, and payload capability with source qualifiers retained."
      eyebrow="04 // Mission capability"
      id="performance"
      title="Performance"
    >
      <SpecificationGrid
        items={[
          {
            icon: Ruler,
            label: "Vehicle height",
            ...formatRocketMeasurement(dimensions.height),
          },
          {
            icon: Weight,
            label: "Liftoff mass",
            ...formatRocketMeasurement(mass.liftoff),
          },
          {
            icon: Flame,
            label: "Liftoff thrust",
            ...formatRocketMeasurement(performance.liftoffThrust),
          },
        ]}
      />

      <div className="orbix-frame mt-6 overflow-hidden border-atmosphere/20 bg-surface/70">
        <div className="flex items-center gap-3 border-b border-atmosphere/20 bg-[#080d17] p-5 sm:p-6">
          <PackageOpen
            aria-hidden="true"
            className="text-accent"
            size={19}
            strokeWidth={1.7}
          />
          <h3 className="font-display text-xl font-semibold">
            Payload capability
          </h3>
        </div>
        <dl className="divide-y divide-border">
          {performance.payloadCapabilities.map((capability) => {
            const payload = formatRocketMeasurement(capability.mass);

            return (
              <div
                className="grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-6"
                key={capability.orbit + "-" + capability.configuration}
              >
                <div>
                  <dt className="font-semibold">
                    {formatOrbitType(capability.orbit)}
                  </dt>
                  <dd className="mt-1 text-xs text-muted">
                    {formatLaunchConfiguration(capability.configuration)}
                    configuration // {payload.note}
                  </dd>
                </div>
                <dd className="orbix-telemetry-value text-xl text-signal">
                  {payload.value}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>

      <div className="orbix-frame mt-6 border-atmosphere/20 bg-surface/70 p-5 sm:p-6">
        <p className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
          <Orbit aria-hidden="true" className="text-accent" size={15} />
          Supported mission regimes
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {performance.supportedOrbits.map((orbit) => (
            <li
              className="border border-accent/20 bg-accent/8 px-3 py-1.5 text-xs text-accent"
              key={orbit}
            >
              {formatOrbitType(orbit)} ({orbit})
            </li>
          ))}
        </ul>
      </div>
    </ProfileSection>
  );
}
