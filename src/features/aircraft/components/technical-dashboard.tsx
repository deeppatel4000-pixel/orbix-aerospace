import {
  CalendarDays,
  Factory,
  Gauge,
  Globe2,
  Scale,
  Tags,
} from "lucide-react";

import { ProfileSection } from "@/features/aircraft/components/profile-section";
import {
  formatAircraftMeasurement,
  formatAircraftRoles,
  formatFirstFlight,
} from "@/features/aircraft/utils";
import type { Aircraft } from "@/features/vehicles/types";

interface TechnicalDashboardProps {
  aircraft: Aircraft;
}

export function TechnicalDashboard({ aircraft }: TechnicalDashboardProps) {
  const dashboardItems = [
    { icon: Factory, label: "Manufacturer", value: aircraft.manufacturer },
    { icon: Globe2, label: "Origin", value: aircraft.country.name },
    {
      icon: CalendarDays,
      label: "First flight",
      value: formatFirstFlight(aircraft.firstFlight),
    },
    {
      icon: Tags,
      label: "Mission role",
      value: formatAircraftRoles(aircraft.roles),
    },
    {
      icon: Gauge,
      label: "Maximum speed",
      value: formatAircraftMeasurement(aircraft.performance.maxSpeed).value,
    },
    {
      icon: Scale,
      label: "Maximum takeoff",
      value: formatAircraftMeasurement(aircraft.weights.maximumTakeoff).value,
    },
  ] as const;

  return (
    <ProfileSection
      description="A compact technical dashboard of identity and configuration values already present in the aircraft record."
      eyebrow="03 // Systems summary"
      id="technical-dashboard"
      title="Technical Dashboard"
    >
      <dl className="grid gap-px overflow-hidden border border-tactical/25 bg-tactical/20 sm:grid-cols-2 xl:grid-cols-3">
        {dashboardItems.map((item) => (
          <div className="bg-[#0a100f] p-5 sm:p-6" key={item.label}>
            <dt className="flex items-center justify-between gap-4 font-mono text-[0.6rem] tracking-[0.13em] text-muted uppercase">
              {item.label}
              <item.icon
                aria-hidden="true"
                className="text-tactical-amber"
                size={15}
              />
            </dt>
            <dd className="orbix-telemetry-value mt-6 text-base leading-6 text-foreground">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </ProfileSection>
  );
}
