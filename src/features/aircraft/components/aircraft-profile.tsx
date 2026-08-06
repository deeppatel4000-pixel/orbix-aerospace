import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Cloud,
  Factory,
  Gauge,
  Globe2,
  Layers3,
  Navigation,
  Plane,
  Tags,
} from "lucide-react";

import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import { AircraftImage } from "@/features/aircraft/components/aircraft-image";
import { DimensionsPanel } from "@/features/aircraft/components/dimensions-panel";
import { EngineeringNotesPanel } from "@/features/aircraft/components/engineering-notes-panel";
import { PerformancePanel } from "@/features/aircraft/components/performance-panel";
import { ProfileSection } from "@/features/aircraft/components/profile-section";
import { PropulsionPanel } from "@/features/aircraft/components/propulsion-panel";
import {
  formatAircraftMeasurement,
  formatAircraftRoles,
  formatAircraftVariantStatus,
  formatFirstFlight,
} from "@/features/aircraft/utils";
import type { Aircraft } from "@/features/vehicles/types";

interface AircraftProfileProps {
  aircraft: Aircraft;
}

const profileNavigation = [
  { href: "#overview", label: "Overview" },
  { href: "#performance", label: "Performance" },
  { href: "#propulsion", label: "Propulsion" },
  { href: "#dimensions", label: "Dimensions" },
  { href: "#engineering-notes", label: "Engineering Notes" },
] as const;

export function AircraftProfile({ aircraft }: AircraftProfileProps) {
  const maxSpeed = formatAircraftMeasurement(aircraft.performance.maxSpeed);
  const range = formatAircraftMeasurement(aircraft.performance.range);
  const serviceCeiling = formatAircraftMeasurement(
    aircraft.performance.serviceCeiling,
  );

  return (
    <article className="bg-[#050908]">
      <header className="group relative isolate flex min-h-[76svh] overflow-hidden border-b border-tactical/35 bg-[#030706]">
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
                Aircraft profile // {aircraft.id}
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
                      <item.icon aria-hidden="true" size={13} />
                      {item.label}
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

      <div className="sticky top-18 z-30 border-b border-tactical/25 bg-[#050908]/92 backdrop-blur-xl">
        <Container>
          <nav
            aria-label="Aircraft profile sections"
            className="[scrollbar-width:thin] overflow-x-auto"
          >
            <ul className="flex min-w-max items-center gap-1 py-3">
              {profileNavigation.map((item, index) => (
                <li key={item.href}>
                  <a
                    className="inline-flex min-h-10 items-center border border-transparent px-3.5 text-sm text-muted transition-colors hover:border-tactical/30 hover:bg-tactical/8 hover:text-tactical-amber focus-visible:border-tactical-amber focus-visible:text-tactical-amber"
                    href={item.href}
                  >
                    <span className="mr-2 font-mono text-[0.58rem] text-tactical-amber">
                      0{index + 1}
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
        <ProfileSection
          description="Identity, mission role, program origin, and available variant context."
          eyebrow="01 // Identity"
          id="overview"
          title="Overview"
        >
          <div className="orbix-frame overflow-hidden border-tactical/25 bg-[#080d0c]/90">
            <dl className="grid gap-px bg-tactical/20 sm:grid-cols-2">
              {[
                {
                  icon: Factory,
                  label: "Manufacturer",
                  value: aircraft.manufacturer,
                },
                {
                  icon: Globe2,
                  label: "Country of origin",
                  value: `${aircraft.country.name} (${aircraft.country.isoCode})`,
                },
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
              ].map((item) => (
                <div className="bg-[#0a100f] p-5 sm:p-6" key={item.label}>
                  <dt className="flex items-center gap-2 font-mono text-[0.6rem] tracking-[0.14em] text-muted uppercase">
                    <item.icon
                      aria-hidden="true"
                      className="text-tactical-amber"
                      size={14}
                    />
                    {item.label}
                  </dt>
                  <dd className="mt-3 text-sm leading-6 font-medium">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="border-t border-tactical/20 p-5 sm:p-6">
              <p className="flex items-center gap-2 font-mono text-[0.6rem] tracking-[0.14em] text-muted uppercase">
                <Layers3
                  aria-hidden="true"
                  className="text-tactical-amber"
                  size={14}
                />
                Recorded variants
              </p>
              <ul className="mt-5 grid gap-3 xl:grid-cols-2">
                {aircraft.variants.map((variant) => (
                  <li
                    className="border border-tactical/20 bg-black/25 p-4 transition-colors hover:border-tactical-amber/35"
                    key={variant.id}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-display text-lg font-semibold">
                          {variant.designation}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted">
                          {variant.notes ?? variant.name}
                        </p>
                      </div>
                      <span className="shrink-0 border border-tactical-amber/25 px-2.5 py-1 font-mono text-[0.56rem] tracking-[0.1em] text-tactical-amber uppercase">
                        {formatAircraftVariantStatus(variant.status)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ProfileSection>

        <PerformancePanel performance={aircraft.performance} />
        <PropulsionPanel propulsion={aircraft.propulsion} />
        <DimensionsPanel
          dimensions={aircraft.dimensions}
          weights={aircraft.weights}
        />
        <EngineeringNotesPanel notes={aircraft.engineeringAnalysis} />

        <div className="border-t border-tactical/25 py-12 sm:py-16">
          <ButtonLink href="/aircraft" variant="secondary">
            <ArrowLeft aria-hidden="true" size={16} />
            Back to Aircraft Explorer
          </ButtonLink>
        </div>
      </Container>
    </article>
  );
}
