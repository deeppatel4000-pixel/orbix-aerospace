"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { CheckCircle2, CircleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { buttonClass } from "@/components/ui/button-class";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/cn";
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

interface LibraryMessage {
  readonly text: string;
  readonly tone: "error" | "success";
}

interface ScenarioLibraryContextValue {
  readonly currentScenario: MissionScenarioBuilderOutput | null;
  readonly library: MissionScenarioLibrary;
  /** True once the library is backed by this browser's localStorage. */
  readonly persistent: boolean;
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

const STORAGE_UNAVAILABLE_MESSAGE =
  "Browser storage is not available, so scenarios can be saved for this visit only. They will be lost when you leave or reload the page.";

function isQuotaError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === "QuotaExceededError" ||
      error.name === "NS_ERROR_DOM_QUOTA_REACHED")
  );
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
  const [persistent, setPersistent] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    if (initialScenarios !== undefined) return;

    try {
      const persistentLibrary = createScenarioLibrary({
        storage: window.localStorage,
      });
      // Swaps the SSR-safe in-memory library for the localStorage-backed one
      // after mount. `window.localStorage` cannot be read during SSR, so this
      // is the hydration-safe pattern, not derivable state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLibrary(persistentLibrary);
      setScenarios(listScenarios(persistentLibrary));
      setPersistent(true);
    } catch (error) {
      setStorageError(
        error instanceof RangeError
          ? `Saved scenarios on this device could not be read: ${error.message} New saves last for this visit only.`
          : STORAGE_UNAVAILABLE_MESSAGE,
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
      persistent,
      scenarios,
      setCurrentScenario,
      setScenarios,
      storageError,
    }),
    [
      currentScenario,
      library,
      persistent,
      scenarios,
      setCurrentScenario,
      storageError,
    ],
  );

  return (
    <ScenarioLibraryContext.Provider value={contextValue}>
      {children}
    </ScenarioLibraryContext.Provider>
  );
}

/** Connects the scenario builder output to the library. */
export function ScenarioLibraryBuilderTarget() {
  const { setCurrentScenario } = useScenarioLibraryContext();
  return <MissionScenarioBuilder onScenarioCreated={setCurrentScenario} />;
}

