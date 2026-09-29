import type { ReactNode } from "react";

import { formatFigure } from "@/components/ui";

interface LabFigureProps {
  /** The formatted number, for example `"54,019.55"`. */
  children: ReactNode;
  /** SI unit shown after the number, for example `"Pa"`. */
  unit?: string;
}

/**
 * A calculated figure and its unit inside a `ReadoutGrid` value (spec 5
 * and 8). The figure and its unit sit in one `nowrap` span, so
 * "1,836,922.53 Pa" never splits; a note after the figure wraps under it.
 * The unit is a smaller muted span after a narrow real space. A degree
 * sign is the exception: it is part of the number, so it follows the
 * figure at full size with no space ("39.3139°"). The text content stays
 * "54,019.55 Pa" for copy, search and screen readers. Sizes are set in
 * `calculator-card.module.css`.
 */
export function LabFigure({ children, unit }: LabFigureProps) {
  if (unit === "°") {
    return (
      <span className="lab-figure whitespace-nowrap">
        <span className="lab-figure__value">{formatFigure(children)}°</span>
      </span>
    );
  }

  return (
    <span className="lab-figure whitespace-nowrap">
      <span className="lab-figure__value">{formatFigure(children)}</span>
      {unit ? (
        <>
          <span className="lab-figure__gap"> </span>
          <span className="lab-figure__unit">{formatFigure(unit)}</span>
        </>
      ) : null}
    </span>
  );
}

/**
 * A mathematical symbol inside an uppercase readout label, such as the
 * "ρ₂/ρ₁" in "Density ratio (ρ₂/ρ₁)". Readout labels are uppercased by
 * CSS, which would turn ρ into Ρ (read as a Latin P), β into Β and p into
 * P; this span keeps the symbol's case, spacing and a legible size.
 */
export function LabSymbol({ children }: { children: ReactNode }) {
  return <span className="lab-symbol">{children}</span>;
}

/**
 * A result that is words, not a number (a flow regime, "Not specified", a
 * material name). Set in sans 500 at 1.125rem, so it never passes for an
 * instrument readout.
 */
export function LabValueText({ children }: { children: ReactNode }) {
  return <span className="lab-value-text">{children}</span>;
}

/**
 * Class names for equations written as JSX inside `EquationBlock`
 * (spec 8). Each relation is one `EQ_LINE` block made of `EQ_TERM` spans
 * that never break. Terms are short (at most about 12 characters, so each
 * fits the 231px line of a 320px screen at the block's 1.5rem minimum),
 * and each starts with the operator that joins it to the previous term, so
 * a relation that does not fit wraps before an operator and indents its
 * continuation.
 *
 * Operators are set tight: no space around `·`, `/` or inside brackets,
 * because every B612 Mono glyph already takes a full cell. A plain space
 * goes only around a top-level `=`, `+` or `−`, and is also the break
 * opportunity there; between two tight terms put a `<wbr />`. These are
 * plain elements, not components, so `formatFigure` still formats the
 * figures inside them.
 */
export const EQ_LINE = "lab-eq-line";
export const EQ_TERM = "whitespace-nowrap";
/**
 * A continuation line of a long relation (for example each bracket of the
 * total-pressure ratio), indented under the line with the "=".
 */
export const EQ_CONT = "lab-eq-line lab-eq-line--cont";
/**
 * A superscript exponent: smaller and clearly raised. Use it for every
 * power in an equation, never a Unicode superscript (², ³): in a mono face
 * those take a whole cell and leave a false space after them.
 */
export const EQ_SUP = "lab-eq-sup";

/**
 * A multiplication dot. B612 Mono draws "·" at the left of its cell, so a
 * bare dot reads as a full stop after the previous symbol; this span
 * shifts the ink to the middle of the cell without changing its advance.
 */
const EQ_DOT = "lab-eq-dot";

/** The multiplication dot as an element, for use inside equation terms. */
export function EqDot() {
  return <span className={EQ_DOT}>·</span>;
}

/**
 * A symbol with both a subscript and an exponent, such as M₁ squared: the
 * exponent is stacked over the subscript in one column.
 */
export function EqSubSup({ sub, sup }: { sub: ReactNode; sup: ReactNode }) {
  return (
    <span className="lab-eq-subsup">
      <span>{sup}</span>
      <span>{sub}</span>
    </span>
  );
}
