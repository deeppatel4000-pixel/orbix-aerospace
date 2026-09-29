import { describe, expect, it } from "vitest";

import { listAircraft } from "@/features/aircraft";
import {
  CARD_SUMMARY_MAX_LENGTH,
  getAircraftVisual,
} from "@/features/aircraft/data/aircraft-visuals";

describe("aircraft card summaries", () => {
  it.each(listAircraft().map((aircraft) => [aircraft.id]))(
    "%s has a one-line summary",
    (id) => {
      const summary = getAircraftVisual(id)?.cardSummary;

      expect(summary).toBeTruthy();
      // The card clips overflow, so a longer summary would be cut silently.
      expect(summary!.length).toBeLessThanOrEqual(CARD_SUMMARY_MAX_LENGTH);
      expect(summary).not.toContain(String.fromCharCode(0x2014));
      expect(summary).toBe(summary!.trim());
    },
  );
});
