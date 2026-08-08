"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import {
  CircleDot,
  Flame,
  MoveRight,
  Orbit,
  Rocket,
  Shield,
  type LucideIcon,
} from "lucide-react";

import type {
  MissionProfileAnalysis,
  MissionReport,
  VehicleReentryEvaluationAnalysis,
} from "@/features/engineering-lab/types";

export interface MissionTimelineProps {
  readonly missionProfileAnalysis: MissionProfileAnalysis;
  readonly missionReport: MissionReport;
  readonly vehicleReentryEvaluation?: VehicleReentryEvaluationAnalysis | null;
}

interface MissionPhase {
  readonly available: boolean;
  readonly detail: string;
  readonly icon: LucideIcon;
  readonly id: string;
  readonly label: string;
  readonly timingLabel: string;
}

const timelineFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

function buildMissionPhases({
  missionProfileAnalysis,
  missionReport,
  vehicleReentryEvaluation,
}: MissionTimelineProps): readonly MissionPhase[] {
  const deltaVBudget = missionProfileAnalysis.sourceAnalyses.deltaVBudget;
  const transfer = deltaVBudget?.sourceAnalyses.hohmannTransfer;
  const planeChange = deltaVBudget?.sourceAnalyses.orbitalPlaneChange;
  const firstManeuver = deltaVBudget?.maneuvers[0];
  const tps = missionReport.thermalAnalysis?.tpsRecommendation;

  return [
    {
      available: deltaVBudget !== undefined,
      detail:
        firstManeuver?.name ??
        "Departure is an educational sequence label; no departure maneuver output was reported.",
      icon: Rocket,
      id: "departure",
      label: "Launch / Departure",
      timingLabel: "Mission start",
    },
    {
      available: transfer !== undefined,
      detail: transfer
        ? `Transfer from ${timelineFormatter.format(transfer.initialOrbit.altitudeMetres)} m to ${timelineFormatter.format(transfer.finalOrbit.altitudeMetres)} m.`
        : "No resolved orbit-transfer output is present.",
      icon: MoveRight,
      id: "orbit-transfer",
      label: "Orbit Transfer",
      timingLabel: transfer
        ? `${timelineFormatter.format(transfer.transfer.transferTimeSeconds)} s reported duration`
        : "Timing not reported",
    },
    {
      available: planeChange !== undefined || Boolean(firstManeuver),
      detail: planeChange
        ? `${timelineFormatter.format(planeChange.inclinationChangeDegrees)} deg reported inclination change.`
        : (firstManeuver?.name ?? "No resolved maneuver output is present."),
      icon: Orbit,
      id: "maneuver",
      label: "Maneuver",
      timingLabel: "Timing not reported",
    },
    {
      available: transfer !== undefined,
      detail: transfer
        ? `${timelineFormatter.format(transfer.finalOrbit.altitudeMetres)} m reported arrival-orbit altitude.`
        : "Arrival orbit is an educational sequence label without a resolved target orbit.",
      icon: CircleDot,
      id: "arrival-orbit",
      label: "Arrival Orbit",
      timingLabel: "Timing not reported",
    },
    {
      available:
        vehicleReentryEvaluation !== undefined &&
        vehicleReentryEvaluation !== null,
      detail: vehicleReentryEvaluation
        ? `${vehicleReentryEvaluation.vehicle.vehicleName} completed the reported reentry profile.`
        : "No completed vehicle reentry evaluation is present.",
      icon: Flame,
      id: "reentry",
      label: "Reentry",
      timingLabel: vehicleReentryEvaluation
        ? `${timelineFormatter.format(vehicleReentryEvaluation.trajectory.durationSeconds)} s reported duration`
        : "Timing not reported",
    },
    {
      available: tps !== undefined,
      detail: tps
        ? `${tps.material.name} is the existing report recommendation.`
        : "No TPS recommendation is present.",
      icon: Shield,
      id: "thermal-protection",
      label: "Thermal Protection",
      timingLabel: "Post-reentry assessment",
    },
  ];
}

