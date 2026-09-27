import type { ComponentProps } from "react";
import Link from "next/link";

import {
  buttonClass,
  type ButtonSize,
  type ButtonVariant,
} from "@/components/ui/button-class";

type ButtonLinkProps = ComponentProps<typeof Link> & {
  size?: ButtonSize;
  variant?: ButtonVariant;
};

/** A `<Link>` styled as a button (spec 8). */
export function ButtonLink({
  className,
  size,
  variant = "primary",
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonClass({ className, size, variant })} {...props} />
  );
}
