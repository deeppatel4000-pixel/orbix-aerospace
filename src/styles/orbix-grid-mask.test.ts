import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Global style guards for design v2 (`docs/design-system/orbix-design-v2.md`).
 *
 * The v1 decoration classes stay deleted (the v2 blueprint grid lives on
 * `body::before` and `.orbix-blueprint-minor`, and the grain on
 * `body::after`). No stylesheet may reintroduce violet, pill radii, pure
 * black, blur or smooth scrolling, and the palette must match spec 4.
 */

const stylesDir = join(process.cwd(), "src/styles");
const readRaw = (file: string) => readFileSync(join(stylesDir, file), "utf8");
const read = (file: string) => readRaw(file).replace(/\/\*[\s\S]*?\*\//g, "");

const sheets = [
  "orbix-tokens.css",
  "orbix-foundations.css",
  "orbix-components.css",
  "orbix-motion.css",
].map((file) => [file, read(file)] as const);

const tokens = read("orbix-tokens.css");
const foundations = read("orbix-foundations.css");
const motion = read("orbix-motion.css");

describe("deleted decoration", () => {
  it.each(sheets)("%s defines no v1 star field or glow class", (_, css) => {
    expect(css).not.toMatch(
      /\.(technical-grid|orbix-grid|orbix-starfield|orbix-atmosphere-glow|orbix-light-field|orbix-brand-glow|orbix-carbon|orbix-premium-card|orbix-frame)(?![\w-])/,
    );
  });

  it.each(sheets)("%s has no glow shadow or clip-path chamfer", (_, css) => {
    expect(css).not.toMatch(/box-shadow:\s*0 0 \d/);
    expect(css).not.toMatch(/drop-shadow\(|clip-path/);
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

  it.each(sheets)("%s declares no radius above 12px", (_, css) => {
    for (const match of css.matchAll(
      /radius[\w-]*:\s*(\d+(?:\.\d+)?)(px|rem)/g,
    )) {
      const px = match[2] === "rem" ? Number(match[1]) * 16 : Number(match[1]);
      expect(px, match[0]).toBeLessThanOrEqual(12);
    }
  });
});

describe("palette (spec 4)", () => {
  // The expected values are read from the binding spec rather than repeated
  // here, so the spec table stays the single source of truth.
  const spec = readFileSync(
    join(process.cwd(), "docs/design-system/orbix-design-v2.md"),
    "utf8",
  );
  const tableRows = [
    ...spec.matchAll(/^\|\s*`(--[a-z-]+)`\s*\|\s*`(#[0-9a-f]{6})`\s*\|/gm),
  ].map((match) => [match[1], match[2]] as const);
  const statusRows = [
    ...spec.matchAll(/(success|warning|danger) `(#[0-9a-f]{6})`/g),
  ].map((match) => [`--status-${match[1]}`, match[2]] as const);
  const expected = [...tableRows, ...statusRows];

  it("reads the full palette from the spec", () => {
    expect(tableRows).toHaveLength(13);
    expect(statusRows).toHaveLength(3);
  });

  it.each(expected)("%s is %s", (token, hex) => {
    expect(tokens).toMatch(new RegExp(`${token}:\\s*${hex};`));
  });

  it("each division overrides --accent", () => {
    for (const division of ["space", "aircraft", "lab"]) {
      expect(tokens).toMatch(
        new RegExp(
          `\\[data-division="${division}"\\]\\s*\\{\\s*--accent:\\s*var\\(--accent-${division}\\);`,
        ),
      );
    }
  });

  it("re-resolves accent-derived roles inside every division", () => {
    expect(tokens).toMatch(
      /:root,\s*\[data-division\]\s*\{[^}]*--orbix-accent:\s*var\(--accent\)/,
    );
  });
});

describe("texture (spec 6)", () => {
  it("draws the blueprint grid and grain on fixed, non-interactive layers", () => {
    expect(foundations).toMatch(
      /body::before,\s*body::after\s*\{[^}]*pointer-events:\s*none;[^}]*position:\s*fixed;/,
    );
    expect(foundations).toMatch(/feTurbulence/);
  });

  it("keeps the texture static", () => {
    const layers = foundations.match(/body::(before|after)\s*\{[^}]*\}/g) ?? [];
    expect(layers.length).toBeGreaterThan(0);
    for (const layer of layers) {
      expect(layer).not.toMatch(/animation|transition/);
    }
  });
});

describe("motion (spec 7)", () => {
  it("runs the hero entrance only when motion is allowed", () => {
    const allowed =
      motion.match(
        /@media \(prefers-reduced-motion: no-preference\)\s*\{[\s\S]*?\n\}/,
      )?.[0] ?? "";
    expect(allowed).toMatch(/\.orbix-rise > \*/);

    const outside = motion.replace(allowed, "");
    expect(outside).not.toMatch(
      /\.orbix-rise > \*\s*\{\s*animation: orbix-rise/,
    );
  });

  it.each(sheets)(
    "%s has no infinite animation except the spinner",
    (file, css) => {
      const infinite = [...css.matchAll(/[^{}]+\{[^{}]*infinite[^{}]*\}/g)].map(
        (match) => match[0],
      );
      for (const rule of infinite) {
        expect(rule, file).toMatch(/\.orbix-spinner/);
      }
    },
  );

  it.each(sheets)("%s never eases UI transitions linearly", (_, css) => {
    expect(css).not.toMatch(/transition[^;]*\blinear\b/);
  });
});
