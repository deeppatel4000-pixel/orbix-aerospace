import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

type ContainerProps = ComponentPropsWithoutRef<"div"> & {
  /**
   * 84rem instead of 72rem. Only for Compare and the Engineering Lab
   * workspace.
   */
  wide?: boolean;
};

export function Container({
  className,
  wide = false,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        wide ? "max-w-[84rem]" : "max-w-[72rem]",
        className,
      )}
      {...props}
    />
  );
}
