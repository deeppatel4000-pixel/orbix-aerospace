import type { ComponentProps } from "react";
import Link from "next/link";

import { cn } from "@/lib/cn";

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary" | "tertiary";
};

export function ButtonLink({
  className,
  variant = "primary",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn("orbix-button", `orbix-button--${variant}`, className)}
      {...props}
    />
  );
}
