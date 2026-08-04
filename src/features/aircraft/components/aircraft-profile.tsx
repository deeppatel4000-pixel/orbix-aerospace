import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Factory,
  Globe2,
  Layers3,
  Plane,
  Tags,
} from "lucide-react";

import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import { DimensionsPanel } from "@/features/aircraft/components/dimensions-panel";
import { EngineeringNotesPanel } from "@/features/aircraft/components/engineering-notes-panel";
import { PerformancePanel } from "@/features/aircraft/components/performance-panel";
import { ProfileSection } from "@/features/aircraft/components/profile-section";
import { PropulsionPanel } from "@/features/aircraft/components/propulsion-panel";
import {
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
  return (
    <article>
      <header className="relative isolate overflow-hidden border-b border-border/70 py-12 sm:py-16 lg:py-20">
        <div
          aria-hidden="true"
          className="technical-grid absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,transparent_95%)] opacity-55"
        />
        <Container>
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-muted">
              <li>
                <Link className="transition-colors hover:text-accent" href="/">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={14} />
              </li>
              <li>
                <Link
                  className="transition-colors hover:text-accent"
                  href="/aircraft"
                >
                  Aircraft
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={14} />
              </li>
              <li aria-current="page" className="text-foreground">
                {aircraft.name}
              </li>
            </ol>
          </nav>

          <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-end">
            <div className="max-w-4xl">
              <p className="flex items-center gap-3 font-mono text-xs tracking-[0.18em] text-accent uppercase">
                <Plane aria-hidden="true" size={16} />
                Aircraft profile // {aircraft.id}
              </p>
              <h1 className="mt-6 text-5xl leading-none font-semibold tracking-[-0.055em] text-balance sm:text-6xl lg:text-7xl">
                {aircraft.name}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-muted sm:text-xl">
                {aircraft.description}
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                {aircraft.roles.map((role) => (
                  <span
                    className="rounded-full border border-accent/20 bg-accent/8 px-3 py-1.5 text-xs font-medium text-accent"
                    key={role}
                  >
                    {formatAircraftRoles([role])}
                  </span>
                ))}
              </div>
            </div>

            <div className="technical-grid relative flex min-h-64 items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface/75">
              <div
                aria-hidden="true"
                className="absolute h-44 w-44 rounded-full border border-accent/15"
              />
              <div
                aria-hidden="true"
                className="absolute h-28 w-28 rotate-45 border border-dashed border-accent/20"
              />
              <Plane
                aria-hidden="true"
                className="relative text-accent drop-shadow-[0_0_24px_rgb(87_215_255/0.24)]"
                size={78}
                strokeWidth={1.05}
              />
              <span className="absolute right-4 bottom-4 font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                Airframe visual pending
              </span>
            </div>
          </div>
        </Container>
      </header>

      <div className="sticky top-18 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
        <Container>
          <nav
            aria-label="Aircraft profile sections"
            className="overflow-x-auto"
          >
            <ul className="flex min-w-max items-center gap-1 py-3">
              {profileNavigation.map((item, index) => (
                <li key={item.href}>
                  <a
                    className="inline-flex min-h-10 items-center rounded-full px-3.5 text-sm text-muted transition-colors hover:bg-white/5 hover:text-accent"
                    href={item.href}
                  >
                    <span className="mr-2 font-mono text-[0.6rem] text-accent">
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
          <div className="rounded-2xl border border-border bg-surface/65">
            <dl className="grid sm:grid-cols-2">
              <div className="border-b border-border p-5 sm:border-r sm:p-6">
                <dt className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                  <Factory aria-hidden="true" size={14} />
                  Manufacturer
                </dt>
                <dd className="mt-3 text-sm font-medium">
                  {aircraft.manufacturer}
                </dd>
              </div>
              <div className="border-b border-border p-5 sm:p-6">
                <dt className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                  <Globe2 aria-hidden="true" size={14} />
                  Country
                </dt>
                <dd className="mt-3 text-sm font-medium">
                  {aircraft.country.name} ({aircraft.country.isoCode})
                </dd>
              </div>
              <div className="border-b border-border p-5 sm:border-r sm:p-6">
                <dt className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                  <CalendarDays aria-hidden="true" size={14} />
                  First flight
                </dt>
                <dd className="mt-3 text-sm font-medium">
                  {formatFirstFlight(aircraft.firstFlight)}
                </dd>
              </div>
              <div className="border-b border-border p-5 sm:p-6">
                <dt className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                  <Tags aria-hidden="true" size={14} />
                  Role
                </dt>
                <dd className="mt-3 text-sm font-medium">
                  {formatAircraftRoles(aircraft.roles)}
                </dd>
              </div>
            </dl>

            <div className="p-5 sm:p-6">
              <p className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                <Layers3 aria-hidden="true" size={14} />
                Recorded variants
              </p>
              <ul className="mt-4 space-y-3">
                {aircraft.variants.map((variant) => (
                  <li
                    className="flex flex-col gap-3 rounded-xl border border-border bg-background/40 p-4 sm:flex-row sm:items-start sm:justify-between"
                    key={variant.id}
                  >
                    <div>
                      <p className="font-semibold">{variant.designation}</p>
                      <p className="mt-1 text-sm text-muted">
                        {variant.notes ?? variant.name}
                      </p>
                    </div>
                    <span className="self-start rounded-full border border-accent/20 px-3 py-1 font-mono text-[0.62rem] text-accent uppercase">
                      {formatAircraftVariantStatus(variant.status)}
                    </span>
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

        <div className="border-t border-border py-12">
          <ButtonLink href="/aircraft" variant="secondary">
            <ArrowLeft aria-hidden="true" size={16} />
            Back to Aircraft Explorer
          </ButtonLink>
        </div>
      </Container>
    </article>
  );
}
