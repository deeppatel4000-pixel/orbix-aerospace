"use client";

import { useEffect, useRef, useState } from "react";

/** Figure text size, CSS pixels: above the 13px minimum (v4 plan 5). */
export const FIGURE_TEXT_PX = 14;

/**
 * A drawing scales with its column, so text sized in viewBox units renders
 * smaller on a phone. This measures the rendered width and returns the font
 * size in user units that renders at 14 CSS pixels at every width.
 * `fallback` is used before measurement (server render).
 */
export function useFigureFontSize(viewWidth: number, fallback: number) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [fontSize, setFontSize] = useState(fallback);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || typeof ResizeObserver === "undefined") return;

    const update = (width: number) => {
      if (width <= 0) return;
      setFontSize((FIGURE_TEXT_PX * viewWidth) / width);
    };
    update(svg.getBoundingClientRect().width);
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) update(entry.contentRect.width);
    });
    observer.observe(svg);
    return () => observer.disconnect();
  }, [fallback, viewWidth]);

  return { fontSize, svgRef };
}
