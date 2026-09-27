"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CircleCheck, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { buttonClass } from "@/components/ui/button-class";
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
  const text = category.replaceAll("-", " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
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
  const [message, setMessage] = useState<string | null>(null);
  const selectedPreset = selectedPresetId
    ? getMissionPresetById(selectedPresetId)
    : undefined;
  const loadedPreset = loadedPresetId
    ? getMissionPresetById(loadedPresetId)
    : undefined;
  const includedSystems = selectedPreset
    ? getIncludedSystems(selectedPreset)
    : [];

  function loadSelectedPreset() {
    if (!selectedPresetId) return;

    const preset = getMissionPresetById(selectedPresetId);
    if (!preset) return;

    loadMissionProfile(preset.missionProfileInputs);
    setLoadedPresetId(preset.id);
    setMessage(
      `Loaded "${preset.name}" into the mission profile analyzer. Open it to see the results.`,
    );
  }

  return (
    <div className="space-y-6">
      <p className="max-w-[68ch] text-sm leading-6 text-muted">
        Each preset is a fixed set of mission-profile inputs. Loading one
        replaces the inputs in the mission profile analyzer; this page does no
        calculation of its own.
      </p>

      <fieldset className="orbix-fieldset">
        <legend className="text-foreground">Choose a mission preset</legend>
        <div className="grid gap-3 lg:grid-cols-2">
          {presets.map((preset) => {
            const selected = preset.id === selectedPresetId;
            const loaded = preset.id === loadedPresetId;
            const inputId = `mission-preset-${preset.id}`;

            return (
              <label
                className={
                  selected
                    ? "flex cursor-pointer gap-3 rounded-md border border-l-2 border-border-strong border-l-accent bg-accent/12 p-4"
                    : "flex cursor-pointer gap-3 rounded-md border border-border bg-surface p-4 hover:border-border-strong"
                }
                htmlFor={inputId}
                key={preset.id}
              >
                <input
                  aria-describedby={`${inputId}-description`}
                  checked={selected}
                  className="mt-1 h-4 w-4 shrink-0 accent-accent"
                  id={inputId}
                  name="mission-preset"
                  onChange={() => {
                    setSelectedPresetId(preset.id);
                    setMessage(null);
                  }}
                  type="radio"
                  value={preset.id}
                />
                <span className="min-w-0">
                  <span className="orbix-label block">
                    {formatCategory(preset.category)}
                  </span>
                  <span
                    className="orbix-h4 mt-1 block text-foreground"
                    id={`${inputId}-title`}
                  >
                    {preset.name}
                  </span>
                  <span
                    className="mt-2 block text-sm leading-6 text-muted"
                    id={`${inputId}-description`}
                  >
                    {preset.description}
                  </span>
                  {loaded ? (
                    <span className="orbix-status orbix-status--positive mt-3">
                      Loaded
                    </span>
                  ) : null}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <section
        aria-labelledby="selected-mission-preset-title"
        className="rounded-md border border-border bg-surface p-4 sm:p-6"
      >
        <h3
          className="orbix-h3 text-foreground"
          id="selected-mission-preset-title"
        >
          {selectedPreset?.name ?? "No preset selected"}
        </h3>

        {selectedPreset ? (
          <dl className="mt-4 grid gap-4 text-sm md:grid-cols-2">
            <div>
              <dt className="orbix-label">Mission category</dt>
              <dd className="mt-1 text-foreground">
                {formatCategory(selectedPreset.category)}
              </dd>
            </div>
            <div>
              <dt className="orbix-label">Systems included</dt>
              <dd className="mt-1 text-foreground">
                {includedSystems.length > 0
                  ? includedSystems.join(", ")
                  : "Mission identity only"}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="mt-2 text-sm leading-6 text-muted">
            Choose a preset above to see what it includes.
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border-subtle pt-4">
          <Button disabled={!selectedPreset} onClick={loadSelectedPreset}>
            <Upload aria-hidden="true" size={16} />
            Load into Mission Profile Analyzer
          </Button>
          {loadedPreset ? (
            <a
              className={buttonClass({ variant: "secondary" })}
              href="#mission-profile-analyzer"
            >
              Open the mission profile analyzer
            </a>
          ) : null}
        </div>

        <div aria-live="polite" className="mt-4" role="status">
          {message ? (
            <p className="flex items-start gap-2 text-sm leading-6 text-status-success">
              <CircleCheck
                aria-hidden="true"
                className="mt-1 shrink-0"
                size={16}
              />
              {message}
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
