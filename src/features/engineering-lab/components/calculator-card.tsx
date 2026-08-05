import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface CalculatorCardProps {
  children: ReactNode;
  description: string;
  eyebrow: string;
  icon: LucideIcon;
  id: string;
  title: string;
}

export function CalculatorCard({
  children,
  description,
  eyebrow,
  icon: Icon,
  id,
  title,
}: CalculatorCardProps) {
  const titleId = id + "-title";

  return (
    <article
      aria-labelledby={titleId}
      className="overflow-hidden rounded-3xl border border-border bg-surface/65"
      id={id}
    >
      <header className="technical-grid border-b border-border bg-background/35 p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent">
            <Icon aria-hidden="true" size={23} strokeWidth={1.7} />
          </span>
          <div>
            <p className="font-mono text-[0.68rem] tracking-[0.18em] text-accent uppercase">
              {eyebrow}
            </p>
            <h2
              className="mt-2 text-3xl font-semibold tracking-[-0.035em]"
              id={titleId}
            >
              {title}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
              {description}
            </p>
          </div>
        </div>
      </header>
      <div className="p-6 sm:p-8">{children}</div>
    </article>
  );
}
