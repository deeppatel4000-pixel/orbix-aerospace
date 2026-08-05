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
      className="min-w-0 border-b border-white/10 bg-[#061116]/90 p-4 xl:border-r xl:border-b-0 xl:p-5"
    >
      <div className="flex items-center justify-between gap-3 xl:block">
        <div>
          <p className="font-mono text-[0.55rem] tracking-[0.15em] text-accent uppercase">
            Command navigation
          </p>
          <h3
            className="mt-1 text-sm font-semibold text-[#dbe5e6]"
            id="mission-control-navigation-title"
          >
            Mission Workspaces
          </h3>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[0.55rem] text-[#7f9499] xl:mt-3 xl:inline-flex">
          12 CHANNELS
        </span>
      </div>

      <nav aria-label="Mission Control sections" className="mt-4">
        <div
          aria-label="Mission visualization views"
          className="grid grid-cols-2 gap-2 sm:grid-cols-5 xl:grid-cols-1"
          role="tablist"
        >
          {MISSION_CONTROL_WORKSPACES.map((workspace, index) => {
            const Icon = workspace.icon;
            const isActive = workspace.id === activeWorkspace;

            return (
              <button
                aria-controls={workspacePanelId}
                aria-label={workspace.accessibleLabel}
                aria-selected={isActive}
                className={
                  "group relative flex min-h-11 items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-xs font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none " +
                  (isActive
                    ? "border-accent/30 bg-accent/10 text-accent"
                    : "border-transparent bg-transparent text-[#81969b] hover:border-white/10 hover:bg-white/5 hover:text-[#dce6e7]")
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
                    className="absolute top-2 bottom-2 left-0 w-0.5 rounded-full bg-accent"
                  />
                ) : null}
                <Icon aria-hidden="true" className="shrink-0" size={15} />
                <span className="truncate">{workspace.label}</span>
                <span className="ml-auto hidden font-mono text-[0.5rem] text-[#60767c] xl:block">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <p className="mt-4 hidden border-t border-white/10 pt-4 text-[0.67rem] leading-5 text-[#687e84] xl:block">
        Use arrow keys to move between workspaces. Home and End jump to the
        first or last channel.
      </p>
    </aside>
  );
}
