import {
  Activity,
  BookOpenCheck,
  Command,
  Orbit,
  RadioTower,
  ShieldCheck,
} from "lucide-react";

import { Container } from "@/components/layout/container";
import { ShowcaseSectionHeading } from "@/features/showcase/components/showcase-section-heading";

const workspaces = [
  { icon: Command, label: "Overview" },
  { icon: Orbit, label: "Orbit" },
  { icon: Activity, label: "Reentry" },
  { icon: RadioTower, label: "Ground Track" },
  { icon: ShieldCheck, label: "Design Review" },
  { icon: BookOpenCheck, label: "Briefing" },
] as const;

const telemetrySources = [
  ["Orbital", "Transfer and delta-v analysis"],
  ["Vehicle", "Reentry evaluation outputs"],
  ["Thermal", "Heating and TPS analysis"],
  ["Review", "Report assumptions and limits"],
] as const;

export function MissionControlPreview() {
  return (
    <section
      aria-labelledby="showcase-mission-control-title"
      className="border-b border-border/70 bg-surface/25 py-24 sm:py-32"
    >
      <Container>
        <ShowcaseSectionHeading
          description="Mission Control turns completed engineering work into a coherent review environment without recalculating or inventing mission data."
          eyebrow="Command interface"
          title="One workspace for the complete mission story."
          titleId="showcase-mission-control-title"
        />

        <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-background shadow-2xl shadow-black/30">
          <div className="flex flex-col gap-3 border-b border-border bg-surface/75 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-xs tracking-[0.18em] text-accent uppercase">
                ORBIX // Mission Control
              </p>
              <p className="mt-1 text-sm text-muted">
                Educational mission systems review
              </p>
            </div>
            <span className="w-fit rounded-full border border-accent/25 bg-accent/5 px-3 py-1 font-mono text-[0.62rem] tracking-[0.14em] text-accent uppercase">
              Presentation preview
            </span>
          </div>

          <div className="grid min-h-[34rem] lg:grid-cols-[14rem_minmax(0,1fr)]">
            <nav
              aria-label="Mission Control preview workspaces"
              className="border-b border-border bg-surface/45 p-3 lg:border-r lg:border-b-0"
            >
              <p className="px-3 py-2 font-mono text-[0.6rem] tracking-[0.16em] text-muted uppercase">
                Workspaces
              </p>
              <ul className="grid gap-1 sm:grid-cols-3 lg:grid-cols-1">
                {workspaces.map((workspace, index) => (
                  <li key={workspace.label}>
                    <div
                      className={
                        index === 0
                          ? "flex items-center gap-3 rounded-lg border border-accent/20 bg-accent/10 px-3 py-3 text-accent"
                          : "flex items-center gap-3 rounded-lg border border-transparent px-3 py-3 text-muted"
                      }
                    >
                      <workspace.icon aria-hidden="true" size={16} />
                      <span className="text-xs font-medium">
                        {workspace.label}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="technical-grid p-5 sm:p-7 lg:p-8">
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
                <div className="rounded-xl border border-border bg-surface/90 p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
                    <div>
                      <p className="font-mono text-[0.62rem] tracking-[0.16em] text-muted uppercase">
                        Mission architecture
                      </p>
                      <h3 className="mt-2 text-xl font-semibold">
                        Analysis-to-presentation flow
                      </h3>
                    </div>
                    <Command
                      aria-hidden="true"
                      className="text-accent"
                      size={22}
                    />
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {[
                      ["01", "Mission profile", "Typed scenario inputs"],
                      ["02", "Orbital systems", "Maneuvers and budgets"],
                      ["03", "Reentry systems", "Vehicle and thermal outputs"],
                      [
                        "04",
                        "Engineering review",
                        "Reports and visual context",
                      ],
                    ].map(([code, title, description]) => (
                      <div
                        className="rounded-lg border border-border bg-background/60 p-4"
                        key={code}
                      >
                        <span className="font-mono text-[0.62rem] text-accent">
                          {code}
                        </span>
                        <p className="mt-3 text-sm font-semibold">{title}</p>
                        <p className="mt-1 text-xs leading-5 text-muted">
                          {description}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-lg border border-accent/20 bg-accent/5 p-4">
                    <p className="font-mono text-[0.6rem] tracking-[0.16em] text-accent uppercase">
                      Presentation boundary
                    </p>
                    <p className="mt-2 text-sm leading-6 text-foreground">
                      Mission Control receives completed objects. Engineering
                      equations remain in calculator and analysis modules.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-surface/90 p-5 sm:p-6">
                  <p className="font-mono text-[0.62rem] tracking-[0.16em] text-muted uppercase">
                    Telemetry sources
                  </p>
                  <dl className="mt-4 divide-y divide-border">
                    {telemetrySources.map(([term, description]) => (
                      <div className="py-4 first:pt-0" key={term}>
                        <dt className="text-sm font-semibold text-foreground">
                          {term}
                        </dt>
                        <dd className="mt-1 text-xs leading-5 text-muted">
                          {description}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-3 flex items-center gap-2 border-t border-border pt-4 font-mono text-[0.62rem] tracking-[0.12em] text-accent uppercase">
                    <span className="h-2 w-2 rounded-full bg-accent" />
                    Source data only
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
