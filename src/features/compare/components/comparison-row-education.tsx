import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { getRowEducation } from "@/features/compare/education";
import type { ComparisonCategory } from "@/features/compare/types";
import { cn } from "@/lib/cn";

interface ComparisonRowEducationProps {
  category: ComparisonCategory;
  className?: string;
  /**
   * The row description. Below 48rem the sticky column hides it, so it is
   * shown first inside the disclosure there.
   */
  description?: string;
  /** The row label, added to the summary's accessible name. */
  label: string;
  rowId: string;
}

/**
 * Collapsed "What this measures" note for a comparison row. The explanation
 * is general aerospace context, never an ORBIX-computed result, and stays
 * collapsed by default so it never buries the published values.
 */
export function ComparisonRowEducation({
  category,
  className,
  description,
  label,
  rowId,
}: ComparisonRowEducationProps) {
  const education = getRowEducation(category, rowId);

  if (!education) return null;

  return (
    <details
      className={cn(
        "group text-[length:var(--text-label)] font-normal",
        className,
      )}
    >
      <summary className="inline-flex min-h-6 cursor-pointer list-none items-center gap-0.5 rounded-sm text-xs text-muted decoration-1 underline-offset-4 group-open:underline hover:text-text-secondary hover:underline focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--orbix-focus)] [&::-webkit-details-marker]:hidden">
        <ChevronRight
          aria-hidden="true"
          className="shrink-0 text-accent transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-open:rotate-90 motion-reduce:transition-none"
          size={12}
        />
        {/* Short in the 6rem phone column so it keeps to one line. Each
            accessible name starts with its visible words (WCAG 2.5.3) and
            names the row, since the summary repeats on every row. */}
        <span className="md:hidden">
          About<span className="sr-only"> {label}</span>
        </span>
        <span className="max-md:hidden">
          What this measures<span className="sr-only">: {label}</span>
        </span>
      </summary>
      <div className="mt-2 max-w-[34ch] space-y-2 border-t border-border-subtle pt-2">
        {description ? (
          <p className="leading-5 text-foreground md:hidden">{description}</p>
        ) : null}
        <p className="leading-5 text-text-secondary">{education.explanation}</p>
        <p className="leading-5 text-muted">
          General aerospace background, not an ORBIX calculation.
        </p>
        {education.labLinks && education.labLinks.length > 0 ? (
          <ul className="space-y-1">
            {education.labLinks.map((link) => (
              <li key={link.anchor}>
                <Link
                  className="orbix-link inline-flex min-h-6 items-center"
                  href={`/engineering-lab#${link.anchor}`}
                >
                  Open the {link.label} tool
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </details>
  );
}
