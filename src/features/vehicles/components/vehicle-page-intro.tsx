import type { ReactNode } from "react";

import { Container } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export interface VehiclePageCrumb {
  readonly href?: string;
  readonly label: string;
}

interface VehiclePageIntroProps {
  breadcrumbs?: readonly VehiclePageCrumb[];
  /** Optional row under the lead: a status tag or actions. */
  children?: ReactNode;
  /** Sentence-case eyebrow, for example the classification. */
  eyebrow?: string;
  lead: string;
  title: string;
}

/**
 * The page intro block (spec 14): optional breadcrumb and eyebrow, the one
 * `<h1>`, one lead paragraph. Left-aligned on the plain page ground with a
 * bottom rule. No image, grid or glow behind it.
 */
export function VehiclePageIntro({
  breadcrumbs,
  children,
  eyebrow,
  lead,
  title,
}: VehiclePageIntroProps) {
  return (
    <header className="border-b border-border">
      <Container className="pt-12 pb-8">
        {breadcrumbs ? (
          <div className="mb-6">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        ) : null}
        {eyebrow ? <p className="orbix-label">{eyebrow}</p> : null}
        <h1 className="orbix-h1 mt-2 text-foreground">{title}</h1>
        <p className="orbix-lead mt-4">{lead}</p>
        {children ? (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {children}
          </div>
        ) : null}
      </Container>
    </header>
  );
}
