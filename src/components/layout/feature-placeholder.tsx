import Link from "next/link";
import { ArrowLeft, CheckCircle2, type LucideIcon } from "lucide-react";

import { Container } from "@/components/layout/container";

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
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent shadow-[0_0_40px_rgb(87_215_255/0.08)]">
              <Icon aria-hidden="true" size={27} strokeWidth={1.7} />
            </div>
            <p className="mt-8 font-mono text-xs tracking-[0.22em] text-accent uppercase">
              {eyebrow}
            </p>
            <h1 className="mt-4 text-5xl font-semibold tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted sm:text-xl">
              {description}
            </p>
            <div className="mt-9 inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-4 py-2 text-sm text-muted">
              <span className="h-2 w-2 rounded-full bg-signal shadow-[0_0_12px_rgb(255_184_77/0.8)]" />
              Foundation ready · Content coming in a later phase
            </div>
          </div>

          <aside className="rounded-3xl border border-border bg-surface/80 p-6 shadow-2xl shadow-black/15 backdrop-blur sm:p-8">
            <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">
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
            <Link
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-foreground"
              href="/"
            >
              <ArrowLeft aria-hidden="true" size={16} />
              Back to platform overview
            </Link>
          </aside>
        </div>
      </Container>
    </section>
  );
}
