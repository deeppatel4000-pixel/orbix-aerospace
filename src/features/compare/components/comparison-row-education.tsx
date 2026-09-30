import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { getRowEducation } from "@/features/compare/education";
import type { ComparisonCategory } from "@/features/compare/types";
import { cn } from "@/lib/cn";

interface ComparisonRowEducationProps {
  category: ComparisonCategory;
  className?: string;
  /**
   * The row description, shown first inside the disclosure in the `list`
   * variant, where the row header does not show it.
   */
  description?: string;
  /** The row label, added to the summary's accessible name. */
  label: string;
  rowId: string;
  /**
   * `cell` (default) sits in the row header from 48rem, under the label.
   * `list` is one entry of the full-width list under each group below
   * 48rem, where the 6.25rem row header column is too narrow for a
   * paragraph: its summary names the row ("About Manufacturer").
   */
  variant?: "cell" | "list";
}

/**
 * Collapsed "About" (what this measures) note for a comparison row. The explanation
 * is general aerospace context, never an ORBIX-computed result, and stays
 * collapsed by default so it never buries the published values.
 */
export function ComparisonRowEducation({
  category,
  className,
  description,
  label,
  rowId,
  variant = "cell",
}: ComparisonRowEducationProps) {
  const education = getRowEducation(category, rowId);

  if (!education) return null;

  const isList = variant === "list";

  return (
    <details
      className={cn(
        "group text-[length:var(--text-label)] font-normal",
        className,
      )}
    >
      <summary
        className={cn(
          "inline-flex cursor-pointer list-none items-center gap-0.5 rounded-sm text-muted decoration-1 underline-offset-4 group-open:underline hover:text-text-secondary hover:underline focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--orbix-focus)] [&::-webkit-details-marker]:hidden",
          isList ? "min-h-11 text-sm" : "min-h-6 text-xs",
        )}
      >
        <ChevronRight
          aria-hidden="true"
          className="shrink-0 text-accent transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-open:rotate-90 motion-reduce:transition-none"
          size={isList ? 14 : 12}
        />
        {/* Each accessible name starts with its visible words (WCAG 2.5.3)
            and names the row, since the summary repeats on every row. */}
        {isList ? (
          "About " + label
        ) : (
          /* A short, quiet label, since it repeats under every row label
             in the column; the hidden words keep the row and the purpose
             in the accessible name, which still starts with "About". */
          <span className="font-mono text-xs tracking-normal">
            About<span className="sr-only"> {label}: what this measures</span>
          </span>
        )}
      </summary>
      <div
        className={cn(
          "space-y-2 border-t border-border-subtle",
          isList ? "mt-1 mb-3 max-w-[60ch] pt-3" : "mt-2 max-w-[34ch] pt-2",
        )}
      >
        {isList && description ? (
          <p className="leading-5 text-foreground">{description}</p>
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
