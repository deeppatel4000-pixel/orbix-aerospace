"use client";

import { useRef, type KeyboardEvent } from "react";
import {
  Box,
  Clapperboard,
  ClipboardList,
  FileText,
  Flame,
  GitCompareArrows,
  LayoutDashboard,
  MapPinned,
  Orbit,
  Radar,
  type LucideIcon,
} from "lucide-react";

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
  readonly icon: LucideIcon;
  readonly id: MissionControlWorkspaceView;
  readonly label: string;
}

export const MISSION_CONTROL_WORKSPACES: readonly MissionControlWorkspaceDefinition[] =
  [
    {
      accessibleLabel: "Overview - Mission Timeline summary",
      icon: LayoutDashboard,
      id: "overview",
      label: "Overview",
    },
    {
      accessibleLabel: "Unified View - Unified Mission presentation",
      icon: Box,
      id: "unified",
      label: "Unified View",
    },
    {
      accessibleLabel: "Orbit - Orbital View",
      icon: Orbit,
      id: "orbit",
      label: "Orbit",
    },
    {
      accessibleLabel: "Reentry - Reentry View",
      icon: Flame,
      id: "reentry",
      label: "Reentry",
    },
    {
      accessibleLabel: "Ground Track - Planetary orbital projection",
      icon: MapPinned,
      id: "ground-track",
      label: "Ground Track",
    },
    {
      accessibleLabel: "Design Review - Mission constraints and considerations",
      icon: ClipboardList,
      id: "design-review",
      label: "Design Review",
    },
    {
      accessibleLabel: "Replay",
      icon: Clapperboard,
      id: "replay",
      label: "Replay",
    },
    {
      accessibleLabel: "Insights",
      icon: Radar,
      id: "insights",
      label: "Insights",
    },
    {
      accessibleLabel: "Briefing",
      icon: FileText,
      id: "briefing",
      label: "Briefing",
    },
    {
      accessibleLabel: "Trade Study",
      icon: GitCompareArrows,
      id: "trade-study",
      label: "Trade Study",
    },
    {
      accessibleLabel: "Showcase",
      icon: Clapperboard,
      id: "showcase",
      label: "Showcase",
    },
    {
      accessibleLabel: "Demo Mode",
      icon: Radar,
      id: "demo-mode",
      label: "Demo Mode",
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
      className="min-w-0 border-b border-white/10 bg-[#061116]/95 p-4 xl:border-r xl:border-b-0 xl:p-5"
    >
      <div className="flex items-start justify-between gap-3 border-b border-white/8 pb-4 xl:block">
        <div>
          <p className="font-mono text-[0.55rem] tracking-[0.15em] text-accent uppercase">
            Mission systems
          </p>
          <h3
            className="mt-1.5 text-sm font-semibold tracking-[0.01em] text-[#e5eef0]"
            id="mission-control-navigation-title"
          >
            Mission Workspaces
          </h3>
          <p className="mt-1 hidden max-w-48 text-[0.64rem] leading-4 text-[#71868c] xl:block">
            Mission planning, engineering review, and presentation systems.
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-accent/15 bg-accent/5 px-2.5 py-1 font-mono text-[0.52rem] tracking-[0.1em] text-[#8ba1a6] uppercase xl:mt-3">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(100,220,255,0.55)]"
          />
          {MISSION_CONTROL_WORKSPACES.length} workspaces
        </span>
      </div>

      <nav aria-label="Mission Control sections" className="mt-4">
        <div
          aria-label="Mission systems workspaces"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-1 xl:gap-4"
          role="tablist"
        >
          {MISSION_CONTROL_WORKSPACE_GROUPS.map((group, groupIndex) => (
            <div
              className="min-w-0 rounded-xl border border-white/[0.07] bg-[#08151b]/70 p-2.5 xl:rounded-none xl:border-0 xl:bg-transparent xl:p-0"
              key={group.id}
              role="presentation"
            >
              <div
                aria-hidden="true"
                className="mb-2 flex items-center gap-2 px-1.5"
              >
                <span className="font-mono text-[0.5rem] tracking-[0.12em] text-accent/70">
                  {String(groupIndex + 1).padStart(2, "0")}
                </span>
                <span className="font-mono text-[0.55rem] font-semibold tracking-[0.14em] text-[#9dafb3] uppercase">
                  {group.label}
                </span>
                <span className="h-px flex-1 bg-white/8" />
              </div>

              <div
                className="grid grid-cols-2 gap-1.5 sm:grid-cols-1"
                role="presentation"
              >
                {group.workspaceIds.map((workspaceId) => {
                  const index = workspaceIndexById.get(workspaceId);
                  const workspace =
                    index === undefined
                      ? undefined
                      : MISSION_CONTROL_WORKSPACES[index];

                  if (!workspace || index === undefined) return null;

                  const Icon = workspace.icon;
                  const isActive = workspace.id === activeWorkspace;

                  return (
                    <button
                      aria-controls={workspacePanelId}
                      aria-label={workspace.accessibleLabel}
                      aria-selected={isActive}
                      className={
                        "group relative flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg border px-2.5 py-2.5 text-left text-xs font-semibold transition-[color,background-color,border-color,box-shadow] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#061116] motion-reduce:transition-none " +
                        (isActive
                          ? "border-accent/30 bg-accent/[0.09] text-[#dffaff] shadow-[inset_0_0_18px_rgba(71,211,255,0.035)]"
                          : "border-transparent bg-transparent text-[#81969b] hover:border-white/10 hover:bg-white/[0.045] hover:text-[#dce6e7]")
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
                      {isActive ? (
                        <span
                          aria-hidden="true"
                          className="absolute top-2 bottom-2 left-0 w-0.5 rounded-full bg-accent shadow-[0_0_8px_rgba(71,211,255,0.45)]"
                        />
                      ) : null}
                      <span
                        aria-hidden="true"
                        className={
                          "grid size-7 shrink-0 place-items-center rounded-md border transition-colors duration-150 motion-reduce:transition-none " +
                          (isActive
                            ? "border-accent/20 bg-accent/10 text-accent"
                            : "border-white/[0.07] bg-white/[0.025] text-[#6f878d] group-hover:border-white/10 group-hover:text-[#b5c8cc]")
                        }
                      >
                        <Icon size={14} />
                      </span>
                      <span className="min-w-0 truncate">
                        {workspace.label}
                      </span>
                      <span className="ml-auto hidden font-mono text-[0.48rem] tracking-[0.08em] text-[#526970] xl:block">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="mt-4 hidden border-t border-white/8 pt-4 xl:block">
        <p className="font-mono text-[0.5rem] tracking-[0.12em] text-[#526970] uppercase">
          Navigation protocol
        </p>
        <p className="mt-1.5 text-[0.64rem] leading-4 text-[#6f858a]">
          Arrow keys move between systems. Home and End jump to the first or
          last workspace.
        </p>
      </div>
    </aside>
  );
}
