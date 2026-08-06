import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

type TechnicalLabelProps = ComponentPropsWithoutRef<"span">;

export function TechnicalLabel({ className, ...props }: TechnicalLabelProps) {
  return <span className={cn("orbix-technical-label", className)} {...props} />;
}
