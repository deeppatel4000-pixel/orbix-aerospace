import type {
  MissionPresetCategory,
  MissionProfileInputs,
} from "@/features/engineering-lab/types";

export const SCENARIO_LIBRARY_STORAGE_KEY = "orbix.mission-scenarios.v1";

const supportedCategories = new Set<MissionPresetCategory>([
  "deep-space-concept",
  "lunar-transfer",
  "orbital-deployment",
  "orbital-logistics",
  "reentry-demonstration",
]);

export interface MissionScenario {
  readonly category: MissionPresetCategory;
  readonly createdAt: string;
  readonly description: string;
  readonly id: string;
  readonly name: string;
  readonly profile: MissionProfileInputs;
  readonly updatedAt: string;
}

export interface MissionScenarioDraft {
  readonly category: MissionPresetCategory;
  readonly description: string;
  readonly id?: string;
  readonly name: string;
  readonly profile: MissionProfileInputs;
}

export interface ScenarioLibraryStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface ScenarioLibraryOptions {
  readonly createId?: () => string;
  readonly initialScenarios?: readonly MissionScenario[];
  readonly now?: () => Date;
  readonly storage?: ScenarioLibraryStorage;
  readonly storageKey?: string;
}

export interface MissionScenarioLibrary {
  deleteScenario(id: string): boolean;
  duplicateScenario(id: string): MissionScenario;
  getScenarioById(id: string): MissionScenario | undefined;
  listScenarios(): readonly MissionScenario[];
  saveScenario(draft: MissionScenarioDraft): MissionScenario;
}

function assertNonEmptyText(
  value: unknown,
  label: string,
): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new RangeError(`${label} must not be empty.`);
  }
}

function cloneValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item)) as T;
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        cloneValue(nestedValue),
      ]),
    ) as T;
  }

  return value;
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const nestedValue of Object.values(value as Record<string, unknown>)) {
      deepFreeze(nestedValue);
    }
    Object.freeze(value);
  }

  return value;
}

