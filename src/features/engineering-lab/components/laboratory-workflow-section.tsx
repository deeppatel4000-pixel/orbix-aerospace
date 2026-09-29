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
 * The discipline name labels the section for assistive technology only:
 * the module's own `<h2>` is the heading a reader navigates by, the index
 * already shows the discipline, and the card carries the tool's number.
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
      <p className="sr-only" id={titleId}>
        {title}
      </p>
      <LaboratoryModuleWorkspace tools={tools} workflowId={id}>
        {children}
      </LaboratoryModuleWorkspace>
    </section>
  );
}
