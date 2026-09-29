"use client";

import { createContext, useContext, type ReactNode } from "react";

import { cn } from "@/lib/cn";

type HeadingTag = "h2" | "h3" | "h4" | "h5" | "h6";

/**
 * The heading level a mission tool's own title takes. A tool card's title is
 * the H2, so a component placed directly in a tool starts at H3. A parent
 * that nests a component one step deeper (the viewer inside Mission control,
 * the scene inside the replay) wraps it in `HeadingLevel` so the outline
 * never inverts (WCAG 1.3.1).
 */
const HeadingLevelContext = createContext(3);

export function useHeadingLevel(): number {
  return useContext(HeadingLevelContext);
}

export function HeadingLevel({
  children,
  level,
}: {
  readonly children: ReactNode;
  readonly level: number;
}) {
  return (
    <HeadingLevelContext.Provider value={Math.min(Math.max(level, 2), 6)}>
      {children}
    </HeadingLevelContext.Provider>
  );
}

/** Title sizes follow the level; a sub-head is always 15px/600. */
const TITLE_CLASS: Readonly<Record<number, string>> = {
  2: "orbix-h2",
  3: "orbix-h3",
  4: "orbix-h4",
};
const SUB_HEAD_CLASS = "text-[0.9375rem] leading-6 font-semibold";

export interface LabHeadingProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly id?: string;
  /** Steps below the current level: 0 for a component's title, 1 for its parts. */
  readonly offset?: number;
  /** `title` sizes by level; `sub` is the 15px/600 sub-head at any level. */
  readonly variant?: "title" | "sub";
}

export function LabHeading({
  children,
  className,
  id,
  offset = 0,
  variant = "title",
}: LabHeadingProps) {
  const level = Math.min(useHeadingLevel() + offset, 6);
  const Tag = `h${level}` as HeadingTag;
  const sizeClass =
    variant === "sub" ? SUB_HEAD_CLASS : (TITLE_CLASS[level] ?? SUB_HEAD_CLASS);

  return (
    <Tag className={cn(sizeClass, "text-foreground", className)} id={id}>
      {children}
    </Tag>
  );
}
