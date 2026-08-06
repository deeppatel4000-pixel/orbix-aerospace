import Image from "next/image";

import { cn } from "@/lib/cn";

interface OrbixMarkProps {
  className?: string;
  priority?: boolean;
  title?: string;
}

export function OrbixMark({
  className,
  priority = false,
  title,
}: OrbixMarkProps) {
  return (
    <span
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={cn(
        "orbix-official-emblem relative block shrink-0 drop-shadow-[0_0_18px_var(--plasma-violet)]",
        className,
      )}
      role={title ? "img" : undefined}
    >
      <Image
        alt=""
        className="object-contain"
        fill
        priority={priority}
        sizes="96px"
        src="/brand/orbix-app-mark.png"
      />
    </span>
  );
}
