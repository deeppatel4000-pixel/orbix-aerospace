import type { ReactNode } from "react";

/**
 * The results panel every calculator ends in (spec 14, Engineering Lab).
 *
 * Open results on the page ground (design v3, spec 6 and 11): no panel,
 * no fill, no outline. A 2px lab-color rule, 48px wide, sits above the
 * h3 title, then the figures follow as definition lists (`ReadoutGrid`),
 * the headline value set large, groups separated by space and at most a
 * hairline. See `.lab-result*` in `calculator-card.module.css`.
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
 * title, then a slot on the same row. The slot always holds the visible
 * words "Inputs changed" (sans 500, text-sm, nowrap, about 110px), hidden
 * with `visibility: hidden` and from assistive technology until the
 * figures are stale, so the slot is the same width either way and the
 * title wraps the same way before and after the first keystroke: nothing
 * below the head moves. A separate screen-reader-only `role="status"`
 * span carries the live message, naming the tool's own submit verb
 * (`staleAction`, "Calculate" unless given), so the figures region is not
 * re-announced when the line appears. When stale, the body also takes
 * `data-stale` and the figures turn muted.
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
    <section aria-labelledby={titleId} className="lab-result min-w-0" id={id}>
      <div
        className={
          "lab-result-title" + (stale === undefined ? "" : " lab-result-head")
        }
      >
        <h3
          className="text-lg leading-7 font-semibold text-foreground"
          id={titleId}
        >
          {title}
        </h3>
        {stale === undefined ? null : (
          <p className="lab-result-stale">
            <span
              aria-hidden="true"
              className="lab-result-stale__text"
              data-shown={stale ? "" : undefined}
            >
              Inputs changed
            </span>
            <span aria-live="polite" className="sr-only" role="status">
              {stale ? "Inputs changed. " + staleAction + " to update." : ""}
            </span>
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
