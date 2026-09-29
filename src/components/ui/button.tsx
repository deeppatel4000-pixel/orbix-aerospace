import type { ComponentPropsWithoutRef } from "react";

import { buttonContent, type ButtonArrow } from "@/components/ui/button-arrow";
import {
  buttonClass,
  type ButtonSize,
  type ButtonVariant,
} from "@/components/ui/button-class";

export type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  /**
   * Adds a 16px arrow (spec 8): `right` (another page), `down` (a section
   * on this page) or `external` (leaves the site) after the label, or
   * `back` (return to the previous page) before it. Decorative;
   * hidden from assistive technology, so the text must carry the meaning.
   */
  arrow?: ButtonArrow;
  /** `default` (44px) or `lg` (48px). */
  size?: ButtonSize;
  /** `primary` (default), `secondary`, `tertiary`, `ghost` or `link`. */
  variant?: ButtonVariant;
};

/**
 * The `<button>` primitive (spec 8), for actions on this page. Use
 * `ButtonLink` for navigation. Button text is a verb phrase naming the
 * outcome ("Calculate delta-v"), never "Go" or "Submit" on its own.
 * Defaults to `type="button"` so it never submits a form by accident.
 */
export function Button({
  arrow,
  children,
  className,
  size,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonClass({ className, size, variant })}
      type={type}
      {...props}
    >
      {buttonContent(children, arrow, variant)}
    </button>
  );
}
