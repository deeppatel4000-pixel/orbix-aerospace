import { BookOpenText, CircleSlash2, FileText, Tag } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface LegendItem {
  description: string;
  icon: LucideIcon;
  label: string;
}

const legendItems: readonly LegendItem[] = [
  {
    description:
      "The bold primary value in each cell, presented in the dataset's original units and configuration.",
    icon: FileText,
    label: "Supplied vehicle data",
  },
  {
    description:
      "A short annotation describing how the adjacent value was formatted, qualified, or sourced.",
    icon: Tag,
    label: "Format & source note",
  },
  {
    description:
      "A collapsed, general aerospace explanation of the characteristic. Conceptual context, not a value ORBIX computed.",
    icon: BookOpenText,
    label: "Why it matters",
  },
  {
    description:
      "The characteristic is not present in the current dataset for that vehicle. It is never treated as zero.",
    icon: CircleSlash2,
    label: "Unavailable",
  },
];

export function ComparisonLegend() {
  return (
    <div
      aria-label="How to read the comparison matrix"
      className="mb-5 grid gap-4 rounded-2xl border border-border bg-surface/40 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4"
      role="group"
    >
      {legendItems.map((item) => (
        <div className="flex items-start gap-2.5" key={item.label}>
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border bg-background/40 text-accent"
          >
            <item.icon size={14} strokeWidth={1.8} />
          </span>
          <div>
            <p className="text-xs font-semibold text-foreground">
              {item.label}
            </p>
            <p className="mt-0.5 text-[0.7rem] leading-4 text-muted">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
