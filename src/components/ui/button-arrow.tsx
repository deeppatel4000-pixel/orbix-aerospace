import { createElement, Fragment, type ReactNode } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";

import type { ButtonVariant } from "@/components/ui/button-class";

/**
 * Direction of the button arrow (spec 9: 16px). `right` moves to another
 * page, `down` to a section on this page, and `external` leaves the site;
 * these trail the label. `back` returns to the page the reader came from
 * and leads the label.
 */
export type ButtonArrow = "back" | "down" | "external" | "right";

const icons = {
  back: ArrowLeft,
  down: ArrowDown,
  external: ArrowUpRight,
  right: ArrowRight,
} as const;

/** The decorative icon shared by `Button` and `ButtonLink`. */
export function ButtonArrowIcon({ direction }: { direction: ButtonArrow }) {
  const Icon = icons[direction];
  return (
    <Icon
      aria-hidden="true"
      className={`orbix-button__icon orbix-button__icon--${
        direction === "back" ? "lead" : "trail"
      }`}
      focusable="false"
      size={16}
      strokeWidth={1.5}
    />
  );
}

/**
 * Splits a text label at its first or last space, so one word can be kept on
 * the same line as the arrow. Handles a string, or an array (JSX text with
 * interpolations) whose first or last item is text. Returns null otherwise.
 */
function splitLabel(
  children: ReactNode,
  at: "first" | "last",
): [ReactNode, ReactNode] | null {
  if (Array.isArray(children) && children.length > 0) {
    const items = children as ReactNode[];
    const edge = at === "last" ? items[items.length - 1] : items[0];
    const split = splitLabel(edge, at);
    if (!split) return null;
    // Spread into a fragment so the rejoined items need no keys.
    return at === "last"
      ? [
          createElement(Fragment, null, ...items.slice(0, -1), split[0]),
          split[1],
        ]
      : [split[0], createElement(Fragment, null, split[1], ...items.slice(1))];
  }
  if (typeof children !== "string" && typeof children !== "number") {
    return null;
  }
  const text = String(children);
  const index =
    at === "last" ? text.trimEnd().lastIndexOf(" ") : text.indexOf(" ");
  if (index === -1) return at === "last" ? ["", text] : [text, ""];
  return at === "last"
    ? [text.slice(0, index + 1), text.slice(index + 1)]
    : [text.slice(0, index), text.slice(index)];
}

/**
 * The label and arrow of a button, in order. Boxed variants keep the arrow
 * as a flex item beside the label. Text variants (`tertiary`, `link`) set
 * the arrow inline inside one label span, joined to the nearest word by a
 * no-wrap span, so a label that wraps keeps its arrow beside the text
 * instead of at the far edge of the row.
 */
export function buttonContent(
  children: ReactNode,
  arrow: ButtonArrow | undefined,
  variant: ButtonVariant,
): ReactNode {
  if (!arrow) return children;

  const icon = <ButtonArrowIcon direction={arrow} />;
  const leading = arrow === "back";

  if (variant !== "tertiary" && variant !== "link") {
    return leading ? (
      <>
        {icon}
        {children}
      </>
    ) : (
      <>
        {children}
        {icon}
      </>
    );
  }

  const split = splitLabel(children, leading ? "first" : "last");

  if (leading) {
    return (
      <span className="orbix-button__label">
        <span className="orbix-button__nowrap">
          {icon}
          {split ? split[0] : null}
        </span>
        {split ? split[1] : children}
      </span>
    );
  }

  return (
    <span className="orbix-button__label">
      {split ? split[0] : children}
      <span className="orbix-button__nowrap">
        {split ? split[1] : "⁠"}
        {icon}
      </span>
    </span>
  );
}
