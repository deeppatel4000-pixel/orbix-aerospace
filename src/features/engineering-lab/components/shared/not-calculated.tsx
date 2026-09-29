import type { ReactNode } from "react";

/**
 * The empty value of a calculator result (spec 13.4). Never a dash, and
 * never a box inside the result panel: one muted line, "Not calculated.",
 * optionally followed by one sentence saying what to enter. When the
 * current inputs are invalid it reads "Not calculated. Check the inputs
 * above."
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
    <p className="orbix-not-calculated leading-6">
      <span className="font-medium text-text-secondary">
        {invalid
          ? "Not calculated. Check the inputs above."
          : "Not calculated."}
      </span>
      {children ? <> {children}</> : null}
    </p>
  );
}
