import {
  ArrowDown,
  ArrowUpRight,
  Database,
  Flame,
  Orbit,
  RadioTower,
  Rocket,
} from "lucide-react";

import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import { RocketCard } from "@/features/rockets/components/rocket-card";
import { RocketImage } from "@/features/rockets/components/rocket-image";
import { formatRocketMeasurement } from "@/features/rockets/utils";
import type { Rocket as RocketVehicle } from "@/features/vehicles/types";

interface RocketExplorerProps {
  rockets: readonly RocketVehicle[];
}

export function RocketExplorer({ rockets }: RocketExplorerProps) {
  const flagship = rockets[0];
  const profileLabel = rockets.length === 1 ? "profile" : "profiles";

  if (!flagship) {
    return (
      <section className="orbix-section">
        <Container>
          <div className="orbix-frame technical-grid mx-auto max-w-3xl border-atmosphere/25 bg-surface/80 p-10 text-center sm:p-16">
            <Database
              aria-hidden="true"
              className="mx-auto text-accent"
              size={28}
            />
            <h1 className="font-display mt-5 text-4xl font-semibold">
              Rocket Explorer
            </h1>
            <p className="mt-4 text-muted">
              No launch vehicle profiles are available in the registry.
            </p>
          </div>
        </Container>
      </section>
    );
  }

  const height = formatRocketMeasurement(flagship.dimensions.height);
  const thrust = formatRocketMeasurement(flagship.performance.liftoffThrust);
  const liftoffMass = formatRocketMeasurement(flagship.mass.liftoff);

  return (
    <>
      <section className="relative isolate min-h-[calc(100svh-5rem)] overflow-hidden border-b border-signal/25 bg-[#020306]">
        <div className="absolute inset-x-0 top-0 -z-30 aspect-square w-full overflow-hidden border-b border-white/10 lg:inset-y-0 lg:right-0 lg:left-auto lg:aspect-auto lg:h-auto lg:w-[min(68vw,calc(100svh-5rem))] lg:border-b-0 lg:border-l">
          <RocketImage
            fillContainer
            imageClassName="saturate-[0.88] contrast-[1.08]"
            priority
            rocket={flagship}
            sizes="(max-width: 1023px) 100vw, min(68vw, calc(100svh - 5rem))"
          />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,#020306_0%,rgba(2,3,6,0.98)_26%,rgba(2,3,6,0.76)_52%,rgba(2,3,6,0.16)_78%,rgba(2,3,6,0.3)_100%),linear-gradient(180deg,rgba(2,3,6,0.18)_0%,rgba(2,3,6,0.04)_42%,#020306_100%)] max-lg:bg-[linear-gradient(180deg,rgba(2,3,6,0.2)_0%,rgba(2,3,6,0.52)_38%,#020306_76%)]"
        />
        <div
          aria-hidden="true"
          className="technical-grid absolute inset-0 -z-10 opacity-20 mix-blend-screen"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 -z-10 h-[36%] bg-[radial-gradient(ellipse_at_70%_100%,rgba(244,147,45,0.26),transparent_58%)]"
        />
        <div
          aria-hidden="true"
          className="absolute top-[18%] right-[-12rem] -z-10 h-[36rem] w-[36rem] rounded-full border border-atmosphere/20 shadow-[0_0_120px_rgba(87,215,255,0.08)]"
        />

        <Container className="flex min-h-[calc(100svh-5rem)] w-full flex-col justify-between py-8 sm:py-12 lg:py-14">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-3 font-mono text-[0.66rem] tracking-[0.2em] text-signal uppercase">
              <RadioTower aria-hidden="true" size={16} strokeWidth={1.7} />
              ORBIX launch operations // Registry 03
            </p>
            <div className="flex items-center gap-3 self-start border border-white/15 bg-black/50 px-3 py-2 backdrop-blur-md sm:self-auto">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-signal shadow-[0_0_10px_currentColor]"
              />
              <span className="font-mono text-[0.6rem] tracking-[0.14em] text-white/70 uppercase">
                {rockets.length} public {profileLabel}
              </span>
            </div>
          </div>

          <div className="mt-36 grid gap-10 lg:mt-24 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,0.66fr)] lg:items-end lg:gap-16">
            <div className="max-w-3xl">
              <p className="font-mono text-[0.65rem] tracking-[0.2em] text-white/60 uppercase">
                Vehicle archive // Propulsion and payload systems
              </p>
              <h1 className="font-display mt-5 text-5xl leading-[0.88] font-semibold tracking-[-0.06em] text-balance text-white sm:text-7xl lg:text-[5.9rem]">
                Rocket
                <span className="block text-signal">Explorer</span>
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/70 sm:text-xl">
                Enter a launch-operations archive where propulsion, staging,
                payload capability, and mission architecture are presented as
                one coherent vehicle system.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href={`/rockets/${flagship.id}`}>
                  Open {flagship.name}
                  <ArrowUpRight aria-hidden="true" size={17} />
                </ButtonLink>
                <ButtonLink href="#launch-vehicle-registry" variant="secondary">
                  Explore launch vehicles
                  <ArrowDown aria-hidden="true" size={17} />
                </ButtonLink>
              </div>
            </div>

            <aside
              aria-label={`${flagship.name} featured launch telemetry`}
              className="orbix-frame border-white/20 bg-black/68 p-5 shadow-[0_28px_90px_rgb(0_0_0/0.48)] backdrop-blur-xl sm:p-6"
            >
              <div className="flex items-start justify-between gap-6 border-b border-white/15 pb-5">
                <div>
                  <p className="font-mono text-[0.6rem] tracking-[0.16em] text-signal uppercase">
                    Vehicle spotlight
                  </p>
                  <h2 className="font-display mt-2 text-2xl font-semibold tracking-[-0.035em] text-white">
                    {flagship.name}
                  </h2>
                  <p className="mt-2 text-sm text-white/55">
                    {flagship.manufacturer}
                    {" // "}
                    {flagship.country.name}
                  </p>
                </div>
                <Rocket
                  aria-hidden="true"
                  className="shrink-0 text-signal"
                  size={23}
                  strokeWidth={1.45}
                />
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-px bg-white/15">
                <div className="bg-black/72 p-4">
                  <dt className="font-mono text-[0.56rem] tracking-[0.12em] text-white/46 uppercase">
                    Vehicle height
                  </dt>
                  <dd className="orbix-telemetry-value mt-3 text-lg text-white sm:text-xl">
                    {height.value}
                  </dd>
                </div>
                <div className="bg-black/72 p-4">
                  <dt className="font-mono text-[0.56rem] tracking-[0.12em] text-white/46 uppercase">
                    Liftoff mass
                  </dt>
                  <dd className="orbix-telemetry-value mt-3 text-lg text-white sm:text-xl">
                    {liftoffMass.value}
                  </dd>
                </div>
                <div className="col-span-2 bg-black/72 p-4">
                  <dt className="flex items-center gap-2 font-mono text-[0.56rem] tracking-[0.12em] text-white/46 uppercase">
                    <Flame aria-hidden="true" size={13} /> Liftoff thrust
                  </dt>
                  <dd className="orbix-telemetry-value mt-3 text-2xl text-signal">
                    {thrust.value}
                  </dd>
                </div>
              </dl>

              <p className="mt-5 border-l border-signal/55 pl-4 text-xs leading-5 text-white/52">
                Measurements are displayed with the qualifiers recorded in the
                public engineering dataset.
              </p>
            </aside>
          </div>
        </Container>
      </section>

      <section
        aria-labelledby="available-rockets-title"
        className="relative overflow-hidden bg-[#03060b] py-20 sm:py-28"
        id="launch-vehicle-registry"
      >
        <div
          aria-hidden="true"
          className="technical-grid absolute inset-0 opacity-30"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_88%_10%,rgba(87,215,255,0.1),transparent_27%),radial-gradient(circle_at_8%_42%,rgba(244,147,45,0.08),transparent_24%)]"
        />
        <Container className="relative">
          <div className="grid gap-8 border-b border-atmosphere/20 pb-9 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-end">
            <div>
              <p className="font-mono text-[0.66rem] tracking-[0.2em] text-signal uppercase">
                Launch vehicle registry // Public reference set
              </p>
              <h2
                className="font-display mt-4 max-w-3xl text-4xl leading-none font-semibold tracking-[-0.045em] sm:text-5xl lg:text-6xl"
                id="available-rockets-title"
              >
                Integrated launch systems
              </h2>
            </div>

            <div>
              <p className="text-sm leading-7 text-muted sm:text-base">
                Five launch architectures, presented with the photographic scale
                and technical context needed to understand each vehicle as a
                complete engineering system.
              </p>
              <div className="mt-4 flex items-center gap-3 border-t border-atmosphere/20 pt-4">
                <Orbit
                  aria-hidden="true"
                  className="text-accent"
                  size={18}
                  strokeWidth={1.6}
                />
                <span className="font-mono text-[0.62rem] tracking-[0.13em] text-muted uppercase">
                  Propulsion // Staging // Payload // Mission
                </span>
              </div>
            </div>
          </div>

          {/* Same uniform grid as the aircraft registry. Launch vehicles
              differ only in their portrait media frame, which the card
              supplies — not in the layout system. */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rockets.map((rocket, index) => (
              <RocketCard
                key={rocket.id}
                priority={index === 0}
                rocket={rocket}
              />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
