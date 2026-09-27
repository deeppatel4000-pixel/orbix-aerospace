import type { ReactNode } from "react";

import { LaboratoryModuleWorkspace } from "@/features/engineering-lab/components/laboratory-module-workspace";
import type { LaboratoryToolNavigationItem } from "@/features/engineering-lab/components/laboratory-tool-navigation";

interface LaboratoryWorkflowSectionProps {
  children: ReactNode;
  id: string;
  title: string;
  /** The modules in this workflow, in the same order as `children`. */
  tools: readonly LaboratoryToolNavigationItem[];
}

/**
 * One discipline of the Engineering Lab and its active module.
 *
 * The discipline name is a short label above the module, not a heading: the
 * module's own `<h2>` is the heading a reader navigates by, and the index on
 * the left already groups tools by discipline.
 */
export function LaboratoryWorkflowSection({
  children,
  id,
  title,
  tools,
}: LaboratoryWorkflowSectionProps) {
  const titleId = `${id}-title`;

  return (
    <section aria-labelledby={titleId} id={id}>
      <p className="orbix-label mb-3" id={titleId}>
        {title}
      </p>
      <LaboratoryModuleWorkspace tools={tools} workflowId={id}>
        {children}
      </LaboratoryModuleWorkspace>
    </section>
  );
}
