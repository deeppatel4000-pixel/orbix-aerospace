import {
  ArrowUpRight,
  CalendarDays,
  Factory,
  Flame,
  Globe2,
  Layers3,
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
  flagship: "aspect-[4/5] sm:aspect-[16/11] lg:aspect-[4/5]",
  standard: "aspect-[4/5] sm:aspect-[16/10] lg:aspect-[4/5]",
  wide: "aspect-[4/5] sm:aspect-[16/9]",
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
        "orbix-frame group relative flex h-full flex-col overflow-hidden border-atmosphere/25 bg-[#060a12]/94 shadow-[0_24px_80px_rgb(0_0_0/0.38)] transition-[border-color,box-shadow,transform] duration-500 hover:border-signal/55 hover:shadow-[0_30px_90px_rgb(0_0_0/0.5)] motion-safe:hover:-translate-y-1",
        className,
      )}
    >
      <div className="relative overflow-hidden border-b border-atmosphere/20">
        <RocketImage
          className={imageTreatmentClasses[treatment]}
          imageClassName="saturate-[0.9] contrast-[1.05]"
          rocket={rocket}
          sizes={
            sizes ??
            (treatment === "flagship"
              ? "(max-width: 1023px) 100vw, 50vw"
              : "(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 42vw")
          }
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,4,10,0.04)_20%,rgba(2,4,10,0.88)_100%)]"
        />
        <div
          aria-hidden="true"
          className="technical-grid absolute inset-0 opacity-20 mix-blend-screen"
        />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-4 sm:p-5">
          <span className="border border-white/15 bg-black/60 px-2.5 py-1 font-mono text-[0.6rem] tracking-[0.16em] text-white/80 uppercase backdrop-blur-md">
            Launch vehicle // {rocket.id}
          </span>
          <span className="orbix-status orbix-status--info border-white/15 bg-black/55 text-[0.56rem] backdrop-blur-md">
            Profile active
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <p className="font-mono text-[0.62rem] tracking-[0.16em] text-signal uppercase">
            {rocket.performance.supportedOrbits.join(" // ")}
          </p>
          <h2
            className={cn(
              "font-display mt-2 leading-none font-semibold tracking-[-0.045em] text-white text-shadow-lg",
              treatment === "flagship"
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
        <p className="text-sm leading-6 text-muted sm:text-[0.95rem] sm:leading-7">
          {rocket.description}
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden border border-atmosphere/20 bg-atmosphere/20">
          <div className="bg-[#080d17] p-3.5">
            <dt className="flex items-center gap-2 font-mono text-[0.58rem] tracking-[0.12em] text-muted uppercase">
              <Factory aria-hidden="true" size={13} /> Manufacturer
            </dt>
            <dd className="mt-2 text-xs leading-5 font-medium">
              {rocket.manufacturer}
            </dd>
          </div>
          <div className="bg-[#080d17] p-3.5">
            <dt className="flex items-center gap-2 font-mono text-[0.58rem] tracking-[0.12em] text-muted uppercase">
              <Globe2 aria-hidden="true" size={13} /> Origin
            </dt>
            <dd className="mt-2 text-xs leading-5 font-medium">
              {rocket.country.name}
            </dd>
          </div>
          <div className="bg-[#080d17] p-3.5">
            <dt className="flex items-center gap-2 font-mono text-[0.58rem] tracking-[0.12em] text-muted uppercase">
              <CalendarDays aria-hidden="true" size={13} /> First flight
            </dt>
            <dd className="mt-2 text-xs leading-5 font-medium">
              {formatRocketFirstFlight(rocket.firstFlight)}
            </dd>
          </div>
          <div className="bg-[#080d17] p-3.5">
            <dt className="flex items-center gap-2 font-mono text-[0.58rem] tracking-[0.12em] text-muted uppercase">
              <Layers3 aria-hidden="true" size={13} /> Stage elements
            </dt>
            <dd className="mt-2 text-xs leading-5 font-medium">
              {rocket.stages.length}
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-col gap-4 border-y border-atmosphere/20 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 font-mono text-[0.58rem] tracking-[0.12em] text-muted uppercase">
              <Flame aria-hidden="true" size={13} /> Liftoff thrust
            </p>
            <p className="orbix-telemetry-value mt-1.5 text-lg text-signal">
              {liftoffThrust.value}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="font-mono text-[0.58rem] tracking-[0.12em] text-muted uppercase">
              Recorded element 01
            </p>
            <p className="mt-1.5 text-sm font-medium">
              {firstStage ? firstStage.name : "Not recorded"}
            </p>
          </div>
        </div>

        <div className="mt-auto pt-5">
          <ButtonLink
            className="w-full justify-between"
            href={`/rockets/${rocket.id}`}
            variant="secondary"
          >
            Open launch vehicle profile
            <ArrowUpRight aria-hidden="true" size={16} />
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
