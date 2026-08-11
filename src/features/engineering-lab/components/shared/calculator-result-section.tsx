import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/**
 * The answer panel every calculator ends in — 22 modules render through it.
 *
 * Kept as a distinct surface, because "what did this compute?" is the one
 * question the module exists to answer and it earns containment. What went is
 * the decoration around it: the `technical-grid` overlay behind the numbers,
 * and the monospace micro-eyebrow. The border now carries a trace of the
 * accent so the result reads as the emphasised region without a second
 * background competing with the figure inside it.
 *
 * `role="status"` with `aria-live="polite"` is deliberately preserved. Results
 * appear on submit without moving focus, so a screen reader user would
 * otherwise get no confirmation that anything happened. Only one module is
 * visible at a time, so at most one of these is live.
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
      className="overflow-hidden rounded-lg border border-accent/25 bg-background/45"
    >
      <div className="border-b border-border p-5 sm:p-6">
        <p className="orbix-label flex items-center gap-2">
          <Icon aria-hidden="true" size={15} />
          {eyebrow}
        </p>
        <h3 className="mt-2 text-lg font-semibold" id={titleId}>
          {title}
        </h3>
      </div>

      <div aria-live="polite" className="p-5 sm:p-6" role="status">
        {children}
      </div>
    </section>
  );
}
