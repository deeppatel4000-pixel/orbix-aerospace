import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { EngineeringNotesPanel as AircraftNotesPanel } from "@/features/aircraft/components/engineering-notes-panel";
import { listAircraft } from "@/features/aircraft/data";
import { EngineeringNotesPanel as RocketNotesPanel } from "@/features/rockets/components/engineering-notes-panel";
import { listRockets } from "@/features/rockets/data";
import type { EngineeringNote } from "@/features/vehicles/types";

/**
 * Published vehicle engineering content.
 *
 * Every profile once advertised its own unfinished state: a warning-amber
 * `PLACEHOLDER` badge on each card, prose promising "future sourced" content,
 * and note bodies that literally began "Placeholder:". All twenty-one notes now
 * carry real, sourced observations.
 *
 * This guards the outcome rather than the wording. Editorial copy stays free to
 * improve; what must never come back is a reader being shown scaffolding — an
 * unfinished note body, an authoring state rendered as UI, or seed-data
 * language describing ORBIX's dataset instead of the aircraft.
 */

const VEHICLES = [
  ...listAircraft().map((aircraft) => ({
    id: aircraft.id,
    notes: aircraft.engineeringAnalysis,
  })),
  ...listRockets().map((rocket) => ({
    id: rocket.id,
    notes: rocket.engineeringAnalysis,
  })),
];

const ALL_NOTES: readonly EngineeringNote[] = VEHICLES.flatMap(
  (vehicle) => vehicle.notes,
);

/** Authoring states that must never be rendered to a reader. */
const EDITORIAL_STATE_LABELS = ["PLACEHOLDER", "REVIEWED", "DRAFT"] as const;

describe("vehicle engineering notes", () => {
  it("covers every vehicle", () => {
    expect(VEHICLES).toHaveLength(10);
    expect(ALL_NOTES).toHaveLength(21);
    for (const vehicle of VEHICLES) {
      expect(vehicle.notes.length, `${vehicle.id} has notes`).toBeGreaterThan(
        0,
      );
    }
  });

  it("has no note still marked as a placeholder", () => {
    const unfinished = ALL_NOTES.filter(
      (note) => note.status === "placeholder",
    );
    expect(unfinished.map((note) => note.id)).toEqual([]);
  });

  it("has no note body that reads as scaffolding", () => {
    for (const note of ALL_NOTES) {
      expect(note.summary.startsWith("Placeholder:"), note.id).toBe(false);
      expect(note.summary).not.toMatch(/^(TBD|TBA|Coming soon)/i);
      // Real observations, not one-line stubs.
      expect(note.summary.length, `${note.id} is substantive`).toBeGreaterThan(
        120,
      );
    }
  });
});

/**
 * BOTH panels, deliberately.
 *
 * Aircraft and rockets render their notes through two separate components that
 * happen to share a name. Cleaning up only the aircraft one left every rocket
 * profile still showing `PLACEHOLDER`, and a test covering a single panel
 * passed the whole time. Whatever is asserted here is asserted twice.
 */
const PANELS = [
  { Panel: AircraftNotesPanel, name: "aircraft" },
  { Panel: RocketNotesPanel, name: "rockets" },
] as const;

describe.each(PANELS)("engineering notes presentation ($name)", ({ Panel }) => {
  const markup = renderToStaticMarkup(<Panel notes={ALL_NOTES.slice(0, 3)} />);

  it("never renders an editorial state to the reader", () => {
    // The badge is gone from the card entirely. `status` still exists on the
    // data and in the formatter — it is simply not the reader's business.
    for (const label of EDITORIAL_STATE_LABELS) {
      expect(markup.toUpperCase()).not.toContain(`>${label}<`);
    }
    expect(markup).not.toContain("Placeholder");
  });

  it("introduces the section as finished work", () => {
    expect(markup).not.toContain("reserved for future sourced");
    expect(markup).not.toContain("Analysis queue");
    expect(markup).toContain("Engineering analysis");
    expect(markup).toContain(
      "Concise engineering observations based on public aerospace specifications",
    );
  });

  it("still renders every note it is given", () => {
    for (const note of ALL_NOTES.slice(0, 3)) {
      expect(markup).toContain(note.summary.slice(0, 60));
    }
  });
});

describe("aircraft notes disclosure", () => {
  it("keeps the first note open", () => {
    // Only the aircraft panel uses `details`/`summary`; the rockets panel
    // renders plain articles. Matched on the rendered `open=""` attribute
    // specifically — a looser `\sopen` matches all three cards, because the
    // card's class list carries `open:border-tactical-amber/35`, the Tailwind
    // variant rather than the attribute.
    const markup = renderToStaticMarkup(
      <AircraftNotesPanel notes={ALL_NOTES.slice(0, 3)} />,
    );

    expect((markup.match(/<details/g) ?? []).length).toBe(3);
    expect((markup.match(/<details[^>]*\sopen=""/g) ?? []).length).toBe(1);
  });
});

describe("F-22 record", () => {
  const f22 = listAircraft().find((aircraft) => aircraft.id === "f-22-raptor");

  it("describes the aircraft, not ORBIX's dataset", () => {
    expect(f22).toBeDefined();
    expect(f22?.description).not.toMatch(
      /data example|example record|seed data|scaffold/i,
    );
    expect(f22?.description).toContain("supercruise");
  });

  it("gives its production variant a real note", () => {
    const variant = f22?.variants.find((entry) => entry.id === "f-22a");
    expect(variant?.notes).toBeDefined();
    expect(variant?.notes).not.toMatch(/example record/i);
  });
});

describe("variant first-flight dates", () => {
  const variantById = new Map(
    listAircraft().flatMap((entry) =>
      entry.variants.map((variant) => [variant.id, variant] as const),
    ),
  );

  /** Only dates verified against an authoritative primary source. */
  it.each([
    ["f-15ex", "2021-02-02"],
    ["f-35b", "2008-06-11"],
    ["f-35c", "2010-06-07"],
  ])("records %s first flight as %s", (id, expected) => {
    expect(variantById.get(id)?.firstFlight).toBe(expected);
  });

  /**
   * Deliberately absent.
   *
   * These four could not be confirmed to the same standard, so the profile
   * shows its honest "Not recorded" fallback. An unsourced date appearing here
   * would be a fabrication wearing the same clothes as a fix, which is exactly
   * what this case exists to catch.
   */
  it.each(["f-15c", "f-15e", "sr-71b", "sr-71c"])(
    "leaves %s first flight unrecorded rather than guessing",
    (id) => {
      expect(variantById.has(id), `${id} should exist`).toBe(true);
      expect(variantById.get(id)?.firstFlight).toBeUndefined();
    },
  );
});
