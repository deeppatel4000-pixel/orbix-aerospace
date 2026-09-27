import type { ReactNode } from "react";
import { Info } from "lucide-react";

interface EngineeringContextNoteProps {
  children: ReactNode;
  title: string;
}

/** A short explanatory note beside a result: a rule, a title and prose. */
export function EngineeringContextNote({
  children,
  title,
}: EngineeringContextNoteProps) {
  return (
    <aside className="orbix-lab-note">
      <p className="orbix-lab-note__title">
        <Info aria-hidden="true" size={16} />
        {title}
      </p>
      <div className="mt-2 text-sm leading-6 text-muted">{children}</div>
    </aside>
  );
}
