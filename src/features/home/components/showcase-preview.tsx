import {
  ArrowUpRight,
  FileText,
  MonitorPlay,
  Presentation,
  ScanSearch,
} from "lucide-react";

import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";

const presentationSystems = [
  { icon: MonitorPlay, label: "Mission visualizations" },
  { icon: FileText, label: "Structured engineering reports" },
  { icon: ScanSearch, label: "Assumptions and design review" },
  { icon: Presentation, label: "Briefings and mission replay" },
] as const;

export function ShowcasePreview() {
  return (
    <section
      aria-labelledby="showcase-preview-title"
      className="relative overflow-hidden border-b border-border bg-surface/35 py-20 sm:py-24"
    >
      <div
        aria-hidden="true"
        className="technical-grid absolute inset-0 opacity-20"
      />
      <Container className="relative">
        <div className="orbix-frame grid overflow-hidden border-accent/25 bg-background/80 lg:grid-cols-[minmax(0,1.1fr)_minmax(24rem,0.9fr)]">
          <div className="p-7 sm:p-10 lg:p-12">
            <p className="orbix-kicker">Engineering communication layer</p>
            <h2
              className="font-display mt-4 max-w-3xl text-4xl leading-[0.98] font-semibold tracking-[-0.045em] sm:text-5xl"
              id="showcase-preview-title"
            >
              Make completed engineering easier to inspect and explain.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted">
              Read completed analysis through orbit schematics, reentry
              profiles, reports, timelines, briefings, and design reviews.
              Illustrative presentation remains separate from the physics.
            </p>
            <ButtonLink className="mt-8" href="/showcase">
              Explore mission showcase
              <ArrowUpRight aria-hidden="true" size={16} />
            </ButtonLink>
          </div>

          <ul
            aria-label="ORBIX presentation systems"
            className="grid gap-px border-t border-border bg-border sm:grid-cols-2 lg:border-t-0 lg:border-l"
          >
            {presentationSystems.map((system) => (
              <li className="bg-[#07101a] p-6 sm:p-7" key={system.label}>
                <system.icon
                  aria-hidden="true"
                  className="text-accent"
                  size={21}
                  strokeWidth={1.6}
                />
                <p className="mt-10 text-sm font-medium text-foreground">
                  {system.label}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
