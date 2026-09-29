import { describe, expect, it } from "vitest";

import { listRockets } from "@/features/rockets";
import {
  CARD_SUMMARY_MAX_LENGTH,
  getRocketVisual,
} from "@/features/rockets/data/rocket-visuals";

describe("rocket card summaries", () => {
  it.each(listRockets().map((rocket) => [rocket.id]))(
    "%s has a one-line summary",
    (id) => {
      const summary = getRocketVisual(id)?.cardSummary;

      expect(summary).toBeTruthy();
      // The card clips overflow, so a longer summary would be cut silently.
      expect(summary!.length).toBeLessThanOrEqual(CARD_SUMMARY_MAX_LENGTH);
      expect(summary).not.toContain(String.fromCharCode(0x2014));
      expect(summary).toBe(summary!.trim());
    },
  );
});
