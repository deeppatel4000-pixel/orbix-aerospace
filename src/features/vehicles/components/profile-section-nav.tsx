"use client";

import { useEffect, useRef, useState } from "react";

export interface ProfileNavItem {
  readonly id: string;
  readonly label: string;
}

interface ProfileSectionNavProps {
  items: readonly ProfileNavItem[];
}

/**
 * The reading line never sits above 112px: the 64px header and room below
 * it, past the sections' 96px scroll margin plus their 1px top rule, so a
 * section jumped to is the one marked.
 */
const READING_LINE_MIN_PX = 112;

/** Keys that scroll the page, which end a jump's pinned section. */
const SCROLL_KEYS = new Set([
  " ",
  "ArrowDown",
  "ArrowUp",
  "End",
  "Home",
  "PageDown",
  "PageUp",
]);

/**
 * "On this page" (spec 9): a plain list of anchor links, no rules, no
 * numbers. From 64rem it sticks in its own column beside the sections, so
 * it never covers them; below 64rem it wraps once above them. The section
 * being read (the last one whose top has passed a reading line 40% down
 * the viewport, or the one just jumped to) gets `aria-current="location"`,
 * shown by colour and weight only. Without JavaScript the links still work
 * and simply show no current item.
 */
export function ProfileSectionNav({ items }: ProfileSectionNavProps) {
  const [currentId, setCurrentId] = useState<string | undefined>(undefined);
  // A section jumped to from this bar stays current until the reader
  // scrolls by hand, even when it is too short to reach the reading line
  // (near the end of the page) or the next one crosses it at once.
  const pinnedId = useRef<string | undefined>(undefined);

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => section !== null);

    if (sections.length === 0) return undefined;

    let frame = 0;

    const update = () => {
      frame = 0;
      if (pinnedId.current) {
        setCurrentId(pinnedId.current);
        return;
      }
      // The reading line: 40% down the viewport, and never above the
      // header and a section's 96px scroll margin plus its rule.
      const line = Math.max(READING_LINE_MIN_PX, window.innerHeight * 0.4);
      let current: string | undefined;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= line) current = section.id;
        else break;
      }
      setCurrentId(current);
    };

    const schedule = () => {
      if (frame === 0) frame = window.requestAnimationFrame(update);
    };

    const unpin = () => {
      if (pinnedId.current === undefined) return;
      pinnedId.current = undefined;
      schedule();
    };

    const onHashChange = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (sections.some((section) => section.id === id)) {
        pinnedId.current = id;
        schedule();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (SCROLL_KEYS.has(event.key)) unpin();
    };

    if (window.location.hash) onHashChange();
    else schedule();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("wheel", unpin, { passive: true });
    window.addEventListener("touchmove", unpin, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      if (frame !== 0) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("wheel", unpin);
      window.removeEventListener("touchmove", unpin);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [items]);

  return (
    <nav
      aria-labelledby="profile-contents-label"
      className="lg:sticky lg:top-24"
    >
      <p className="orbix-label" id="profile-contents-label">
        On this page
      </p>
      <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1 lg:flex-col lg:gap-y-1.5">
        {items.map((item) => (
          <li key={item.id}>
            <a
              aria-current={item.id === currentId ? "location" : undefined}
              className="inline-flex min-h-8 items-center text-[0.9375rem] text-muted underline-offset-[3px] transition-colors duration-(--motion-fast) ease-(--motion-ease) hover:text-foreground hover:underline aria-[current=location]:font-semibold aria-[current=location]:text-foreground motion-reduce:transition-none"
              href={`#${item.id}`}
              onClick={() => {
                pinnedId.current = item.id;
                setCurrentId(item.id);
              }}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
