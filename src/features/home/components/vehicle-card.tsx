import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { AircraftImage } from "@/features/aircraft/components/aircraft-image";
import { RocketImage } from "@/features/rockets/components/rocket-image";
import { cn } from "@/lib/cn";

interface VehicleCardProps {
  className?: string;
  code: string;
  href: string;
  id: string;
  kind: "aircraft" | "rocket";
  name: string;
  type: string;
}

export function VehicleCard({
  className,
  code,
  href,
  id,
  kind,
  name,
  type,
}: VehicleCardProps) {
  const titleId = `featured-vehicle-${id}`;
  const vehicleIdentity = { id, name };

  return (
    <article
      aria-labelledby={titleId}
      className={cn(
        "orbix-premium-card orbix-premium-card--interactive group relative h-full",
        className,
      )}
    >
      <Link
        aria-label={"Open the " + name + " profile"}
        className="flex h-full flex-col rounded-[inherit] focus-visible:outline-offset-[-4px]"
        href={href}
      >
        <div className="relative aspect-[4/3] overflow-hidden border-b border-border/80 bg-background/55 sm:aspect-[16/11]">
          {kind === "aircraft" ? (
            <AircraftImage
              aircraft={vehicleIdentity}
              className="absolute inset-0"
              fillContainer
              imageClassName="saturate-[0.88] contrast-[1.05] motion-reduce:transition-none"
              sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 58vw"
            />
          ) : (
            <RocketImage
              className="absolute inset-0"
              fillContainer
              imageClassName="saturate-[0.9] contrast-[1.05]"
              rocket={vehicleIdentity}
              sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 58vw"
            />
          )}

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,4,10,0.08)_16%,rgba(2,4,10,0.28)_48%,rgba(2,4,10,0.96)_100%)]"
          />
          <div
            aria-hidden="true"
            className="technical-grid absolute inset-0 opacity-20 mix-blend-screen"
          />

          <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-4 p-4 sm:p-5">
            <span className="border border-white/15 bg-black/60 px-2.5 py-1 font-mono text-[0.6rem] tracking-[0.16em] text-white/80 uppercase backdrop-blur-md">
              {code}
              {" // Engineering record"}
            </span>
            <span
              aria-hidden="true"
              className={cn(
                "h-1.5 w-1.5 shrink-0 rounded-full shadow-[0_0_10px_currentColor]",
                kind === "rocket"
                  ? "bg-signal text-signal"
                  : "bg-accent text-accent",
              )}
            />
          </div>

          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            <p
              className={cn(
                "font-mono text-[0.62rem] tracking-[0.16em] uppercase",
                kind === "rocket" ? "text-signal" : "text-accent",
              )}
            >
              {type}
            </p>
            <h3
              className="font-display mt-2 text-3xl leading-none font-semibold tracking-[-0.04em] text-white sm:text-4xl"
              id={titleId}
            >
              {name}
            </h3>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-4 p-5">
          <span className="font-mono text-[0.62rem] tracking-[0.12em] text-muted uppercase">
            Open full engineering profile
          </span>
          <ArrowUpRight
            aria-hidden="true"
            className="shrink-0 text-muted transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent motion-reduce:transition-none"
            size={18}
          />
        </div>
      </Link>
    </article>
  );
}
