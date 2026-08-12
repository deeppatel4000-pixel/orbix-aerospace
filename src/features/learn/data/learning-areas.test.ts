import { describe, expect, it } from "vitest";

import { listAircraft } from "@/features/aircraft/data";
import { listLearningAreas } from "@/features/learn/data";
import { listRockets } from "@/features/rockets/data";

/**
 * Learn's content freeze.
 *
 * The Phase 6A redesign changed how pathways are presented and nothing about
 * what they contain. Presentation work is exactly where content quietly goes
 * missing — a list that stops rendering its tail, a link that loses its href —
 * so the dataset's shape is pinned here rather than inferred from the page.
 *
 * These assertions are deliberately about identity and reachability, not copy.
 * Editorial wording is free to change; the set of pathways, their ids, and
 * every destination they point at are not.
 */

const EXPECTED_PATHWAY_IDS = [
  "aerodynamics-flight-fundamentals",
  "propulsion-vehicle-performance",
  "high-speed-compressible-flow",
  "atmospheric-entry-thermal-protection",
  "orbital-mechanics-mission-design",
  "mission-operations-engineering-communication",
] as const;

describe("learning areas", () => {
  const areas = listLearningAreas();

  it("keeps its six pathways, in order", () => {
    expect(areas.map((area) => area.id)).toEqual([...EXPECTED_PATHWAY_IDS]);
  });

  it("has no duplicate pathway ids or codes", () => {
    const ids = areas.map((area) => area.id);
    const codes = areas.map((area) => area.code);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("keeps every laboratory anchor, each one unique", () => {
    const anchors = areas.flatMap((area) =>
      area.labAnchors.map((anchor) => anchor.anchorId),
    );

    // Twenty-eight distinct Engineering Laboratory modules are referenced.
    expect(anchors).toHaveLength(28);
    expect(new Set(anchors).size).toBe(28);
  });

  it("keeps every exploration link", () => {
    const links = areas.flatMap((area) => area.explorationLinks);

    expect(links).toHaveLength(7);
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
    // to one the registry does not hold — that would be a broken promise the
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
      expect(area.concept.trim()).not.toBe("");
      expect(area.whyItMatters.trim()).not.toBe("");
      expect(area.realWorldContext.trim()).not.toBe("");
      expect(area.labAnchors.length).toBeGreaterThan(0);
    }
  });
});
