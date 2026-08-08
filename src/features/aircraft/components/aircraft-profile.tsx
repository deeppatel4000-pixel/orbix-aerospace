import Link from "next/link";
import { ChevronRight, Cloud, Gauge, Navigation, Plane } from "lucide-react";

import { Container } from "@/components/layout/container";
import { AircraftProfileCta } from "@/features/aircraft/components/aircraft-profile-cta";
import { AircraftImage } from "@/features/aircraft/components/aircraft-image";
import { AircraftVisualPanel } from "@/features/aircraft/components/aircraft-visual-panel";
import { DimensionsPanel } from "@/features/aircraft/components/dimensions-panel";
import { EngineeringNotesPanel } from "@/features/aircraft/components/engineering-notes-panel";
import { HistoricalTimeline } from "@/features/aircraft/components/historical-timeline";
import { MissionApplications } from "@/features/aircraft/components/mission-applications";
import { MissionOverview } from "@/features/aircraft/components/mission-overview";
import { PerformancePanel } from "@/features/aircraft/components/performance-panel";
import { PropulsionPanel } from "@/features/aircraft/components/propulsion-panel";
import { RelatedAircraft } from "@/features/aircraft/components/related-aircraft";
import { TechnicalDashboard } from "@/features/aircraft/components/technical-dashboard";
import { VariantsPanel } from "@/features/aircraft/components/variants-panel";
import { listAircraft } from "@/features/aircraft/data";
import {
  formatAircraftMeasurement,
  formatAircraftRoles,
} from "@/features/aircraft/utils";
import type { Aircraft } from "@/features/vehicles/types";

interface AircraftProfileProps {
  aircraft: Aircraft;
}

const profileNavigation = [
  { href: "#mission-overview", label: "Mission" },
  { href: "#aircraft-image", label: "Image" },
  { href: "#technical-dashboard", label: "Dashboard" },
  { href: "#performance", label: "Performance" },
  { href: "#dimensions", label: "Dimensions" },
  { href: "#powerplant", label: "Powerplant" },
  { href: "#engineering-notes", label: "Engineering Notes" },
  { href: "#variants", label: "Variants" },
  { href: "#historical-timeline", label: "Timeline" },
  { href: "#mission-applications", label: "Applications" },
  { href: "#related-aircraft", label: "Related" },
] as const;

