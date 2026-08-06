import Image from "next/image";

import { cn } from "@/lib/cn";

interface OrbixWordmarkProps {
  className?: string;
  priority?: boolean;
  sizes?: string;
  title?: string;
}

export function OrbixWordmark({
  className,
  priority = false,
  sizes = "160px",
  title,
}: OrbixWordmarkProps) {
  return (
    <span
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={cn(
        "orbix-official-wordmark relative block aspect-[2.64/1] shrink-0 overflow-hidden",
        className,
      )}
      role={title ? "img" : undefined}
    >
      <Image
        alt=""
        className="object-contain mix-blend-screen brightness-[1.08] contrast-[1.55]"
        fill
        priority={priority}
        quality={90}
        sizes={sizes}
        src="/brand/orbix-wordmark.png"
        style={{
          WebkitMaskImage:
            "radial-gradient(ellipse 106% 98% at center, black 68%, transparent 100%)",
          maskImage:
            "radial-gradient(ellipse 106% 98% at center, black 68%, transparent 100%)",
        }}
      />
    </span>
  );
}
