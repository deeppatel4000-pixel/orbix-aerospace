import {
  ArrowUpRight,
  CalendarDays,
  Factory,
  Gauge,
  Globe2,
  Layers3,
} from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import { AircraftImage } from "@/features/aircraft/components/aircraft-image";
import type { AircraftCardTreatment } from "@/features/aircraft/data";
import {
  formatAircraftMeasurement,
  formatAircraftRoles,
  formatFirstFlight,
} from "@/features/aircraft/utils";
import type { Aircraft } from "@/features/vehicles/types";
import { cn } from "@/lib/cn";

interface AircraftCardProps {
  aircraft: Aircraft;
  className?: string;
  treatment?: AircraftCardTreatment;
}

const imageTreatmentClasses: Record<AircraftCardTreatment, string> = {
  flagship: "aspect-[16/11] sm:aspect-[16/9] lg:aspect-[16/10]",
  standard: "aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3]",
  wide: "aspect-[16/9] sm:aspect-[2/1]",
};

export function AircraftCard({
  aircraft,
  className,
  treatment = "standard",
}: AircraftCardProps) {
  const titleId = `aircraft-card-${aircraft.id}`;
  const maxSpeed = formatAircraftMeasurement(aircraft.performance.maxSpeed);
  const engine = aircraft.propulsion.engines[0];

  return (
    <article
      aria-labelledby={titleId}
      className={cn(
        "orbix-frame group relative flex h-full flex-col overflow-hidden border-tactical/30 bg-[#080d0c]/92 shadow-[0_24px_80px_rgb(0_0_0/0.32)] transition-[border-color,box-shadow,transform] duration-500 hover:border-tactical-amber/55 hover:shadow-[0_30px_90px_rgb(0_0_0/0.46)] motion-safe:hover:-translate-y-1",
        className,
      )}
    >
      <div className="relative overflow-hidden border-b border-tactical/25">
        <AircraftImage
          aircraft={aircraft}
          className={imageTreatmentClasses[treatment]}
          imageClassName="saturate-[0.9] contrast-[1.04]"
          sizes={
            treatment === "flagship"
              ? "(max-width: 1023px) 100vw, 66vw"
              : "(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 42vw"
          }
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,6,0.05)_20%,rgba(2,5,6,0.82)_100%)]"
        />
        <div
          aria-hidden="true"
          className="technical-grid absolute inset-0 opacity-25 mix-blend-screen"
        />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-4 sm:p-5">
          <span className="border border-white/15 bg-black/55 px-2.5 py-1 font-mono text-[0.6rem] tracking-[0.16em] text-white/80 uppercase backdrop-blur-md">
            Airframe // {aircraft.id}
          </span>
          <span className="orbix-status orbix-status--info border-white/15 bg-black/50 text-[0.56rem] backdrop-blur-md">
            Profile active
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <p className="font-mono text-[0.62rem] tracking-[0.16em] text-tactical-amber uppercase">
            {formatAircraftRoles(aircraft.roles)}
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
            {aircraft.name}
          </h2>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6 lg:p-7">
        <p className="text-sm leading-6 text-muted sm:text-[0.95rem] sm:leading-7">
          {aircraft.description}
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden border border-tactical/20 bg-tactical/20">
          <div className="bg-[#0a100f] p-3.5">
            <dt className="flex items-center gap-2 font-mono text-[0.58rem] tracking-[0.12em] text-muted uppercase">
              <Factory aria-hidden="true" size={13} /> Manufacturer
            </dt>
            <dd className="mt-2 text-xs leading-5 font-medium text-foreground">
              {aircraft.manufacturer}
            </dd>
          </div>
          <div className="bg-[#0a100f] p-3.5">
            <dt className="flex items-center gap-2 font-mono text-[0.58rem] tracking-[0.12em] text-muted uppercase">
              <Globe2 aria-hidden="true" size={13} /> Origin
            </dt>
            <dd className="mt-2 text-xs leading-5 font-medium text-foreground">
              {aircraft.country.name}
            </dd>
          </div>
          <div className="bg-[#0a100f] p-3.5">
            <dt className="flex items-center gap-2 font-mono text-[0.58rem] tracking-[0.12em] text-muted uppercase">
              <CalendarDays aria-hidden="true" size={13} /> First flight
            </dt>
            <dd className="mt-2 text-xs leading-5 font-medium text-foreground">
              {formatFirstFlight(aircraft.firstFlight)}
            </dd>
          </div>
          <div className="bg-[#0a100f] p-3.5">
            <dt className="flex items-center gap-2 font-mono text-[0.58rem] tracking-[0.12em] text-muted uppercase">
              <Layers3 aria-hidden="true" size={13} /> Generation
            </dt>
            <dd className="text-muted-strong mt-2 text-xs leading-5 font-medium">
              Not recorded
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-col gap-4 border-y border-tactical/20 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 font-mono text-[0.58rem] tracking-[0.12em] text-muted uppercase">
              <Gauge aria-hidden="true" size={13} /> Maximum speed
            </p>
            <p className="orbix-telemetry-value mt-1.5 text-lg">
              {maxSpeed.value}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="font-mono text-[0.58rem] tracking-[0.12em] text-muted uppercase">
              Powerplant
            </p>
            <p className="mt-1.5 text-sm font-medium">
              {engine ? `${engine.quantity} × ${engine.name}` : "Not recorded"}
            </p>
          </div>
        </div>

        <div className="mt-auto pt-5">
          <ButtonLink
            className="w-full justify-between"
            href={`/aircraft/${aircraft.id}`}
            variant="secondary"
          >
            Open engineering profile
            <ArrowUpRight aria-hidden="true" size={16} />
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
