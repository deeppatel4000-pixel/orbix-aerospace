import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Global style guards for design v3 (`docs/design-system/orbix-design-v3.md`).
 *
 * The v1 and v2 decoration stays deleted: no blueprint grid, grain, light
 * field, gradient, mask, shadow or radius above 2px (spec 3). No stylesheet
 * may reintroduce violet, pill radii, pure black, blur or smooth scrolling,
 * and the palette must match the spec 4 table.
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
      /\.(technical-grid|orbix-grid|orbix-starfield|orbix-atmosphere-glow|orbix-light-field|orbix-brand-glow|orbix-carbon|orbix-premium-card|orbix-frame|orbix-blueprint-minor|orbix-reg-marks|orbix-surface|orbix-photo-hero__scrim|orbix-spec-grid|orbix-spec-cell)(?![\w-])/,
    );
  });

  it.each(sheets)(
    "%s has no shadow or clip-path chamfer (spec 3.4)",
    (_, css) => {
      expect(css).not.toMatch(/box-shadow|text-shadow|drop-shadow|clip-path/);
    },
  );

  it.each(sheets)("%s has no gradient or mask (spec 3.1)", (_, css) => {
    expect(css).not.toMatch(/gradient\(|mask-image|mask:/);
  });

  it("draws no page-level texture layer (spec 3.10)", () => {
    expect(foundations).not.toMatch(/body::(before|after)|feTurbulence/);
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

  it.each(sheets)("%s declares no radius above 2px (spec 3.3)", (_, css) => {
    for (const match of css.matchAll(
      /radius[\w-]*:\s*(\d+(?:\.\d+)?)(px|rem)/g,
    )) {
      const px = match[2] === "rem" ? Number(match[1]) * 16 : Number(match[1]);
      expect(px, match[0]).toBeLessThanOrEqual(2);
    }
  });

  it.each(sheets)("%s never forces uppercase (spec 3.6)", (_, css) => {
    expect(css).not.toMatch(/text-transform:\s*uppercase/);
  });
});

describe("palette (spec 4)", () => {
  // The expected values are read from the binding spec rather than repeated
  // here, so the spec table stays the single source of truth.
  const spec = readFileSync(
    join(process.cwd(), "docs/design-system/orbix-design-v3.md"),
    "utf8",
  );
  const tableRows = [
    ...spec.matchAll(/^\|\s*`(--[a-z-]+)`\s*\|\s*`(#[0-9a-f]{6})`\s*\|/gm),
  ].map((match) => [match[1], match[2]] as const);

  it("reads the full palette from the spec", () => {
    expect(tableRows).toHaveLength(10);
  });

  it.each(tableRows)("%s is %s", (token, hex) => {
    expect(tokens).toMatch(new RegExp(String.raw`${token}:\s*${hex};`));
  });

  it("each division overrides --accent", () => {
    for (const division of ["space", "aircraft", "lab"]) {
      expect(tokens).toMatch(
        new RegExp(
          String.raw`\[data-division="${division}"\]\s*\{\s*--accent:\s*var\(--accent-${division}\);`,
        ),
      );
    }
  });

  it("re-resolves accent-derived roles inside every division", () => {
    expect(tokens).toMatch(
      /:root,\s*\[data-division\]\s*\{[^}]*--orbix-accent:\s*var\(--accent\)/,
    );
  });

  it("collapses every v2 surface role onto the page ground (spec 3.2)", () => {
    for (const role of ["--bg-surface", "--bg-raised", "--orbix-surface"]) {
      expect(tokens).toMatch(
        new RegExp(String.raw`${role}:\s*var\(--bg-page\);`),
      );
    }
  });
});

describe("motion (spec 10)", () => {
  it("has no entrance animation", () => {
    for (const [, css] of sheets) {
      expect(css).not.toMatch(/@keyframes orbix-rise|\.orbix-rise/);
    }
  });

  it("removes every transition under reduced motion", () => {
    expect(motion).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*transition:\s*none !important/,
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
