import { ArrowLeft, type LucideIcon } from "lucide-react";

import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";

interface FeaturePlaceholderProps {
  description: string;
  eyebrow: string;
  /** Deprecated and ignored: no icon wells (spec 14). */
  icon?: LucideIcon;
  plannedItems: readonly string[];
  title: string;
}

/** A plain page intro plus a list of planned content. */
export function FeaturePlaceholder({
  description,
  eyebrow,
  plannedItems,
  title,
}: FeaturePlaceholderProps) {
  return (
    <section className="border-b border-border pt-12 pb-8">
      <Container>
        <p className="orbix-label">{eyebrow}</p>
        <h1 className="orbix-h1 mt-2">{title}</h1>
        <p className="orbix-lead mt-4">{description}</p>

        <h2 className="orbix-h3 mt-8">Planned content</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-text-secondary">
          {plannedItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <ButtonLink className="mt-8" href="/" variant="secondary">
          <ArrowLeft aria-hidden="true" size={16} />
          Go to the home page
        </ButtonLink>
      </Container>
    </section>
  );
}
