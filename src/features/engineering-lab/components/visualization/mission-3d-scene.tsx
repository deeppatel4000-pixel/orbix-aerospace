"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Box, Flame, Orbit, Radar } from "lucide-react";

import type {
  MissionProfileAnalysis,
  MissionReport,
  VehicleReentryEvaluationAnalysis,
} from "@/features/engineering-lab/types";

import { EarthModel } from "./earth-model";
import { OrbitPath3D } from "./orbit-path-3d";
import { SpacecraftMarker } from "./spacecraft-marker";

export type Mission3DMode = "orbital" | "reentry";

export interface Mission3DSceneProps {
  readonly initialMode?: Mission3DMode;
  readonly missionProfileAnalysis?: MissionProfileAnalysis | null;
  readonly missionReport?: MissionReport | null;
  readonly vehicleReentryEvaluation?: VehicleReentryEvaluationAnalysis | null;
}

const sceneFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

const sceneModes = [
  { icon: Orbit, id: "orbital", label: "Orbital Mission" },
  { icon: Flame, id: "reentry", label: "Reentry Mission" },
] as const;

function SceneTelemetry({
  label,
  unit,
  value,
}: {
  readonly label: string;
  readonly unit?: string;
  readonly value: number | string | undefined;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#03090d]/80 px-3 py-2 backdrop-blur-sm">
      <dt className="font-mono text-[0.5rem] tracking-[0.1em] text-[#70878d] uppercase">
        {label}
      </dt>
      <dd className="mt-1">
        <output className="font-mono text-xs font-semibold text-[#d9e5e6]">
          {typeof value === "number"
            ? sceneFormatter.format(value)
            : (value ?? "Not reported")}
          {value !== undefined && unit ? ` ${unit}` : ""}
        </output>
      </dd>
    </div>
  );
}

