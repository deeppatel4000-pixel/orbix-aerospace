"use client";

import { ChevronDown } from "lucide-react";

export interface LaboratoryToolNavigationItem {
  /** The tool's DOM id, which is also its deep-link anchor. */
  readonly id: string;
  /** Short discipline line shown under the title in the index. */
  readonly kind: string;
  readonly title: string;
}

export interface LaboratoryToolGroup {
  /** The workflow section's DOM id. */
  readonly id: string;
  readonly title: string;
  readonly tools: readonly LaboratoryToolNavigationItem[];
}

interface LaboratoryToolNavigationProps {
  activeToolId: string;
  groups: readonly LaboratoryToolGroup[];
  onSelect: (toolId: string) => void;
}

function ToolList({
  activeToolId,
  groups,
  idPrefix,
}: {
  activeToolId: string;
  groups: readonly LaboratoryToolGroup[];
  idPrefix: string;
}) {
  return (
    <div className="space-y-6">
      {groups.map((group) => {
        const headingId = `${idPrefix}-${group.id}`;

        return (
          <div key={group.id}>
            <p className="orbix-caps text-muted" id={headingId}>
              {group.title}
            </p>
            <ul aria-labelledby={headingId} className="mt-2 space-y-0.5">
              {group.tools.map((tool) => {
                const isActive = tool.id === activeToolId;

                return (
                  <li key={tool.id}>
                    {/* Plain in-page links: the shell listens for the hash
                     * change and reveals the module, so Tab reaches every tool
                     * and Enter opens it, with no second mechanism to learn. */}
                    <a
                      aria-current={isActive ? "location" : undefined}
                      className={
                        isActive
                          ? "block border-l-2 border-accent bg-[var(--orbix-accent-subtle)] px-3 py-1.5 text-sm leading-5 font-medium text-foreground"
                          : "block border-l-2 border-transparent px-3 py-1.5 text-sm leading-5 text-text-secondary transition-colors duration-150 hover:border-border-strong hover:text-foreground"
                      }
                      data-active={isActive ? "true" : undefined}
                      href={`#${tool.id}`}
                    >
                      {tool.title}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

/**
 * The Engineering Lab tool index (spec 14).
 *
 * From 1024px it is a vertical list grouped by discipline, each tool a plain
 * in-page link with `aria-current` on the active one. Below 1024px the same
 * index becomes a labelled `<select>` plus the full list inside a native
 * `<details>`, so a phone reader can either jump straight to a tool or scan
 * the list. Every path ends in the URL hash, which `LaboratoryShell` resolves.
 */
export function LaboratoryToolNavigation({
  activeToolId,
  groups,
  onSelect,
}: LaboratoryToolNavigationProps) {
  return (
    <nav aria-label="Engineering Lab tools">
      <div className="lg:hidden">
        <div className="orbix-field">
          <label
            className="orbix-field__label"
            htmlFor="laboratory-tool-select"
          >
            Choose a tool
          </label>
          <div className="orbix-field__control">
            <select
              className="orbix-select"
              id="laboratory-tool-select"
              onChange={(event) => onSelect(event.target.value)}
              value={activeToolId}
            >
              {groups.map((group) => (
                <optgroup key={group.id} label={group.title}>
                  {group.tools.map((tool) => (
                    <option key={tool.id} value={tool.id}>
                      {tool.title}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="orbix-field__icon orbix-field__icon--end"
              size={16}
            />
          </div>
        </div>

        <details className="mt-3 rounded-md border border-border">
          <summary className="flex min-h-10 cursor-pointer items-center px-3 text-sm font-medium text-text-secondary hover:text-foreground">
            Show all tools
          </summary>
          <div className="border-t border-border-subtle p-3">
            <ToolList
              activeToolId={activeToolId}
              groups={groups}
              idPrefix="laboratory-tools-compact"
            />
          </div>
        </details>
      </div>

      <div className="hidden lg:block">
        <ToolList
          activeToolId={activeToolId}
          groups={groups}
          idPrefix="laboratory-tools"
        />
      </div>
    </nav>
  );
}
