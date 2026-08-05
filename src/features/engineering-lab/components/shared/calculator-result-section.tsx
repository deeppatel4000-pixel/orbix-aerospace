import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface CalculatorResultSectionProps {
  children: ReactNode;
  eyebrow: string;
  icon: LucideIcon;
  id: string;
  title: string;
}

export function CalculatorResultSection({
  children,
  eyebrow,
  icon: Icon,
  id,
  title,
}: CalculatorResultSectionProps) {
  const titleId = id + "-title";

  return (
    <section
      aria-labelledby={titleId}
      className="technical-grid overflow-hidden rounded-2xl border border-border bg-background/45"
    >
      <div className="border-b border-border p-5 sm:p-6">
        <p className="flex items-center gap-2 font-mono text-[0.65rem] tracking-[0.14em] text-accent uppercase">
          <Icon aria-hidden="true" size={15} />
          {eyebrow}
        </p>
        <h3 className="mt-2 text-xl font-semibold" id={titleId}>
          {title}
        </h3>
      </div>

      <div aria-live="polite" className="p-5 sm:p-6" role="status">
        {children}
      </div>
    </section>
  );
}
