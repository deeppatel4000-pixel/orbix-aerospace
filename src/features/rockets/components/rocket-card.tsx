import {
  ArrowRight,
  CalendarDays,
  Factory,
  Layers3,
  Rocket as RocketIcon,
} from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import {
  formatOrbitType,
  formatRocketFirstFlight,
} from "@/features/rockets/utils";
import type { Rocket } from "@/features/vehicles/types";

interface RocketCardProps {
  rocket: Rocket;
}

export function RocketCard({ rocket }: RocketCardProps) {
  const titleId = "rocket-card-" + rocket.id;

  return (
    <article
      aria-labelledby={titleId}
      className="group overflow-hidden rounded-2xl border border-border bg-surface/70 transition-colors hover:border-accent/45 hover:bg-surface-elevated/70"
    >
      <div className="grid lg:grid-cols-[0.78fr_1.22fr]">
        <div className="technical-grid relative flex min-h-64 items-center justify-center overflow-hidden border-b border-border bg-background/50 lg:min-h-full lg:border-r lg:border-b-0">
          <div
            aria-hidden="true"
            className="absolute h-48 w-48 rounded-full border border-accent/15 transition-transform duration-500 motion-safe:group-hover:scale-110"
          />
          <div
            aria-hidden="true"
            className="absolute h-36 w-20 rounded-full border border-dashed border-accent/20"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-7 top-1/2 h-px bg-accent/15"
          />
          <div
            aria-hidden="true"
            className="absolute inset-y-7 left-1/2 w-px bg-accent/15"
          />
          <RocketIcon
            aria-hidden="true"
            className="relative text-accent drop-shadow-[0_0_24px_rgb(87_215_255/0.24)]"
            size={76}
            strokeWidth={1.05}
          />
          <span className="absolute top-4 left-4 font-mono text-[0.62rem] tracking-[0.16em] text-muted uppercase">
            Vehicle profile
          </span>
          <span className="absolute right-4 bottom-4 font-mono text-[0.62rem] tracking-[0.14em] text-accent uppercase">
            {rocket.id}
          </span>
        </div>

        <div className="flex flex-col p-6 sm:p-8">
          <div className="flex flex-wrap gap-2">
            {rocket.performance.supportedOrbits.map((orbit) => (
              <span
                className="rounded-full border border-accent/20 bg-accent/8 px-3 py-1 font-mono text-[0.65rem] tracking-[0.12em] text-accent uppercase"
                key={orbit}
                title={formatOrbitType(orbit)}
              >
                {orbit}
              </span>
            ))}
          </div>

          <h2
            className="mt-5 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl"
            id={titleId}
          >
            {rocket.name}
          </h2>
          <p className="mt-4 text-base leading-7 text-muted">
            {rocket.description}
          </p>

          <dl className="mt-7 grid gap-4 border-y border-border/80 py-5 sm:grid-cols-3">
            <div>
              <dt className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                <Factory aria-hidden="true" size={14} />
                Manufacturer
              </dt>
              <dd className="mt-2 text-sm font-medium">
                {rocket.manufacturer}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                <CalendarDays aria-hidden="true" size={14} />
                First flight
              </dt>
              <dd className="mt-2 text-sm font-medium">
                {formatRocketFirstFlight(rocket.firstFlight)}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                <Layers3 aria-hidden="true" size={14} />
                Stage elements
              </dt>
              <dd className="mt-2 text-sm font-medium">
                {rocket.stages.length}
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex justify-end">
            <ButtonLink href={"/rockets/" + rocket.id}>
              View rocket profile
              <ArrowRight aria-hidden="true" size={16} />
            </ButtonLink>
          </div>
        </div>
      </div>
    </article>
  );
}
