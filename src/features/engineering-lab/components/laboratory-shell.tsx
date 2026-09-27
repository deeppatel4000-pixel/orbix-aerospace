"use client";

import {
  Children,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  LaboratoryToolNavigation,
  type LaboratoryToolGroup,
} from "@/features/engineering-lab/components/laboratory-tool-navigation";

interface LaboratoryShellProps {
  children: ReactNode;
  /**
   * The workflows in render order, each with its tools in render order.
   * Paired by index with `children` (one `LaboratoryWorkflowSection` each).
   */
  workflows: readonly LaboratoryToolGroup[];
}

const ActiveToolContext = createContext<string | null>(null);

/** The id of the tool the shell is currently showing. */
export function useActiveLaboratoryTool(): string | null {
  return useContext(ActiveToolContext);
}

/**
 * The Engineering Lab workspace: the tool index on the left from 1024px and
 * exactly one active tool on the right.
 *
 * The URL hash is the single source of truth for navigation. Index links,
 * the compact select and deep links from Learn, Compare and the homepage all
 * set the hash; this shell resolves it to a tool. A hash may name a tool, a
 * workflow (its first tool opens) or any element inside a tool.
 *
 * Tools are hidden rather than unmounted, so deep links can be resolved by
 * looking the target up in the document and so a reader's inputs survive a
 * glance at another tool.
 */
export function LaboratoryShell({ children, workflows }: LaboratoryShellProps) {
  const workflowChildren = useMemo(
    () => Children.toArray(children),
    [children],
  );
  const firstToolId = workflows[0]?.tools[0]?.id ?? "";
  const [activeToolId, setActiveToolId] = useState(firstToolId);

  const resolveHash = useCallback(() => {
    const hashId = decodeURIComponent(window.location.hash.slice(1));

    if (hashId.length === 0) {
      setActiveToolId(firstToolId);
      return;
    }

    for (const workflow of workflows) {
      if (workflow.id === hashId) {
        setActiveToolId(workflow.tools[0]?.id ?? firstToolId);
        return;
      }
      if (workflow.tools.some((tool) => tool.id === hashId)) {
        setActiveToolId(hashId);
        return;
      }
    }

    // The hash names something inside a tool: an input, a result, a nested
    // anchor. Open the tool that contains it.
    const target = document.getElementById(hashId);
    const containingTool = target?.closest<HTMLElement>(
      "[data-laboratory-tool]",
    )?.dataset.laboratoryTool;

    if (containingTool !== undefined) {
      setActiveToolId(containingTool);
    }
  }, [firstToolId, workflows]);

  useEffect(() => {
    // Reads `window.location.hash` and the DOM, neither of which exists during
    // SSR: the "synchronize with an external system" case effects exist for.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    resolveHash();
    window.addEventListener("hashchange", resolveHash);

    return () => window.removeEventListener("hashchange", resolveHash);
  }, [resolveHash]);

  useEffect(() => {
    // Once the target is visible, bring it into view. The browser's own jump
    // happens before React reveals a hidden tool, so it cannot do this alone.
    const hashId = decodeURIComponent(window.location.hash.slice(1));
    const target = hashId.length > 0 ? document.getElementById(hashId) : null;

    if (target === null || target.closest("[hidden]") !== null) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      target.scrollIntoView({ block: "start" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeToolId]);

  const selectTool = useCallback((toolId: string) => {
    setActiveToolId(toolId);
    window.location.hash = toolId;
  }, []);

  const activeWorkflowIndex = Math.max(
    0,
    workflows.findIndex((workflow) =>
      workflow.tools.some((tool) => tool.id === activeToolId),
    ),
  );
  const activeTool = workflows
    .flatMap((workflow) => workflow.tools)
    .find((tool) => tool.id === activeToolId);

  return (
    <ActiveToolContext.Provider value={activeToolId}>
      <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
        <aside className="lg:sticky lg:top-[calc(57px+1.5rem)] lg:max-h-[calc(100vh-57px-3rem)] lg:overflow-y-auto lg:py-1 lg:pr-2 lg:pl-1">
          <LaboratoryToolNavigation
            activeToolId={activeToolId}
            groups={workflows}
            onSelect={selectTool}
          />
        </aside>

        <div className="min-w-0 [&_[id]]:scroll-mt-[calc(57px+1.5rem)]">
          <p aria-atomic="true" aria-live="polite" className="sr-only">
            Current tool: {activeTool?.title ?? "None selected"}
          </p>
          {workflowChildren.map((workflow, index) => {
            const workflowId =
              workflows[index]?.id ?? `laboratory-workflow-${index + 1}`;
            const isActive = index === activeWorkflowIndex;

            return (
              <div
                data-laboratory-workflow={workflowId}
                hidden={!isActive}
                key={workflowId}
              >
                {workflow}
              </div>
            );
          })}
        </div>
      </div>
    </ActiveToolContext.Provider>
  );
}
