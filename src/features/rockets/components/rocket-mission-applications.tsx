import { Orbit, PackageOpen } from "lucide-react";

import { ProfileSection } from "@/features/rockets/components/profile-section";
import {
  formatLaunchConfiguration,
  formatOrbitType,
  formatRocketMeasurement,
} from "@/features/rockets/utils";
import type { RocketPerformance } from "@/features/vehicles/types";

interface RocketMissionApplicationsProps {
  performance: RocketPerformance;
}

export function RocketMissionApplications({
  performance,
}: RocketMissionApplicationsProps) {
  return (
    <ProfileSection
      description="Mission applications are limited to the supported orbit classes and payload records supplied with this configuration."
      eyebrow="07 // Mission envelope"
      id="mission-applications"
      title="Mission Applications"
    >
      <div className="grid gap-5 xl:grid-cols-[0.7fr_1.3fr]">
        <div className="orbix-frame border-atmosphere/25 bg-[#080d17] p-5 sm:p-6">
          <p className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
            <Orbit aria-hidden="true" className="text-accent" size={15} />
            Supported regimes
          </p>
          <ul className="mt-6 grid gap-px overflow-hidden border border-atmosphere/20 bg-atmosphere/20 sm:grid-cols-2 xl:grid-cols-1">
            {performance.supportedOrbits.map((orbit, index) => (
              <li
                className="flex items-center justify-between gap-4 bg-[#050a12] px-4 py-3.5"
                key={orbit}
              >
                <span className="text-sm">{formatOrbitType(orbit)}</span>
                <span className="font-mono text-[0.58rem] tracking-[0.12em] text-accent">
                  {String(index + 1).padStart(2, "0")}
                  {" // "}
                  {orbit}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="orbix-frame overflow-hidden border-atmosphere/25 bg-[#080d17]">
          <div className="flex items-center gap-3 border-b border-atmosphere/20 px-5 py-4 sm:px-6">
            <PackageOpen aria-hidden="true" className="text-signal" size={17} />
            <h3 className="font-display text-lg font-semibold">
              Published payload records
            </h3>
          </div>
          <dl className="divide-y divide-atmosphere/15">
            {performance.payloadCapabilities.map((capability) => {
              const payload = formatRocketMeasurement(capability.mass);

              return (
                <div
                  className="grid gap-4 px-5 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6"
                  key={`${capability.orbit}-${capability.configuration}`}
                >
                  <dt className="font-semibold">
                    {formatOrbitType(capability.orbit)}
                    <span className="mt-1.5 block text-xs leading-5 font-normal text-muted">
                      {formatLaunchConfiguration(capability.configuration)}
                      {" // "}
                      {payload.note}
                    </span>
                  </dt>
                  <dd className="orbix-telemetry-value text-xl text-signal">
                    {payload.value}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    </ProfileSection>
  );
}
