import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface LaboratoryWorkflowSectionProps {
  children: ReactNode;
  code: string;
  description: string;
  icon: LucideIcon;
  id: string;
  title: string;
}

export function LaboratoryWorkflowSection({
  children,
  code,
  description,
  icon: Icon,
  id,
  title,
}: LaboratoryWorkflowSectionProps) {
  const titleId = `${id}-title`;

  return (
    <section
      aria-labelledby={titleId}
      className="scroll-mt-28 border-t border-border pt-10 first:border-t-0 first:pt-0 sm:pt-12"
      id={id}
    >
      <header className="mb-7 grid gap-5 border-b border-border pb-7 sm:grid-cols-[3rem_minmax(0,1fr)] sm:items-start">
        <span className="flex h-11 w-11 items-center justify-center border border-accent/25 bg-accent/[0.08] text-accent">
          <Icon aria-hidden="true" size={20} strokeWidth={1.6} />
        </span>
        <div>
          <p className="font-mono text-[0.62rem] tracking-[0.16em] text-accent uppercase">
            {code}
          </p>
          <h2
            className="font-display mt-2 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl"
            id={titleId}
          >
            {title}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted sm:text-base sm:leading-7">
            {description}
          </p>
        </div>
      </header>

      <div className="space-y-8">{children}</div>
    </section>
  );
}
