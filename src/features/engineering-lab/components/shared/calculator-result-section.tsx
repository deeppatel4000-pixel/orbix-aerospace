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
 * on the first keystroke. Only such a tool passes `stale` (true or false);
 * a tool that recalculates as its inputs change never does, and its head
 * is the title alone. When passed, the head is a two-column grid: the
 * title, then a small `role="status"` slot on the same row. When stale,
 * the body takes `data-stale` and the figures turn muted, and the slot
 * shows "Inputs changed" (sans 500, text-sm, nowrap, about 110px), with
 * the rest of the instruction naming the tool's own submit verb
 * (`staleAction`, "Calculate" unless given) in screen-reader text. The
 * slot is always rendered for these tools and never wraps, so the head is
 * one row whether it is empty or filled (a long title wraps instead):
 * nothing below it moves on the first keystroke or on submit, and the
 * figures region is not re-announced when the line appears.
 */

interface CalculatorResultSectionProps {
  children: ReactNode;
  id: string;
  /**
   * The figures shown were calculated from inputs that have since changed.
   * Pass it (true or false) only from a tool that calculates on submit;
   * leave it out on a tool that recalculates as you type.
   */
  stale?: boolean;
  /** The verb on the tool's submit button, named in the stale line. */
  staleAction?: string;
  title: string;
}

export function CalculatorResultSection({
  children,
  id,
  stale,
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
      <div
        className={
          "border-b border-border px-4 py-3 sm:px-5" +
          (stale === undefined ? "" : " lab-result-head")
        }
      >
        <h3
          className="text-base leading-6 font-semibold text-foreground"
          id={titleId}
        >
          {title}
        </h3>
        {stale === undefined ? null : (
          <p aria-live="polite" className="lab-result-stale" role="status">
            {stale ? (
              <>
                Inputs changed
                <span className="sr-only">
                  {". " + staleAction + " to update."}
                </span>
              </>
            ) : null}
          </p>
        )}
      </div>

      <div
        aria-live="polite"
        className="lab-result-body"
        data-stale={stale ? "" : undefined}
        role="status"
      >
        {children}
      </div>
    </section>
  );
}