function formatCategory(category: MissionScenario["category"]): string {
  const text = category.replaceAll("-", " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
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
  const {
    currentScenario,
    library,
    persistent,
    scenarios,
    setScenarios,
    storageError,
  } = useScenarioLibraryContext();
  const [loadedScenario, setLoadedScenario] = useState<LoadedScenario | null>(
    null,
  );
  const [message, setMessage] = useState<LibraryMessage | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const libraryHeadingRef = useRef<HTMLHeadingElement>(null);
  const loadedHeadingRef = useRef<HTMLHeadingElement>(null);
  const keepButtonRef = useRef<HTMLButtonElement>(null);
  const deleteTriggerRefs = useRef(new Map<string, HTMLButtonElement>());

  useEffect(() => {
    if (pendingDeleteId !== null) keepButtonRef.current?.focus();
  }, [pendingDeleteId]);

  function refreshScenarios() {
    setScenarios(listScenarios(library));
  }

  /**
   * Runs a library write. If the browser refuses to store it (quota full,
   * storage blocked), the in-memory entries the write added are rolled back
   * so the list on screen matches what is actually saved.
   */
  function writeToLibrary(
    write: () => MissionScenario,
    describeSuccess: (scenario: MissionScenario) => string,
    fallbackError: string,
  ) {
    const idsBefore = new Set(listScenarios(library).map(({ id }) => id));

    try {
      const saved = write();
      refreshScenarios();
      setMessage({
        text: persistent
          ? describeSuccess(saved)
          : `${describeSuccess(saved)} It is kept for this visit only because browser storage is not available.`,
        tone: persistent ? "success" : "error",
      });
    } catch (error) {
      for (const scenario of listScenarios(library)) {
        if (!idsBefore.has(scenario.id)) {
          try {
            deleteScenario(library, scenario.id);
          } catch {
            // Storage is still refusing writes; the entry stays in memory.
          }
        }
      }
      refreshScenarios();
      setMessage({
        text: isQuotaError(error)
          ? "Not saved: browser storage for this site is full. Delete a saved scenario, then try again."
          : error instanceof RangeError
            ? `Not saved: ${error.message}`
            : fallbackError,
        tone: "error",
      });
    }
  }

  function saveCurrentMission() {
    if (currentScenario === null) return;

    writeToLibrary(
      () =>
        saveScenario(library, {
          category: currentScenario.category,
          description: currentScenario.description,
          name: currentScenario.profile.missionName,
          profile: currentScenario.profile,
        }),
      (saved) => `Saved "${saved.name}" to the scenario library.`,
      "Not saved: the scenario could not be written to browser storage. Check that site data is allowed, then try again.",
    );
  }

  function copyScenario(id: string) {
    writeToLibrary(
      () => duplicateScenario(library, id),
      (copy) => `Saved a copy as "${copy.name}".`,
      "Not duplicated: the copy could not be written to browser storage.",
    );
  }

  function loadScenario(id: string) {
    const scenario = getScenarioById(library, id);
    if (!scenario) {
      setMessage({
        text: "That scenario is no longer in the library.",
        tone: "error",
      });
      return;
    }

    setLoadedScenario((current) => ({
      revision: (current?.revision ?? 0) + 1,
      scenario,
    }));
    setMessage({
      text: `Loaded "${scenario.name}" into the mission profile analyzer below.`,
      tone: "success",
    });
    window.setTimeout(() => loadedHeadingRef.current?.focus(), 0);
  }

  function cancelDelete() {
    const id = pendingDeleteId;
    setPendingDeleteId(null);
    if (id !== null) {
      window.setTimeout(() => deleteTriggerRefs.current.get(id)?.focus(), 0);
    }
  }

  function confirmDelete(id: string) {
    const scenario = getScenarioById(library, id);
    setPendingDeleteId(null);
    if (!scenario) return;

    try {
      deleteScenario(library, id);
      setMessage({
        text: `Deleted "${scenario.name}" from the scenario library.`,
        tone: "success",
      });
    } catch {
      setMessage({
        text: `"${scenario.name}" was removed from this page, but browser storage could not be updated. It may reappear after a reload.`,
        tone: "error",
      });
    }
    if (loadedScenario?.scenario.id === id) {
      setLoadedScenario(null);
    }
    refreshScenarios();
    window.setTimeout(() => libraryHeadingRef.current?.focus(), 0);
  }

  function handleConfirmKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      cancelDelete();
    }
  }

  return (
    <div className="space-y-6">
      <header
        className={
          // The rule separates the header from the list; an empty library
          // has no list, so it ends on the sentence.
          scenarios.length > 0
            ? "flex flex-col gap-4 border-b border-border-subtle pb-6 md:flex-row md:items-end md:justify-between"
            : "flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        }
      >
        <div className="max-w-[68ch]">
          <h3
            className="orbix-h3 text-foreground outline-none"
            id="scenario-library-title"
            ref={libraryHeadingRef}
            tabIndex={-1}
          >
            {/* The card already says what the library is; the heading
             * names what is in it. */}
            {scenarios.length === 0
              ? "No saved scenarios"
              : `${scenarios.length} saved ${
                  scenarios.length === 1 ? "scenario" : "scenarios"
                }`}
          </h3>
          {/* One sentence beside the Save button: how to save, or what is
           * ready to save. With an empty library it is the whole empty
           * state, so no second heading repeats the title. */}
          <p
            className="mt-2 text-sm leading-6 text-muted"
            id="save-current-mission-hint"
          >
            {currentScenario !== null
              ? `Ready to save "${currentScenario.profile.missionName}" from the mission scenario builder.`
              : scenarios.length === 0
                ? "Analyze a mission in the mission scenario builder, then select Save current mission to keep its inputs here."
                : "To enable saving, open the mission scenario builder and select Analyze mission."}
          </p>
        </div>
        <Button
          aria-describedby="save-current-mission-hint"
          className="shrink-0"
          disabled={currentScenario === null}
          onClick={saveCurrentMission}
        >
          Save current mission
        </Button>
      </header>

      {storageError ? (
        <p
          className="flex items-start gap-2 text-sm leading-6 text-status-danger"
          role="alert"
        >
          <CircleAlert aria-hidden="true" className="mt-1 shrink-0" size={16} />
          {storageError}
        </p>
      ) : null}

      {/* Always mounted so screen readers announce each new message. */}
      <div aria-live="polite" role="status">
        {message ? (
          <p
            className={
              message.tone === "success"
                ? "flex items-start gap-2 text-sm leading-6 text-status-success"
                : "flex items-start gap-2 text-sm leading-6 text-status-danger"
            }
          >
            {message.tone === "success" ? (
              <CheckCircle2
                aria-hidden="true"
                className="mt-1 shrink-0"
                size={16}
              />
            ) : (
              <CircleAlert
                aria-hidden="true"
                className="mt-1 shrink-0"
                size={16}
              />
            )}
            {message.text}
          </p>
        ) : null}
      </div>

      {scenarios.length === 0 ? null : (
        <ul
          aria-label="Saved mission scenarios"
          className="grid gap-x-8 gap-y-4 lg:grid-cols-2"
          role="list"
        >
          {scenarios.map((scenario) => {
            const systems = getIncludedSystems(scenario);
            const loaded = loadedScenario?.scenario.id === scenario.id;
            const confirming = pendingDeleteId === scenario.id;
            const titleId = `scenario-${scenario.id}-title`;

            return (
              <li
                aria-labelledby={titleId}
                className={
                  // Open ruled rows, no box (spec 3.2). The loaded scenario
                  // is marked by the "Loaded" tag and a division-color
                  // rule; loading one changes only color and moves nothing.
                  cn(
                    "border-t pt-4 pb-2",
                    loaded ? "border-accent" : "border-border-subtle",
                  )
                }
                key={scenario.id}
                role="listitem"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="orbix-label">
                      {formatCategory(scenario.category)}
                    </p>
                    <h4
                      className="orbix-h4 mt-1 break-words text-foreground"
                      id={titleId}
                    >
                      {scenario.name}
                    </h4>
                  </div>
                  {loaded ? <Tag tone="accent">Loaded</Tag> : null}
                </div>

                <p className="mt-3 text-sm leading-6 text-muted">
                  {scenario.description}
                </p>

                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="orbix-label">Created</dt>
                    <dd className="mt-1 text-foreground tabular-nums">
                      {formatTimestamp(scenario.createdAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Updated</dt>
                    <dd className="mt-1 text-foreground tabular-nums">
                      {formatTimestamp(scenario.updatedAt)}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="orbix-label">Included systems</dt>
                    <dd className="mt-1 text-foreground">
                      {systems.length > 0
                        ? systems.join(", ")
                        : "Mission identity only"}
                    </dd>
                  </div>
                </dl>

                {confirming ? (
                  <div
                    aria-labelledby={`${titleId}-confirm`}
                    className="mt-4 border-t border-border-subtle pt-4"
                    onKeyDown={handleConfirmKeyDown}
                    role="group"
                  >
                    <p
                      className="text-sm leading-6 text-foreground"
                      id={`${titleId}-confirm`}
                    >
                      Delete &quot;{scenario.name}&quot; from this browser? This
                      cannot be undone.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        className="border-status-danger text-status-danger"
                        onClick={() => confirmDelete(scenario.id)}
                        variant="secondary"
                      >
                        Delete scenario
                      </Button>
                      <button
                        className={buttonClass({ variant: "ghost" })}
                        onClick={cancelDelete}
                        ref={keepButtonRef}
                        type="button"
                      >
                        Keep scenario
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-border-subtle pt-4">
                    <Button
                      aria-label={`Load ${scenario.name}`}
                      onClick={() => loadScenario(scenario.id)}
                      variant="secondary"
                    >
                      Load
                    </Button>
                    <Button
                      aria-label={`Duplicate ${scenario.name}`}
                      onClick={() => copyScenario(scenario.id)}
                      variant="ghost"
                    >
                      Duplicate
                    </Button>
                    <button
                      aria-label={`Delete ${scenario.name}`}
                      className={buttonClass({
                        className: "text-status-danger",
                        variant: "ghost",
                      })}
                      onClick={() => setPendingDeleteId(scenario.id)}
                      ref={(node) => {
                        if (node) {
                          deleteTriggerRefs.current.set(scenario.id, node);
                        } else {
                          deleteTriggerRefs.current.delete(scenario.id);
                        }
                      }}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {loadedScenario ? (
        <section
          aria-labelledby="loaded-scenario-analysis-title"
          className="border-t border-border-subtle pt-8"
        >
          <h3
            className="orbix-h3 text-foreground outline-none"
            id="loaded-scenario-analysis-title"
            ref={loadedHeadingRef}
            tabIndex={-1}
          >
            Mission profile analyzer: {loadedScenario.scenario.name}
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            The saved inputs are loaded into the analyzer below. Edit them there
            to try variations; the saved scenario is not changed.
          </p>
          <div className="mt-6">
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
