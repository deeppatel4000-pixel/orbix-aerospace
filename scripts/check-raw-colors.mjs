#!/usr/bin/env node
/**
 * Migration-safe raw-colour check.
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
 * `eslint-disable` comments — a large diff through component files that this
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
    "the canonical token source — literal colours are its whole purpose",
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

const current = new Map();
for (const filePath of listFiles(scanRoot)) {
  const key = toPosix(relative(repoRoot, filePath));
  if (allowlist.has(key)) continue;

  const { count, samples } = inspect(filePath);
  if (count > 0) current.set(key, { count, samples });
}

if (process.argv.includes("--update")) {
  const next = Object.fromEntries(
    [...current.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, { count }]) => [key, count]),
  );
  writeFileSync(baselinePath, `${JSON.stringify(next, null, 2)}\n`);
  const total = Object.values(next).reduce((sum, n) => sum + n, 0);
  console.log(
    `Baseline updated: ${Object.keys(next).length} files, ${total} recorded violations.`,
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

const failures = [];
for (const [file, { count, samples }] of current) {
  const allowed = baseline[file] ?? 0;
  if (count > allowed) {
    failures.push({ allowed, count, file, samples });
  }
}

if (failures.length > 0) {
  console.error("\nRaw colour values are not allowed in new component code.\n");
  console.error(
    "Use a semantic token from src/styles/orbix-tokens.css instead — for\n" +
      "example `text-muted`, `border-border`, or `var(--orbix-accent)`.\n",
  );
  for (const { allowed, count, file, samples } of failures) {
    console.error(
      `  ${file}\n    ${allowed} allowed, ${count} found — e.g. ${samples.join(", ")}`,
    );
  }
  console.error(
    "\nIf you have genuinely removed violations elsewhere, re-record the\n" +
      "baseline with: node scripts/check-raw-colors.mjs --update\n",
  );
  process.exit(1);
}

const recorded = Object.values(baseline).reduce((sum, n) => sum + n, 0);
const observed = [...current.values()].reduce(
  (sum, { count }) => sum + count,
  0,
);
console.log(
  `Raw colour check passed — ${observed} known violations across ${current.size} files ` +
    `(baseline allows ${recorded}). No new raw colours.`,
);
