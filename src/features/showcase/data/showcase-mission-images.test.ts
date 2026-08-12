import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { SHOWCASE_MISSIONS } from "@/features/showcase/data/mission-showcase";

/**
 * Showcase mission imagery.
 *
 * Five missions, five photographs, one each. The failure this guards against
 * is not a crash — a mission pointing at another mission's file, or at a file
 * that was never committed, renders perfectly happily and is simply wrong. Both
 * are invisible to every other test in the suite, so they are pinned here.
 *
 * Three independent claims, because no one of them implies the others:
 *
 *   pairing      each mission carries the file the user approved FOR IT,
 *                checked against a list written out below rather than derived
 *                from the source — a check that restates its subject proves
 *                only that the data equals itself
 *   bytes        the five files are five different photographs, by digest, not
 *                by filename
 *   presence     each one is really on disk, at a plausible size
 */

const PUBLIC_DIRECTORY = join(process.cwd(), "public");

/**
 * The approved pairing, in order, written independently of the source.
 *
 * This is the assertion that matters. Five files can be unique, present and
 * correctly formed while two of them hang on the wrong missions — a state no
 * uniqueness or existence check can see, and one a reader would notice
 * instantly. Swapping any two entries in `mission-showcase.ts` fails here.
 */
const APPROVED_PAIRING = [
  [
    "leo-satellite-deployment",
    "/images/missions/leo-satellite-deployment.webp",
  ],
  ["iss-style-resupply", "/images/missions/iss-style-resupply.webp"],
  ["lunar-transfer-concept", "/images/missions/lunar-transfer-concept.webp"],
  ["reentry-demonstrator", "/images/missions/reentry-demonstrator.webp"],
  ["mars-transfer-concept", "/images/missions/mars-transfer-concept.webp"],
] as const;

describe("showcase mission imagery", () => {
  it("keeps its five missions, in order", () => {
    expect(SHOWCASE_MISSIONS.map((mission) => mission.preset.id)).toEqual(
      APPROVED_PAIRING.map(([id]) => id),
    );
  });

  it("gives each mission exactly the image the user approved for it", () => {
    expect(
      SHOWCASE_MISSIONS.map((mission) => [
        mission.preset.id,
        mission.image.src,
      ]),
    ).toEqual(APPROVED_PAIRING.map(([id, src]) => [id, src]));
  });

  it("gives every mission an image", () => {
    for (const mission of SHOWCASE_MISSIONS) {
      expect(
        mission.image.src,
        `${mission.preset.id} should carry an image source`,
      ).toMatch(/^\/images\/missions\/[a-z0-9-]+\.webp$/);
    }
  });

  it("never lets two missions share a source", () => {
    const sources = SHOWCASE_MISSIONS.map((mission) => mission.image.src);

    expect(
      new Set(sources).size,
      `duplicate source in ${sources.join(", ")}`,
    ).toBe(sources.length);
  });

  it("never lets two missions share the same picture, whatever it is named", () => {
    // Distinct paths are not distinct pictures. Copying one approved asset
    // over another leaves five filenames, five entries and one duplicated
    // photograph — which only the bytes can reveal.
    const digests = SHOWCASE_MISSIONS.map((mission) =>
      createHash("sha256")
        .update(readFileSync(join(PUBLIC_DIRECTORY, mission.image.src)))
        .digest("hex"),
    );

    expect(
      new Set(digests).size,
      `duplicate image bytes: ${digests.join(", ")}`,
    ).toBe(SHOWCASE_MISSIONS.length);
  });

  it("points every mission at a file that exists and is not empty", () => {
    for (const mission of SHOWCASE_MISSIONS) {
      const path = join(PUBLIC_DIRECTORY, mission.image.src);

      expect(
        existsSync(path),
        `${mission.preset.id} points at missing ${mission.image.src}`,
      ).toBe(true);
      expect(statSync(path).size).toBeGreaterThan(1024);
    }
  });

  it("gives every image alt text that describes the mission, not the file", () => {
    for (const mission of SHOWCASE_MISSIONS) {
      const { alt } = mission.image;

      expect(alt.trim()).not.toBe("");
      // Short and factual — a sentence, not a generated paragraph.
      expect(alt.length).toBeLessThanOrEqual(90);
      expect(alt).not.toMatch(/\.webp|image of|picture of/i);
      expect(alt.endsWith(".")).toBe(true);
    }
  });

  it("still names and categorises every mission", () => {
    // The imagery pass must not disturb the text the card was already built
    // from. Where a card LINKS is asserted against rendered markup in
    // `mission-gallery.test.tsx`, which is the only place that can see an href.
    for (const mission of SHOWCASE_MISSIONS) {
      expect(mission.preset.name.trim()).not.toBe("");
      expect(mission.categoryLabel.trim()).not.toBe("");
    }
  });
});
