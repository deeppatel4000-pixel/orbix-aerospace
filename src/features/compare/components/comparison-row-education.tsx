import Link from "next/link";

import {
  getRowEducation,
  type RowEducationEntry,
} from "@/features/compare/education";
import type { ComparisonCategory } from "@/features/compare/types";
import { cn } from "@/lib/cn";

const BACKGROUND_NOTE =
  "General aerospace background, not an ORBIX calculation.";

/** The open state underlines solidly; at rest the trigger is dotted. */
const summaryClass =
  "inline-flex cursor-pointer list-none items-center rounded-sm text-muted underline decoration-dotted decoration-1 underline-offset-4 transition-colors duration-200 group-open:decoration-solid hover:text-text-secondary hover:decoration-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--orbix-focus)] motion-reduce:transition-none [&::-webkit-details-marker]:hidden";

function LabLinks({ education }: { education: RowEducationEntry }) {
  return education.labLinks && education.labLinks.length > 0 ? (
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
  ) : null;
}

interface ComparisonRowEducationProps {
  category: ComparisonCategory;
  className?: string;
  /** The row label, added to the summary's accessible name. */
  label: string;
  rowId: string;
}

/**
 * Collapsed "About" (what this measures) note in a row header, from 48rem.
 * The explanation is general aerospace context, never an ORBIX-computed
 * result, and stays collapsed by default so it never buries the published
 * values. The trigger is quiet muted text with a dotted underline, since it
 * repeats under every row label in the column.
 */
export function ComparisonRowEducation({
  category,
  className,
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
      {/* The accessible name starts with the visible word (WCAG 2.5.3); the
          hidden words name the row, since the summary repeats on every row. */}
      <summary className={cn(summaryClass, "min-h-6 text-xs")}>
        About<span className="sr-only"> {label}: what this measures</span>
      </summary>
      <div className="mt-1.5 mb-1 max-w-[34ch] space-y-2">
        <p className="leading-5 text-text-secondary">{education.explanation}</p>
        <p className="leading-5 text-muted">{BACKGROUND_NOTE}</p>
        <LabLinks education={education} />
      </div>
    </details>
  );
}

interface ComparisonGroupNotesProps {
  category: ComparisonCategory;
  className?: string;
  /** The group label, added to the summary's accessible name. */
  groupLabel: string;
  rows: readonly {
    readonly description?: string;
    readonly id: string;
    readonly label: string;
  }[];
}

/**
 * Below 48rem the row header column is too narrow for a paragraph, so each
 * group ends in one collapsed "About these rows" note holding every row's
 * description and background as a definition list, instead of one
 * disclosure per row.
 */
export function ComparisonGroupNotes({
  category,
  className,
  groupLabel,
  rows,
}: ComparisonGroupNotesProps) {
  const entries = rows.flatMap((row) => {
    const education = getRowEducation(category, row.id);
    return education ? [{ education, row }] : [];
  });

  if (entries.length === 0) return null;

  return (
    <details className={cn("group text-sm", className)}>
      <summary className={cn(summaryClass, "min-h-11")}>
        About these rows<span className="sr-only"> in {groupLabel}</span>
      </summary>
      <dl className="mt-2 mb-4 max-w-[60ch] space-y-5">
        {entries.map(({ education, row }) => (
          <div className="space-y-2" key={row.id}>
            <dt className="leading-5 font-medium text-foreground">
              {row.label}
            </dt>
            <dd className="space-y-2">
              {row.description ? (
                <p className="leading-5 text-foreground">{row.description}</p>
              ) : null}
              <p className="leading-5 text-text-secondary">
                {education.explanation}
              </p>
              <LabLinks education={education} />
            </dd>
          </div>
        ))}
      </dl>
      <p className="mb-3 max-w-[60ch] leading-5 text-muted">
        {BACKGROUND_NOTE}
      </p>
    </details>
  );
}
