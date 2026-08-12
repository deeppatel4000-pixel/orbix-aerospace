import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * The shared technical grid must never mask its own content again.
 *
 * `.technical-grid` / `.orbix-grid` once ended with
 * `mask-image: linear-gradient(to bottom, black 8%, transparent 94%)`. A CSS
 * mask applies to the element AND every descendant, and twenty-one of the
 * thirty-six usages are content containers — the Compare empty state, Mission
 * Control panels, the mission tiles, both explorer empty states. Their text and
 * controls faded toward the bottom of the card.
 *
 * Scoped deliberately to this one declaration. Gradients are not banned
 * anywhere else: the photographic scrims in `vehicle-media-frame.tsx` and the
 * vehicle visual panels darken IMAGES so overlaid text stays legible, which is
 * the opposite problem and must keep working.
 */

const FOUNDATIONS = join(process.cwd(), "src/styles/orbix-foundations.css");

/** The shared declaration body, comments stripped. */
function sharedGridRule(): string {
  const source = readFileSync(FOUNDATIONS, "utf8");
  const match = source.match(
    /\.technical-grid,\s*\.orbix-grid\s*\{([\s\S]*?)\n {2}\}/,
  );

  expect(match, "the shared technical-grid rule should exist").not.toBeNull();
  return (match?.[1] ?? "").replace(/\/\*[\s\S]*?\*\//g, "");
}

describe("shared technical grid", () => {
  it("does not mask the element it is applied to", () => {
    const rule = sharedGridRule();

    expect(rule.match(/(?<!-)\bmask-image\s*:/g) ?? []).toEqual([]);
    expect(rule.match(/-webkit-mask-image\s*:/g) ?? []).toEqual([]);
    expect(rule.match(/\bmask\s*:/g) ?? []).toEqual([]);
  });

  it("still draws the grid", () => {
    // The fix removes the fade, not the treatment.
    expect(sharedGridRule()).toContain("background-image");
  });
});
