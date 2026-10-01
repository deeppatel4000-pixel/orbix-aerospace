#!/usr/bin/env node
/**
 * Migration-safe design checks: raw colours, and the design v3 kill list.
 *
 * Two ratchets share one baseline file:
 *
 * 1. RAW COLOURS (below): literal colours outside the token file.
 * 2. KILL LIST (`docs/design-system/orbix-design-v3.md` sections 3 and 12):
 *    gradients, mask fades, shadows, radius utilities above 2px, `gap-px`
 *    compartments and `uppercase`. The shared foundation (`src/styles/`,
 *    `src/components/`) must be at zero with no baseline at all; feature
 *    files may keep the hits they had when v3 started and may not gain any.
 *    The v3 definition of done is an empty `killList` baseline.
 *
 * ## What problem this solves
 *
 * ORBIX has a canonical token system in `src/styles/orbix-tokens.css`, but the
 * audit found ~218 distinct hard-coded colour values across 74 component
 * files. Failing the build on all of them would either block this phase or
 * force a 74-file rewrite into it.
 *
 * So this check freezes the debt instead of failing on it. Every file's
 * current violation count is recorded in `design-debt-baseline.json`. A file
 * may keep the violations it already has; it may not gain new ones, and a file
 * with no recorded debt may not introduce any.
 *
 * ## Why a script rather than an ESLint rule
 *
 * Grandfathering per-file counts in ESLint would mean adding ~74
 * `eslint-disable` comments: a large diff through component files that this
 * phase is explicitly not allowed to touch. This keeps the entire mechanism in
 * two files.
 *
 * ## Guarantees
 *
 * - Reads only the working tree. No git, no diff against a branch, no network.
 * - Works from a clean checkout, identically in CI and locally.
 * - Deterministic: same tree in, same result out.
 *
 * ## Usage
 *
 *   node scripts/check-raw-colors.mjs            # verify (runs in `npm run validate`)
 *   node scripts/check-raw-colors.mjs --update   # re-record the baseline
 *
 * Run `--update` after genuinely removing violations, so the ratchet tightens
 * and the debt cannot come back.
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const baselinePath = join(repoRoot, "design-debt-baseline.json");

/** Only application source is checked. */
const scanRoot = join(repoRoot, "src");
const scanExtensions = [".ts", ".tsx"];

/**
 * Files permitted to declare literal colours, with the reason.
 *
 * Keep this list short. A path belongs here only if it is a colour *source*,
 * not a colour *consumer*.
 */
const allowlist = new Map([
  [
    "src/styles/orbix-tokens.css",
    "the canonical token source; literal colours are its whole purpose",
  ],
  [
    "src/app/opengraph-image.tsx",
    "ImageResponse cannot read CSS custom properties, so the social image mirrors five token values",
  ],
]);

/**
 * Colour literals in component code.
 *
 * - `#abc`, `#aabbcc`, `#aabbccdd`
 * - `rgb(...)` / `rgba(...)` / `hsl(...)` / `hsla(...)` with numeric arguments
 *
 * Deliberately NOT matched: `color-mix(...)` and `var(--token)` compositions,
 * which are the correct way to derive a colour from a token.
 */
const patterns = [/#[0-9a-fA-F]{3,8}\b/g, /\b(?:rgba?|hsla?)\(\s*[\d.]/g];

function listFiles(directory) {
  const found = [];
  for (const entry of readdirSync(directory)) {
    const full = join(directory, entry);
    if (statSync(full).isDirectory()) {
      found.push(...listFiles(full));
      continue;
    }
    if (scanExtensions.some((extension) => entry.endsWith(extension))) {
      found.push(full);
    }
  }
  return found;
}

/** Violations in one file, as a count plus a sample for the error message. */
function inspect(filePath) {
  const source = readFileSync(filePath, "utf8");
  const matches = patterns.flatMap((pattern) => [...source.matchAll(pattern)]);

  return {
    count: matches.length,
    samples: [...new Set(matches.map((match) => match[0].trim()))].slice(0, 5),
  };
}

function toPosix(pathValue) {
  return pathValue.split(sep).join("/");
}

/* ------------------------------------------------------------------ *
 * KILL LIST (spec 3, 12)
 * ------------------------------------------------------------------ */

const killScanExtensions = [".ts", ".tsx", ".css"];

/** Paths that must be at zero, with no baseline. */
const killListStrictPrefixes = ["src/styles/", "src/components/"];

const killPatterns = [
  ["gradient", /\b(?:repeating-)?(?:linear|radial|conic)-gradient\(/g],
  ["svg gradient", /<(?:linear|radial)Gradient\b/g],
  ["tailwind gradient", /\bbg-(?:gradient|linear|radial|conic)-/g],
  ["mask-image", /\bmask-image\b|\bmask-(?:linear|radial|conic)-/g],
  ["box-shadow", /\bbox-shadow\s*:(?!\s*none)/g],
  [
    "shadow utility",
    /(?<![\w-])(?:inset-)?shadow-(?:\[|2xs|xs|sm|md|lg|xl|2xl)\b/g,
  ],
  ["drop-shadow", /\bdrop-shadow\b|<feDropShadow\b/g],
  ["text-shadow", /\btext-shadow\b(?!\s*:\s*none)/g],
  [
    "radius > 2px",
    /\brounded(?:-[trblse]{1,2})?-(?:md|lg|xl|2xl|3xl|4xl|full)\b/g,
  ],
  ["bare shadow utility", /(?<![\w-])shadow(?![\w-])/g],
  [
    "arbitrary radius > 2px",
    /\brounded(?:-[trblse]{1,2})?-\[(?!(?:0|0px|1px|2px|var\(--radius-(?:0|1|2|photo)\))\])[^\]]*\]/g,
  ],
  [
    "css radius > 2px",
    /\bborder-(?:[a-z-]+-)?radius\s*:\s*(?![\s0]|1px|2px|var\(--radius-(?:0|1|2|photo|circle)\)|inherit)[^;}]*/g,
  ],
  ["mask", /(?<![\w-])(?:-webkit-)?mask\s*:/g],
  ["gap-px", /\bgap-(?:[xy]-)?px\b/g],
  ["uppercase", /\buppercase\b/g],
];

