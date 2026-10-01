import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSource(file: string): string {
  return readFileSync(path.join(process.cwd(), file), "utf8");
}

describe("compare row education lab links", () => {
  it("points every link at a tool on the lab page, named by its heading", () => {
    // Neither the lab's MODULES map nor the row maps are exported, so both
    // sources are read (as in Learn's matching test): a link whose tool is
    // renamed, merged or taken off the page fails here.
    const dashboard = readSource(
      "src/features/engineering-lab/components/engineering-dashboard.tsx",
    );
    const start = dashboard.indexOf("const MODULES = {");
    expect(start, "MODULES map not found").not.toBe(-1);
    const end = dashboard.indexOf("} as const", start);
    const titles = new Map<string, string>();
    for (const match of dashboard
      .slice(start, end)
      .matchAll(/^ {2}"([a-z0-9-]+)": \{[\s\S]*?title:\s*"([^"]+)"/gm)) {
      if (match[1] && match[2]) titles.set(match[1], match[2]);
    }

    const links = [
      ...readSource("src/features/compare/education/row-education.ts").matchAll(
        /anchor:\s*"([a-z0-9-]+)",\s*label:\s*"([^"]+)"/g,
      ),
    ];

    expect(titles.size).toBeGreaterThan(0);
    expect(links.length).toBeGreaterThan(0);
    for (const [, anchor, label] of links) {
      expect(titles.get(anchor ?? ""), anchor).toBe(label);
    }
  });
});
