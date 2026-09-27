import { cn } from "@/lib/cn";

export type OrbixEnvironmentTheme =
  "laboratory" | "launch" | "orbital" | "tactical";

const environmentLabels: Readonly<Record<OrbixEnvironmentTheme, string>> = {
  laboratory: "Aerospace research laboratory",
  launch: "Orbital launch operations",
  orbital: "Orbital mission environment",
  tactical: "Aerospace flight-test environment",
};

interface OrbixEnvironmentBackdropProps {
  className?: string;
  /** Deprecated and ignored. */
  priority?: boolean;
  /** Deprecated and ignored. */
  sizes?: string;
  theme: OrbixEnvironmentTheme;
}

/**
 * Deprecated. The environment photographs this displayed have no recorded
 * source and are treated as AI-generated (spec 12.4), so they are no longer
 * rendered, and neither are the gradient scrims and grid laid over them.
 * The component renders an empty decorative element so existing imports keep
 * compiling until page tasks remove them; phase C deletes it and the image
 * files.
 */
export function OrbixEnvironmentBackdrop({
  className,
  theme,
}: OrbixEnvironmentBackdropProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 -z-20 overflow-hidden",
        className,
      )}
      data-orbix-environment={theme}
    />
  );
}

export function getOrbixEnvironmentLabel(theme: OrbixEnvironmentTheme) {
  return environmentLabels[theme];
}
