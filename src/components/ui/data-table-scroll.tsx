"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface DataTableScrollProps {
  /** The id of the visible caption, which names the scroll region. */
  captionId: string;
  children: ReactNode;
}

/**
 * The scroll box of a `DataTable`, and a plain text line under it while
 * the table is wider than the box: "Scroll sideways for 3 more columns".
 * The scrollbar alone is not a reliable cue (iOS overlay scrollbars hide
 * it), and spec 3.1 rules out a fade. The count is the number of columns
 * whose header does not fit the box at its start, measured again whenever
 * the box or the table changes size. Server-rendered without the line,
 * which appears only once a column is actually cut off.
 */
export function DataTableScroll({ captionId, children }: DataTableScrollProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState(0);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    const measure = () => {
      const left = box.getBoundingClientRect().left - box.scrollLeft;
      const limit = box.clientWidth + 1;
      let cut = 0;
      for (const header of box.querySelectorAll<HTMLElement>("thead th")) {
        const rect = header.getBoundingClientRect();
        if (rect.width > 0 && rect.right - left > limit) cut += 1;
      }
      setMore(cut);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    const table = box.querySelector("table");
    if (table) observer.observe(table);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div
        aria-labelledby={captionId}
        className="orbix-data-table__scroll"
        ref={boxRef}
        role="region"
        tabIndex={0}
      >
        {children}
      </div>
      {more > 0 ? (
        <p className="orbix-data-table__hint" data-scroll-hint="">
          Scroll sideways for {more} more {more === 1 ? "column" : "columns"}
        </p>
      ) : null}
    </>
  );
}
