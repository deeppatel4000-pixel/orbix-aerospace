import { CircleCheck, CircleMinus } from "lucide-react";

export interface StartupCheckItem {
  readonly available: boolean;
  readonly id: string;
  readonly label: string;
}

export interface StartupCheckListProps {
  readonly items: readonly StartupCheckItem[];
}

/** A static list of which inputs were supplied, with text and icon. */
export function StartupCheckList({ items }: StartupCheckListProps) {
  return (
    <ul
      aria-label="Supplied analyses"
      className="mt-3 grid gap-x-8 sm:grid-cols-2"
    >
      {items.map((item) => (
        <li
          className="flex items-center gap-2 border-t border-border-subtle py-2 text-sm"
          data-check-availability={
            item.available ? "available" : "not-supplied"
          }
          key={item.id}
        >
          {item.available ? (
            <CircleCheck
              aria-hidden="true"
              className="shrink-0 text-status-success"
              size={16}
            />
          ) : (
            <CircleMinus
              aria-hidden="true"
              className="shrink-0 text-muted"
              size={16}
            />
          )}
          <span className="min-w-0 flex-1 text-foreground">{item.label}</span>
          <span className={item.available ? "text-foreground" : "text-muted"}>
            {item.available ? "Supplied" : "Not supplied"}
          </span>
        </li>
      ))}
    </ul>
  );
}
