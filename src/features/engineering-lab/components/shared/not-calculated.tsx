import type { ReactNode } from "react";

/**
 * The empty value of a calculator result (spec 13.4). Never a dash: the text
 * "Not calculated" in muted body-small type, optionally followed by one
 * sentence saying what to enter. When the current inputs are invalid the
 * status line becomes "Not calculated. Check the inputs above."
 */

interface NotCalculatedProps {
  children?: ReactNode;
  invalid?: boolean;
}

export function NotCalculated({
  children,
  invalid = false,
}: NotCalculatedProps) {
  return (
    <div className="rounded border border-dashed border-border-strong px-4 py-4">
      <p className="orbix-not-calculated font-medium">
        {invalid ? "Not calculated. Check the inputs above." : "Not calculated"}
      </p>
      {children ? (
        <p className="mt-2 text-sm leading-6 text-muted">{children}</p>
      ) : null}
    </div>
  );
}
