import { cn } from "@/lib/cn";

interface LoadingIndicatorProps {
  className?: string;
  label?: string;
}

/**
 * The one permitted infinite animation (spec 7): a 16px ring beside visible
 * text, shown only while something is loading. It stops rotating under
 * reduced motion.
 */
export function LoadingIndicator({
  className,
  label = "Loading",
}: LoadingIndicatorProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-sm text-muted",
        className,
      )}
      role="status"
    >
      <span aria-hidden="true" className="orbix-spinner" />
      {label}
    </span>
  );
}
