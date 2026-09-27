"use client";

import { Children, useMemo, type ReactNode } from "react";

import { useActiveLaboratoryTool } from "@/features/engineering-lab/components/laboratory-shell";
import type { LaboratoryToolNavigationItem } from "@/features/engineering-lab/components/laboratory-tool-navigation";

interface LaboratoryModuleWorkspaceProps {
  children: ReactNode;
  /** Fallback id prefix when a child has no matching index entry. */
  workflowId: string;
  /**
   * The modules in this workflow, in the same order as `children`. Paired by
   * index, the same contract `LaboratoryShell` uses for workflows.
   */
  tools: readonly LaboratoryToolNavigationItem[];
}

/**
 * Shows the one active module of a workflow and keeps the rest mounted but
 * hidden. The active tool comes from `LaboratoryShell`, which owns the index
 * and the URL hash. Hidden rather than unmounted, so deep links to elements
 * inside a module still resolve and a reader's inputs survive a switch.
 */
export function LaboratoryModuleWorkspace({
  children,
  tools,
  workflowId,
}: LaboratoryModuleWorkspaceProps) {
  const toolChildren = useMemo(() => Children.toArray(children), [children]);
  const activeToolId = useActiveLaboratoryTool();
  const firstToolId = tools[0]?.id;
  const ownsActiveTool = tools.some((tool) => tool.id === activeToolId);
  const visibleToolId = ownsActiveTool ? activeToolId : firstToolId;

  return (
    <>
      {toolChildren.map((tool, index) => {
        const toolId = tools[index]?.id ?? `${workflowId}-module-${index + 1}`;

        return (
          <div
            data-laboratory-tool={toolId}
            hidden={toolId !== visibleToolId}
            key={toolId}
          >
            {tool}
          </div>
        );
      })}
    </>
  );
}
