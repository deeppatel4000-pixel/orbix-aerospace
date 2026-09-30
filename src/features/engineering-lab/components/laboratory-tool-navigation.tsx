"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef } from "react";

import { buttonClass } from "@/components/ui/button-class";
import { formatIndexNumber } from "@/components/ui/section-index";
import { cn } from "@/lib/cn";

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

/** The running number of each group's first tool, so rows read 01 onward. */
function groupStarts(groups: readonly LaboratoryToolGroup[]): number[] {
  let next = 1;
  return groups.map((group) => {
    const start = next;
    next += group.tools.length;
    return start;
  });
}

function groupRange(start: number, count: number): string {
  return count > 1
    ? `${formatIndexNumber(start)}-${formatIndexNumber(start + count - 1)}`
    : formatIndexNumber(start);
}

function ToolRows({
  activeToolId,
  dense = false,
  headingId,
  start,
  tools,
}: {
  activeToolId: string;
  /** The desktop rail: 26px rows at 13.5px. */
  dense?: boolean;
  headingId: string;
  start: number;
  tools: readonly LaboratoryToolNavigationItem[];
}) {
  return (
    <ol aria-labelledby={headingId} className="mt-1" start={start}>
      {tools.map((tool, toolIndex) => {
        const isActive = tool.id === activeToolId;

        return (
          <li className="relative" key={tool.id}>
            {/* The number sits outside the link so the link's accessible
             * name is exactly the tool's title, and it lets clicks through
             * to the link underneath. */}
            <span
              aria-hidden="true"
              className={cn(
                // Pinned to the title's first line (the link's top padding
                // plus a line box of the same 20px height), so on a two-line
                // title the number sits on the first baseline.
                "orbix-data orbix-data--sm pointer-events-none absolute left-3 leading-5",
                dense ? "top-[0.1875rem]" : "top-1.5",
                isActive ? "text-accent" : "text-muted",
              )}
            >
              {formatIndexNumber(start + toolIndex)}
            </span>
            {/* Plain in-page links: the shell listens for the hash change
             * and reveals the tool, so Tab reaches every tool and Enter
             * opens it, with no second mechanism to learn. */}
            <a
              aria-current={isActive ? "location" : undefined}
              className={cn(
                "block border-l-2 pr-3 pl-11 transition-colors focus-visible:outline-offset-[-2px]",
                dense
                  ? "min-h-[1.625rem] py-[0.1875rem] text-[0.84375rem] leading-5"
                  : "min-h-8 py-1.5 text-sm leading-5",
                isActive
                  ? "border-accent bg-surface-raised font-medium text-foreground"
                  : "border-transparent text-text-secondary hover:border-border-control hover:bg-surface-raised hover:text-foreground",
              )}
              data-active={isActive ? "true" : undefined}
              href={`#${tool.id}`}
            >
              {tool.title}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * The full numbered list with every discipline open, for the narrow
 * "Show all tools" disclosure.
 */
function ToolList({
  activeToolId,
  groups,
  idPrefix,
}: {
  activeToolId: string;
  groups: readonly LaboratoryToolGroup[];
  idPrefix: string;
}) {
  const starts = groupStarts(groups);

  return (
    <div className="space-y-4">
      {groups.map((group, groupIndex) => {
        const headingId = `${idPrefix}-${group.id}`;
        const start = starts[groupIndex] ?? 1;

        return (
          <div key={group.id}>
            <p className="flex min-h-7 items-center justify-between gap-3 border-b border-border">
              <span
                className="text-[0.8125rem] leading-5 font-medium text-foreground"
                id={headingId}
              >
                {group.title}
              </span>
              <span
                aria-hidden="true"
                className="orbix-data orbix-data--sm whitespace-nowrap text-muted"
              >
                {groupRange(start, group.tools.length)}
              </span>
            </p>
            <ToolRows
              activeToolId={activeToolId}
              headingId={headingId}
              start={start}
              tools={group.tools}
            />
          </div>
        );
      })}
    </div>
  );
}

/**
 * The desktop index. The open tool's discipline lists every tool, numbered;
 * the other disciplines fold to one line each, a link with the discipline's
 * name and number range that opens its first tool. All 33 tools open would
 * need about 1,100px, so at a 900px-tall window the later disciplines would
 * sit behind an inner scroll; folded, the whole index fits in about 440px.
 * From a 1,376px-tall window (86rem) every discipline shows its rows:
 * all 33 open, with the longer titles wrapping, need about 1,260px of rail.
 * Every tool stays reachable: its discipline link, then its own row, and the
 * narrow select and "Show all tools" list carry the full catalogue.
 */
function DesktopIndex({
  activeToolId,
  groups,
}: {
  activeToolId: string;
  groups: readonly LaboratoryToolGroup[];
}) {
  const starts = groupStarts(groups);
  const listRef = useRef<HTMLDivElement>(null);
  // Set when a folded discipline's header is activated. Following an
  // in-page link drops focus to <body> (the tool frame cannot take focus),
  // so once the shell has opened the tool, focus moves to its row and the
  // next Tab reaches the discipline's second tool.
  const openedFromHeader = useRef(false);

  useEffect(() => {
    const list = listRef.current;
    const activeLink = list?.querySelector<HTMLElement>(
      'a[aria-current="location"]',
    );
    if (openedFromHeader.current) {
      openedFromHeader.current = false;
      activeLink?.focus({ preventScroll: true });
    }
    // On a short window the rail (from 1024px) can still scroll. Scroll only
    // it, like `scrollIntoView({ block: "nearest" })` scoped to the rail, so
    // the page itself never moves when the open tool changes.
    const rail = list?.closest<HTMLElement>("[data-tool-rail]");
    if (
      activeLink === null ||
      activeLink === undefined ||
      rail === null ||
      rail === undefined ||
      rail.scrollHeight <= rail.clientHeight
    ) {
      return;
    }
    const railBox = rail.getBoundingClientRect();
    const linkBox = activeLink.getBoundingClientRect();
    // Keep clear of the 2rem fade at the rail's foot.
    const fade = 32;
    if (linkBox.top < railBox.top) {
      rail.scrollTop -= railBox.top - linkBox.top;
    } else if (linkBox.bottom > railBox.bottom - fade) {
      rail.scrollTop += linkBox.bottom - (railBox.bottom - fade);
    }
  }, [activeToolId]);

  // The top rule and padding match the open tool's card (a 1px rule, then
  // 1.5rem), so the index and the workspace start on one line.
  return (
    <div className="border-t border-border pt-6" ref={listRef}>
      {groups.map((group, groupIndex) => {
        const headingId = `laboratory-tools-${group.id}`;
        const start = starts[groupIndex] ?? 1;
        const range = groupRange(start, group.tools.length);
        const open = group.tools.some((tool) => tool.id === activeToolId);
        const firstTool = group.tools[0];

        return (
          <div className={groupIndex > 0 ? "mt-4" : undefined} key={group.id}>
            {/* A folded discipline's header is a link to its first tool;
             * the open discipline's header is the same element without an
             * href (not a link, no tab stop), so the open list's first row
             * is the only way to its first tool. */}
            <a
              className={cn(
                "flex min-h-7 items-center justify-between gap-3 border-b text-[0.8125rem] leading-5 font-semibold transition-colors focus-visible:outline-offset-2",
                open
                  ? "border-border text-foreground"
                  : "border-border-subtle text-text-secondary hover:border-border-control hover:text-foreground",
              )}
              href={
                open || firstTool === undefined ? undefined : `#${firstTool.id}`
              }
              id={headingId}
              onClick={
                open
                  ? undefined
                  : () => {
                      openedFromHeader.current = true;
                    }
              }
            >
              {/* The range is decorative, so the link and the list it labels
               * are both named by the discipline alone. */}
              <span>{group.title}</span>
              <span
                aria-hidden="true"
                className="orbix-data orbix-data--sm font-normal whitespace-nowrap text-muted"
              >
                {range}
              </span>
            </a>
            {/* Folded disciplines keep their rows mounted but hidden, and a
             * window tall enough for all 33 rows (from 1,376px) shows every
             * discipline open, so the whole numbered index reads at once. */}
            <div
              className={
                open ? undefined : "hidden [@media(min-height:86rem)]:block"
              }
            >
              <ToolRows
                activeToolId={activeToolId}
                dense
                headingId={headingId}
                start={start}
                tools={group.tools}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * The Engineering Lab tool index (spec 9): every tool numbered in B612 Mono,
 * grouped by discipline.
 *
 * From 1024px it is a vertical list of plain in-page links with
 * `aria-current` on the active one, held below the header by the shell;
 * only the open tool's discipline is expanded.
 * Below 1024px it is only a labelled `<select>` in a slim bar under the
 * header; the full list lives in `LaboratoryToolDirectory`, in the page
 * flow above the tool. Every path ends in the URL hash, which
 * `LaboratoryShell` resolves.
 */
export function LaboratoryToolNavigation({
  activeToolId,
  groups,
  onSelect,
}: LaboratoryToolNavigationProps) {
  const starts = groupStarts(groups);

  return (
    <nav aria-label="Engineering Lab tools">
      <div className="flex items-center gap-3 lg:hidden">
        {/* The visible prefix is part of the accessible name
         * ("Choose a tool"), so label-in-name holds. */}
        <span aria-hidden="true" className="orbix-caps shrink-0 text-muted">
          Tool
        </span>
        <label className="sr-only" htmlFor="laboratory-tool-select">
          Choose a tool
        </label>
        <div className="orbix-field__control min-w-0 flex-1">
          <select
            className="orbix-select"
            id="laboratory-tool-select"
            onChange={(event) => onSelect(event.target.value)}
            value={activeToolId}
          >
            {groups.map((group, groupIndex) => (
              <optgroup key={group.id} label={group.title}>
                {group.tools.map((tool, toolIndex) => (
                  <option key={tool.id} value={tool.id}>
                    {`${formatIndexNumber((starts[groupIndex] ?? 1) + toolIndex)} ${tool.title}`}
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

      <div className="hidden lg:block">
        <DesktopIndex activeToolId={activeToolId} groups={groups} />
      </div>
    </nav>
  );
}

/**
 * The full numbered list below 1024px, as a native disclosure in the page
 * flow above the open tool (not in the sticky bar, which holds only the
 * select). It folds itself away once a tool is chosen.
 */
export function LaboratoryToolDirectory({
  activeToolId,
  groups,
}: {
  activeToolId: string;
  groups: readonly LaboratoryToolGroup[];
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (detailsRef.current !== null) {
      detailsRef.current.open = false;
    }
  }, [activeToolId]);

  return (
    <nav aria-label="All Engineering Lab tools" className="lg:hidden">
      <details className="group" ref={detailsRef}>
        <summary
          className={buttonClass({
            className:
              "w-full cursor-pointer list-none justify-between px-0 hover:bg-transparent hover:text-foreground [&::-webkit-details-marker]:hidden",
            variant: "ghost",
          })}
        >
          <span>Show all tools</span>
          <ChevronDown
            aria-hidden="true"
            className="transition-transform group-open:rotate-180"
            size={16}
          />
        </summary>
        <div className="border-t border-border pt-4 pb-2">
          <ToolList
            activeToolId={activeToolId}
            groups={groups}
            idPrefix="laboratory-tools-compact"
          />
        </div>
      </details>
    </nav>
  );
}
