import Link from "next/link";
import { BookOpenText } from "lucide-react";

import { getRowEducation } from "@/features/compare/education";
import type { ComparisonCategory } from "@/features/compare/types";

interface ComparisonRowEducationProps {
  category: ComparisonCategory;
  rowId: string;
}

/**
 * Collapsed, presentation-only "why it matters" note for a comparison row.
 * The explanation is general aerospace context, never an ORBIX-computed
 * result, and is kept collapsed by default so it never buries the
 * published specification data above it.
 */
export function ComparisonRowEducation({
  category,
  rowId,
}: ComparisonRowEducationProps) {
  const education = getRowEducation(category, rowId);

  if (!education) return null;

  return (
    <details className="mt-3 text-xs font-normal">
      <summary className="inline-flex min-h-11 items-center gap-1.5 py-1 font-mono text-[0.62rem] tracking-[0.1em] text-accent uppercase">
        <BookOpenText aria-hidden="true" size={13} strokeWidth={1.8} />
        Why it matters
      </summary>
      <div className="mt-2 max-w-xs space-y-2 border-l border-accent/25 pl-3">
        <p className="leading-5 text-muted">{education.explanation}</p>
        {/* Full `text-muted`, not a reduced-opacity variant: at 70% opacity
            this line measured 4.06:1 against the surface behind it, below the
            WCAG AA 4.5:1 minimum for normal-weight text. */}
        <p className="font-mono text-[0.58rem] tracking-[0.08em] text-muted uppercase">
          General aerospace concept, not an ORBIX calculation
        </p>
        {education.labLinks && education.labLinks.length > 0 ? (
          <ul className="flex flex-wrap gap-x-3 gap-y-1.5">
            {education.labLinks.map((link) => (
              <li key={link.anchor}>
                <Link
                  className="inline-flex min-h-11 items-center text-[0.68rem] font-semibold text-accent underline-offset-2 hover:underline"
                  href={`/engineering-lab#${link.anchor}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </details>
  );
}