function isTestFile(key) {
  return /\.test\.[cm]?[jt]sx?$/.test(key) || key.includes("/__tests__/");
}

/** Drops block and line comments so a comment naming a rule never counts. */
function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
}

function inspectKillList(filePath) {
  const source = stripComments(readFileSync(filePath, "utf8"));
  const hits = [];
  for (const [name, pattern] of killPatterns) {
    for (const match of source.matchAll(pattern))
      hits.push(`${name}: ${match[0]}`);
  }
  return { count: hits.length, samples: [...new Set(hits)].slice(0, 5) };
}

function listKillFiles(directory) {
  const found = [];
  for (const entry of readdirSync(directory)) {
    const full = join(directory, entry);
    if (statSync(full).isDirectory()) {
      found.push(...listKillFiles(full));
      continue;
    }
    if (killScanExtensions.some((extension) => entry.endsWith(extension))) {
      found.push(full);
    }
  }
  return found;
}

const currentKill = new Map();
for (const filePath of listKillFiles(scanRoot)) {
  const key = toPosix(relative(repoRoot, filePath));
  if (isTestFile(key)) continue;
  const { count, samples } = inspectKillList(filePath);
  if (count > 0) currentKill.set(key, { count, samples });
}

/* ------------------------------------------------------------------ *
 * RAW COLOURS
 * ------------------------------------------------------------------ */

const current = new Map();
for (const filePath of listFiles(scanRoot)) {
  const key = toPosix(relative(repoRoot, filePath));
  if (allowlist.has(key)) continue;

  const { count, samples } = inspect(filePath);
  if (count > 0) current.set(key, { count, samples });
}

function sortedCounts(map, skip = () => false) {
  return Object.fromEntries(
    [...map.entries()]
      .filter(([key]) => !skip(key))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, { count }]) => [key, count]),
  );
}

const isStrict = (key) =>
  killListStrictPrefixes.some((prefix) => key.startsWith(prefix));

if (process.argv.includes("--update")) {
  const rawColors = sortedCounts(current);
  // Strict paths are never baselined: they must be fixed, not recorded.
  const killList = sortedCounts(currentKill, isStrict);
  writeFileSync(
    baselinePath,
    `${JSON.stringify({ killList, rawColors }, null, 2)}\n`,
  );
  const sum = (object) => Object.values(object).reduce((a, n) => a + n, 0);
  console.log(
    `Baseline updated: raw colours ${Object.keys(rawColors).length} files, ${sum(rawColors)} violations; ` +
      `kill list ${Object.keys(killList).length} files, ${sum(killList)} hits.`,
  );
  process.exit(0);
}

let baseline;
try {
  baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
} catch {
  console.error(
    `Missing or unreadable ${toPosix(relative(repoRoot, baselinePath))}.\n` +
      `Create it with: node scripts/check-raw-colors.mjs --update`,
  );
  process.exit(1);
}

const rawBaseline = baseline.rawColors ?? {};
const killBaseline = baseline.killList ?? {};

const failures = [];
for (const [file, { count, samples }] of current) {
  const allowed = rawBaseline[file] ?? 0;
  if (count > allowed) {
    failures.push({ allowed, count, file, samples });
  }
}

const killFailures = [];
for (const [file, { count, samples }] of currentKill) {
  const allowed = isStrict(file) ? 0 : (killBaseline[file] ?? 0);
  if (count > allowed) {
    killFailures.push({ allowed, count, file, samples });
  }
}

if (failures.length > 0) {
  console.error("\nRaw colour values are not allowed in new component code.\n");
  console.error(
    "Use a semantic token from src/styles/orbix-tokens.css instead, for\n" +
      "example `text-muted`, `border-rule`, or `var(--orbix-accent)`.\n",
  );
  for (const { allowed, count, file, samples } of failures) {
    console.error(
      `  ${file}\n    ${allowed} allowed, ${count} found, e.g. ${samples.join(", ")}`,
    );
  }
}

if (killFailures.length > 0) {
  console.error(
    "\nDesign v3 kill list (orbix-design-v3.md sections 3 and 12): no\n" +
      "gradients, masks, shadows, radius above 2px, gap-px or uppercase.\n" +
      "src/styles and src/components must be at zero.\n",
  );
  for (const { allowed, count, file, samples } of killFailures) {
    console.error(
      `  ${file}\n    ${allowed} allowed, ${count} found, e.g. ${samples.join("; ")}`,
    );
  }
}

if (failures.length > 0 || killFailures.length > 0) {
  console.error(
    "\nIf you have genuinely removed violations elsewhere, re-record the\n" +
      "baseline with: node scripts/check-raw-colors.mjs --update\n",
  );
  process.exit(1);
}

const total = (map) =>
  [...map.values()].reduce((sum, { count }) => sum + count, 0);
console.log(
  `Raw colour check passed: ${total(current)} known violations across ${current.size} files. ` +
    `Kill list check passed: ${total(currentKill)} known hits across ${currentKill.size} feature files ` +
    `(target 0). Nothing new.`,
);
