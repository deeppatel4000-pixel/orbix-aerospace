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
  const labId = `${area.id}-lab-links`;
  const exploreId = `${area.id}-exploration-links`;
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
          {/* A reading list, not a row of chips.
           *
           * Each anchor was a bordered pill in uppercase monospace at 0.66rem
           * — twenty-eight of them across the page, which supplied most of the
           * route's surfaces and nearly all of its microtext, and made module
           * names that are ordinary English read as machine identifiers. They
           * are now interface-typeface links on shared rules. Every href and
           * every label is unchanged. */}
          <h3 className="orbix-label text-muted" id={labId}>
            Continue in the Engineering Laboratory
          </h3>
          <ul
            aria-labelledby={labId}
            className="mt-3 divide-y divide-border/70 border-y border-border/70"
          >
            {area.labAnchors.map((anchor) => (
              <li key={anchor.anchorId}>
                <a
                  className="group text-muted-strong flex min-h-11 items-center justify-between gap-3 py-2.5 text-sm leading-6 transition-colors hover:text-accent"
                  href={`/engineering-lab#${anchor.anchorId}`}
                >
                  {anchor.label}
                  <ArrowUpRight
                    aria-hidden="true"
                    className="shrink-0 text-muted transition-colors group-hover:text-accent"
                    size={14}
                  />
                </a>
              </li>
            ))}
          </ul>

          {area.explorationLinks.length > 0 ? (
            <div className="mt-6 border-t border-border/70 pt-6">
              <h3 className="orbix-label text-muted" id={exploreId}>
                Explore in ORBIX
              </h3>
              <div className="mt-3 divide-y divide-border/70">
                {area.explorationLinks.map((link) => (
                  <Link
                    className="group block py-3 transition-colors"
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
