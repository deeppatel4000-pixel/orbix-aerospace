import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { getRowEducation } from "@/features/compare/education";
import type { ComparisonCategory } from "@/features/compare/types";

interface ComparisonRowEducationProps {
  category: ComparisonCategory;
  rowId: string;
}

/**
 * Collapsed "What this measures" note for a comparison row (spec 14). The
 * explanation is general aerospace context, never an ORBIX-computed result,
 * and stays collapsed by default so it never buries the published values.
 */
export function ComparisonRowEducation({
  category,
  rowId,
}: ComparisonRowEducationProps) {
  const education = getRowEducation(category, rowId);

  if (!education) return null;

  return (
    <details className="group mt-2 text-[length:var(--text-label)] font-normal">
      <summary className="inline-flex min-h-6 cursor-pointer list-none items-center gap-1 rounded-sm text-accent underline decoration-1 underline-offset-[0.2em] hover:text-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
        <ChevronRight
          aria-hidden="true"
          className="shrink-0 transition-transform duration-150 group-open:rotate-90 motion-reduce:transition-none"
          size={14}
        />
        What this measures
      </summary>
      <div className="mt-2 space-y-2 border-l border-border-strong pl-3">
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