export function MissionTimeline(props: MissionTimelineProps) {
  const timelineId = useId().replaceAll(":", "");
  const phases = buildMissionPhases(props);
  const [activeIndex, setActiveIndex] = useState(0);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activePhase = phases[activeIndex] ?? phases[0];
  const progressPercentage =
    phases.length > 1 ? (activeIndex / (phases.length - 1)) * 100 : 0;

  function selectPhase(index: number) {
    setActiveIndex(index);
  }

  function focusPhase(index: number) {
    selectPhase(index);
    buttonRefs.current[index]?.focus();
  }

  function handlePhaseKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusPhase((index + 1) % phases.length);
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusPhase((index - 1 + phases.length) % phases.length);
    }

    if (event.key === "Home") {
      event.preventDefault();
      focusPhase(0);
    }

    if (event.key === "End") {
      event.preventDefault();
      focusPhase(phases.length - 1);
    }
  }

  return (
    <section aria-labelledby={`${timelineId}-title`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[0.62rem] tracking-[0.16em] text-accent uppercase">
            Mission sequence // Reported outputs
          </p>
          <h3 className="mt-1 text-xl font-semibold" id={`${timelineId}-title`}>
            Mission Phases
          </h3>
        </div>
        <p className="font-mono text-[0.66rem] text-muted">
          Arrow keys navigate phases
        </p>
      </div>

      <div
        aria-label="Mission phases"
        className="mt-5 overflow-x-auto pb-2"
        role="tablist"
      >
        <div className="relative grid min-w-[56rem] grid-cols-6 gap-3 px-2 pt-2">
          <div
            aria-hidden="true"
            className="absolute top-8 right-[8.5%] left-[8.5%] h-px bg-white/12"
          >
            <span
              className="block h-px bg-accent transition-[width] duration-500 motion-reduce:transition-none"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {phases.map((phase, index) => {
            const Icon = phase.icon;
            const isActive = index === activeIndex;
            const buttonId = `${timelineId}-${phase.id}-tab`;

            return (
              <button
                aria-controls={`${timelineId}-phase-detail`}
                aria-selected={isActive}
                className="group relative z-10 flex min-h-28 flex-col items-center rounded-xl px-2 py-2 text-center outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#071015]"
                id={buttonId}
                key={phase.id}
                onClick={() => selectPhase(index)}
                onKeyDown={(event) => handlePhaseKeyDown(event, index)}
                ref={(element) => {
                  buttonRefs.current[index] = element;
                }}
                role="tab"
                tabIndex={isActive ? 0 : -1}
                type="button"
              >
                <span
                  className={
                    "flex h-12 w-12 items-center justify-center rounded-full border transition-colors motion-reduce:transition-none " +
                    (isActive
                      ? "border-accent bg-accent/15 text-accent shadow-[0_0_18px_rgba(91,205,190,0.18)] motion-safe:animate-pulse motion-reduce:animate-none"
                      : phase.available
                        ? "border-white/20 bg-[#0b1a20] text-[#a8c2c8] group-hover:border-accent/45 group-hover:text-accent"
                        : "border-white/10 bg-[#0a151a] text-[#60757b]")
                  }
                >
                  <Icon aria-hidden="true" size={18} strokeWidth={1.7} />
                </span>
                <span
                  className={
                    "mt-3 text-xs font-semibold " +
                    (isActive ? "text-foreground" : "text-muted")
                  }
                >
                  {phase.label}
                </span>
                <span className="mt-1 font-mono text-[0.57rem] tracking-[0.08em] text-[#71878d] uppercase">
                  {phase.available ? "Resolved" : "Educational"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {activePhase ? (
        <div
          aria-labelledby={`${timelineId}-${activePhase.id}-tab`}
          className="mt-4 rounded-xl border border-white/10 bg-[#09171c] p-4"
          id={`${timelineId}-phase-detail`}
          role="tabpanel"
          tabIndex={0}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-[0.6rem] tracking-[0.12em] text-accent uppercase">
                Active phase // {activePhase.label}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#b5c7cb]">
                {activePhase.detail}
              </p>
            </div>
            <output className="shrink-0 rounded-lg border border-white/10 bg-black/15 px-3 py-2 font-mono text-xs text-[#d1dee0]">
              {activePhase.timingLabel}
            </output>
          </div>
        </div>
      ) : null}
    </section>
  );
}
