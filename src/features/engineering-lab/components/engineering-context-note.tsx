import type { ReactNode } from "react";
import { Info } from "lucide-react";

interface EngineeringContextNoteProps {
  children: ReactNode;
  label?: string;
  title: string;
}

export function EngineeringContextNote({
  children,
  label = "Model context",
  title,
}: EngineeringContextNoteProps) {
  return (
    <aside className="border-l-2 border-laboratory/55 bg-laboratory/5 px-5 py-4">
      <div className="flex items-start gap-3">
        <Info
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-laboratory"
          size={17}
          strokeWidth={1.7}
        />
        <div>
          <p className="font-mono text-[0.62rem] tracking-[0.16em] text-laboratory uppercase">
            {label}
          </p>
          <p className="mt-1.5 text-sm font-semibold text-foreground">
            {title}
          </p>
          <div className="mt-2 text-sm leading-6 text-muted">{children}</div>
        </div>
      </div>
    </aside>
  );
}
