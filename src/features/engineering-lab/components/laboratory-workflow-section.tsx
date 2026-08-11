import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { LaboratoryModuleWorkspace } from "@/features/engineering-lab/components/laboratory-module-workspace";
import type { LaboratoryToolNavigationItem } from "@/features/engineering-lab/components/laboratory-tool-navigation";

interface LaboratoryWorkflowSectionProps {
  children: ReactNode;
  code: string;
  description: string;
  icon: LucideIcon;
  id: string;
  title: string;
  /** The modules in this workflow, in the same order as `children`. */
  tools: readonly LaboratoryToolNavigationItem[];
}

/**
 * One workflow: its heading, its module index, and the single active module.
 *
 * Stays a server component because it renders a `LucideIcon`, which is a
 * component reference and cannot cross the server/client boundary. The index
 * and the module gating live in `LaboratoryModuleWorkspace`.
 *
 * Before this phase every module in a workflow rendered stacked in one column,
 * which is what made a workflow 10,745px tall on a desktop and 18,873px for
 * atmospheric entry. Choosing one module means the page answers "which model am
 * I using?" instead of leaving it to scrolling.
 */
export function LaboratoryWorkflowSection({
  children,
  code,
  description,
  icon: Icon,
  id,
  title,
  tools,
}: LaboratoryWorkflowSectionProps) {
  const titleId = `${id}-title`;

  return (
    <section
      aria-labelledby={titleId}
      className="scroll-mt-28 border-t border-border pt-10 first:border-t-0 first:pt-0 sm:pt-12"
      id={id}
    >
      <header className="mb-7 grid gap-5 border-b border-border pb-7 sm:grid-cols-[3rem_minmax(0,1fr)] sm:items-start">
        <span className="flex h-11 w-11 items-center justify-center border border-accent/25 bg-accent/[0.08] text-accent">
          <Icon aria-hidden="true" size={20} strokeWidth={1.6} />
        </span>
        <div>
          <p className="orbix-label">{code}</p>
          <h2
            className="font-display mt-2 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl"
            id={titleId}
          >
            {title}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted sm:text-base sm:leading-7">
            {description}
          </p>
        </div>
      </header>

      <LaboratoryModuleWorkspace tools={tools} workflowId={id}>
        {children}
      </LaboratoryModuleWorkspace>
    </section>
  );
}
