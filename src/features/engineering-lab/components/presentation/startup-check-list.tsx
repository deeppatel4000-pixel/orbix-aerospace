import { CheckCircle2, CircleDashed } from "lucide-react";

export interface StartupCheckItem {
  readonly available: boolean;
  readonly id: string;
  readonly label: string;
}

export interface StartupCheckListProps {
  readonly items: readonly StartupCheckItem[];
}

export function StartupCheckList({ items }: StartupCheckListProps) {
  return (
    <ul
      aria-label="Mission Control startup system checks"
      className="mt-6 grid gap-2 sm:grid-cols-2"
    >
      {items.map((item) => (
        <li
          className={
            "flex min-h-14 items-center gap-3 rounded-xl border px-4 py-3 " +
            (item.available
              ? "border-accent/20 bg-accent/5"
              : "border-white/10 bg-black/15")
          }
          data-check-availability={
            item.available ? "available" : "not-supplied"
          }
          key={item.id}
        >
          {item.available ? (
            <CheckCircle2
              aria-hidden="true"
              className="shrink-0 text-accent"
              size={17}
            />
          ) : (
            <CircleDashed
              aria-hidden="true"
              className="shrink-0 text-[#60777d]"
              size={17}
            />
          )}
          <span className="min-w-0 flex-1 text-sm text-[#c4d1d3]">
            {item.label}
          </span>
          <span
            className={
              "font-mono text-[0.52rem] tracking-[0.08em] uppercase " +
              (item.available ? "text-accent" : "text-[#6f858a]")
            }
          >
            {item.available ? "Available" : "Not supplied"}
          </span>
        </li>
      ))}
    </ul>
  );
}
