import { describe, expect, it } from "vitest";

import type {
  MissionScenario,
  MissionScenarioDraft,
  ScenarioLibraryStorage,
} from "./scenario-library";
import {
  createScenarioLibrary,
  deleteScenario,
  duplicateScenario,
  getScenarioById,
  listScenarios,
  saveScenario,
  SCENARIO_LIBRARY_STORAGE_KEY,
  validateMissionScenario,
} from "./scenario-library";

const draft: MissionScenarioDraft = {
  category: "orbital-deployment",
  description: "A saved educational deployment scenario.",
  name: "Deployment Scenario",
  profile: {
    deltaVBudget: {
      hohmannTransfer: {
        finalAltitudeMetres: 550_000,
        initialAltitudeMetres: 200_000,
      },
      missionName: "Deployment Scenario",
    },
    missionName: "Deployment Scenario",
  },
};

function createMemoryStorage(): ScenarioLibraryStorage & {
  values: Map<string, string>;
} {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
    values,
  };
}

function createDeterministicLibrary() {
  let id = 0;
  let second = 0;
  return createScenarioLibrary({
    createId: () => `scenario-${(id += 1)}`,
    now: () =>
      new Date(`2026-08-04T12:00:${String(second++).padStart(2, "0")}.000Z`),
  });
}

describe("scenario library", () => {
  it("creates an empty library", () => {
    expect(listScenarios(createScenarioLibrary())).toEqual([]);
  });

  it("saves and retrieves an immutable scenario", () => {
    const library = createDeterministicLibrary();
    const scenario = saveScenario(library, draft);

    expect(scenario).toMatchObject({
      createdAt: "2026-08-04T12:00:00.000Z",
      id: "scenario-1",
      name: "Deployment Scenario",
      updatedAt: "2026-08-04T12:00:00.000Z",
    });
    expect(getScenarioById(library, scenario.id)).toBe(scenario);
    expect(Object.isFrozen(scenario)).toBe(true);
    expect(Object.isFrozen(scenario.profile)).toBe(true);
  });

  it("updates an existing scenario while preserving its creation timestamp", () => {
    const library = createDeterministicLibrary();
    const original = saveScenario(library, draft);
    const updated = saveScenario(library, {
      ...draft,
      description: "Updated educational description.",
      id: original.id,
    });

    expect(listScenarios(library)).toHaveLength(1);
    expect(updated.createdAt).toBe(original.createdAt);
    expect(updated.updatedAt).toBe("2026-08-04T12:00:01.000Z");
    expect(updated.description).toBe("Updated educational description.");
  });

  it("duplicates a scenario with a new identity and preserved profile", () => {
    const library = createDeterministicLibrary();
    const source = saveScenario(library, draft);
    const copy = duplicateScenario(library, source.id);

    expect(copy.id).not.toBe(source.id);
    expect(copy.name).toBe("Deployment Scenario Copy");
    expect(copy.profile).toEqual(source.profile);
    expect(listScenarios(library)).toHaveLength(2);
  });

  it("deletes a saved scenario", () => {
    const library = createDeterministicLibrary();
    const scenario = saveScenario(library, draft);

    expect(deleteScenario(library, scenario.id)).toBe(true);
    expect(deleteScenario(library, scenario.id)).toBe(false);
    expect(getScenarioById(library, scenario.id)).toBeUndefined();
  });

  it("persists scenarios and reloads them without changing profile values", () => {
    const storage = createMemoryStorage();
    const firstLibrary = createScenarioLibrary({
      createId: () => "persistent-scenario",
      now: () => new Date("2026-08-04T12:00:00.000Z"),
      storage,
    });
    const saved = saveScenario(firstLibrary, draft);
    const reloadedLibrary = createScenarioLibrary({ storage });

    expect(storage.values.has(SCENARIO_LIBRARY_STORAGE_KEY)).toBe(true);
    expect(listScenarios(reloadedLibrary)).toEqual([saved]);
    expect(
      getScenarioById(reloadedLibrary, saved.id)?.profile.deltaVBudget
        ?.hohmannTransfer?.finalAltitudeMetres,
    ).toBe(550_000);
  });

  it.each([
    ["empty name", { ...draft, name: " " }],
    ["empty description", { ...draft, description: "" }],
    ["missing profile", { ...draft, profile: undefined }],
    ["unsupported category", { ...draft, category: "unsupported-category" }],
  ])("rejects an invalid scenario draft: %s", (_label, invalidDraft) => {
    expect(() =>
      saveScenario(
        createDeterministicLibrary(),
        invalidDraft as MissionScenarioDraft,
      ),
    ).toThrowError(RangeError);
  });

  it("rejects malformed stored scenario objects", () => {
    const malformed = {
      ...draft,
      createdAt: "not-a-date",
      id: "malformed",
      updatedAt: "2026-08-04T12:00:00.000Z",
    } as MissionScenario;

    expect(() => validateMissionScenario(malformed)).toThrowError(
      new RangeError("Mission scenario created timestamp is invalid."),
    );
  });

  it("rejects duplicate IDs when a library is created", () => {
    const scenario: MissionScenario = {
      ...draft,
      createdAt: "2026-08-04T12:00:00.000Z",
      id: "duplicate",
      updatedAt: "2026-08-04T12:00:00.000Z",
    };

    expect(() =>
      createScenarioLibrary({ initialScenarios: [scenario, scenario] }),
    ).toThrowError(new RangeError("Duplicate mission scenario ID: duplicate"));
  });

  it("rejects malformed persisted JSON", () => {
    const storage = createMemoryStorage();
    storage.values.set(SCENARIO_LIBRARY_STORAGE_KEY, "{broken-json");

    expect(() => createScenarioLibrary({ storage })).toThrowError(
      new RangeError("Stored mission scenario library is malformed."),
    );
  });

  it("does not perform numerical mission validation", () => {
    const library = createDeterministicLibrary();
    const scenario = saveScenario(library, {
      ...draft,
      profile: {
        deltaVBudget: {
          hohmannTransfer: {
            finalAltitudeMetres: Number.NaN,
            initialAltitudeMetres: -1,
          },
          missionName: "Delegated Validation",
        },
        missionName: "Delegated Validation",
      },
    });

    expect(
      scenario.profile.deltaVBudget?.hohmannTransfer?.initialAltitudeMetres,
    ).toBe(-1);
    expect(
      scenario.profile.deltaVBudget?.hohmannTransfer?.finalAltitudeMetres,
    ).toBeNaN();
  });
});
