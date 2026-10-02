import { useId, type ComponentPropsWithoutRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";

export type ReadoutGridProps = ComponentPropsWithoutRef<"dl"> & {
  /**
   * Most entries per row: one below a 20rem container, two from
   * 20rem, three (when asked for) from 46rem. `1` keeps a single column,
   * for compound values. Default 2.
   */
  columns?: 1 | 2 | 3;
  /**
   * Names a group of figures inside a larger result. Rendered as a plain
   * sentence-case sans head above the list (under a 1px rule, no fill),
   * and the group becomes a `<section>` labeled by it.
   */
  title?: ReactNode;
};

/**
 * Calculated figures as an open definition list (design v3, spec 6 and
 * 11), for results inside `CalculatorResultSection`. Each child is a
 * `<div>` holding one `<dt>` label and its `<dd>` value: the label above
 * in sentence-case sans, the value below in B612 Mono. Values use
 * `LabFigure`, so a number never breaks and only its unit may wrap. Put a
 * symbol inside a label in `LabSymbol`.
 *
 * Importance is explicit: a value set in `orbix-readout-lg` is the
 * headline figure, set large on a row of its own; `orbix-data` values are
 * secondary and share rows. Put primary entries first. Words rather than
 * numbers (a flow regime, a material name) go in `LabValueText`.
 *
 * No compartments, fills or outlines: entries are separated by space, and
 * a titled group opens under one hairline. The wrapper is an inline-size
 * container, so the column count and the two fixed figure sizes follow its
 * width, not the viewport. All rules live in `calculator-card.module.css`
 * (`.lab-readout-grid`), because Vitest cannot load a CSS module from this
 * shared barrel.
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
 * column scrolls, on a viewport at least 56rem (896px) tall. Only for tools whose
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
