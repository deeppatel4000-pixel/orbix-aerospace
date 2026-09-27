import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

type TechnicalLabelProps = ComponentPropsWithoutRef<"span">;

/** Deprecated alias that renders the `.orbix-label` role (spec 5). */
export function TechnicalLabel({ className, ...props }: TechnicalLabelProps) {
  return <span className={cn("orbix-label", className)} {...props} />;
}
