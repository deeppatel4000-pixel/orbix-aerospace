"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  CheckCircle2,
  Copy,
  Database,
  Save,
  Trash2,
  Upload,
} from "lucide-react";

import { MissionProfileAnalyzer } from "@/features/engineering-lab/components/mission-profile-analyzer";
import {
  MissionScenarioBuilder,
  type MissionScenarioBuilderOutput,
} from "@/features/engineering-lab/components/mission-scenario-builder";
import {
  createScenarioLibrary,
  deleteScenario,
  duplicateScenario,
  getScenarioById,
  listScenarios,
  saveScenario,
  type MissionScenario,
  type MissionScenarioLibrary,
} from "@/features/engineering-lab/missions";

interface LoadedScenario {
  readonly revision: number;
  readonly scenario: MissionScenario;
}

interface ScenarioLibraryContextValue {
  readonly currentScenario: MissionScenarioBuilderOutput | null;
  readonly library: MissionScenarioLibrary;
  readonly scenarios: readonly MissionScenario[];
  readonly setCurrentScenario: (scenario: MissionScenarioBuilderOutput) => void;
  readonly setScenarios: (scenarios: readonly MissionScenario[]) => void;
  readonly storageError: string | null;
}

export interface ScenarioLibraryIntegrationProps {
  readonly children: ReactNode;
  readonly initialScenarios?: readonly MissionScenario[];
}

const ScenarioLibraryContext =
  createContext<ScenarioLibraryContextValue | null>(null);

function useScenarioLibraryContext(): ScenarioLibraryContextValue {
  const context = useContext(ScenarioLibraryContext);
  if (context === null) {
    throw new Error(
      "Scenario library components must be inside ScenarioLibraryIntegration.",
    );
  }
  return context;
}

/** Coordinates input handoff and browser persistence without running analysis. */
export function ScenarioLibraryIntegration({
  children,
  initialScenarios,
}: ScenarioLibraryIntegrationProps) {
  const [library, setLibrary] = useState(() =>
    createScenarioLibrary({ initialScenarios }),
  );
  const [scenarios, setScenarios] = useState<readonly MissionScenario[]>(() =>
    listScenarios(library),
  );
  const [currentScenario, setCurrentScenarioState] =
    useState<MissionScenarioBuilderOutput | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    if (initialScenarios !== undefined) return;

    try {
      const persistentLibrary = createScenarioLibrary({
        storage: window.localStorage,
      });
      setLibrary(persistentLibrary);
      setScenarios(listScenarios(persistentLibrary));
    } catch (error) {
      setStorageError(
        error instanceof RangeError
          ? error.message
          : "Saved scenarios could not be loaded on this device.",
      );
    }
  }, [initialScenarios]);

  const setCurrentScenario = useCallback(
    (scenario: MissionScenarioBuilderOutput) => {
      setCurrentScenarioState(scenario);
    },
    [],
  );
  const contextValue = useMemo(
    () => ({
      currentScenario,
      library,
      scenarios,
      setCurrentScenario,
      setScenarios,
      storageError,
    }),
    [currentScenario, library, scenarios, setCurrentScenario, storageError],
  );

  return (
    <ScenarioLibraryContext.Provider value={contextValue}>
      {children}
    </ScenarioLibraryContext.Provider>
  );
}

/** Connects the Day 69 builder output to the library workspace. */
export function ScenarioLibraryBuilderTarget() {
  const { setCurrentScenario } = useScenarioLibraryContext();
  return <MissionScenarioBuilder onScenarioCreated={setCurrentScenario} />;
}

