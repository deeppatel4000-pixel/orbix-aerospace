"use client";

import { useEffect, useRef, useState } from "react";

import { Container } from "@/components/layout/container";

export interface ProfileNavItem {
  readonly id: string;
  readonly label: string;
}

interface ProfileSectionNavProps {
  items: readonly ProfileNavItem[];
}

/**
 * The reading line never sits above 144px: the 64px header, this 46px bar
 * and room below them, past the sections' 128px scroll margin plus their
 * 1px top rule, so a section jumped to is the one marked.
 */
const READING_LINE_MIN_PX = 144;

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
 * "On this page" (spec 9): a sticky hairline bar under the site header with
 * B612 Mono labels. Plain anchor links; the section being read (the last
 * one whose top has passed a reading line 40% down the viewport, or the
 * one just jumped to from this bar) gets `aria-current="location"` and a
 * 2px accent rule. Without JavaScript the
 * links still work and simply show no current item. On narrow screens the
 * row scrolls sideways inside the bar, never the page.
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
      // header, this bar and a section's 128px scroll margin plus its rule.
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
    <div className="sticky top-16 z-30 border-y border-border bg-page">
      <Container>
        {/*
         * The row scrolls sideways inside the bar on narrow screens, with no
         * scrollbar chrome: overflow-y is clipped (an overflow-x box would
         * otherwise compute overflow-y to auto) and the scrollbar is hidden.
         * Below 64rem the right edge fades so the clipped labels still read
         * as more to scroll to.
         */}
        <nav
          aria-label="On this page"
          className="-mx-3 [scrollbar-width:none] overflow-x-auto overflow-y-hidden max-lg:[mask-image:linear-gradient(90deg,#000_calc(100%-1.5rem),transparent)] [&::-webkit-scrollbar]:hidden"
        >
          {/* The end padding lets the last label scroll clear of the fade. */}
          <ul className="flex min-w-max max-lg:pr-8">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  aria-current={item.id === currentId ? "location" : undefined}
                  // The 2px accent rule is an inset shadow, so it is drawn
                  // inside the 44px box and never pushes the row past the
                  // bar (which would show a scrollbar).
                  className="orbix-caps flex min-h-11 items-center px-3 whitespace-nowrap text-text-secondary transition-[color,box-shadow] duration-(--motion-fast) ease-(--motion-ease) hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[color:var(--orbix-focus)] aria-[current=location]:text-foreground aria-[current=location]:shadow-[inset_0_-2px_0_var(--orbix-accent)] motion-reduce:transition-none"
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
      </Container>
    </div>
  );
}
