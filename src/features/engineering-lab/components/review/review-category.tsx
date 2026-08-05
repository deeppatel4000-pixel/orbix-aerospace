import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export interface ReviewCategoryProps {
  readonly children: ReactNode;
  readonly description: string;
  readonly icon: LucideIcon;
  readonly id: string;
  readonly title: string;
}

export function ReviewCategory({
  children,
  description,
  icon: Icon,
  id,
  title,
}: ReviewCategoryProps) {
  return (
    <section
      aria-labelledby={`design-review-${id}-title`}
      className="rounded-2xl border border-white/10 bg-[#061116]/78 p-5 sm:p-6"
    >
      <div className="flex items-start gap-3 border-b border-white/10 pb-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/6 text-accent">
          <Icon aria-hidden="true" size={18} />
        </span>
        <div>
          <p className="font-mono text-[0.54rem] tracking-[0.13em] text-[#71868c] uppercase">
            Design review category
          </p>
          <h3
            className="mt-1 text-lg font-semibold text-[#dce6e7]"
            id={`design-review-${id}-title`}
          >
            {title}
          </h3>
          <p className="mt-2 max-w-3xl text-xs leading-5 text-[#7f9499]">
            {description}
          </p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