export function Mission3DScene({
  initialMode,
  missionProfileAnalysis,
  missionReport,
  vehicleReentryEvaluation,
}: Mission3DSceneProps) {
  const deltaVBudget = missionProfileAnalysis?.sourceAnalyses.deltaVBudget;
  const transfer = deltaVBudget?.sourceAnalyses.hohmannTransfer;
  const planeChange = deltaVBudget?.sourceAnalyses.orbitalPlaneChange;
  const hasOrbitalScene = Boolean(transfer || planeChange);
  const hasReentryScene = Boolean(
    vehicleReentryEvaluation?.trajectory.trajectoryPoints.length,
  );
  const [activeMode, setActiveMode] = useState<Mission3DMode>(
    initialMode ?? (hasOrbitalScene ? "orbital" : "reentry"),
  );
  const modeRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const missionName =
    missionReport?.missionSummary.missionName ??
    missionProfileAnalysis?.missionName ??
    "Mission visualization";

  if (!hasOrbitalScene && !hasReentryScene) {
    return (
      <section
        aria-label="Interactive 3D mission scene"
        className="rounded-2xl border border-white/10 bg-[#040b0f] p-6"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-accent">
            <Box aria-hidden="true" size={18} />
          </span>
          <div>
            <p className="font-mono text-[0.62rem] tracking-[0.14em] text-accent uppercase">
              Spatial mission view
            </p>
            <h3 className="mt-1 text-lg font-semibold">
              3D mission visualization unavailable
            </h3>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-[#83989d]">
          A resolved orbital transfer, orbital maneuver, or vehicle reentry
          evaluation is required to render the presentation scene.
        </p>
      </section>
    );
  }

  function selectMode(mode: Mission3DMode) {
    const modeAvailable =
      mode === "orbital" ? hasOrbitalScene : hasReentryScene;

    if (modeAvailable) setActiveMode(mode);
  }

  function focusMode(index: number) {
    const mode = sceneModes[index];

    if (!mode) return;

    const modeAvailable =
      mode.id === "orbital" ? hasOrbitalScene : hasReentryScene;

    if (!modeAvailable) return;

    setActiveMode(mode.id);
    modeRefs.current[index]?.focus();
  }

  function handleModeKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex =
        (index + direction + sceneModes.length) % sceneModes.length;
      focusMode(nextIndex);
    }
  }

  return (
    <section
      aria-labelledby="mission-3d-scene-title"
      className="overflow-hidden rounded-2xl border border-white/12 bg-[#02070a]"
    >
      <header className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="flex items-center gap-2 font-mono text-[0.61rem] tracking-[0.16em] text-accent uppercase">
            <Radar aria-hidden="true" size={14} />
            Spatial telemetry // Presentation geometry
          </p>
          <h3
            className="mt-1 text-lg font-semibold"
            id="mission-3d-scene-title"
          >
            Interactive 3D Mission Scene
          </h3>
          <p className="mt-1 text-xs text-[#748a90]">{missionName}</p>
        </div>

        <div
          aria-label="3D mission mode"
          className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-[#061015] p-1.5"
          role="tablist"
        >
          {sceneModes.map((mode, index) => {
            const Icon = mode.icon;
            const available =
              mode.id === "orbital" ? hasOrbitalScene : hasReentryScene;
            const isActive = mode.id === activeMode;

            return (
              <button
                aria-controls="mission-3d-scene-panel"
                aria-selected={isActive}
                className={
                  "flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none " +
                  (isActive
                    ? "bg-accent/12 text-accent"
                    : "text-[#84999e] hover:bg-white/5 hover:text-[#dce6e7]")
                }
                disabled={!available}
                id={`mission-3d-${mode.id}-tab`}
                key={mode.id}
                onClick={() => selectMode(mode.id)}
                onKeyDown={(event) => handleModeKeyDown(event, index)}
                ref={(element) => {
                  modeRefs.current[index] = element;
                }}
                role="tab"
                tabIndex={isActive ? 0 : -1}
                type="button"
              >
                <Icon aria-hidden="true" size={14} />
                {mode.label}
              </button>
            );
          })}
        </div>
      </header>

      <div
        aria-labelledby={`mission-3d-${activeMode}-tab`}
        className="relative min-h-[34rem] overflow-hidden"
        id="mission-3d-scene-panel"
        role="tabpanel"
        style={{ perspective: "1000px" }}
        tabIndex={0}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-80"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 18%, rgba(255,255,255,0.8) 0 1px, transparent 1.5px), radial-gradient(circle at 78% 24%, rgba(255,255,255,0.7) 0 1px, transparent 1.5px), radial-gradient(circle at 42% 72%, rgba(125,213,218,0.65) 0 1px, transparent 1.5px), radial-gradient(circle at 88% 80%, rgba(255,255,255,0.55) 0 1px, transparent 1.5px), linear-gradient(180deg, #02070b 0%, #06131a 100%)",
            backgroundSize:
              "112px 112px, 173px 173px, 137px 137px, 209px 209px, 100% 100%",
          }}
        />
        <div
          aria-hidden="true"
          className="technical-grid absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)] opacity-20"
        />

        {activeMode === "orbital" ? (
          <div aria-label="Orbital mission scene" className="absolute inset-0">
            <div className="absolute inset-0 flex [transform:translateZ(30px)] items-center justify-center pb-10">
              <EarthModel label="Earth with orbital mission paths" />
            </div>
            <OrbitPath3D
              finalAltitudeMetres={transfer?.finalOrbit.altitudeMetres}
              initialAltitudeMetres={transfer?.initialOrbit.altitudeMetres}
              transferAvailable={transfer !== undefined}
            />

            <dl className="absolute top-4 left-4 grid gap-2 sm:grid-cols-2">
              <SceneTelemetry
                label="Mission phase"
                value={transfer ? "Orbit transfer" : "Orbital maneuver"}
              />
              <SceneTelemetry
                label="Total delta-v"
                unit="m/s"
                value={
                  missionReport?.orbitalAnalysis?.totalDeltaVMetresPerSecond
                }
              />
              <SceneTelemetry
                label="Transfer duration"
                unit="s"
                value={transfer?.transfer.transferTimeSeconds}
              />
              <SceneTelemetry
                label="Plane change"
                unit="deg"
                value={planeChange?.inclinationChangeDegrees}
              />
            </dl>
          </div>
        ) : (
          <div aria-label="Reentry mission scene" className="absolute inset-0">
            <div className="absolute -bottom-24 -left-16 [transform:translateZ(20px)] sm:-bottom-20 sm:left-[6%]">
              <EarthModel label="Earth atmospheric reentry target" />
            </div>

            <div className="absolute top-[18%] right-[8%] h-[55%] w-[68%] rotate-[24deg] border-t border-dashed border-signal/45 [transform-style:preserve-3d] sm:right-[12%] sm:w-[58%]">
              <div className="absolute -top-[4.5rem] right-[8%] motion-safe:animate-bounce motion-reduce:animate-none">
                <SpacecraftMarker
                  phaseLabel="Atmospheric descent"
                  thermalActive
                />
              </div>
              <span className="absolute -top-7 left-1/2 rounded border border-signal/20 bg-[#071116]/90 px-2 py-1 font-mono text-[0.52rem] tracking-[0.08em] text-signal uppercase">
                Reentry corridor
              </span>
            </div>

            <div className="absolute right-0 bottom-0 left-0 h-[34%] border-t border-[#65cfd4]/20 bg-gradient-to-t from-[#0b4a58]/28 to-transparent shadow-[0_-24px_60px_rgba(45,164,174,0.08)]">
              <span className="absolute top-3 right-4 font-mono text-[0.55rem] tracking-[0.12em] text-[#75aab0] uppercase">
                Atmospheric interface
              </span>
            </div>

            <div className="absolute top-4 right-4 flex items-center gap-2 rounded-lg border border-signal/20 bg-[#100e08]/80 px-3 py-2 text-signal backdrop-blur-sm">
              <Flame aria-hidden="true" size={14} />
              <span className="font-mono text-[0.57rem] tracking-[0.1em] uppercase">
                Heating phase indicated
              </span>
            </div>

            <dl className="absolute top-4 left-4 grid gap-2 sm:grid-cols-2">
              <SceneTelemetry
                label="Vehicle"
                value={vehicleReentryEvaluation?.vehicle.vehicleName}
              />
              <SceneTelemetry
                label="Initial altitude"
                unit="m"
                value={
                  vehicleReentryEvaluation?.summary.flight.initialAltitudeMeters
                }
              />
              <SceneTelemetry
                label="Reentry duration"
                unit="s"
                value={
                  vehicleReentryEvaluation?.summary.flight
                    .reentryDurationSeconds
                }
              />
              <SceneTelemetry
                label="Peak heating"
                unit="kW/m²"
                value={
                  vehicleReentryEvaluation?.summary.thermal
                    .peakHeatFluxKilowattsPerSquareMetre
                }
              />
            </dl>
          </div>
        )}

        <p className="absolute right-4 bottom-3 left-4 text-center font-mono text-[0.52rem] tracking-[0.08em] text-[#61777d] uppercase">
          Illustrative presentation geometry // Not to scale
        </p>
      </div>

      <p aria-live="polite" className="sr-only" role="status">
        Active 3D mission mode:{" "}
        {activeMode === "orbital" ? "Orbital Mission" : "Reentry Mission"}.
      </p>
    </section>
  );
}
