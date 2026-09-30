"use client";

import { useRef, type KeyboardEvent } from "react";

import { cn } from "@/lib/cn";

export type MissionControlWorkspaceView =
  | "briefing"
  | "design-review"
  | "demo-mode"
  | "ground-track"
  | "insights"
  | "orbit"
  | "overview"
  | "reentry"
  | "replay"
  | "showcase"
  | "trade-study"
  | "unified";

export interface MissionControlWorkspaceDefinition {
  readonly accessibleLabel: string;
  readonly id: MissionControlWorkspaceView;
  readonly label: string;
}

/**
 * Listed in the order the tabs are drawn (group by group), so arrow-key
 * focus order matches the visual order.
 */
export const MISSION_CONTROL_WORKSPACES: readonly MissionControlWorkspaceDefinition[] =
  [
    {
      accessibleLabel: "Overview: mission timeline summary",
      id: "overview",
      label: "Overview",
    },
    {
      accessibleLabel: "Unified view: unified mission presentation",
      id: "unified",
      label: "Unified view",
    },
    {
      accessibleLabel: "Orbit: orbital view",
      id: "orbit",
      label: "Orbit",
    },
    {
      accessibleLabel: "Reentry: reentry view",
      id: "reentry",
      label: "Reentry",
    },
    {
      accessibleLabel: "Ground track: illustrative orbital projection",
      id: "ground-track",
      label: "Ground track",
    },
    {
      accessibleLabel: "Design review: mission constraints and considerations",
      id: "design-review",
      label: "Design review",
    },
    {
      accessibleLabel: "Insights",
      id: "insights",
      label: "Insights",
    },
    {
      accessibleLabel: "Trade study",
      id: "trade-study",
      label: "Trade study",
    },
    {
      accessibleLabel: "Replay",
      id: "replay",
      label: "Replay",
    },
    {
      accessibleLabel: "Briefing",
      id: "briefing",
      label: "Briefing",
    },
    {
      accessibleLabel: "Showcase",
      id: "showcase",
      label: "Showcase",
    },
    {
      accessibleLabel: "Demo mode",
      id: "demo-mode",
      label: "Demo mode",
    },
  ];

export type MissionControlNavigationKey =
  "ArrowDown" | "ArrowLeft" | "ArrowRight" | "ArrowUp" | "End" | "Home";

export function resolveWorkspaceNavigationIndex(
  currentIndex: number,
  key: MissionControlNavigationKey,
  totalWorkspaces: number,
): number {
  if (totalWorkspaces <= 0) return 0;
  if (key === "Home") return 0;
  if (key === "End") return totalWorkspaces - 1;
  if (key === "ArrowRight" || key === "ArrowDown") {
    return (currentIndex + 1) % totalWorkspaces;
  }

  return (currentIndex - 1 + totalWorkspaces) % totalWorkspaces;
}

export interface MissionControlSidebarProps {
  readonly activeWorkspace: MissionControlWorkspaceView;
  readonly onWorkspaceChange: (workspace: MissionControlWorkspaceView) => void;
  readonly workspacePanelId?: string;
}

interface MissionControlWorkspaceGroup {
  readonly id: string;
  readonly label: string;
  readonly workspaceIds: readonly MissionControlWorkspaceView[];
}

const MISSION_CONTROL_WORKSPACE_GROUPS: readonly MissionControlWorkspaceGroup[] =
  [
    {
      id: "mission-command",
      label: "Mission",
      workspaceIds: ["overview", "unified"],
    },
    {
      id: "engineering-systems",
      label: "Engineering",
      workspaceIds: ["orbit", "reentry", "ground-track"],
    },
    {
      id: "engineering-review",
      label: "Review",
      workspaceIds: ["design-review", "insights", "trade-study"],
    },
    {
      id: "mission-presentation",
      label: "Presentation",
      workspaceIds: ["replay", "briefing", "showcase", "demo-mode"],
    },
  ];

const workspaceIndexById = new Map(
  MISSION_CONTROL_WORKSPACES.map((workspace, index) => [workspace.id, index]),
);

const navigationKeys = new Set<string>([
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "End",
  "Home",
]);

export function MissionControlSidebar({
  activeWorkspace,
  onWorkspaceChange,
  workspacePanelId = "mission-workspace-panel",
}: MissionControlSidebarProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    if (!navigationKeys.has(event.key)) return;

    event.preventDefault();
    const nextIndex = resolveWorkspaceNavigationIndex(
      currentIndex,
      event.key as MissionControlNavigationKey,
      MISSION_CONTROL_WORKSPACES.length,
    );
    const nextWorkspace = MISSION_CONTROL_WORKSPACES[nextIndex];

    if (!nextWorkspace) return;

    onWorkspaceChange(nextWorkspace.id);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <div className="min-w-0 border-b border-border-subtle py-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h4
          className="text-[0.9375rem] leading-6 font-semibold text-foreground"
          id="mission-control-navigation-title"
        >
          Mission workspaces
        </h4>
        <p className="text-sm text-muted">
          Arrow keys move between workspaces; Home and End jump to the ends.
        </p>
      </div>

      <nav aria-label="Mission control sections" className="mt-3">
        {/* Square segmented controls, one per group, above the workspace
         * so the content keeps the full tool column. From 48rem the four
         * groups sit on a fixed two-column grid, so both rows line up; a
         * group too wide for its cell wraps its own segments, and each
         * segment grows so a wrapped row leaves no gap. */}
        <div
          aria-label="Mission systems workspaces"
          aria-orientation="horizontal"
          className="grid gap-x-5 gap-y-4 md:grid-cols-2"
          role="tablist"
        >
          {MISSION_CONTROL_WORKSPACE_GROUPS.map((group) => (
            <div
              className="flex max-w-full min-w-0 flex-col gap-1.5"
              key={group.id}
              role="presentation"
            >
              <p aria-hidden="true" className="orbix-caps text-muted">
                {group.label}
              </p>

              <div
                className={cn(
                  "w-full gap-px overflow-hidden rounded border border-border-control bg-border-control",
                  // Below 30rem a four-segment group is a 2 x 2 grid, so it
                  // never wraps 3 + 1 with one segment on a row of its own.
                  group.workspaceIds.length === 4
                    ? "grid grid-cols-2 min-[30rem]:flex min-[30rem]:flex-wrap"
                    : "flex flex-wrap",
                )}
                role="presentation"
              >
                {group.workspaceIds.map((workspaceId) => {
                  const index = workspaceIndexById.get(workspaceId);
                  const workspace =
                    index === undefined
                      ? undefined
                      : MISSION_CONTROL_WORKSPACES[index];

                  if (!workspace || index === undefined) return null;

                  const isActive = workspace.id === activeWorkspace;

                  return (
                    <button
                      aria-controls={workspacePanelId}
                      aria-label={workspace.accessibleLabel}
                      aria-selected={isActive}
                      className={cn(
                        "inline-flex min-h-11 grow items-center justify-center px-3.5 text-sm whitespace-nowrap transition-colors focus-visible:outline-offset-[-3px]",
                        isActive
                          ? "bg-accent font-medium text-on-accent"
                          : "bg-background text-text-secondary hover:bg-surface-raised hover:text-foreground",
                      )}
                      id={`mission-workspace-${workspace.id}-tab`}
                      key={workspace.id}
                      onClick={() => onWorkspaceChange(workspace.id)}
                      onKeyDown={(event) => handleKeyDown(event, index)}
                      ref={(element) => {
                        tabRefs.current[index] = element;
                      }}
                      role="tab"
                      tabIndex={isActive ? 0 : -1}
                      type="button"
                    >
                      {workspace.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}
