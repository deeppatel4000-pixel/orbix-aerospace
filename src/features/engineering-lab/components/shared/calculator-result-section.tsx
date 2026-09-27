import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/**
 * The results panel every calculator ends in (spec 14, Engineering Lab).
 *
 * A flat bordered panel: a small label, an h3 title, then the figures. The
 * body keeps `role="status"` with `aria-live="polite"`: results appear on
 * submit (or as valid inputs change) without moving focus, so a screen reader
 * user would otherwise get no confirmation that anything was calculated. Only
 * one module is visible at a time, so at most one of these is live.
 */

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
      className="overflow-hidden rounded-md border border-border bg-surface"
      id={id}
    >
      <div className="border-b border-border-subtle px-4 py-4 sm:px-6">
        <p className="orbix-label flex items-center gap-2">
          <Icon aria-hidden="true" className="shrink-0" size={16} />
          {eyebrow}
        </p>
        <h3 className="mt-1 text-lg font-semibold" id={titleId}>
          {title}
        </h3>
      </div>

      <div aria-live="polite" className="p-4 sm:p-6" role="status">
        {children}
      </div>
    </section>
  );
}
