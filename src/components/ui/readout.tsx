import {
  Children,
  cloneElement,
  Fragment,
  isValidElement,
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
} from "react";

import { cn } from "@/lib/cn";

/**
 * A decimal point or thousands separator between two digits. Only these
 * are touched, so prose punctuation ("U.S.", "a, b") is left alone.
 */
const FIGURE_SEPARATOR = /(?<=\d)([.,])(?=\d)/;

/**
 * B612 Mono draws `.` and `,` at the far left of their 0.65em cell, so
 * "3.25" reads as "3. 25" and "50,000" as "50, 000". This wraps each
 * separator between digits in `.orbix-num-sep`, which nudges the mark to
 * the centre of its cell. The text content (copy, search, screen readers)
 * is unchanged.
 *
 * Strings and numbers are formatted. Arrays, fragments and plain HTML
 * elements (`<sub>`, `<sup>`, `<span>`) are walked, so a figure inside a
 * JSX equation is formatted too. Components are left alone: they own their
 * own markup and may format it themselves.
 */
export function formatFigure(value: ReactNode): ReactNode {
  if (Array.isArray(value)) {
    return Children.map(value as ReactNode[], (child) => formatFigure(child));
  }

  if (isValidElement(value)) {
    if (value.type !== Fragment && typeof value.type !== "string") {
      return value;
    }
    const element = value as ReactElement<{ children?: ReactNode }>;
    const { children } = element.props;
    if (children === undefined || children === null) return value;
    return cloneElement(element, undefined, formatFigure(children));
  }

  if (typeof value !== "string" && typeof value !== "number") return value;

  const parts = String(value).split(FIGURE_SEPARATOR);
  if (parts.length === 1) return value;

  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <span className="orbix-num-sep" key={index}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}

/** A `.` or `:` between two word characters, or a `/` path separator. */
const CODE_MARK = /((?<=\w)[.:](?=\w)|\/)/;

/**
 * Code text set in the data face: commands, file paths and URLs such as
 * `npm run check:design` or `github.com/owner/repo`. B612 Mono draws `.`
 * and `:` at the left of their cell, so "check:design" reads as
 * "check: design". Each `.` or `:` between word characters is wrapped in
 * `.orbix-num-sep` (the same centring `formatFigure` uses), and a `<wbr>`
 * follows each `/` so a long path breaks at a folder, never mid-word. Pass
 * `{ breakAfterSlash: false }` for a command argument that must stay on one
 * line (a `<wbr>` breaks even inside `white-space: nowrap`). The text
 * content (copy, search, screen readers) is unchanged.
 */
export function formatCode(
  text: string,
  { breakAfterSlash = true }: { breakAfterSlash?: boolean } = {},
): ReactNode {
  const parts = text.split(CODE_MARK);
  if (parts.length === 1) return text;

  return parts.map((part, index) => {
    if (index % 2 === 0) return part;
    if (part === "/") {
      if (!breakAfterSlash) return part;
      return (
        <Fragment key={index}>
          /<wbr />
        </Fragment>
      );
    }
    return (
      <span className="orbix-num-sep" key={index}>
        {part}
      </span>
    );
  });
}

export type ReadoutProps = ComponentPropsWithoutRef<"span"> & {
  /** A formatted figure, for example `"Mach 3.2"` or `"50,000"`. */
  children: ReactNode;
};

/**
 * Inline B612 Mono figure with tabular numerals and centred separators.
 * Use it wherever a number is set in the data face outside `SpecPanel`,
 * `RecordRow` and `DataTable` numeric columns (which already format).
 */
export function Readout({ children, className, ...props }: ReadoutProps) {
  return (
    <span className={cn("orbix-readout-inline", className)} {...props}>
      {formatFigure(children)}
    </span>
  );
}

/**
 * Whether a key-figure value is a figure (set in B612 Mono) or a name or
 * word (set in Plex Sans, spec 5: mono only for figures, units and
 * equations). A number, or a string that starts with a digit, a sign or
 * "Mach", is a figure: "2,193", "~3,500", "Mach 3.3", "-56". "F-22 Raptor",
 * "Saturn V" and "Retired" are text. JSX values are treated as figures;
 * pass `kind` on the item to decide explicitly.
 */
export function isFigureValue(value: ReactNode): boolean {
  if (typeof value === "number") return true;
  if (typeof value !== "string") return value !== null && value !== undefined;
  return /^\s*(?:[~≈<>≤≥±+\-−$]\s*)?(?:Mach\s+)?\d/i.test(value);
}
