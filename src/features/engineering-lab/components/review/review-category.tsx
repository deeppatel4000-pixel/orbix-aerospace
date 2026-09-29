import type { ReactNode } from "react";
import { LabHeading } from "../visualization/lab-heading";

export interface ReviewCategoryProps {
  readonly children: ReactNode;
  readonly description: string;
  readonly id: string;
  readonly title: string;
}

export function ReviewCategory({
  children,
  description,
  id,
  title,
}: ReviewCategoryProps) {
  return (
    <section
      aria-labelledby={`design-review-${id}-title`}
      className="border-t border-border-subtle pt-6 first:border-t-0 first:pt-0"
    >
      <LabHeading offset={1} id={`design-review-${id}-title`}>
        {title}
      </LabHeading>
      <p className="mt-1 max-w-[68ch] text-sm leading-6 text-muted">
        {description}
      </p>
      <div className="mt-3">{children}</div>
    </section>
  );
}
