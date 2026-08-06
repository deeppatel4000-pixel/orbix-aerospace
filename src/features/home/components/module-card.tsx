import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

interface ModuleCardProps {
  code: string;
  description: string;
  href: string;
  icon: LucideIcon;
  title: string;
}

export function ModuleCard({
  code,
  description,
  href,
  icon: Icon,
  title,
}: ModuleCardProps) {
  return (
    <article className="group h-full">
      <Link
        aria-label={"Open the " + title + " module"}
        className="orbix-premium-card orbix-premium-card--interactive flex h-full flex-col p-6 sm:p-7"
        href={href}
      >
        <div className="flex items-center justify-between">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/20 bg-accent/8 text-accent">
            <Icon aria-hidden="true" size={21} strokeWidth={1.7} />
          </span>
          <span className="font-mono text-[0.62rem] tracking-[0.16em] text-muted uppercase">
            {code}
            {" // Active"}
          </span>
        </div>

        <h3 className="mt-8 text-xl font-semibold tracking-tight">{title}</h3>
        <p className="mt-3 flex-1 text-sm leading-6 text-muted">
          {description}
        </p>

        <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-accent">
          Open workspace
          <ArrowRight
            aria-hidden="true"
            className="transition-transform motion-safe:group-hover:translate-x-1"
            size={16}
          />
        </span>
      </Link>
    </article>
  );
}
