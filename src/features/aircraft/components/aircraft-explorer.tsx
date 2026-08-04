import { Database, Plane } from "lucide-react";

import { Container } from "@/components/layout/container";
import { AircraftCard } from "@/features/aircraft/components/aircraft-card";
import type { Aircraft } from "@/features/vehicles/types";

interface AircraftExplorerProps {
  aircraft: readonly Aircraft[];
}

export function AircraftExplorer({ aircraft }: AircraftExplorerProps) {
  const profileLabel = aircraft.length === 1 ? "profile" : "profiles";

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border/70 py-20 sm:py-28">
        <div
          aria-hidden="true"
          className="technical-grid absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,transparent_90%)] opacity-60"
        />
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
            <div className="max-w-3xl">
              <p className="flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-accent uppercase">
                <Plane aria-hidden="true" size={16} strokeWidth={1.7} />
                Aircraft registry // Explorer
              </p>
              <h1 className="mt-6 text-5xl leading-[0.98] font-semibold tracking-[-0.05em] text-balance sm:text-6xl lg:text-7xl">
                Aircraft Explorer
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted sm:text-xl">
                Examine military aircraft through structured engineering
                profiles covering performance, propulsion, dimensions, and
                design considerations.
              </p>
            </div>

            <aside className="rounded-2xl border border-border bg-surface/75 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Database aria-hidden="true" size={19} strokeWidth={1.7} />
                </span>
                <div>
                  <p className="font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                    Registry status
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    Dataset connected
                  </p>
                </div>
              </div>
              <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
                <span className="text-sm text-muted">Available profiles</span>
                <span className="font-mono text-2xl text-accent">
                  {aircraft.length}
                </span>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <section
        aria-labelledby="available-aircraft-title"
        className="py-20 sm:py-28"
        id="available-aircraft"
      >
        <Container>
          <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-xs tracking-[0.18em] text-accent uppercase">
                Available airframes
              </p>
              <h2
                className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl"
                id="available-aircraft-title"
              >
                Engineering profiles
              </h2>
            </div>
            <p className="font-mono text-xs tracking-[0.12em] text-muted uppercase">
              {aircraft.length} {profileLabel} indexed
            </p>
          </div>

          <div className="mt-8 grid gap-6">
            {aircraft.map((item) => (
              <AircraftCard aircraft={item} key={item.id} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
