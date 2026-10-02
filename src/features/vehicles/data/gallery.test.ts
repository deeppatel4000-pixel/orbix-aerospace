import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { toMetres } from "@/features/vehicles/drawings/units";

import { aircraftVehicles } from "./aircraft";
import {
  getSitePhoto,
  getVehicleGallery,
  getVehiclePhoto,
  listPhotos,
  PHOTO_SLOTS_IN_USE,
  type SitePhotoSlot,
} from "./gallery";
import { getVehicleDrawing, listDrawings } from "./gallery-drawings";
import { rocketVehicles } from "./rockets";

const PUBLIC = join(process.cwd(), "public");
const EM_DASH = String.fromCharCode(0x2014);
const vehicles = [...aircraftVehicles, ...rocketVehicles];
const SITE_SLOTS: readonly SitePhotoSlot[] = [
  "about",
  "home-vehicles",
  "learn-aerodynamics",
  "learn-compressible-flow",
  "learn-propulsion",
  "not-found",
  "og",
];

describe("photo slot map", () => {
  it("uses each file in one slot only (card and profile share the identity photograph)", () => {
    for (const use of listPhotos()) {
      const allowed =
        use.slots.length === 1 ||
        [...use.slots].sort().join(",") === "card,profile";
      expect(allowed, `${use.photo.src}: ${use.slots.join(", ")}`).toBe(true);
    }
  });

  it("gives every vehicle a card, a profile photograph and a 2 to 3 view gallery", () => {
    for (const vehicle of vehicles) {
      expect(getVehiclePhoto(vehicle.id, "card")).toBeDefined();
      expect(getVehiclePhoto(vehicle.id, "profile")).toBeDefined();
      const gallery = getVehicleGallery(vehicle.id);
      expect(gallery.length).toBeGreaterThanOrEqual(2);
      expect(gallery.length).toBeLessThanOrEqual(3);
    }
  });

  it("gives every replaced photograph a new file name, so no image cache can pair a new caption with an old file", () => {
    // Files re-exported or replaced in v4 that kept their pre-v4 names would
    // be served from the optimizer and CDN caches as the old renditions.
    const preV4Names = [
      "/images/aircraft/f-15-eagle.webp",
      "/images/aircraft/f-22-raptor.webp",
      "/images/aircraft/f-35-lightning-ii.webp",
      "/images/aircraft/sr-71-blackbird.webp",
      "/images/rockets/saturn-v.webp",
    ];
    const srcs = listPhotos().map((use) => use.photo.src);
    for (const name of preV4Names) expect(srcs).not.toContain(name);
  });

  it("gives each of a vehicle's photographs a distinct title", () => {
    const seen = new Set<string>();
    for (const { photo } of listPhotos()) {
      const key = `${photo.vehicleId}: ${photo.title}`;
      expect(seen.has(key), key).toBe(false);
      seen.add(key);
    }
  });

  it("lists for Credits only files in a slot a page renders", () => {
    for (const use of listPhotos({ inUseOnly: true })) {
      expect(use.slots.some((slot) => PHOTO_SLOTS_IN_USE.has(slot))).toBe(true);
    }
  });

  it("fills every site slot", () => {
    for (const slot of SITE_SLOTS) expect(getSitePhoto(slot)).toBeDefined();
  });

  it.each(listPhotos().map((use) => [use.photo.src, use]))(
    "%s exists at its recorded size, with a full credit record",
    async (src, use) => {
      const file = join(PUBLIC, src);
      expect(existsSync(file)).toBe(true);
      const meta = await sharp(file).metadata();
      expect(meta.width).toBe(use.photo.width);
      expect(meta.height).toBe(use.photo.height);
      for (const value of [
        use.photo.alt,
        use.photo.caption,
        use.photo.credit,
        use.photo.license,
        use.photo.modifications,
        use.photo.title,
      ]) {
        expect(value.trim()).not.toBe("");
        expect(value).not.toContain(EM_DASH);
      }
      expect(use.photo.license).not.toMatch(/\bN[CD]\b/);
      expect(use.photo.licenseUrl).toMatch(/^https:\/\//);
      expect(use.photo.sourceUrl).toMatch(
        /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/,
      );
    },
  );
});

describe("vehicle drawings", () => {
  it("has one drawing per vehicle", () => {
    for (const vehicle of vehicles) {
      expect(getVehicleDrawing(vehicle.id)).toBeDefined();
    }
    expect(listDrawings()).toHaveLength(vehicles.length);
  });

  it.each(vehicles.map((vehicle) => [vehicle.id, vehicle]))(
    "%s is normalized to its recorded dimensions",
    (id, vehicle) => {
      const drawing = getVehicleDrawing(id)!;
      const xs: number[] = [];
      const ys: number[] = [];
      for (const [, x, y] of drawing.d.matchAll(/(-?[\d.]+) (-?[\d.]+)/g)) {
        xs.push(Number(x));
        ys.push(Number(y));
      }
      const width = Math.max(...xs) - Math.min(...xs);
      const height = Math.max(...ys) - Math.min(...ys);
      expect(height).toBeCloseTo(drawing.heightM, 1);
      expect(width).toBeCloseTo(drawing.widthM, 1);

      if ("wingspan" in vehicle.dimensions) {
        expect(drawing.view).toBe("top");
        expect(drawing.heightM).toBeCloseTo(
          toMetres(vehicle.dimensions.length),
          1,
        );
        expect(drawing.widthM).toBeCloseTo(
          toMetres(vehicle.dimensions.wingspan),
          1,
        );
      } else {
        expect(drawing.view).toBe("side");
        expect(drawing.heightM).toBeCloseTo(
          toMetres(vehicle.dimensions.height),
          1,
        );
      }

      const svg = readFileSync(join(PUBLIC, drawing.src), "utf8");
      expect(svg).toContain(drawing.d);
      // A standalone file must size from its viewBox (meter units are not
      // valid SVG lengths) and stay visible on the dark ground.
      expect(svg).not.toMatch(/<svg[^>]*\s(width|height)=/);
      expect(svg).not.toContain("currentColor");
      if (drawing.shareAlike) expect(drawing.license).toBe("CC BY-SA 4.0");
    },
  );
});
