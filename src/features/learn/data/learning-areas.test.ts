import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { listAircraft } from "@/features/aircraft/data";
import {
  listDeferredLearningAreas,
  listLearningAreas,
} from "@/features/learn/data";
import { listRockets } from "@/features/rockets/data";

/**
 * Learn's content freeze.
 *
 * The 2026 redesign rewrote the copy and presentation of the pathways but kept
 * every pathway id and every destination they point at. Presentation work is exactly where content quietly goes
 * missing (a list that stops rendering its tail, a link that loses its href),
 * so the dataset's shape is pinned here rather than inferred from the page.
 *
 * These assertions are deliberately about identity and reachability, not copy.
 * Editorial wording is free to change; the set of pathways, their ids, and
 * every destination they point at are not.
 */

/** Pathways shown on /learn (v4 plan section 8: 1, 2, 3 and 5). */
const EXPECTED_PATHWAY_IDS = [
  "aerodynamics-flight-fundamentals",
  "propulsion-vehicle-performance",
  "high-speed-compressible-flow",
  "orbital-mechanics-mission-design",
] as const;

/** Pathways kept in the data but deferred from the page (4 and 6). */
const EXPECTED_DEFERRED_IDS = [
  "atmospheric-entry-thermal-protection",
  "mission-operations-engineering-communication",
] as const;