function formatCategory(category: MissionScenario["category"]): string {
  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatTimestamp(timestamp: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

function getIncludedSystems(scenario: MissionScenario): readonly string[] {
  return [
    scenario.profile.deltaVBudget ? "Delta-v budget" : null,
    scenario.profile.vehicleReentryEvaluation ? "Vehicle evaluation" : null,
    scenario.profile.vehicleComparison ? "Vehicle comparison" : null,
  ].filter((system): system is string => system !== null);
}

export function ScenarioLibrary() {
  const { currentScenario, library, scenarios, setScenarios, storageError } =
    useScenarioLibraryContext();
  const [loadedScenario, setLoadedScenario] = useState<LoadedScenario | null>(
    null,
  );
  const [announcement, setAnnouncement] = useState("Scenario library ready.");
  const libraryHeadingRef = useRef<HTMLHeadingElement>(null);
  const loadedHeadingRef = useRef<HTMLHeadingElement>(null);

  function refreshScenarios() {
    setScenarios(listScenarios(library));
  }

  function saveCurrentMission() {
    if (currentScenario === null) return;

    try {
      const saved = saveScenario(library, {
        category: currentScenario.category,
        description: currentScenario.description,
        name: currentScenario.profile.missionName,
        profile: currentScenario.profile,
      });
      refreshScenarios();
      setAnnouncement(`${saved.name} saved to the scenario library.`);
    } catch (error) {
      setAnnouncement(
        error instanceof RangeError
          ? error.message
          : "The current mission could not be saved.",
      );
    }
  }

  function loadScenario(id: string) {
    const scenario = getScenarioById(library, id);
    if (!scenario) {
      setAnnouncement("The selected mission scenario is unavailable.");
      return;
    }

    setLoadedScenario((current) => ({
      revision: (current?.revision ?? 0) + 1,
      scenario,
    }));
    setAnnouncement(
      `${scenario.name} loaded into the Mission Profile Analyzer.`,
    );
    window.setTimeout(() => loadedHeadingRef.current?.focus(), 0);
  }

  function copyScenario(id: string) {
    try {
      const copy = duplicateScenario(library, id);
      refreshScenarios();
      setAnnouncement(`${copy.name} added to the scenario library.`);
    } catch (error) {
      setAnnouncement(
        error instanceof RangeError
          ? error.message
          : "The mission scenario could not be duplicated.",
      );
    }
  }

  function removeScenario(id: string) {
    const scenario = getScenarioById(library, id);
    if (!scenario) return;

    deleteScenario(library, id);
    if (loadedScenario?.scenario.id === id) {
      setLoadedScenario(null);
    }
    refreshScenarios();
    setAnnouncement(`${scenario.name} deleted from the scenario library.`);
    window.setTimeout(() => libraryHeadingRef.current?.focus(), 0);
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 border-b border-border pb-7 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="font-mono text-[0.68rem] tracking-[0.15em] text-accent uppercase">
            Device library // Mission inputs only
          </p>
          <h3
            className="mt-2 text-2xl font-semibold outline-none"
            id="scenario-library-title"
            ref={libraryHeadingRef}
            tabIndex={-1}
          >
            Saved educational scenarios
          </h3>
          <p className="mt-3 text-sm leading-6 text-muted">
            Save and reload mission-profile inputs on this device. The library
            never evaluates a mission or changes its engineering configuration.
          </p>
        </div>
        <button
          aria-describedby="save-current-mission-hint"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-background transition-opacity outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-45"
          disabled={currentScenario === null}
          onClick={saveCurrentMission}
          type="button"
        >
          <Save aria-hidden="true" size={16} />
          Save Current Mission
        </button>
      </header>

      <p className="sr-only" id="save-current-mission-hint">
        Analyze a custom mission in Module 28 before saving it here.
      </p>

      {storageError ? (
        <p
          className="rounded-xl border border-signal/35 bg-signal/8 p-4 text-sm text-signal"
          role="alert"
        >
          {storageError}
        </p>
      ) : null}

      {scenarios.length === 0 ? (
        <section
          aria-labelledby="scenario-library-empty-title"
          className="rounded-2xl border border-dashed border-border bg-background/30 px-6 py-12 text-center"
        >
          <Database
            aria-hidden="true"
            className="mx-auto text-accent"
            size={28}
          />
          <h4
            className="mt-4 text-lg font-semibold"
            id="scenario-library-empty-title"
          >
            No saved mission scenarios
          </h4>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">
            Configure and analyze a mission in Module 28, then use Save Current
            Mission to add its unchanged input profile to this device library.
          </p>
        </section>
      ) : (
        <div
          aria-label="Saved mission scenarios"
          className="grid gap-4 lg:grid-cols-2"
          role="list"
        >
          {scenarios.map((scenario) => {
            const systems = getIncludedSystems(scenario);
            const loaded = loadedScenario?.scenario.id === scenario.id;

            return (
              <article
                aria-labelledby={`scenario-${scenario.id}-title`}
                className={
                  loaded
                    ? "rounded-2xl border border-accent/60 bg-accent/7 p-5"
                    : "rounded-2xl border border-border bg-background/35 p-5"
                }
                key={scenario.id}
                role="listitem"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[0.62rem] tracking-[0.12em] text-accent uppercase">
                      {formatCategory(scenario.category)}
                    </p>
                    <h4
                      className="mt-2 text-lg font-semibold"
                      id={`scenario-${scenario.id}-title`}
                    >
                      {scenario.name}
                    </h4>
                  </div>
                  {loaded ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/35 bg-accent/8 px-3 py-1 text-[0.65rem] font-semibold text-accent">
                      <CheckCircle2 aria-hidden="true" size={13} />
                      Loaded
                    </span>
                  ) : null}
                </div>

                <p className="mt-3 text-sm leading-6 text-muted">
                  {scenario.description}
                </p>

                <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
                  <div>
                    <dt className="text-muted">Created</dt>
                    <dd className="mt-1 font-mono">
                      {formatTimestamp(scenario.createdAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">Updated</dt>
                    <dd className="mt-1 font-mono">
                      {formatTimestamp(scenario.updatedAt)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-xs text-muted">Included systems</p>
                  <p className="mt-1 text-sm font-semibold">
                    {systems.length > 0
                      ? systems.join(" · ")
                      : "Mission identity only"}
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  <button
                    aria-label={`Load ${scenario.name}`}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-background outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent/45"
                    onClick={() => loadScenario(scenario.id)}
                    type="button"
                  >
                    <Upload aria-hidden="true" size={14} />
                    Load
                  </button>
                  <button
                    aria-label={`Duplicate ${scenario.name}`}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold outline-none hover:border-accent/60 hover:text-accent focus-visible:ring-2 focus-visible:ring-accent/35"
                    onClick={() => copyScenario(scenario.id)}
                    type="button"
                  >
                    <Copy aria-hidden="true" size={14} />
                    Duplicate
                  </button>
                  <button
                    aria-label={`Delete ${scenario.name}`}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-signal/35 px-3 py-2 text-xs font-semibold text-signal outline-none hover:bg-signal/8 focus-visible:ring-2 focus-visible:ring-signal/35"
                    onClick={() => removeScenario(scenario.id)}
                    type="button"
                  >
                    <Trash2 aria-hidden="true" size={14} />
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <p aria-live="polite" className="sr-only" role="status">
        {announcement}
      </p>

      {loadedScenario ? (
        <section
          aria-labelledby="loaded-scenario-analysis-title"
          className="border-t border-border pt-8"
        >
          <h3
            className="text-2xl font-semibold outline-none"
            id="loaded-scenario-analysis-title"
            ref={loadedHeadingRef}
            tabIndex={-1}
          >
            Loaded Mission Profile Analyzer
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            {loadedScenario.scenario.name} is loaded through the analyzer&apos;s
            existing initialMissionProfile input.
          </p>
          <div className="mt-7">
            <MissionProfileAnalyzer
              initialMissionProfile={loadedScenario.scenario.profile}
              key={loadedScenario.revision}
            />
          </div>
        </section>
      ) : null}
    </div>
  );
}
