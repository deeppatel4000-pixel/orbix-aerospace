import { ArrowLeft, CheckCircle2, type LucideIcon } from "lucide-react";

import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import { OrbixSurface } from "@/components/ui/orbix-surface";
import { StatusBadge } from "@/components/ui/status-badge";

interface FeaturePlaceholderProps {
  description: string;
  eyebrow: string;
  icon: LucideIcon;
  plannedItems: readonly string[];
  title: string;
}

export function FeaturePlaceholder({
  description,
  eyebrow,
  icon: Icon,
  plannedItems,
  title,
}: FeaturePlaceholderProps) {
  return (
    <section className="relative isolate overflow-hidden py-20 sm:py-28 lg:py-32">
      <div
        aria-hidden="true"
        className="technical-grid absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,transparent_85%)] opacity-50"
      />
      <Container>
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_25rem] lg:gap-20">
          <div>
            <div className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-card)] border border-accent/20 bg-accent/10 text-accent shadow-[0_0_40px_rgb(88_220_255/0.08)]">
              <Icon aria-hidden="true" size={27} strokeWidth={1.7} />
            </div>
            <p className="orbix-technical-label mt-8">{eyebrow}</p>
            <h1 className="font-display mt-4 text-5xl font-semibold tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted sm:text-xl">
              {description}
            </p>
            <StatusBadge className="mt-9" tone="caution">
              Foundation ready · Content coming in a later phase
            </StatusBadge>
          </div>

          <OrbixSurface as="aside" className="p-6 sm:p-8" variant="engineering">
            <p className="orbix-technical-label text-muted">
              Planned workspace
            </p>
            <ul className="mt-6 space-y-5">
              {plannedItems.map((item) => (
                <li
                  className="flex gap-3 text-sm leading-6 text-foreground"
                  key={item}
                >
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-accent"
                    size={18}
                  />
                  {item}
                </li>
              ))}
            </ul>
            <ButtonLink className="mt-8" href="/" variant="secondary">
              <ArrowLeft aria-hidden="true" size={16} />
              Back to platform overview
            </ButtonLink>
          </OrbixSurface>
        </div>
      </Container>
    </section>
  );
}
