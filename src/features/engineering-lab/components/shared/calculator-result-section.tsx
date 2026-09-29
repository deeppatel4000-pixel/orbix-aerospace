import type { ReactNode } from "react";

/**
 * The results panel every calculator ends in (spec 14, Engineering Lab).
 *
 * One flat 8px panel of hairline compartments (design v2, spec 6 and 8): a
 * flat head holding only the h3 title over a 1px rule (no raised fill, so
 * it matches the readout grid heads and does not read as a second panel
 * family beside the EquationBlock), then the figures, usually one or
 * more `ReadoutGrid`s. The body has no padding of its own: a `ReadoutGrid`
 * placed directly in it runs edge to edge and is separated from the next
 * one by a 1px rule, and every other direct child gets the panel inset
 * (`.lab-result-body` in `calculator-card.module.css`). Keep grids as
 * direct children, so the result reads as one compartment sheet rather
 * than panels inside a panel.
 *
 * The body keeps `role="status"` with `aria-live="polite"`: results appear
 * on submit (or as valid inputs change) without moving focus, so a screen
 * reader user would otherwise get no confirmation that anything was
 * calculated. Only one module is visible at a time, so at most one of these
 * is live.
 *
 * `stale`: a tool that calculates on submit keeps its last result on screen
 * while its inputs are edited, rather than collapsing the panel to one line
 * on the first keystroke. The body takes `data-stale`, the figures turn
 * muted, and a first compartment row says the inputs changed and names the
 * tool's own submit verb (`staleAction`, "Calculate" unless given), so the
 * instruction matches the button. The live region announces that row once,
 * when it appears.
 */

interface CalculatorResultSectionProps {
  children: ReactNode;
  id: string;
  /** The figures shown were calculated from inputs that have since changed. */
  stale?: boolean;
  /** The verb on the tool's submit button, named in the stale line. */
  staleAction?: string;
  title: string;
}

export function CalculatorResultSection({
  children,
  id,
  stale = false,
  staleAction = "Calculate",
  title,
}: CalculatorResultSectionProps) {
  const titleId = id + "-title";

  return (
    <section
      aria-labelledby={titleId}
      className="min-w-0 overflow-hidden rounded-lg border border-border bg-surface"
      id={id}
    >
      <div className="border-b border-border px-4 py-3 sm:px-5">
        <h3
          className="text-base leading-6 font-semibold text-foreground"
          id={titleId}
        >
          {title}
        </h3>
      </div>

      <div
        aria-live="polite"
        className="lab-result-body"
        data-stale={stale ? "" : undefined}
        role="status"
      >
        {stale ? (
          <p className="lab-result-stale">
            Inputs changed. {staleAction} to update.
          </p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
