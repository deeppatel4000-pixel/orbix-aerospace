import {
  Children,
  cloneElement,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

/**
 * A type designation with a hard hyphen: "F-22", "F-22A", "J-2", "RS-25",
 * "SR-71", "F119-PW-100": a capital, then hyphen-joined parts, with a digit
 * somewhere in it. Browsers break a line after any hyphen, which sets "F-"
 * at the end of one line and "22" on the next.
 */
const DESIGNATION =
  /(\b(?=[A-Z][\w-]*\d)[A-Z][A-Za-z0-9]*(?:-[A-Za-z0-9]+)+\b)/;

/**
 * Keeps each hyphenated designation in running text on one line by
 * wrapping it in a `white-space: nowrap` span. The text itself is not
 * changed (no non-breaking hyphen), so copy, search and screen readers see
 * the same "F-22".
 *
 * Strings are formatted; arrays, fragments and plain HTML elements are
 * walked. Components are left alone.
 */
export function keepDesignations(value: ReactNode): ReactNode {
  if (Array.isArray(value)) {
    return Children.map(value as ReactNode[], (child) =>
      keepDesignations(child),
    );
  }

  if (isValidElement(value)) {
    if (value.type !== Fragment && typeof value.type !== "string") {
      return value;
    }
    const element = value as ReactElement<{ children?: ReactNode }>;
    const { children } = element.props;
    if (children === undefined || children === null) return value;
    return cloneElement(element, undefined, keepDesignations(children));
  }

  if (typeof value !== "string") return value;

  const parts = value.split(DESIGNATION);
  if (parts.length === 1) return value;

  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <span className="whitespace-nowrap" key={index}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}
