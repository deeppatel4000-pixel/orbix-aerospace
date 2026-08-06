import Image from "next/image";

import { cn } from "@/lib/cn";

export type OrbixEnvironmentTheme =
  "laboratory" | "launch" | "orbital" | "tactical";

interface OrbixEnvironmentDefinition {
  readonly image: string;
  readonly label: string;
  readonly imageClassName: string;
  readonly overlayClassName: string;
}

const environments: Readonly<
  Record<OrbixEnvironmentTheme, OrbixEnvironmentDefinition>
> = {
  laboratory: {
    image: "/images/environments/engineering-lab.webp",
    imageClassName: "object-center",
    label: "Aerospace research laboratory",
    overlayClassName:
      "bg-[linear-gradient(90deg,rgb(3_7_17/0.98)_0%,rgb(7_14_24/0.92)_38%,rgb(9_18_30/0.56)_68%,rgb(3_7_17/0.72)_100%)]",
  },
  launch: {
    image: "/images/environments/launch-complex.webp",
    imageClassName: "object-center",
    label: "Orbital launch operations",
    overlayClassName:
      "bg-[linear-gradient(90deg,rgb(3_7_17/0.98)_0%,rgb(4_10_22/0.91)_42%,rgb(3_7_17/0.42)_72%,rgb(3_7_17/0.7)_100%)]",
  },
  orbital: {
    image: "/images/environments/orbital-command.webp",
    imageClassName: "object-center",
    label: "Orbital mission environment",
    overlayClassName:
      "bg-[linear-gradient(90deg,rgb(3_7_17/0.98)_0%,rgb(3_7_17/0.9)_44%,rgb(3_7_17/0.35)_76%,rgb(3_7_17/0.55)_100%)]",
  },
  tactical: {
    image: "/images/environments/tactical-aircraft.webp",
    imageClassName: "object-center",
    label: "Aerospace flight-test environment",
    overlayClassName:
      "bg-[linear-gradient(90deg,rgb(3_8_7/0.98)_0%,rgb(7_13_11/0.92)_42%,rgb(8_12_10/0.36)_74%,rgb(3_7_7/0.68)_100%)]",
  },
};

interface OrbixEnvironmentBackdropProps {
  className?: string;
  priority?: boolean;
  sizes?: string;
  theme: OrbixEnvironmentTheme;
}

export function OrbixEnvironmentBackdrop({
  className,
  priority = false,
  sizes = "100vw",
  theme,
}: OrbixEnvironmentBackdropProps) {
  const environment = environments[theme];

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 -z-20 overflow-hidden",
        className,
      )}
      data-orbix-environment={theme}
      title={environment.label}
    >
      <Image
        alt=""
        className={cn(
          "object-cover opacity-78 saturate-[0.82]",
          environment.imageClassName,
        )}
        fill
        priority={priority}
        sizes={sizes}
        src={environment.image}
      />
      <div className={cn("absolute inset-0", environment.overlayClassName)} />
      <div className="orbix-grid absolute inset-0 opacity-55" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}

export function getOrbixEnvironmentLabel(theme: OrbixEnvironmentTheme) {
  return environments[theme].label;
}
