import type { ComponentProps } from "react";
import Link from "next/link";

import { cn } from "@/lib/cn";

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary";
};

export function ButtonLink({
  className,
  variant = "primary",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all",
        variant === "primary"
          ? "bg-accent text-background shadow-[0_12px_40px_rgb(87_215_255/0.18)] hover:bg-foreground"
          : "border border-border bg-surface/60 text-foreground hover:border-accent/60 hover:text-accent",
        className,
      )}
      {...props}
    />
  );
}
