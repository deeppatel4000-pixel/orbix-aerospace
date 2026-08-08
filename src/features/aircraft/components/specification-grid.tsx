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
      {items.map((item, index) => (
        <div
          className="orbix-frame relative min-h-44 overflow-hidden border-tactical/25 bg-[#080d0c]/90 p-5 sm:p-6"
          key={item.label}
        >
          <div
            aria-hidden="true"
            className="technical-grid absolute inset-0 opacity-25"
          />
          <div className="flex items-center justify-between gap-4">
            <dt className="relative font-mono text-[0.62rem] tracking-[0.15em] text-muted uppercase">
              {item.label}
            </dt>
            <item.icon
              aria-hidden="true"
              className="relative text-tactical-amber"
              size={18}
              strokeWidth={1.7}
            />
          </div>
          <dd className="orbix-telemetry-value relative mt-7 text-2xl sm:text-3xl">
            {item.value}
          </dd>
          <p className="relative mt-2 text-xs leading-5 text-muted">
            {item.note}
          </p>
          <span
            aria-hidden="true"
            className="absolute right-3 bottom-2 font-mono text-[0.56rem] tracking-[0.12em] text-tactical/35"
          >
            SPEC-0{index + 1}
          </span>
        </div>
      ))}
    </dl>
  );
}