export function AircraftProfile({ aircraft }: AircraftProfileProps) {
  const maxSpeed = formatAircraftMeasurement(aircraft.performance.maxSpeed);
  const range = formatAircraftMeasurement(aircraft.performance.range);
  const serviceCeiling = formatAircraftMeasurement(
    aircraft.performance.serviceCeiling,
  );
  const relatedAircraft = listAircraft().filter(
    (candidate) => candidate.id !== aircraft.id,
  );

  return (
    <article className="bg-[#050908]">
      <header className="relative isolate flex min-h-[76svh] overflow-hidden border-b border-tactical/35 bg-[#030706]">
        <AircraftImage
          aircraft={aircraft}
          className="-z-30"
          fillContainer
          imageClassName="saturate-[0.86] contrast-[1.06]"
          priority
          sizes="100vw"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(2,5,5,0.96)_0%,rgba(2,5,5,0.72)_44%,rgba(2,5,5,0.18)_78%),linear-gradient(180deg,rgba(2,5,5,0.42)_0%,rgba(2,5,5,0.03)_42%,rgba(2,5,5,0.96)_100%)]"
        />
        <div
          aria-hidden="true"
          className="technical-grid absolute inset-0 -z-10 opacity-25 mix-blend-screen"
        />

        <Container className="flex w-full flex-col justify-between py-8 sm:py-10 lg:py-12">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 font-mono text-[0.64rem] tracking-[0.12em] text-white/60 uppercase">
              <li>
                <Link
                  className="rounded-sm transition-colors hover:text-tactical-amber focus-visible:text-tactical-amber"
                  href="/"
                >
                  Home
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={13} />
              </li>
              <li>
                <Link
                  className="rounded-sm transition-colors hover:text-tactical-amber focus-visible:text-tactical-amber"
                  href="/aircraft"
                >
                  Aircraft
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={13} />
              </li>
              <li aria-current="page" className="text-white">
                {aircraft.name}
              </li>
            </ol>
          </nav>

          <div className="mt-32 grid gap-10 lg:mt-24 lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-end lg:gap-16">
            <div className="max-w-4xl">
              <p className="flex items-center gap-3 font-mono text-[0.66rem] tracking-[0.2em] text-tactical-amber uppercase">
                <Plane aria-hidden="true" size={16} />
                Aircraft mission dossier // {aircraft.id}
              </p>
              <h1 className="font-display mt-5 text-5xl leading-[0.9] font-semibold tracking-[-0.055em] text-balance text-white sm:text-7xl lg:text-[5.5rem]">
                {aircraft.name}
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-7 text-white/72 sm:text-lg sm:leading-8">
                {aircraft.description}
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                {aircraft.roles.map((role) => (
                  <span
                    className="border border-tactical-amber/35 bg-black/45 px-3 py-1.5 font-mono text-[0.62rem] tracking-[0.12em] text-tactical-amber uppercase backdrop-blur-md"
                    key={role}
                  >
                    {formatAircraftRoles([role])}
                  </span>
                ))}
              </div>
            </div>

            <aside
              aria-label="Aircraft flight envelope summary"
              className="orbix-frame border-white/20 bg-black/62 p-5 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between gap-4 border-b border-white/15 pb-4">
                <div>
                  <p className="font-mono text-[0.58rem] tracking-[0.14em] text-white/50 uppercase">
                    Published envelope
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    Public reference values
                  </p>
                </div>
                <span className="orbix-status text-[0.54rem] text-tactical-amber">
                  Indexed
                </span>
              </div>
              <dl className="mt-4 space-y-1">
                {[
                  {
                    icon: Gauge,
                    label: "Maximum speed",
                    value: maxSpeed.value,
                  },
                  { icon: Navigation, label: "Range", value: range.value },
                  {
                    icon: Cloud,
                    label: "Service ceiling",
                    value: serviceCeiling.value,
                  },
                ].map((item) => (
                  <div
                    className="flex items-center justify-between gap-5 border-b border-white/10 py-3 last:border-0"
                    key={item.label}
                  >
                    <dt className="flex items-center gap-2 font-mono text-[0.58rem] tracking-[0.1em] text-white/52 uppercase">
                      <item.icon aria-hidden="true" size={13} /> {item.label}
                    </dt>
                    <dd className="orbix-telemetry-value text-sm text-white">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </aside>
          </div>
        </Container>
      </header>

      <div className="sticky top-[5.5rem] z-30 border-b border-tactical/25 bg-[#050908]/92 backdrop-blur-xl">
        <Container>
          <nav
            aria-label="Aircraft dossier sections"
            className="[scrollbar-width:thin] overflow-x-auto"
          >
            <ul className="flex min-w-max items-center gap-1 py-3">
              {profileNavigation.map((item, index) => (
                <li key={item.href}>
                  <a
                    className="inline-flex min-h-11 items-center border border-transparent px-3.5 text-sm text-muted transition-colors hover:border-tactical/30 hover:bg-tactical/8 hover:text-tactical-amber focus-visible:border-tactical-amber focus-visible:text-tactical-amber"
                    href={item.href}
                  >
                    <span className="mr-2 font-mono text-[0.58rem] text-tactical-amber">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </div>

      <Container>
        <MissionOverview aircraft={aircraft} />
        <AircraftVisualPanel aircraft={aircraft} />
        <TechnicalDashboard aircraft={aircraft} />
        <PerformancePanel performance={aircraft.performance} />
        <DimensionsPanel
          dimensions={aircraft.dimensions}
          weights={aircraft.weights}
        />
        <PropulsionPanel propulsion={aircraft.propulsion} />
        <EngineeringNotesPanel notes={aircraft.engineeringAnalysis} />
        <VariantsPanel variants={aircraft.variants} />
        <HistoricalTimeline aircraft={aircraft} />
        <MissionApplications roles={aircraft.roles} />
        <RelatedAircraft aircraft={relatedAircraft} />
        <AircraftProfileCta aircraft={aircraft} />
      </Container>
    </article>
  );
}
