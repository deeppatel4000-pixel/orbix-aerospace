import {
  ArrowDown,
  ArrowUpRight,
  Cloud,
  Database,
  Gauge,
  Plane,
} from "lucide-react";

import { OrbixBackground } from "@/components/brand/orbix-background";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import { AircraftCard } from "@/features/aircraft/components/aircraft-card";
import { AircraftImage } from "@/features/aircraft/components/aircraft-image";
import { getAircraftVisual } from "@/features/aircraft/data";
import {
  formatAircraftMeasurement,
  formatAircraftRoles,
} from "@/features/aircraft/utils";
import type { Aircraft } from "@/features/vehicles/types";

interface AircraftExplorerProps {
  aircraft: readonly Aircraft[];
}

const cardPlacementClasses = [
  "lg:col-span-8",
  "lg:col-span-4",
  "lg:col-span-7",
  "lg:col-span-5",
  "lg:col-span-12",
] as const;

export function AircraftExplorer({ aircraft }: AircraftExplorerProps) {
  const featuredAircraft =
    aircraft.find((item) => item.id === "f-22-raptor") ?? aircraft[0];
  const profileLabel = aircraft.length === 1 ? "profile" : "profiles";

  if (!featuredAircraft) {
    return (
      <Container className="orbix-section">
        <div className="orbix-frame technical-grid p-10 text-center">
          <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">
            Aircraft registry unavailable
          </p>
        </div>
      </Container>
    );
  }

  const heroSpeed = formatAircraftMeasurement(
    featuredAircraft.performance.maxSpeed,
  );
  const heroCeiling = formatAircraftMeasurement(
    featuredAircraft.performance.serviceCeiling,
  );

  return (
    <>
      <section className="group relative isolate flex min-h-[calc(100svh-5rem)] overflow-hidden border-b border-tactical/35 bg-[#030706]">
        <AircraftImage
          aircraft={featuredAircraft}
          className="-z-30"
          fillContainer
          imageClassName="saturate-[0.82] contrast-[1.08]"
          priority
          sizes="100vw"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(2,5,5,0.98)_0%,rgba(2,5,5,0.9)_34%,rgba(2,5,5,0.28)_72%,rgba(2,5,5,0.54)_100%),linear-gradient(180deg,rgba(2,5,5,0.28)_0%,rgba(2,5,5,0.05)_42%,rgba(2,5,5,0.94)_100%)]"
        />
        <OrbixBackground className="-z-10 opacity-35" />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[18%] -z-10 h-px bg-gradient-to-r from-transparent via-tactical-amber/40 to-transparent"
        />

        <Container className="flex w-full flex-col justify-between py-10 sm:py-14 lg:py-16">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-3 font-mono text-[0.66rem] tracking-[0.2em] text-tactical-amber uppercase">
              <Plane aria-hidden="true" size={16} strokeWidth={1.7} />
              ORBIX aircraft systems // Registry 02
            </p>
            <div className="flex items-center gap-3 self-start border border-white/15 bg-black/45 px-3 py-2 backdrop-blur-md sm:self-auto">
              <Database
                aria-hidden="true"
                className="text-tactical-amber"
                size={15}
              />
              <span className="font-mono text-[0.6rem] tracking-[0.14em] text-white/75 uppercase">
                {aircraft.length} verified {profileLabel}
              </span>
            </div>
          </div>

          <div className="mt-32 grid gap-10 lg:mt-24 lg:grid-cols-[minmax(0,0.95fr)_minmax(28rem,0.7fr)] lg:items-end lg:gap-20">
            <div className="max-w-3xl">
              <p className="font-mono text-[0.65rem] tracking-[0.2em] text-white/65 uppercase">
                Flagship airframe // {featuredAircraft.id}
              </p>
              <h1 className="font-display mt-5 text-5xl leading-[0.9] font-semibold tracking-[-0.055em] text-balance text-white sm:text-7xl lg:text-[5.7rem]">
                Aircraft
                <span className="block text-tactical-amber">Explorer</span>
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/72 sm:text-xl">
                Enter a cinematic registry of landmark airframes, then inspect
                the propulsion, performance, geometry, and published design
                context behind each aircraft.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href={`/aircraft/${featuredAircraft.id}`}>
                  Open {featuredAircraft.name}
                  <ArrowUpRight aria-hidden="true" size={17} />
                </ButtonLink>
                <ButtonLink href="#available-aircraft" variant="secondary">
                  Explore the fleet
                  <ArrowDown aria-hidden="true" size={17} />
                </ButtonLink>
              </div>
            </div>

            <aside
              aria-label={`${featuredAircraft.name} featured telemetry`}
              className="orbix-frame orbix-carbon border-white/20 bg-black/60 p-5 backdrop-blur-xl sm:p-6"
            >
              <div className="flex items-start justify-between gap-6 border-b border-white/15 pb-5">
                <div>
                  <p className="font-mono text-[0.6rem] tracking-[0.16em] text-tactical-amber uppercase">
                    Featured aircraft
                  </p>
                  <h2 className="font-display mt-2 text-2xl font-semibold tracking-[-0.035em] text-white">
                    {featuredAircraft.name}
                  </h2>
                  <p className="mt-2 text-sm text-white/58">
                    {formatAircraftRoles(featuredAircraft.roles)}
                  </p>
                </div>
                <span className="orbix-status text-[0.55rem] text-tactical-amber">
                  Active
                </span>
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-px bg-white/15">
                <div className="bg-black/65 p-4">
                  <dt className="flex items-center gap-2 font-mono text-[0.56rem] tracking-[0.12em] text-white/50 uppercase">
                    <Gauge aria-hidden="true" size={13} /> Maximum speed
                  </dt>
                  <dd className="orbix-telemetry-value mt-3 text-xl text-white">
                    {heroSpeed.value}
                  </dd>
                </div>
                <div className="bg-black/65 p-4">
                  <dt className="flex items-center gap-2 font-mono text-[0.56rem] tracking-[0.12em] text-white/50 uppercase">
                    <Cloud aria-hidden="true" size={13} /> Ceiling
                  </dt>
                  <dd className="orbix-telemetry-value mt-3 text-xl text-white">
                    {heroCeiling.value}
                  </dd>
                </div>
              </dl>

              <p className="mt-5 border-l border-tactical-amber/50 pl-4 text-xs leading-5 text-white/55">
                Values shown exactly as qualified in the public engineering
                record. No operational or classified specifications are used.
              </p>
            </aside>
          </div>
        </Container>
      </section>

      <section
        aria-labelledby="available-aircraft-title"
        className="relative overflow-hidden bg-[#050908] py-20 sm:py-28"
        id="available-aircraft"
      >
        <div
          aria-hidden="true"
          className="technical-grid absolute inset-0 opacity-35"
        />
        <Container className="relative">
          <div className="grid gap-8 border-b border-tactical/25 pb-8 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-end">
            <div>
              <p className="font-mono text-[0.66rem] tracking-[0.2em] text-tactical-amber uppercase">
                Available airframes // Public reference set
              </p>
              <h2
                className="font-display mt-4 text-4xl leading-none font-semibold tracking-[-0.045em] sm:text-5xl lg:text-6xl"
                id="available-aircraft-title"
              >
                Engineering profiles
              </h2>
            </div>
            <p className="text-sm leading-7 text-muted sm:text-base">
              The registry gives each aircraft room to communicate its mission,
              geometry, and engineering character instead of reducing the fleet
              to identical thumbnails.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-flow-row-dense lg:grid-cols-12">
            {aircraft.map((item, index) => {
              const visual = getAircraftVisual(item.id);

              return (
                <AircraftCard
                  aircraft={item}
                  className={cardPlacementClasses[index] ?? "lg:col-span-6"}
                  key={item.id}
                  treatment={visual?.cardTreatment}
                />
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
