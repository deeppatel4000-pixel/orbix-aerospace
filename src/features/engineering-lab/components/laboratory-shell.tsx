"use client";

import {
  Children,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  LaboratoryToolDirectory,
  LaboratoryToolNavigation,
  type LaboratoryToolGroup,
} from "@/features/engineering-lab/components/laboratory-tool-navigation";

interface LaboratoryShellProps {
  /**
   * Old anchors mapped to the tool that now covers them, so links to
   * merged or replaced tools still open something useful.
   */
  aliases?: Readonly<Record<string, string>>;
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
 * The Engineering Lab workspace: the tool index with tool IDs, held below the
 * header (a slim select bar under 1024px, a column on the left from
 * 1024px), and exactly one active tool beside it.
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
export function LaboratoryShell({
  aliases,
  children,
  workflows,
}: LaboratoryShellProps) {
  const workflowChildren = useMemo(
    () => Children.toArray(children),
    [children],
  );
  const firstToolId = workflows[0]?.tools[0]?.id ?? "";
  const [activeToolId, setActiveToolId] = useState(firstToolId);
  const indexRef = useRef<HTMLDivElement>(null);

  const resolveHash = useCallback(() => {
    const hashId = decodeURIComponent(window.location.hash.slice(1));

    if (hashId.length === 0) {
      setActiveToolId(firstToolId);
      return;
    }

    const alias = aliases?.[hashId];
    if (alias !== undefined) {
      setActiveToolId(alias);
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
  }, [aliases, firstToolId, workflows]);

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
    const target =
      hashId.length > 0
        ? (document.getElementById(hashId) ??
          document.getElementById(aliases?.[hashId] ?? ""))
        : null;

    if (target === null || target.closest("[hidden]") !== null) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      // Scroll by measurement, not scroll-margin: the tool card sets its own
      // scroll-margin, and below 1024px the sticky tool bar sits under the
      // header, so the clearance depends on the layout. The bar's resolved
      // `top` is where it sticks; below 1024px it spans the column, so the
      // target must also clear its height.
      const index = indexRef.current;
      const stacked = window.matchMedia("(max-width: 63.999rem)").matches;
      let clearance = 0;

      if (index !== null) {
        const stickyTop = Number.parseFloat(getComputedStyle(index).top) || 0;
        clearance = stacked ? stickyTop + index.offsetHeight : stickyTop;
      }

      window.scrollTo({
        top: Math.max(
          0,
          target.getBoundingClientRect().top + window.scrollY - clearance - 16,
        ),
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeToolId, aliases]);

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
      <div className="grid gap-4 lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:items-start lg:gap-10">
        {/* Held under the 64px header: below 1024px as a slim bar holding
         * only the select, from 1024px as the numbered index with the open
         * discipline expanded. On a short window the index scrolls inside
         * its own column with a visible thin scrollbar as the overflow cue
         * (spec 3.1: no fade), and the current row is kept in view. The
         * narrow bar's ground is the page colour, so scrolled content does
         * not show through it; it is not a fill. */}
        <div
          data-tool-rail=""
          className="sticky top-[var(--header-height)] z-30 -mx-4 self-start border-b border-border bg-background px-4 py-2 sm:-mx-6 sm:px-6 lg:top-[calc(var(--header-height)+1.5rem)] lg:z-auto lg:mx-0 lg:max-h-[calc(100svh-var(--header-height)-3rem)] lg:[scrollbar-width:thin] lg:[scrollbar-color:var(--rule-strong)_var(--rule)] lg:overflow-y-auto lg:border-b-0 lg:bg-transparent lg:px-0 lg:pt-0 lg:pb-8 max-lg:[html:has(&)]:scroll-pt-[calc(var(--header-height)+5rem)]"
          ref={indexRef}
        >
          <LaboratoryToolNavigation
            activeToolId={activeToolId}
            groups={workflows}
            onSelect={selectTool}
          />
        </div>

        <div className="min-w-0 [&_[id]]:scroll-mt-[calc(var(--header-height)+5rem)]! lg:[&_[id]]:scroll-mt-[calc(var(--header-height)+1.5rem)]!">
          <p aria-atomic="true" aria-live="polite" className="sr-only">
            Current tool: {activeTool?.title ?? "None selected"}
          </p>
          <div className="mb-4 lg:hidden">
            <LaboratoryToolDirectory
              activeToolId={activeToolId}
              groups={workflows}
            />
          </div>
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
