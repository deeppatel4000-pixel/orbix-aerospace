import { cn } from "@/lib/cn";

/**
 * The rules the spec sheet follows. Each is true of the rendering code: no
 * score is computed, `MISSING_VALUE_TEXT` replaces absent values, and
 * `normalizeRowMagnitudes` only draws scale lines for same-unit rows,
 * scaled to the largest figure in the row.
 */
const comparisonRules = [
  {
    term: "Published units",
    detail: "As the sources give them, never converted.",
  },
  {
    term: "No scoring",
    detail: "No ranking and no winner.",
  },
  {
    term: "Gaps stay visible",
    detail: "A missing value reads “Not published”, never zero.",
  },
  {
    term: "Scale lines need one unit",
    detail: "Drawn only when every figure in the row shares a unit.",
  },
] as const;

interface ComparisonRulesProps {
  className?: string;
}

/**
 * Compact legend for the spec sheet: a plain definition list, sans terms,
 * muted details, groups separated by space. The rules are not a sequence,
 * so they carry no numbers. Sits in the empty top-left cell of the identity
 * strip from 64rem and after the sheet below that.
 */
export function ComparisonRules({ className }: ComparisonRulesProps) {
  return (
    <dl
      aria-label="How the spec sheet reads"
      className={cn("flex flex-col gap-4", className)}
    >
      {comparisonRules.map((rule) => (
        <div key={rule.term}>
          <dt className="text-sm leading-5 font-medium text-foreground">
            {rule.term}
          </dt>
          <dd className="mt-0.5 text-[0.8125rem] leading-5 text-muted">
            {rule.detail}
          </dd>
        </div>
      ))}
    </dl>
  );
}
