import type { ComponentProps } from "react";
import Link from "next/link";

import { buttonContent, type ButtonArrow } from "@/components/ui/button-arrow";
import {
  buttonClass,
  type ButtonSize,
  type ButtonVariant,
} from "@/components/ui/button-class";

export type ButtonLinkProps = ComponentProps<typeof Link> & {
  /**
   * Adds a 16px arrow (spec 9): `right` (another page), `down` (a section
   * on this page) or `external` (leaves the site) after the label, or
   * `back` (return to the previous page) before it. Decorative;
   * hidden from assistive technology.
   */
  arrow?: ButtonArrow;
  /** `default` (44px) or `lg` (48px). */
  size?: ButtonSize;
  /** `primary` (default), `secondary`, `tertiary`, `ghost` or `link`. */
  variant?: ButtonVariant;
};

/**
 * A Next.js `<Link>` styled as a button (spec 9), for navigation. Takes
 * every `Link` prop plus `variant`, `size` and `arrow`; see `buttonClass`
 * for the variants. For an external URL pass `arrow="external"` and name
 * the destination in the text.
 */
export function ButtonLink({
  arrow,
  children,
  className,
  size,
  variant = "primary",
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonClass({ className, size, variant })} {...props}>
      {buttonContent(children, arrow, variant)}
    </Link>
  );
}
