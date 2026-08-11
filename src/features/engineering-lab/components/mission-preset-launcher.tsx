"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CheckCircle2,
  Layers,
  Orbit,
  Plane,
  RotateCcw,
  Upload,
} from "lucide-react";

import { MissionProfileAnalyzer } from "@/features/engineering-lab/components/mission-profile-analyzer";
import {
  getMissionPresetById,
  listMissionPresets,
} from "@/features/engineering-lab/missions";
import type {
  MissionPreset,
  MissionProfileInputs,
} from "@/features/engineering-lab/types";

interface LoadedMissionProfile {
  readonly inputs: MissionProfileInputs;
  readonly revision: number;
}

interface MissionPresetIntegrationContextValue {
  readonly loadMissionProfile: (inputs: MissionProfileInputs) => void;
  readonly loadedMissionProfile: LoadedMissionProfile | null;
}

interface MissionPresetIntegrationProps {
  readonly children: ReactNode;
}

const MissionPresetIntegrationContext =
  createContext<MissionPresetIntegrationContextValue | null>(null);

function useMissionPresetIntegration(): MissionPresetIntegrationContextValue {
  const context = useContext(MissionPresetIntegrationContext);

  if (context === null) {
    throw new Error(
      "Mission preset components must be inside MissionPresetIntegration.",
    );
  }

  return context;
}

/**
 * Owns only the UI handoff between the preset launcher and profile analyzer.
 * Mission inputs remain unchanged and analysis stays inside the analyzer.
 */
export function MissionPresetIntegration({
  children,
}: MissionPresetIntegrationProps) {
  const [loadedMissionProfile, setLoadedMissionProfile] =
    useState<LoadedMissionProfile | null>(null);
  const loadMissionProfile = useCallback((inputs: MissionProfileInputs) => {
    setLoadedMissionProfile((current) => ({
      inputs,
      revision: (current?.revision ?? 0) + 1,
    }));
  }, []);
  const contextValue = useMemo(
    () => ({ loadMissionProfile, loadedMissionProfile }),
    [loadMissionProfile, loadedMissionProfile],
  );

  return (
    <MissionPresetIntegrationContext.Provider value={contextValue}>
      {children}
    </MissionPresetIntegrationContext.Provider>
  );
}

/** Supplies the latest unmodified preset inputs to the existing analyzer. */
export function MissionPresetProfileTarget() {
  const { loadedMissionProfile } = useMissionPresetIntegration();

  return (
    <MissionProfileAnalyzer
      initialMissionProfile={loadedMissionProfile?.inputs}
      key={loadedMissionProfile?.revision ?? "default"}
    />
  );
}

