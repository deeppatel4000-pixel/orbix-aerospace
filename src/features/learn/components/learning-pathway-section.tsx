import {
  ArrowUpRight,
  Flame,
  Orbit,
  Plane,
  Radar,
  Rocket,
  Wind,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { OrbixSurface } from "@/components/ui/orbix-surface";
import { TechnicalLabel } from "@/components/ui/technical-label";
import type { LearnAccent, LearningArea } from "@/features/learn/types";
import { cn } from "@/lib/cn";

interface AccentPresentation {
  readonly iconWellClassName: string;
  readonly icon: LucideIcon;
  readonly labelClassName: string;
  readonly quoteBorderClassName: string;
}

const accentPresentation: Readonly<Record<LearnAccent, AccentPresentation>> = {
  accent: {
    icon: Radar,
    iconWellClassName: "border-accent/25 bg-accent/10 text-accent",
    labelClassName: "text-accent",
    quoteBorderClassName: "border-accent/50",
  },
  atmosphere: {
    icon: Rocket,
    iconWellClassName: "border-atmosphere/25 bg-atmosphere/10 text-atmosphere",
    labelClassName: "text-atmosphere",
    quoteBorderClassName: "border-atmosphere/50",
  },
  laboratory: {
    icon: Wind,
    iconWellClassName: "border-laboratory/25 bg-laboratory/10 text-laboratory",
    labelClassName: "text-laboratory",
    quoteBorderClassName: "border-laboratory/50",
  },
  plasma: {
    icon: Orbit,
    iconWellClassName: "border-plasma/25 bg-plasma/10 text-plasma",
    labelClassName: "text-plasma",
    quoteBorderClassName: "border-plasma/50",
  },
  signal: {
    icon: Flame,
    iconWellClassName: "border-signal/25 bg-signal/10 text-signal",
    labelClassName: "text-signal",
    quoteBorderClassName: "border-signal/50",
  },
  tactical: {
    icon: Plane,
    iconWellClassName: "border-tactical/25 bg-tactical/10 text-tactical-amber",
    labelClassName: "text-tactical-amber",
    quoteBorderClassName: "border-tactical-amber/50",
  },
};

interface LearningPathwaySectionProps {
  area: LearningArea;
  sequence: number;
}

export function LearningPathwaySection({
  area,
  sequence,
}: LearningPathwaySectionProps) {
  const titleId = `${area.id}-title`;
  const presentation = accentPresentation[area.accent];
  const Icon = presentation.icon;
  const ordinal = String(sequence).padStart(2, "0");

  return (
    <section
      aria-labelledby={titleId}
      className="scroll-mt-28 border-t border-border pt-14 first:border-t-0 first:pt-0 sm:pt-16"
      id={area.id}
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-12">
        <div>
          <header className="flex items-start gap-4">
            <span
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center border",
                presentation.iconWellClassName,
              )}
            >
              <Icon aria-hidden="true" size={22} strokeWidth={1.7} />
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "font-mono text-[0.62rem] tracking-[0.18em] uppercase",
                  presentation.labelClassName,
                )}
              >
                {area.code}
              </p>
              <h2
                className="font-display mt-2 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl"
                id={titleId}
              >
                {area.title}
              </h2>
            </div>
            <span
              aria-hidden="true"
              className={cn(
                "font-display hidden shrink-0 text-7xl leading-none font-semibold tracking-tighter opacity-[0.14] lg:block",
                presentation.labelClassName,
              )}
            >
              {ordinal}
            </span>
          </header>

          <p className="orbix-body-lead mt-6">{area.concept}</p>

          <div className="mt-6 border-t border-border/70 pt-6">
            <TechnicalLabel className="text-muted">
              Why it matters
            </TechnicalLabel>
            <p
              className={cn(
                "mt-3 border-l-2 pl-4 text-base leading-7 text-foreground/90 sm:text-lg sm:leading-8",
                presentation.quoteBorderClassName,
              )}
            >
              {area.whyItMatters}
            </p>
            <p className="mt-5 text-sm leading-6 text-muted sm:text-base sm:leading-7">
              <span className="text-muted-strong font-semibold">
                In real aerospace —{" "}
              </span>
              {area.realWorldContext}
            </p>
          </div>
        </div>

        <OrbixSurface
          as="aside"
          className="p-6 sm:p-7"
          variant={area.surfaceVariant}
        >
          <TechnicalLabel className="text-muted">
            Continue in the Engineering Laboratory
          </TechnicalLabel>
          <ul className="mt-4 flex flex-wrap gap-2">
            {area.labAnchors.map((anchor) => (
              <li key={anchor.anchorId}>
                <a
                  className="text-muted-strong inline-flex min-h-11 items-center rounded-full border border-border px-3.5 text-center font-mono text-[0.66rem] tracking-[0.05em] uppercase transition-colors hover:border-accent/50 hover:text-accent"
                  href={`/engineering-lab#${anchor.anchorId}`}
                >
                  {anchor.label}
                </a>
              </li>
            ))}
          </ul>

          {area.explorationLinks.length > 0 ? (
            <div className="mt-6 space-y-3 border-t border-border/70 pt-6">
              <TechnicalLabel className="text-muted">
                Explore in ORBIX
              </TechnicalLabel>
              <div className="space-y-3">
                {area.explorationLinks.map((link) => (
                  <Link
                    className="group block rounded-[var(--radius-control)] border border-border p-3.5 transition-colors hover:border-accent/50"
                    href={link.href}
                    key={link.href}
                  >
                    <span className="flex items-center justify-between gap-2 text-sm font-semibold text-foreground">
                      {link.label}
                      <ArrowUpRight
                        aria-hidden="true"
                        className="shrink-0 text-muted transition-colors group-hover:text-accent"
                        size={15}
                      />
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-muted">
                      {link.description}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </OrbixSurface>
      </div>
    </section>
  );
}
