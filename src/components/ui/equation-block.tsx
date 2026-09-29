import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { formatFigure } from "@/components/ui/readout";
import { cn } from "@/lib/cn";

/** One entry of the variables legend. */
export interface EquationVariable {
  /** The symbol as written in the equation, for example "Isp". */
  readonly symbol: ReactNode;
  /** What it stands for, in words. */
  readonly meaning: ReactNode;
  /** SI unit, for example "m/s". Omit for dimensionless quantities. */
  readonly unit?: string;
}

export type EquationBlockProps = Omit<
  ComponentPropsWithoutRef<"figure">,
  "children"
> & {
  /** The equation as text, set large in B612 Mono. */
  equation: ReactNode;
  /** Name of the relation, for example "Tsiolkovsky rocket equation". */
  label?: string;
  /**
   * How a screen reader should say the equation, when the written form
   * relies on symbols it would mispronounce, for example
   * "delta v equals I s p times g zero times the natural log of m zero over m f".
   */
  spokenAs?: string;
  variables?: readonly EquationVariable[];
};

/**
 * Equation block for the Engineering Lab and Learn (spec 8): the equation
 * set large in B612 Mono on a raised panel with a thin accent top rule, and
 * the variables as a definition list below it. Decimal points and thousands
 * separators in the equation, symbols and units go through `formatFigure`,
 * including those inside `<sub>`/`<sup>` in a JSX equation.
 */
export function EquationBlock({
  className,
  equation,
  label,
  spokenAs,
  variables,
  ...props
}: EquationBlockProps) {
  return (
    <figure className={cn("orbix-equation", className)} {...props}>
      {label ? (
        <figcaption className="orbix-equation__label">{label}</figcaption>
      ) : null}
      <p className="orbix-equation__expr">
        {spokenAs ? (
          <>
            <span aria-hidden="true">{formatFigure(equation)}</span>
            <span className="sr-only">{spokenAs}</span>
          </>
        ) : (
          formatFigure(equation)
        )}
      </p>
      {variables && variables.length > 0 ? (
        <dl className="orbix-equation__vars">
          {variables.map((variable, index) => (
            <div className="contents" key={index}>
              <dt>{formatFigure(variable.symbol)}</dt>
              <dd>
                {variable.meaning}
                {variable.unit ? (
                  <span className="orbix-equation__unit">
                    {formatFigure(variable.unit)}
                  </span>
                ) : null}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </figure>
  );
}
