import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Colour-literal guard for the migrated presentation surfaces.
 *
 * The repository-wide ratchet in `scripts/check-raw-colors.mjs` allows a
 * budget: it fails on an increase in the total, so a literal reintroduced here
 * could be paid for by a removal somewhere else and slip through. These files
 * were migrated to semantic tokens against visual evidence, and there is no
 * reason for a literal to come back to any of them, so they are held at zero
 * individually.
 *
 * Scoped deliberately to the fifteen files covered by the four Engineering
 * Laboratory presentation baselines. `visualization/` is NOT included: its
 * colours encode plotted data categories and mission state, and mapping those
 * to tokens is a separate piece of work with different rules.
 */

const MIGRATED_FILES = [
  "briefing-header.tsx",
  "briefing-objectives.tsx",
  "briefing-overview.tsx",
  "briefing-system-summary.tsx",
  "demo-mode.tsx",
  "demo-navigation.tsx",
  "demo-step.tsx",
  "mission-briefing.tsx",
  "mission-showcase.tsx",
  "mission-trade-study.tsx",
  "showcase-phase.tsx",
  "showcase-stage.tsx",
  "showcase-telemetry.tsx",
  "trade-study-card.tsx",
  "trade-study-metrics.tsx",
] as const;

/**
 * Matches the same literal forms the repository ratchet looks for. `color-mix`
 * and `var(--token)` compositions are deliberately not matched — those are the
 * correct way to derive a colour from a token.
 */
const COLOUR_LITERAL = /#[0-9a-fA-F]{3,8}\b|\brgba?\(\s*\d|\bhsla?\(\s*\d/g;

const directory = join(
  process.cwd(),
  "src/features/engineering-lab/components/presentation",
);

describe("migrated presentation surfaces", () => {
  for (const file of MIGRATED_FILES) {
    it(`${file} uses semantic tokens rather than colour literals`, () => {
      const source = readFileSync(join(directory, file), "utf8");
      const found = source.match(COLOUR_LITERAL) ?? [];

      expect(found, `${file} reintroduced ${found.join(", ")}`).toEqual([]);
    });
  }
});
