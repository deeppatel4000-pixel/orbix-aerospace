"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CircleCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonArrowIcon } from "@/components/ui/button-arrow";
import { buttonClass } from "@/components/ui/button-class";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/cn";
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
      <fieldset className="orbix-fieldset">
        <legend className="text-foreground">Choose a mission preset</legend>
        {/* One treatment at every width: each option is an open row on a
         * 1px top rule across its full width, with no box and no fill
         * (spec 3.2). The chosen option's rule becomes a 2px accent rule
         * and it shows a check; the rule never reaches past the column
         * edge the rules above and below stop at. */}
        <div className="grid gap-y-3 lg:grid-cols-2 lg:gap-x-6">
          {presets.map((preset, presetIndex) => {
            const selected = preset.id === selectedPresetId;
            const loaded = preset.id === loadedPresetId;
            const inputId = `mission-preset-${preset.id}`;

            return (
              <label
                className={cn(
                  // Padding is equal in both states, so choosing a preset
                  // changes only color and the weight of the top rule.
                  "group relative flex cursor-pointer gap-3 py-4 transition-colors before:pointer-events-none before:absolute before:inset-x-0 before:top-0",
                  // An odd last tile spans both columns, so no blank cell.
                  presets.length % 2 === 1 &&
                    presetIndex === presets.length - 1 &&
                    "lg:col-span-2",
                  "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--orbix-focus)]",
                  selected
                    ? "before:h-0.5 before:bg-accent"
                    : "before:h-px before:bg-border-subtle hover:before:bg-rule-strong",
                )}
                htmlFor={inputId}
                key={preset.id}
              >
                {/* Native radio for the group semantics and arrow keys,
                    visually hidden under a drawn radio pinned to the row's
                    top-right corner. The text always keeps clear of that
                    corner, so choosing a preset moves nothing. */}
                <input
                  aria-describedby={`${inputId}-description`}
                  checked={selected}
                  className="absolute inset-0 m-0 cursor-pointer appearance-none opacity-0"
                  id={inputId}
                  name="mission-preset"
                  onChange={() => {
                    setSelectedPresetId(preset.id);
                    setMessage(null);
                  }}
                  type="radio"
                  value={preset.id}
                />
                {/* A drawn radio (1px outline at rest, accent ring and dot
                    when chosen), so an unselected row still reads as a
                    choice. Drawn in SVG: the ring is the control's own
                    shape, not a rounded box. */}
                <svg
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute top-4 right-0 h-4 w-4 transition-colors",
                    selected
                      ? "text-accent"
                      : "text-rule-strong group-hover:text-foreground",
                  )}
                  viewBox="0 0 16 16"
                >
                  <circle
                    cx="8"
                    cy="8"
                    fill="none"
                    r="7.5"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                  {selected ? (
                    <circle cx="8" cy="8" fill="currentColor" r="4" />
                  ) : null}
                </svg>
                <span className="min-w-0 pr-6">
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
                    <Tag className="mt-3" tone="accent">
                      Loaded
                    </Tag>
                  ) : null}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <section
        aria-labelledby="selected-mission-preset-title"
        className="border-t border-border-subtle pt-5"
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
            Load into the mission profile analyzer
          </Button>
          {loadedPreset ? (
            <a
              className={buttonClass({ variant: "secondary" })}
              href="#mission-profile-analyzer"
            >
              Open the mission profile analyzer
              <ButtonArrowIcon direction="down" />
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
