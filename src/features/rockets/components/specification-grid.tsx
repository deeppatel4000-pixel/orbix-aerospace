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
    <dl className="grid gap-px overflow-hidden border border-atmosphere/25 bg-atmosphere/20 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div
          className="relative bg-[#080d17] p-5 sm:min-h-44 sm:p-6"
          key={item.label}
        >
          <dt className="flex items-center justify-between gap-4 font-mono text-[0.65rem] tracking-[0.14em] text-muted uppercase">
            {item.label}
            <item.icon
              aria-hidden="true"
              className="text-accent"
              size={18}
              strokeWidth={1.7}
            />
          </dt>
          <dd className="mt-8">
            <span className="orbix-telemetry-value block text-2xl text-signal sm:text-3xl">
              {item.value}
            </span>
            <span className="mt-2 block max-w-xs text-xs leading-5 text-muted">
              {item.note}
            </span>
            <span
              aria-hidden="true"
              className="absolute right-0 bottom-0 h-5 w-5 border-r border-b border-signal/35"
            />
          </dd>
        </div>
      ))}
    </dl>
  );
}
