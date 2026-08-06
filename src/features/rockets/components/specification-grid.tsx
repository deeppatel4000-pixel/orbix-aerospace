import type { LucideIcon } from "lucide-react";

interface SpecificationItem {
  icon: LucideIcon;
  label: string;
  note: string;
  value: string;
}

interface SpecificationGridProps {
  items: readonly SpecificationItem[];
}

export function SpecificationGrid({ items }: SpecificationGridProps) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div
          className="orbix-frame border-atmosphere/20 bg-surface/70 p-5 transition-colors hover:border-signal/35"
          key={item.label}
        >
          <div className="flex items-center justify-between gap-4">
            <dt className="font-mono text-[0.65rem] tracking-[0.14em] text-muted uppercase">
              {item.label}
            </dt>
            <item.icon
              aria-hidden="true"
              className="text-accent"
              size={18}
              strokeWidth={1.7}
            />
          </div>
          <dd className="orbix-telemetry-value mt-6 text-2xl text-signal">
            {item.value}
          </dd>
          <p className="mt-2 text-xs text-muted">{item.note}</p>
        </div>
      ))}
    </dl>
  );
}
