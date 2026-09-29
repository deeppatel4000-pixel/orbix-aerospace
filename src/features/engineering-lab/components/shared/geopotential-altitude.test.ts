import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES } from "@/features/engineering-lab/types";

import {
  GEOPOTENTIAL_ALTITUDE_HINT,
  GEOPOTENTIAL_ALTITUDE_LABEL,
} from "./geopotential-altitude";

/** US Standard Atmosphere 1976 effective Earth radius for H to z. */
const EFFECTIVE_EARTH_RADIUS_METRES = 6_356_766;

const componentsDir = join(__dirname, "..");

describe("geopotential altitude wording", () => {
  it("names the altitude the troposphere model actually uses", () => {
    expect(GEOPOTENTIAL_ALTITUDE_LABEL).toBe("Geopotential altitude");
    expect(GEOPOTENTIAL_ALTITUDE_HINT).toContain("11,000 m");
  });

  it("states a true bound on the gap to geometric altitude", () => {
    const h = STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES;
    const geometric =
      (EFFECTIVE_EARTH_RADIUS_METRES * h) / (EFFECTIVE_EARTH_RADIUS_METRES - h);
    expect(geometric - h).toBeGreaterThan(19);
    expect(geometric - h).toBeLessThan(20);
    expect(GEOPOTENTIAL_ALTITUDE_HINT).toContain(
      "within 20 m of geometric altitude",
    );
    // One line: a single sentence.
    expect(GEOPOTENTIAL_ALTITUDE_HINT.match(/\. /g)).toBeNull();
  });

  it("no calculator or analyzer calls the atmosphere input geometric", () => {
    const offenders = readdirSync(componentsDir)
      .filter((name) => /-(calculator|analyzer)\.tsx$/.test(name))
      .filter((name) =>
        /Geometric altitude/.test(
          readFileSync(join(componentsDir, name), "utf8"),
        ),
      );
    expect(offenders).toEqual([]);
  });
});
