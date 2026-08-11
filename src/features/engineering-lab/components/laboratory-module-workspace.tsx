"use client";

import {
  Children,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  LaboratoryToolNavigation,
  type LaboratoryToolNavigationItem,
} from "@/features/engineering-lab/components/laboratory-tool-navigation";

interface LaboratoryModuleWorkspaceProps {
  children: ReactNode;
  /** Fallback id prefix when a child has no matching index entry. */
  workflowId: string;
  /**
   * The modules in this workflow, in the same order as `children`.
   *
   * Paired by index, which is the contract `LaboratoryShell` already uses for
   * workflows. The duplication against each card's own props is deliberate but
   * not unchecked: `engineering-lab-modules.spec.ts` asserts every index entry
   * matches the heading of the card it reveals, so the two cannot drift apart
   * silently.
   */
  tools: readonly LaboratoryToolNavigationItem[];
}

/**
 * The module index and the single active module inside one workflow.
 *
 * Split out from `LaboratoryWorkflowSection` so that section can stay a server
 * component: it renders a `LucideIcon` in its header, and a component reference
 * cannot cross the server/client boundary. The cards themselves arrive here as
 * already-rendered children, exactly as `LaboratoryShell` receives workflows.
 *
 * Modules are hidden rather than unmounted, for two reasons. Deep links from
 * Learn, Compare, the homepage and the showcase point at module ids, and the
 * shell resolves those by looking the element up in the document — which only
 * works if it is present. And several modules hold real interaction state (a
 * scenario builder, a mission replay); unmounting would silently discard a
 * reader's work when they glance at a neighbouring module.
 */
export function LaboratoryModuleWorkspace({
  children,
  tools,
  workflowId,
}: LaboratoryModuleWorkspaceProps) {
  const toolChildren = useMemo(() => Children.toArray(children), [children]);
  const firstToolId = tools[0]?.id ?? "";
  const [activeToolId, setActiveToolId] = useState(firstToolId);

  const resolveHash = useCallback(() => {
    const hashId = decodeURIComponent(window.location.hash.slice(1));
    if (hashId.length === 0) return;

    // Either the hash names a module directly, or it names something inside
    // one — an input, a result panel, a nested anchor.
    const direct = tools.find((tool) => tool.id === hashId);
    if (direct) {
      setActiveToolId(direct.id);
      return;
    }

    const target = document.getElementById(hashId);
    const containing = target?.closest<HTMLElement>("[data-laboratory-tool]");
    const containingId = containing?.dataset.laboratoryTool;

    if (
      containingId !== undefined &&
      tools.some((tool) => tool.id === containingId)
    ) {
      setActiveToolId(containingId);
    }
  }, [tools]);

  useEffect(() => {
    // Reads `window.location.hash` and the DOM, neither of which exists during
    // SSR — the "synchronize with an external system" case. The disable matches
    // the one in `laboratory-shell.tsx`, added when eslint-config-next 16
    // brought `set-state-in-effect` into its recommended set.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    resolveHash();
    window.addEventListener("hashchange", resolveHash);

    return () => window.removeEventListener("hashchange", resolveHash);
  }, [resolveHash]);

  const selectTool = useCallback((toolId: string) => {
    setActiveToolId(toolId);
    window.location.hash = toolId;
  }, []);

  const activeTool = tools.find((tool) => tool.id === activeToolId);

  return (
    <>
      <LaboratoryToolNavigation
        activeToolId={activeToolId}
        onSelect={selectTool}
        tools={tools}
      />

      <p aria-atomic="true" aria-live="polite" className="sr-only">
        Current module: {activeTool?.title ?? "Unknown"}
      </p>

      <div className="mt-8">
        {toolChildren.map((tool, index) => {
          const toolId =
            tools[index]?.id ?? `${workflowId}-module-${index + 1}`;
          const isActive = toolId === activeToolId;

          return (
            <div
              aria-hidden={!isActive}
              data-laboratory-tool={toolId}
              hidden={!isActive}
              key={toolId}
            >
              {tool}
            </div>
          );
        })}
      </div>
    </>
  );
}
