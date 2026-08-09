"use client";

import {
  Children,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Container } from "@/components/layout/container";
import {
  LaboratoryWorkflowNavigation,
  type LaboratoryWorkflowNavigationItem,
} from "@/features/engineering-lab/components/laboratory-workflow-navigation";

interface LaboratoryShellProps {
  children: ReactNode;
  workflows: readonly LaboratoryWorkflowNavigationItem[];
}

function getWorkflowIdFromHref(href: `#${string}`): string {
  return href.slice(1);
}

export function LaboratoryShell({ children, workflows }: LaboratoryShellProps) {
  const workflowChildren = useMemo(
    () => Children.toArray(children),
    [children],
  );
  const firstWorkflowId = getWorkflowIdFromHref(workflows[0]?.href ?? "#");
  const [activeWorkflowId, setActiveWorkflowId] = useState(firstWorkflowId);

  const resolveHash = useCallback(() => {
    const hashId = decodeURIComponent(window.location.hash.slice(1));

    if (hashId.length === 0) {
      setActiveWorkflowId(firstWorkflowId);
      return;
    }

    const directWorkflow = workflows.find(
      ({ href }) => getWorkflowIdFromHref(href) === hashId,
    );
    const nestedTarget = document.getElementById(hashId);
    const containingWorkflow = nestedTarget?.closest<HTMLElement>(
      "[data-laboratory-workflow]",
    );
    const nextWorkflowId = directWorkflow
      ? getWorkflowIdFromHref(directWorkflow.href)
      : containingWorkflow?.dataset.laboratoryWorkflow;

    if (nextWorkflowId !== undefined) {
      setActiveWorkflowId(nextWorkflowId);
    }
  }, [firstWorkflowId, workflows]);

  useEffect(() => {
    // `resolveHash` reads `window.location.hash` and queries the DOM, neither
    // of which exists during SSR. This is the "synchronize with an external
    // system" case that effects exist for, not derivable state. Flagged only
    // because eslint-plugin-react-hooks 5 -> 7 (pulled in by
    // eslint-config-next 16) added `set-state-in-effect` to its recommended
    // set; this code is unchanged from the Next 15 baseline. See docs/upgrades/.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    resolveHash();
    window.addEventListener("hashchange", resolveHash);

    return () => window.removeEventListener("hashchange", resolveHash);
  }, [resolveHash]);

  useEffect(() => {
    const hashId = decodeURIComponent(window.location.hash.slice(1));
    const target = hashId.length > 0 ? document.getElementById(hashId) : null;

    if (target === null || target.closest("[hidden]") !== null) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      target.scrollIntoView({ block: "start" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeWorkflowId]);

  const selectWorkflow = useCallback((href: `#${string}`) => {
    const workflowId = getWorkflowIdFromHref(href);
    setActiveWorkflowId(workflowId);

    if (window.location.hash === href) {
      document.getElementById(workflowId)?.scrollIntoView({ block: "start" });
      return;
    }

    window.location.hash = workflowId;
  }, []);

  const activeWorkflow = workflows.find(
    ({ href }) => getWorkflowIdFromHref(href) === activeWorkflowId,
  );

  return (
    <section
      aria-labelledby="laboratory-workflows-title"
      className="relative overflow-clip py-16 sm:py-20"
      id="laboratory-workflows"
    >
      <div
        aria-hidden="true"
        className="technical-grid absolute inset-0 -z-10 opacity-18"
      />
      <Container>
        <div className="mb-10 max-w-4xl border-b border-border pb-8 sm:mb-12">
          <p className="font-mono text-xs tracking-[0.18em] text-accent uppercase">
            Module registry // Six engineering workflows
          </p>
          <h2
            className="font-display mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl"
            id="laboratory-workflows-title"
          >
            Select an engineering workflow.
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
            Start with an isolated model, then move through integrated flow,
            reentry, orbital, and mission-review systems without leaving the
            laboratory.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start xl:gap-14">
          <aside className="orbix-frame border-border bg-surface/75 p-4 backdrop-blur-md lg:sticky lg:top-24">
            <LaboratoryWorkflowNavigation
              activeWorkflowId={activeWorkflowId}
              onSelect={selectWorkflow}
              workflows={workflows}
            />
          </aside>

          <div className="min-w-0 [&_[id]]:scroll-mt-28">
            <p aria-atomic="true" aria-live="polite" className="sr-only">
              Current laboratory workflow: {activeWorkflow?.title ?? "Unknown"}
            </p>
            {workflowChildren.map((workflow, index) => {
              const workflowDefinition = workflows[index];
              const workflowId = workflowDefinition
                ? getWorkflowIdFromHref(workflowDefinition.href)
                : `laboratory-workflow-${index + 1}`;
              const isActive = workflowId === activeWorkflowId;

              return (
                <div
                  aria-hidden={!isActive}
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
      </Container>
    </section>
  );
}