function isValidTimestamp(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function validateScenarioProfile(
  profile: unknown,
): asserts profile is MissionProfileInputs {
  if (
    typeof profile !== "object" ||
    profile === null ||
    Array.isArray(profile)
  ) {
    throw new RangeError("Mission scenario profile must be an object.");
  }

  assertNonEmptyText(
    (profile as Partial<MissionProfileInputs>).missionName,
    "Mission profile name",
  );
}

/** Validates storage structure only; numerical validation stays downstream. */
export function validateMissionScenario(scenario: MissionScenario): void {
  if (typeof scenario !== "object" || scenario === null) {
    throw new RangeError("Mission scenario must be an object.");
  }

  assertNonEmptyText(scenario.id, "Mission scenario ID");
  assertNonEmptyText(scenario.name, "Mission scenario name");
  assertNonEmptyText(scenario.description, "Mission scenario description");

  if (!supportedCategories.has(scenario.category)) {
    throw new RangeError("Mission scenario category is not supported.");
  }

  if (!isValidTimestamp(scenario.createdAt)) {
    throw new RangeError("Mission scenario created timestamp is invalid.");
  }
  if (!isValidTimestamp(scenario.updatedAt)) {
    throw new RangeError("Mission scenario updated timestamp is invalid.");
  }

  validateScenarioProfile(scenario.profile);
}

function validateScenarioDraft(draft: MissionScenarioDraft): void {
  if (typeof draft !== "object" || draft === null) {
    throw new RangeError("Mission scenario draft must be an object.");
  }

  if (draft.id !== undefined) {
    assertNonEmptyText(draft.id, "Mission scenario ID");
  }
  assertNonEmptyText(draft.name, "Mission scenario name");
  assertNonEmptyText(draft.description, "Mission scenario description");

  if (!supportedCategories.has(draft.category)) {
    throw new RangeError("Mission scenario category is not supported.");
  }

  validateScenarioProfile(draft.profile);
}

function freezeScenario(scenario: MissionScenario): MissionScenario {
  return deepFreeze(cloneValue(scenario));
}

function readStoredScenarios(
  storage: ScenarioLibraryStorage,
  storageKey: string,
): readonly MissionScenario[] | undefined {
  const serialized = storage.getItem(storageKey);
  if (serialized === null) return undefined;

  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch {
    throw new RangeError("Stored mission scenario library is malformed.");
  }

  if (!Array.isArray(parsed)) {
    throw new RangeError("Stored mission scenario library must be an array.");
  }

  return parsed as MissionScenario[];
}

function defaultIdFactory(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `scenario-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createScenarioLibrary(
  options: ScenarioLibraryOptions = {},
): MissionScenarioLibrary {
  const storageKey = options.storageKey ?? SCENARIO_LIBRARY_STORAGE_KEY;
  const now = options.now ?? (() => new Date());
  const createId = options.createId ?? defaultIdFactory;
  const storedScenarios = options.storage
    ? readStoredScenarios(options.storage, storageKey)
    : undefined;
  const initialScenarios = storedScenarios ?? options.initialScenarios ?? [];
  const scenarios = new Map<string, MissionScenario>();

  for (const scenario of initialScenarios) {
    validateMissionScenario(scenario);
    if (scenarios.has(scenario.id)) {
      throw new RangeError(`Duplicate mission scenario ID: ${scenario.id}`);
    }
    scenarios.set(scenario.id, freezeScenario(scenario));
  }

  function persist(): void {
    options.storage?.setItem(
      storageKey,
      JSON.stringify(Array.from(scenarios.values())),
    );
  }

  if (storedScenarios === undefined && initialScenarios.length > 0) {
    persist();
  }

  function resolveUniqueId(): string {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const id = createId();
      assertNonEmptyText(id, "Generated mission scenario ID");
      if (!scenarios.has(id)) return id;
    }

    throw new RangeError(
      "A unique mission scenario ID could not be generated.",
    );
  }

  const library: MissionScenarioLibrary = {
    deleteScenario(id) {
      const deleted = scenarios.delete(id);
      if (deleted) persist();
      return deleted;
    },
    duplicateScenario(id) {
      const source = scenarios.get(id);
      if (!source) {
        throw new RangeError(`Mission scenario not found: ${id}`);
      }

      return library.saveScenario({
        category: source.category,
        description: source.description,
        name: `${source.name} Copy`,
        profile: source.profile,
      });
    },
    getScenarioById(id) {
      return scenarios.get(id);
    },
    listScenarios() {
      return Object.freeze(Array.from(scenarios.values()));
    },
    saveScenario(draft) {
      validateScenarioDraft(draft);

      const existing = draft.id ? scenarios.get(draft.id) : undefined;
      const timestamp = now().toISOString();
      const scenario = freezeScenario({
        category: draft.category,
        createdAt: existing?.createdAt ?? timestamp,
        description: draft.description,
        id: draft.id ?? resolveUniqueId(),
        name: draft.name,
        profile: draft.profile,
        updatedAt: timestamp,
      });

      validateMissionScenario(scenario);
      scenarios.set(scenario.id, scenario);
      persist();
      return scenario;
    },
  };

  return library;
}

export function listScenarios(
  library: MissionScenarioLibrary,
): readonly MissionScenario[] {
  return library.listScenarios();
}

export function getScenarioById(
  library: MissionScenarioLibrary,
  id: string,
): MissionScenario | undefined {
  return library.getScenarioById(id);
}

export function saveScenario(
  library: MissionScenarioLibrary,
  draft: MissionScenarioDraft,
): MissionScenario {
  return library.saveScenario(draft);
}

export function deleteScenario(
  library: MissionScenarioLibrary,
  id: string,
): boolean {
  return library.deleteScenario(id);
}

export function duplicateScenario(
  library: MissionScenarioLibrary,
  id: string,
): MissionScenario {
  return library.duplicateScenario(id);
}
