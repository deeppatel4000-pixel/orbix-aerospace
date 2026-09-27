"use client";

import { useRef, type KeyboardEvent } from "react";

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
      accessibleLabel: "Replay",
      id: "replay",
      label: "Replay",
    },
    {
      accessibleLabel: "Insights",
      id: "insights",
      label: "Insights",
    },
    {
      accessibleLabel: "Briefing",
      id: "briefing",
      label: "Briefing",
    },
    {
      accessibleLabel: "Trade study",
      id: "trade-study",
      label: "Trade study",
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
    <aside
      aria-labelledby="mission-control-navigation-title"
      className="min-w-0 border-b border-border-subtle py-4 xl:border-b-0 xl:pr-4"
    >
      <h4
        className="text-sm font-semibold text-foreground"
        id="mission-control-navigation-title"
      >
        Mission workspaces
      </h4>

      <nav aria-label="Mission control sections" className="mt-3">
        <div
          aria-label="Mission systems workspaces"
          aria-orientation="vertical"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-1"
          role="tablist"
        >
          {MISSION_CONTROL_WORKSPACE_GROUPS.map((group) => (
            <div className="min-w-0" key={group.id} role="presentation">
              <p aria-hidden="true" className="orbix-caps mb-1 text-muted">
                {group.label}
              </p>

              <div className="grid gap-0.5" role="presentation">
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
                      className={
                        isActive
                          ? "flex min-h-10 items-center border-l-2 border-accent bg-accent/12 px-3 py-2 text-left text-sm font-medium text-foreground"
                          : "flex min-h-10 items-center border-l-2 border-transparent px-3 py-2 text-left text-sm text-text-secondary transition-colors duration-150 hover:border-border-strong hover:text-foreground"
                      }
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

      <p className="mt-4 border-t border-border-subtle pt-3 text-sm leading-5 text-muted">
        Arrow keys move between workspaces. Home and End jump to the first or
        last.
      </p>
    </aside>
  );
}
