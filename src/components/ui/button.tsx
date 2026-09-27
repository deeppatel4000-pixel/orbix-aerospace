import type { ComponentPropsWithoutRef } from "react";

import {
  buttonClass,
  type ButtonSize,
  type ButtonVariant,
} from "@/components/ui/button-class";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  size?: ButtonSize;
  variant?: ButtonVariant;
};

/**
 * The `<button>` primitive (spec 8). Button text is a verb phrase naming the
 * outcome ("Calculate delta-v"), never "Go" or "Submit" on its own.
 * Defaults to `type="button"` so it never submits a form by accident.
 */
export function Button({
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
    />
  );
}
