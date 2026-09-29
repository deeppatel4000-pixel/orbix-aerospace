import { useId, type ComponentPropsWithoutRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";

export type ReadoutGridProps = ComponentPropsWithoutRef<"dl"> & {
  /**
   * Most compartments per row: one below a 19rem container, two from
   * 19rem, three (when asked for) from 40rem. `1` keeps a single column,
   * for compound values. Default 2.
   */
  columns?: 1 | 2 | 3;
  /**
   * Names a group of figures inside a larger result. Rendered as a plain
   * head row above the compartments (sans 500, 0.8125rem, sentence case,
   * over a 1px rule, no fill), and the group becomes a `<section>`
   * labelled by it.
   */
  title?: ReactNode;
};

/**
 * Calculated figures as a hairline compartment grid (spec 6 and 8), for
 * results inside `CalculatorResultSection`. Each child is a `<div>` holding
 * one `<dt>` label and its `<dd>` value; values use `LabFigure`, so a
 * number never breaks and only its unit may wrap. Put a symbol inside a
 * label in `LabSymbol`: labels are uppercase and would otherwise turn ρ
 * into Ρ.
 *
 * Importance is explicit: a value set in `orbix-readout-lg` is a primary
 * figure and its compartment takes a whole row; `orbix-data` values are
 * secondary and share rows. Put primary compartments first. Words rather
 * than numbers (a flow regime, a material name) go in `LabValueText`.
 *
 * The wrapper is an inline-size container, and the column count and the
 * two fixed figure sizes follow its width, not the viewport or the
 * compartment, so every figure of one kind is the same size across a
 * tool. When the last row of secondary figures is short, its last
 * compartment spans the rest of the row, so no empty cell is left. Grids
 * sit directly in the result panel body, edge to edge, separated by 1px
 * rules; none draws an outline of its own. All rules live in
 * `calculator-card.module.css` (`.lab-readout-grid`), because Vitest
 * cannot load a CSS module from this shared barrel.
 *
 * This is the results counterpart of `SpecPanel`'s grid: `SpecPanel` wraps
 * its grid in a bordered `<section>` with a head, which would put a panel
 * inside the result panel, and it takes plain values rather than the
 * `<output>` elements the calculators announce.
 */
export function ReadoutGrid({
  className,
  columns = 2,
  title,
  ...props
}: ReadoutGridProps) {
  const titleId = useId();

  if (title) {
    return (
      <section
        aria-labelledby={titleId}
        className={cn("lab-readout-grid min-w-0", className)}
        data-columns={columns}
      >
        <h4 className="lab-readout-grid__head" id={titleId}>
          {title}
        </h4>
        <dl {...props} />
      </section>
    );
  }

  return (
    <div
      className={cn("lab-readout-grid min-w-0", className)}
      data-columns={columns}
    >
      <dl {...props} />
    </div>
  );
}

interface LabToolLayoutProps {
  children: ReactNode;
  /** The tool's `EquationBlock`, shown above the form. */
  equation: ReactNode;
}

/**
 * The frame inside every calculator and analyzer (spec 9, Engineering Lab):
 * the equation block first and prominent, then the form and results.
 *
 * The root is the `tool` inline-size container. A tool's form and results
 * sit in a `LAB_TOOL_SPLIT` grid: side by side from a 44rem tool, form
 * 5 parts to results 6 (`LAB_TOOL_SPLIT_STICKY` also holds a short
 * results column in view while the form scrolls). Each column is a `col` container for its own field grids
 * (two-up from 36rem), because the tool's width depends on the lab shell,
 * not on the viewport.
 */
export function LabToolLayout({ children, equation }: LabToolLayoutProps) {
  return (
    <div className="lab-tool @container/tool grid min-w-0 gap-8">
      {equation}
      {children}
    </div>
  );
}

/**
 * Form and results side by side from a 44rem tool (see `LabToolLayout`).
 * Give it three children in reading order: the form column, the results
 * column, and the notes column (assumptions, explainers). Side by side,
 * the notes sit under the form in the left column and the results span
 * both rows on the right; see `.lab-tool-split` in
 * `calculator-card.module.css`. The results column scrolls with the page.
 */
export const LAB_TOOL_SPLIT =
  "lab-tool-split grid gap-8 @min-[44rem]/tool:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]";

/**
 * `LAB_TOOL_SPLIT` whose results column also stays in view while the left
 * column scrolls, on a viewport at least 50rem tall. Only for tools whose
 * whole result panel is short enough to fit that viewport: a taller sticky
 * column would keep its lower part below the fold until the left column
 * ended.
 */
export const LAB_TOOL_SPLIT_STICKY = LAB_TOOL_SPLIT + " lab-tool-split--sticky";

/**
 * Form and results stacked at every width, for tools whose results are a
 * wide comparison table that needs the whole tool width.
 */
export const LAB_TOOL_STACK = "grid gap-8";
