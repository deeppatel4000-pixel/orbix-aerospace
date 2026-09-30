"use client";

import { useEffect, useRef, useState } from "react";

/** Rendered size of figure annotation text, CSS pixels (spec 5 labels). */
const ANNOTATION_PX = 11;

/**
 * A figure scales with its column, so a fixed size in viewBox units renders
 * smaller on a phone. This measures the drawing's rendered width and returns
 * the font size in user units that renders at 11 CSS pixels.
 *
 * `minimum` (default) never goes below 11 CSS px but lets the text grow with
 * a drawing rendered wider than its viewBox. `exact` holds 11 CSS px at every
 * width.
 */
export function useAnnotationFontSize(
  enabled: boolean,
  viewWidth: number,
  mode: "minimum" | "exact" = "minimum",
) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [fontSize, setFontSize] = useState(ANNOTATION_PX);
  // False until the drawing has been measured on the client. Before that
  // (server render, or while the page hydrates) a caller can hold the
  // 11px floor with container-query CSS instead.
  const [measured, setMeasured] = useState(false);

  useEffect(() => {
    const svg = svgRef.current;
    if (!enabled || !svg || typeof ResizeObserver === "undefined") return;

    function update(width: number) {
      if (width <= 0) return;
      const exact = (ANNOTATION_PX * viewWidth) / width;
      setFontSize(mode === "exact" ? exact : Math.max(ANNOTATION_PX, exact));
      setMeasured(true);
    }

    update(svg.getBoundingClientRect().width);
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) update(entry.contentRect.width);
    });
    observer.observe(svg);
    return () => observer.disconnect();
  }, [enabled, mode, viewWidth]);

  return { fontSize, measured, svgRef };
}
