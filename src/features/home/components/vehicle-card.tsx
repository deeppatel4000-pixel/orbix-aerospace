import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";

interface VehicleCardProps {
  code: string;
  href: string;
  icon: LucideIcon;
  name: string;
  type: string;
}

export function VehicleCard({
  code,
  href,
  icon: Icon,
  name,
  type,
}: VehicleCardProps) {
  return (
    <article className="orbix-premium-card orbix-premium-card--interactive group relative">
      <Link
        aria-label={"Open the " + name + " profile"}
        className="block"
        href={href}
      >
        <div className="flex items-center justify-between border-b border-border/80 px-4 py-3">
          <span className="font-mono text-[0.62rem] tracking-[0.16em] text-muted uppercase">
            {code}
            {" // Engineering record"}
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-signal shadow-[0_0_9px_rgb(255_184_77/0.55)]" />
        </div>

        <div className="technical-grid relative flex aspect-[16/10] items-center justify-center overflow-hidden border-b border-border/80 bg-background/55">
          <div
            aria-hidden="true"
            className="absolute h-40 w-40 rounded-full border border-accent/10 transition-transform duration-500 motion-safe:group-hover:scale-110"
          />
          <div
            aria-hidden="true"
            className="absolute h-24 w-24 rotate-45 border border-accent/10"
          />
          <Icon
            aria-hidden="true"
            className="relative text-accent/80 drop-shadow-[0_0_22px_rgb(87_215_255/0.2)] transition-transform duration-300 motion-safe:group-hover:-translate-y-1"
            size={64}
            strokeWidth={1.1}
          />
          <span className="absolute right-3 bottom-3 font-mono text-[0.58rem] tracking-[0.12em] text-muted uppercase">
            Profile available
          </span>
        </div>

        <div className="p-5">
          <p className="font-mono text-[0.65rem] tracking-[0.16em] text-accent uppercase">
            {type}
          </p>
          <div className="mt-2 flex items-end justify-between gap-4">
            <h3 className="text-xl font-semibold tracking-tight">{name}</h3>
            <ArrowUpRight
              aria-hidden="true"
              className="shrink-0 text-muted transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
              size={18}
            />
          </div>
        </div>
      </Link>
    </article>
  );
}
