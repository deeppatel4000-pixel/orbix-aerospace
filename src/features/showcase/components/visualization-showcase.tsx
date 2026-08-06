import { FileText, Orbit, Route } from "lucide-react";

import { Container } from "@/components/layout/container";
import { ShowcaseSectionHeading } from "@/features/showcase/components/showcase-section-heading";

const visualizationCards = [
  {
    description:
      "Circular orbits and transfer paths provide visual context for completed orbital analysis.",
    icon: Orbit,
    label: "Orbit workspace",
    visual: "orbit",
  },
  {
    description:
      "Trajectory, heating, and deceleration markers communicate how an entry evolves over time.",
    icon: Route,
    label: "Reentry workspace",
    visual: "reentry",
  },
  {
    description:
      "Reports, trade studies, and briefings translate engineering outputs into a reviewable narrative.",
    icon: FileText,
    label: "Review workspace",
    visual: "review",
  },
] as const;

function OrbitSchematic() {
  return (
    <div className="technical-grid relative flex min-h-64 items-center justify-center overflow-hidden rounded-xl border border-border bg-background/70">
      <div className="absolute h-20 w-20 rounded-full border border-accent/30 bg-accent/5 shadow-[0_0_45px_rgb(87_215_255/0.12)]" />
      <div className="absolute h-40 w-64 -rotate-12 rounded-[50%] border border-accent/35" />
      <div className="absolute h-56 w-[22rem] -rotate-12 rounded-[50%] border border-dashed border-muted/30" />
      <span className="absolute top-[29%] right-[19%] h-3 w-3 rounded-full bg-accent shadow-[0_0_15px_rgb(87_215_255/0.85)]" />
      <span className="absolute bottom-3 left-3 font-mono text-[0.58rem] tracking-[0.14em] text-muted uppercase">
        Interface schematic // illustrative
      </span>
    </div>
  );
}

function ReentrySchematic() {
  return (
    <div className="technical-grid relative min-h-64 overflow-hidden rounded-xl border border-border bg-background/70">
      <div className="absolute inset-x-0 bottom-0 h-24 border-t border-accent/15 bg-accent/[0.04]" />
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 400 260"
      >
        <path
          d="M 30 35 C 125 45, 185 78, 230 125 S 305 210, 370 222"
          fill="none"
          stroke="rgb(87 215 255 / 0.55)"
          strokeDasharray="6 7"
          strokeWidth="2"
        />
        <circle cx="230" cy="125" fill="#ffb84d" r="5" />
        <circle cx="315" cy="202" fill="#57d7ff" r="5" />
      </svg>
      <span className="absolute top-[43%] left-[58%] font-mono text-[0.55rem] tracking-wider text-signal uppercase">
        Heating marker
      </span>
      <span className="absolute right-[5%] bottom-[18%] font-mono text-[0.55rem] tracking-wider text-accent uppercase">
        Deceleration marker
      </span>
      <span className="absolute bottom-3 left-3 font-mono text-[0.58rem] tracking-[0.14em] text-muted uppercase">
        Interface schematic // illustrative
      </span>
    </div>
  );
}

function ReviewSchematic() {
  return (
    <div className="technical-grid relative flex min-h-64 items-center justify-center overflow-hidden rounded-xl border border-border bg-background/70 p-6">
      <div className="w-full max-w-xs rounded-lg border border-border bg-surface/90 p-4 shadow-xl shadow-black/30">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <span className="font-mono text-[0.58rem] tracking-[0.14em] text-accent uppercase">
            Engineering review
          </span>
          <span className="h-2 w-2 rounded-full bg-accent" />
        </div>
        <div className="mt-4 space-y-3">
          {[
            "Mission architecture",
            "Vehicle analysis",
            "Thermal protection",
          ].map((label, index) => (
            <div
              className="grid grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-3"
              key={label}
            >
              <span className="font-mono text-[0.58rem] text-muted">
                0{index + 1}
              </span>
              <div>
                <p className="text-[0.68rem] text-foreground">{label}</p>
                <div className="mt-1.5 h-1 rounded-full bg-border">
                  <div className="h-1 w-2/3 rounded-full bg-accent/35" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <span className="absolute bottom-3 left-3 font-mono text-[0.58rem] tracking-[0.14em] text-muted uppercase">
        Interface schematic // illustrative
      </span>
    </div>
  );
}

export function VisualizationShowcase() {
  return (
    <section
      aria-labelledby="showcase-visualization-title"
      className="orbix-section border-y border-border/70 bg-surface/20"
    >
      <Container>
        <ShowcaseSectionHeading
          description="Visualization is a communication layer, not a second physics engine. Every workspace is designed to make completed analysis easier to inspect and explain."
          eyebrow="Engineering visualization"
          title="Make technical relationships visible."
          titleId="showcase-visualization-title"
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {visualizationCards.map((card) => (
            <article
              className="orbix-premium-card orbix-premium-card--interactive p-4"
              key={card.label}
            >
              {card.visual === "orbit" ? <OrbitSchematic /> : null}
              {card.visual === "reentry" ? <ReentrySchematic /> : null}
              {card.visual === "review" ? <ReviewSchematic /> : null}
              <div className="p-3 pt-5">
                <div className="flex items-center gap-3">
                  <card.icon
                    aria-hidden="true"
                    className="text-accent"
                    size={18}
                  />
                  <h3 className="font-display text-lg font-semibold">
                    {card.label}
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {card.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
