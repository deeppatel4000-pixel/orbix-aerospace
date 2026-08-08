import {
  ArrowUpRight,
  CalendarDays,
  Factory,
  Flame,
  Globe2,
  Layers3,
  Orbit,
} from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import { RocketImage } from "@/features/rockets/components/rocket-image";
import type { RocketCardTreatment } from "@/features/rockets/data";
import {
  formatRocketFirstFlight,
  formatRocketMeasurement,
} from "@/features/rockets/utils";
import type { Rocket } from "@/features/vehicles/types";
import { cn } from "@/lib/cn";

interface RocketCardProps {
  className?: string;
  rocket: Rocket;
  sizes?: string;
  treatment?: RocketCardTreatment;
}

const imageTreatmentClasses: Record<RocketCardTreatment, string> = {
  flagship: "aspect-[4/5] sm:aspect-[16/11] lg:aspect-[16/11]",
  standard: "aspect-[4/5] sm:aspect-[16/10] lg:aspect-[4/5]",
  wide: "aspect-[4/5] sm:aspect-[16/9] lg:aspect-[2/1]",
};

export function RocketCard({
  className,
  rocket,
  sizes,
  treatment = "standard",
}: RocketCardProps) {
  const titleId = `rocket-card-${rocket.id}`;
  const liftoffThrust = formatRocketMeasurement(
    rocket.performance.liftoffThrust,
  );
  const firstStage = rocket.stages[0];

  return (
    <article
      aria-labelledby={titleId}
      className={cn(
        "orbix-frame relative flex h-full flex-col overflow-hidden border-atmosphere/25 bg-[#050911]/96 shadow-[0_28px_90px_rgb(0_0_0/0.42)]",
        className,
      )}
    >
      <div className="relative overflow-hidden border-b border-signal/20">
        <RocketImage
          className={imageTreatmentClasses[treatment]}
          imageClassName="saturate-[0.92] contrast-[1.06]"
          rocket={rocket}
          sizes={
            sizes ??
            (treatment === "flagship"
              ? "(max-width: 1023px) 100vw, 58vw"
              : "(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 42vw")
          }
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,4,8,0.02)_18%,rgba(2,4,8,0.18)_52%,rgba(2,4,8,0.94)_100%)]"
        />
        <div
          aria-hidden="true"
          className="technical-grid absolute inset-0 opacity-16 mix-blend-screen"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-28 bg-[radial-gradient(ellipse_at_bottom,rgba(244,147,45,0.18),transparent_70%)]"
        />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-4 sm:p-5">
          <span className="border border-white/15 bg-black/62 px-2.5 py-1 font-mono text-[0.58rem] tracking-[0.16em] text-white/78 uppercase backdrop-blur-md">
            LV // {rocket.id}
          </span>
          <span className="border border-signal/30 bg-black/62 px-2.5 py-1 font-mono text-[0.56rem] tracking-[0.14em] text-signal uppercase backdrop-blur-md">
            Engineering profile
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 lg:p-7">
          <p className="font-mono text-[0.6rem] tracking-[0.16em] text-signal uppercase">
            {rocket.performance.supportedOrbits.join(" // ")}
          </p>
          <h2
            className={cn(
              "font-display mt-2 leading-none font-semibold tracking-[-0.05em] text-white text-shadow-lg",
              treatment === "flagship" || treatment === "wide"
                ? "text-4xl sm:text-5xl"
                : "text-3xl sm:text-4xl",
            )}
            id={titleId}
          >
            {rocket.name}
          </h2>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6 lg:p-7">
        <div className="grid flex-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(15rem,0.72fr)]">
          <div className="flex flex-col">
            <p className="text-sm leading-6 text-muted sm:text-[0.95rem] sm:leading-7">
              {rocket.description}
            </p>

            <dl className="mt-6 grid grid-cols-2 gap-x-5 gap-y-5 border-y border-atmosphere/18 py-5">
              <div>
                <dt className="flex items-center gap-2 font-mono text-[0.56rem] tracking-[0.12em] text-muted uppercase">
                  <Factory aria-hidden="true" size={13} /> Manufacturer
                </dt>
                <dd className="mt-2 text-xs leading-5 font-medium text-foreground">
                  {rocket.manufacturer}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 font-mono text-[0.56rem] tracking-[0.12em] text-muted uppercase">
                  <Globe2 aria-hidden="true" size={13} /> Origin
                </dt>
                <dd className="mt-2 text-xs leading-5 font-medium text-foreground">
                  {rocket.country.name}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 font-mono text-[0.56rem] tracking-[0.12em] text-muted uppercase">
                  <CalendarDays aria-hidden="true" size={13} /> First flight
                </dt>
                <dd className="mt-2 text-xs leading-5 font-medium text-foreground">
                  {formatRocketFirstFlight(rocket.firstFlight)}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 font-mono text-[0.56rem] tracking-[0.12em] text-muted uppercase">
                  <Layers3 aria-hidden="true" size={13} /> Stage elements
                </dt>
                <dd className="mt-2 text-xs leading-5 font-medium text-foreground">
                  {rocket.stages.length}
                </dd>
              </div>
            </dl>
          </div>

          <div className="border border-atmosphere/20 bg-[#080d16] p-4 sm:p-5">
            <p className="flex items-center gap-2 font-mono text-[0.56rem] tracking-[0.13em] text-accent uppercase">
              <Orbit aria-hidden="true" size={13} /> Propulsion record
            </p>
            <div className="mt-4 border-b border-atmosphere/18 pb-4">
              <p className="flex items-center gap-2 font-mono text-[0.55rem] tracking-[0.12em] text-muted uppercase">
                <Flame aria-hidden="true" size={12} /> Liftoff thrust
              </p>
              <p className="orbix-telemetry-value mt-2 text-xl text-signal">
                {liftoffThrust.value}
              </p>
            </div>
            <div className="pt-4">
              <p className="font-mono text-[0.55rem] tracking-[0.12em] text-muted uppercase">
                First recorded stage
              </p>
              <p className="mt-2 text-sm leading-5 font-medium">
                {firstStage ? firstStage.name : "Not recorded"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-atmosphere/20 pt-5">
          <ButtonLink
            className="w-full justify-between"
            href={`/rockets/${rocket.id}`}
            variant="secondary"
          >
            Open launch vehicle dossier
            <ArrowUpRight aria-hidden="true" size={16} />
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
