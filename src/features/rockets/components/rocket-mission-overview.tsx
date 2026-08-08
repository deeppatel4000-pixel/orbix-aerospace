import { CalendarDays, Factory, Globe2, Layers3, Orbit } from "lucide-react";

import { ProfileSection } from "@/features/rockets/components/profile-section";
import { formatRocketFirstFlight } from "@/features/rockets/utils";
import type { Rocket } from "@/features/vehicles/types";

interface RocketMissionOverviewProps {
  rocket: Rocket;
}

export function RocketMissionOverview({ rocket }: RocketMissionOverviewProps) {
  const overviewItems = [
    { icon: Factory, label: "Prime manufacturer", value: rocket.manufacturer },
    { icon: Globe2, label: "Country of origin", value: rocket.country.name },
    {
      icon: CalendarDays,
      label: "First integrated flight",
      value: formatRocketFirstFlight(rocket.firstFlight),
    },
    {
      icon: Layers3,
      label: "Propulsion elements",
      value: String(rocket.stages.length).padStart(2, "0"),
    },
  ] as const;

  return (
    <ProfileSection
      description="The recorded program identity, launch architecture, and mission envelope supplied by the ORBIX vehicle registry."
      eyebrow="01 // Program record"
      id="overview"
      title="Launch Vehicle Overview"
    >
      <div className="grid overflow-hidden border border-atmosphere/25 bg-atmosphere/20 lg:grid-cols-[minmax(0,1.25fr)_minmax(17rem,0.75fr)]">
        <div className="bg-[#080d17] p-6 sm:p-8">
          <p className="font-mono text-[0.62rem] tracking-[0.16em] text-signal uppercase">
            Mission role // Launch vehicle
          </p>
          <p className="mt-5 max-w-3xl text-base leading-8 text-foreground/90">
            {rocket.description}
          </p>
          <div className="mt-8 border-t border-atmosphere/20 pt-6">
            <p className="flex items-center gap-2 font-mono text-[0.6rem] tracking-[0.14em] text-muted uppercase">
              <Orbit aria-hidden="true" className="text-accent" size={15} />
              Recorded mission regimes
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {rocket.performance.supportedOrbits.map((orbit) => (
                <li
                  className="border border-accent/25 bg-accent/8 px-3 py-1.5 font-mono text-[0.62rem] tracking-[0.12em] text-accent uppercase"
                  key={orbit}
                >
                  {orbit}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <dl className="grid gap-px bg-atmosphere/20 sm:grid-cols-2 lg:grid-cols-1">
          {overviewItems.map((item) => (
            <div className="bg-[#060a12] p-5 sm:p-6" key={item.label}>
              <dt className="flex items-center justify-between gap-4 font-mono text-[0.58rem] tracking-[0.13em] text-muted uppercase">
                {item.label}
                <item.icon
                  aria-hidden="true"
                  className="text-signal"
                  size={15}
                />
              </dt>
              <dd className="orbix-telemetry-value mt-4 text-sm leading-6 text-foreground">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </ProfileSection>
  );
}