describe("learning areas", () => {
  const areas = listLearningAreas();
  const deferred = listDeferredLearningAreas();
  const everyArea = [...areas, ...deferred];

  it("shows four pathways, in order, and keeps the two deferred ones", () => {
    expect(areas.map((area) => area.id)).toEqual([...EXPECTED_PATHWAY_IDS]);
    expect(deferred.map((area) => area.id)).toEqual([...EXPECTED_DEFERRED_IDS]);
  });

  it("has no duplicate pathway ids or titles", () => {
    const ids = everyArea.map((area) => area.id);
    const titles = everyArea.map((area) => area.title);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("keeps every laboratory anchor, each one unique", () => {
    const anchors = areas.flatMap((area) =>
      area.labAnchors.map((anchor) => anchor.anchorId),
    );

    // Thirteen distinct Engineering Lab modules are linked from the page.
    expect(anchors).toHaveLength(13);
    expect(new Set(anchors).size).toBe(13);
  });

  it("labels every laboratory anchor with the module heading it points at", () => {
    // The Engineering Lab keeps each module heading in one MODULES map in
    // engineering-dashboard.tsx. It is not exported, so the source is read
    // here: renaming a lab module without updating Learn fails this test.
    const source = readFileSync(
      path.join(
        process.cwd(),
        "src/features/engineering-lab/components/engineering-dashboard.tsx",
      ),
      "utf8",
    );
    const start = source.indexOf("const MODULES = {");
    expect(
      start,
      "MODULES map not found in engineering-dashboard.tsx",
    ).not.toBe(-1);
    const block = source.slice(start);
    const headings = new Map<string, string>();
    const entry = /^  "([a-z0-9-]+)": \{[\s\S]*?title:\s*"([^"]+)"/gm;
    for (const match of block.matchAll(entry)) {
      if (match[1] && match[2]) headings.set(match[1], match[2]);
    }

    for (const anchor of areas.flatMap((area) => area.labAnchors)) {
      expect(headings.get(anchor.anchorId), anchor.anchorId).toBe(anchor.label);
    }
  });

  it("writes equation subscripts as _x, never as Unicode subscript digits", () => {
    // B612 Mono has no glyphs for U+2080 to U+2089, so "m₀" falls back to a
    // different face. "_0" renders as a real <sub>, as on /engineering-lab.
    const unicodeSubscript = /[₀-₉]/;
    for (const idea of everyArea.flatMap((area) => area.keyIdeas)) {
      const fields = [
        idea.text,
        idea.equation ?? "",
        ...(idea.variables ?? []).flatMap((variable) => [
          variable.symbol,
          variable.unit ?? "",
        ]),
      ];
      for (const value of fields) {
        expect(unicodeSubscript.test(value), value).toBe(false);
      }
    }
  });

  it("keeps every exploration link", () => {
    const links = areas.flatMap((area) => area.explorationLinks);

    expect(links).toHaveLength(5);
    for (const link of links) {
      expect(link.href.startsWith("/"), `${link.href} should be internal`).toBe(
        true,
      );
      expect(link.label.trim()).not.toBe("");
      expect(link.description.trim()).not.toBe("");
    }
  });

  it("points every vehicle link at a vehicle that exists", () => {
    // A pathway promising a specific aircraft or launch vehicle must not link
    // to one the registry does not hold: that would be a broken promise the
    // route makes on another feature's behalf.
    const vehicleIds = new Set([
      ...listAircraft().map((aircraft) => aircraft.id),
      ...listRockets().map((rocket) => rocket.id),
    ]);

    for (const area of areas) {
      for (const link of area.explorationLinks) {
        const [path] = link.href.split("?");
        const segments = (path ?? "").split("/").filter(Boolean);
        const isVehicleProfile =
          segments.length === 2 &&
          (segments[0] === "aircraft" || segments[0] === "rockets");

        if (!isVehicleProfile) continue;
        expect(
          vehicleIds.has(segments[1] ?? ""),
          `${link.href} names a vehicle that does not exist`,
        ).toBe(true);
      }
    }
  });

  it("gives every pathway the fields its presentation renders", () => {
    for (const area of areas) {
      expect(area.title.trim()).not.toBe("");
      expect(area.summary.trim()).not.toBe("");
      expect(area.whyItMatters.trim()).not.toBe("");
      expect(area.keyIdeas.length).toBeGreaterThan(0);
      expect(area.labAnchors.length).toBeGreaterThan(0);
      expect(area.furtherReading.length).toBeGreaterThan(0);
    }
  });

  it("names, voices and explains every equation it shows", () => {
    // Each equation renders as an EquationBlock: a label, a spoken form for
    // screen readers, and a legend that defines every symbol.
    for (const idea of everyArea.flatMap((area) => area.keyIdeas)) {
      if (idea.equation === undefined) continue;
      expect(idea.equationLabel?.trim(), idea.equation).toBeTruthy();
      expect(idea.spokenAs?.trim(), idea.equation).toBeTruthy();
      expect(idea.variables?.length ?? 0, idea.equation).toBeGreaterThan(0);
      for (const variable of idea.variables ?? []) {
        expect(
          idea.equation.includes(variable.symbol),
          `${variable.symbol} should appear in ${idea.equation}`,
        ).toBe(true);
      }
    }
  });

  it("links further reading only to https pages and cites a source for each", () => {
    for (const reference of everyArea.flatMap((area) => area.furtherReading)) {
      expect(reference.title.trim()).not.toBe("");
      expect(reference.source.trim()).not.toBe("");
      if (reference.href !== undefined) {
        expect(reference.href.startsWith("https://")).toBe(true);
      }
    }
  });

  it("keeps copy free of em dashes, en dashes and banned hype words", () => {
    const banned =
      /\u2014|\u2013|\b(elevate|seamless|unleash|unlock|next-gen|cutting-edge|revolutionary|empower|world-class|premium|state-of-the-art|advanced|immersive|journey|powerful|robust)\b/i;
    const strings = everyArea.flatMap((area) => [
      area.title,
      area.summary,
      area.whyItMatters,
      ...area.keyIdeas.flatMap((idea) => [
        idea.text,
        idea.equation ?? "",
        idea.equationLabel ?? "",
        idea.spokenAs ?? "",
        ...(idea.variables ?? []).flatMap((variable) => [
          variable.symbol,
          variable.meaning,
          variable.unit ?? "",
        ]),
      ]),
      ...area.labAnchors.map((anchor) => anchor.label),
      ...area.explorationLinks.flatMap((link) => [
        link.label,
        link.description,
      ]),
      ...area.furtherReading.flatMap((reference) => [
        reference.title,
        reference.source,
      ]),
    ]);

    for (const value of strings) {
      expect(banned.test(value), value).toBe(false);
    }
  });
});