function formatCategory(category: MissionPreset["category"]): string {
  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getIncludedSystems(preset: MissionPreset): readonly string[] {
  const inputs = preset.missionProfileInputs;

  return [
    inputs.deltaVBudget ? "Delta-v budget" : null,
    inputs.vehicleReentryEvaluation ? "Vehicle evaluation" : null,
    inputs.vehicleComparison ? "Vehicle comparison" : null,
  ].filter((system): system is string => system !== null);
}

export function MissionPresetLauncher() {
  const presets = listMissionPresets();
  const { loadMissionProfile } = useMissionPresetIntegration();
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [loadedPresetId, setLoadedPresetId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState(
    "Select an educational mission preset to inspect its configuration.",
  );
  const selectedPreset = selectedPresetId
    ? getMissionPresetById(selectedPresetId)
    : undefined;
  const includedSystems = selectedPreset
    ? getIncludedSystems(selectedPreset)
    : [];

  function selectPreset(preset: MissionPreset) {
    setSelectedPresetId(preset.id);
    setAnnouncement(`${preset.name} selected.`);
  }

  function loadSelectedPreset() {
    if (!selectedPresetId) return;

    const preset = getMissionPresetById(selectedPresetId);
    if (!preset) return;

    loadMissionProfile(preset.missionProfileInputs);
    setLoadedPresetId(preset.id);
    setAnnouncement(`${preset.name} loaded into the Mission Profile Analyzer.`);
  }

  function resetSelection() {
    setSelectedPresetId(null);
    setAnnouncement(
      loadedPresetId
        ? "Preset selection cleared. The loaded mission profile remains active."
        : "Preset selection cleared.",
    );
  }

  return (
    <div className="space-y-7">
      <div>
        <p className="orbix-label text-accent">
          Educational templates // Input only
        </p>
        <h3 className="mt-2 text-xl font-semibold">
          Select a mission architecture
        </h3>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          Presets provide immutable input configurations. Loading a template
          sends its existing MissionProfileInputs directly to the analyzer; this
          launcher performs no engineering calculations.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {presets.map((preset) => {
          const selected = preset.id === selectedPresetId;
          const loaded = preset.id === loadedPresetId;

          return (
            <article
              aria-labelledby={`mission-preset-${preset.id}-title`}
              className={
                selected
                  ? "rounded-2xl border border-accent/60 bg-accent/7 p-5 shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-accent)_15%,transparent)]"
                  : "rounded-2xl border border-border bg-background/35 p-5"
              }
              key={preset.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[0.62rem] tracking-[0.12em] text-accent uppercase">
                    {formatCategory(preset.category)}
                  </p>
                  <h4
                    className="mt-2 text-lg font-semibold"
                    id={`mission-preset-${preset.id}-title`}
                  >
                    {preset.name}
                  </h4>
                </div>
                {loaded ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/35 bg-accent/8 px-3 py-1 text-[0.65rem] font-semibold text-accent">
                    <CheckCircle2 aria-hidden="true" size={13} />
                    Loaded
                  </span>
                ) : null}
              </div>

              <div className="mt-4 space-y-3 text-xs leading-5 text-muted">
                <div>
                  <p className="font-semibold text-foreground">Description</p>
                  <p className="mt-1">{preset.description}</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    Educational purpose
                  </p>
                  <p className="mt-1">
                    Explore a {formatCategory(preset.category).toLowerCase()}{" "}
                    workflow through the integrated laboratory analysis.
                  </p>
                </div>
              </div>

              <button
                aria-label={`Select ${preset.name} mission preset`}
                aria-pressed={selected}
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-border bg-surface/65 px-5 py-2.5 text-sm font-semibold transition-colors outline-none hover:border-accent/60 hover:text-accent focus-visible:ring-2 focus-visible:ring-accent/35"
                onClick={() => selectPreset(preset)}
                type="button"
              >
                {selected ? (
                  <CheckCircle2 aria-hidden="true" size={16} />
                ) : (
                  <Orbit aria-hidden="true" size={16} />
                )}
                {selected ? "Selected" : "Select mission"}
              </button>
            </article>
          );
        })}
      </div>

      <section
        aria-labelledby="selected-mission-preset-title"
        className="rounded-2xl border border-border bg-surface/50 p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[0.65rem] tracking-[0.13em] text-accent uppercase">
              Selected preset
            </p>
            <h3
              className="mt-2 text-xl font-semibold"
              id="selected-mission-preset-title"
            >
              {selectedPreset?.name ?? "No mission selected"}
            </h3>
          </div>
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold transition-colors outline-none hover:border-accent/60 hover:text-accent focus-visible:ring-2 focus-visible:ring-accent/35 disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!selectedPreset}
            onClick={resetSelection}
            type="button"
          >
            <RotateCcw aria-hidden="true" size={14} />
            Reset selection
          </button>
        </div>

        {selectedPreset ? (
          <div className="mt-5 grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(15rem,0.7fr)]">
            <div>
              <p className="text-sm leading-6 text-muted">
                {selectedPreset.description}
              </p>
              <dl className="mt-4">
                <div>
                  <dt className="text-xs text-muted">Mission category</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {formatCategory(selectedPreset.category)}
                  </dd>
                </div>
              </dl>
            </div>
            <div>
              <p className="text-xs text-muted">Systems included</p>
              <ul className="mt-2 space-y-2">
                {includedSystems.length > 0 ? (
                  includedSystems.map((system) => (
                    <li
                      className="flex items-center gap-2 text-sm font-semibold"
                      key={system}
                    >
                      {system === "Delta-v budget" ? (
                        <Orbit
                          aria-hidden="true"
                          className="text-accent"
                          size={15}
                        />
                      ) : system === "Vehicle evaluation" ? (
                        <Plane
                          aria-hidden="true"
                          className="text-accent"
                          size={15}
                        />
                      ) : (
                        <Layers
                          aria-hidden="true"
                          className="text-accent"
                          size={15}
                        />
                      )}
                      {system}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-muted">Mission identity only</li>
                )}
              </ul>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">
            Choose one of the educational cards to inspect and load its input
            configuration.
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center">
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-background transition-opacity outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!selectedPreset}
            onClick={loadSelectedPreset}
            type="button"
          >
            <Upload aria-hidden="true" size={16} />
            Load into Mission Profile Analyzer
          </button>
          {loadedPresetId ? (
            <a
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors outline-none hover:border-accent/60 hover:text-accent focus-visible:ring-2 focus-visible:ring-accent/35 sm:ml-auto"
              href="#mission-profile-analyzer"
            >
              View loaded mission profile
            </a>
          ) : null}
        </div>
      </section>

      <p aria-live="polite" className="sr-only" role="status">
        {announcement}
      </p>
    </div>
  );
}
