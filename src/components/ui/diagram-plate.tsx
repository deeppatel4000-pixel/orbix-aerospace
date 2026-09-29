import type { ComponentPropsWithoutRef } from "react";

import { RegistrationMarks } from "@/components/ui/registration-marks";
import { cn } from "@/lib/cn";

/**
 * A technical drawing plate for diagrams on editorial pages (spec 6 and 9):
 * the drawing sits on the surface colour inside a hairline frame with an
 * 8px radius, and the shared registration marks sit just outside its
 * corners like crop marks. Renders a `<figure>`; pass the caption as a
 * child `<figcaption>` and name the figure with `aria-labelledby`.
 */
export function DiagramPlate({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<"figure">) {
  return (
    <figure
      className={cn(
        "relative m-0 rounded-lg border border-border-subtle bg-surface p-5 sm:p-8",
        className,
      )}
      {...props}
    >
      <RegistrationMarks inset="-7px" />
      {children}
    </figure>
  );
}
