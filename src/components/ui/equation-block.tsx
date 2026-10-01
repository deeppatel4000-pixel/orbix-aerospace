import {
  Children,
  cloneElement,
  Fragment,
  isValidElement,
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
} from "react";

import { formatFigure } from "@/components/ui/readout";
import { cn } from "@/lib/cn";

const PAREN_SPLIT = /([()])/;

/**
 * An equation's text through `formatFigure`, with each parenthesis set in
 * `.orbix-equation__paren` (Plex Sans): B612 Mono draws ( and ) nearly
 * square, so "ln(m0/mf)" read as "ln[m0/mf]". Walks arrays, fragments and
 * plain HTML elements like `formatFigure`, so a Lab equation written in
 * JSX and a Learn equation built from a string set their parentheses the
 * same way. Components are left alone.
 */
function typesetEquation(value: ReactNode): ReactNode {
  if (Array.isArray(value)) {
    return Children.map(value as ReactNode[], (child) =>
      typesetEquation(child),
    );
  }
  if (isValidElement(value)) {
    if (value.type !== Fragment && typeof value.type !== "string") {
      return value;
    }
    const element = value as ReactElement<{
      children?: ReactNode;
      className?: string;
    }>;
    const { children, className } = element.props;
    if (children === undefined || children === null) return value;
    if (className?.includes("orbix-equation__paren")) return value;
    return cloneElement(element, undefined, typesetEquation(children));
  }
  if (typeof value !== "string") return formatFigure(value);
  const parts = value.split(PAREN_SPLIT);
  if (parts.length === 1) return formatFigure(value);
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <span className="orbix-equation__paren" key={index}>
        {part}
      </span>
    ) : (
      <Fragment key={index}>{formatFigure(part)}</Fragment>
    ),
  );
}

/** One entry of the variables list. */
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
  /** The equation as text, set in B612 Mono. */
  equation: ReactNode;
  /**
   * Name of the relation, for example "Tsiolkovsky rocket equation". It is
   * set under the equation as the lead-in to the variables ("Tsiolkovsky
   * rocket equation, where"), never above it as a label.
   */
  label?: string;
  /**
   * Equation number printed in parentheses at the right margin, for example
   * `"2.1"` renders "(2.1)", in IBM Plex Sans (spec 6) on every page: B612
   * Mono draws the parentheses almost square, so they read as brackets. A real reference number (spec 3.7). Spec 6
   * numbers every display equation, so pages should always pass one.
   */
  number?: string;
  /**
   * How a screen reader should say the equation, when the written form
   * relies on symbols it would mispronounce, for example
   * "delta v equals I s p times g zero times the natural log of m zero over m f".
   */
  spokenAs?: string;
  variables?: readonly EquationVariable[];
};

/**
 * Display equation (spec 6) for the Engineering Lab and Learn: the
 * expression set on the page ground, indented, with its number "(2.1)" at
 * the right margin, then the relation's name as a plain lead-in and the
 * variables as a "where" list. No panel, no accent rule. Decimal points
 * and thousands separators in the equation, symbols and units go through
 * `formatFigure`, including those inside `<sub>`/`<sup>` in a JSX
 * equation, and parentheses in the equation and symbols are set in Plex
 * Sans (`typesetEquation`). Scripts follow one size and offset rule
 * (`.orbix-equation sub, sup`).
 */
export function EquationBlock({
  className,
  equation,
  label,
  number,
  spokenAs,
  variables,
  ...props
}: EquationBlockProps) {
  const hasVariables = Boolean(variables && variables.length > 0);
  return (
    <figure className={cn("orbix-equation", className)} {...props}>
      <div className="orbix-equation__line">
        <p className="orbix-equation__expr">
          {spokenAs ? (
            <>
              <span aria-hidden="true">{typesetEquation(equation)}</span>
              <span className="sr-only">{spokenAs}</span>
            </>
          ) : (
            typesetEquation(equation)
          )}
        </p>
        {number ? (
          <span className="orbix-equation__number">({number})</span>
        ) : null}
      </div>
      {label && hasVariables && label === variables?.[0]?.meaning ? (
        // The label would only repeat the first variable's meaning, so the
        // figure keeps it as its accessible name and shows a plain "where".
        <figcaption className="orbix-equation__where">
          <span className="sr-only">{label}, </span>where
        </figcaption>
      ) : label ? (
        <figcaption className="orbix-equation__where">
          {label}
          {hasVariables ? ", where" : "."}
        </figcaption>
      ) : hasVariables ? (
        <p className="orbix-equation__where">where</p>
      ) : null}
      {hasVariables ? (
        <>
          <dl className="orbix-equation__vars">
            {variables?.map((variable, index) => (
              <div className="contents" key={index}>
                <dt>{typesetEquation(variable.symbol)}</dt>
                <dd>
                  {variable.meaning}
                  {variable.unit ? (
                    <>
                      {", "}
                      <span className="orbix-equation__unit">
                        {formatFigure(variable.unit)}
                      </span>
                    </>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
        </>
      ) : null}
    </figure>
  );
}
