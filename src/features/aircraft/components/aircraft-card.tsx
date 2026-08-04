import { ArrowRight, CalendarDays, Factory, Plane } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import {
  formatAircraftRoles,
  formatFirstFlight,
} from "@/features/aircraft/utils";
import type { Aircraft } from "@/features/vehicles/types";

interface AircraftCardProps {
  aircraft: Aircraft;
}

export function AircraftCard({ aircraft }: AircraftCardProps) {
  const titleId = "aircraft-card-" + aircraft.id;

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
            className="absolute h-28 w-28 rotate-45 border border-dashed border-accent/20"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-7 top-1/2 h-px bg-accent/15"
          />
          <div
            aria-hidden="true"
            className="absolute inset-y-7 left-1/2 w-px bg-accent/15"
          />
          <Plane
            aria-hidden="true"
            className="relative text-accent drop-shadow-[0_0_24px_rgb(87_215_255/0.24)]"
            size={76}
            strokeWidth={1.05}
          />
          <span className="absolute top-4 left-4 font-mono text-[0.62rem] tracking-[0.16em] text-muted uppercase">
            Airframe profile
          </span>
          <span className="absolute right-4 bottom-4 font-mono text-[0.62rem] tracking-[0.14em] text-accent uppercase">
            {aircraft.id}
          </span>
        </div>

        <div className="flex flex-col p-6 sm:p-8">
          <div className="flex flex-wrap gap-2">
            {aircraft.roles.map((role) => (
              <span
                className="rounded-full border border-accent/20 bg-accent/8 px-3 py-1 font-mono text-[0.65rem] tracking-[0.12em] text-accent uppercase"
                key={role}
              >
                {formatAircraftRoles([role])}
              </span>
            ))}
          </div>

          <h2
            className="mt-5 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl"
            id={titleId}
          >
            {aircraft.name}
          </h2>
          <p className="mt-4 text-base leading-7 text-muted">
            {aircraft.description}
          </p>

          <dl className="mt-7 grid gap-4 border-y border-border/80 py-5 sm:grid-cols-2">
            <div>
              <dt className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                <Factory aria-hidden="true" size={14} />
                Manufacturer
              </dt>
              <dd className="mt-2 text-sm font-medium">
                {aircraft.manufacturer}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                <CalendarDays aria-hidden="true" size={14} />
                First flight
              </dt>
              <dd className="mt-2 text-sm font-medium">
                {formatFirstFlight(aircraft.firstFlight)}
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">
              Role:{" "}
              <span className="text-foreground">
                {formatAircraftRoles(aircraft.roles)}
              </span>
            </p>
            <ButtonLink href={"/aircraft/" + aircraft.id}>
              View aircraft profile
              <ArrowRight aria-hidden="true" size={16} />
            </ButtonLink>
          </div>
        </div>
      </div>
    </article>
  );
}
