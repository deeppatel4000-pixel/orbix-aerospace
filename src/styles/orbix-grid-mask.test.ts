import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Global style guards for the 2026 redesign (spec 1, 15.1).
 *
 * The decorative grid, star field and glow classes have been deleted, and no
 * stylesheet may reintroduce them, the deleted violet token, pill radii, pure
 * black, blur, or smooth scrolling.
 */

const stylesDir = join(process.cwd(), "src/styles");
const read = (file: string) =>
  readFileSync(join(stylesDir, file), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

const sheets = [
  "orbix-tokens.css",
  "orbix-foundations.css",
  "orbix-components.css",
  "orbix-motion.css",
].map((file) => [file, read(file)] as const);

describe("deleted decoration", () => {
  it.each(sheets)("%s defines no grid, star field or glow class", (_, css) => {
    expect(css).not.toMatch(
      /\.(technical-grid|orbix-grid|orbix-starfield|orbix-atmosphere-glow|orbix-light-field|orbix-brand-glow|orbix-carbon|orbix-premium-card)(?![\w-])/,
    );
  });
});

describe("global style hard rules", () => {
  it.each(sheets)("%s has no violet, purple, indigo or fuchsia", (_, css) => {
    expect(css).not.toMatch(/plasma|violet|purple|indigo|fuchsia/i);
  });

  it.each(sheets)("%s has no pill radius", (_, css) => {
    expect(css).not.toMatch(/999px|9999px/);
  });

  it.each(sheets)("%s never uses pure black", (_, css) => {
    expect(css).not.toMatch(/#0{6}\b|#0{3}\b|rgb\(0 0 0|\bblack\b/i);
  });

  it.each(sheets)("%s has no blur or smooth scrolling", (_, css) => {
    expect(css).not.toMatch(/backdrop-filter|blur\(|scroll-behavior:\s*smooth/);
  });
});
