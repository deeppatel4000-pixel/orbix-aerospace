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
    <article className="group h-full border-t border-border/80">
      <Link
        aria-label={"Open the " + title + " module"}
        className="relative flex h-full min-h-80 flex-col overflow-hidden border-x border-b border-border/70 bg-surface/48 p-6 transition-[background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:border-accent/40 hover:bg-surface/76 hover:shadow-[0_22px_50px_rgb(0_0_0/0.28)] focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transform-none motion-reduce:transition-none sm:p-7"
        href={href}
      >
        <div
          aria-hidden="true"
          className="absolute top-0 right-0 h-px w-20 bg-gradient-to-l from-accent/70 to-transparent"
        />
        <div className="flex items-center justify-between gap-4">
          <span className="flex h-11 w-11 items-center justify-center border border-accent/22 bg-accent/7 text-accent">
            <Icon aria-hidden="true" size={21} strokeWidth={1.7} />
          </span>
          <span className="font-mono text-[0.62rem] tracking-[0.16em] text-muted uppercase">
            {code}
            {" // Active"}
          </span>
        </div>

        <h3 className="font-display mt-10 text-2xl font-semibold tracking-[-0.025em]">
          {title}
        </h3>
        <p className="mt-4 flex-1 text-sm leading-7 text-muted">
          {description}
        </p>

        <span className="mt-8 inline-flex items-center justify-between gap-3 border-t border-border/75 pt-4 text-sm font-semibold text-accent">
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
