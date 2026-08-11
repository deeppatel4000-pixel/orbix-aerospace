import { Crosshair, Orbit, Plane, Shield } from "lucide-react";

import type {
  MissionProfileAnalysis,
  MissionReport,
} from "@/features/engineering-lab/types";

export interface BriefingObjectivesProps {
  readonly missionProfile: MissionProfileAnalysis;
  readonly report?: MissionReport;
}

function buildPresentationObjectives(
  missionProfile: MissionProfileAnalysis,
  report?: MissionReport,
): readonly string[] {
  const objectives: string[] = [];
  const orbital = missionProfile.sourceAnalyses.deltaVBudget;

  if (orbital?.sourceAnalyses.hohmannTransfer) {
    objectives.push(
      "Establish and review the supplied transfer-orbit profile.",
    );
  } else if (orbital) {
    objectives.push("Review the supplied orbital maneuver architecture.");
  }

  if (orbital?.sourceAnalyses.orbitalPlaneChange) {
    objectives.push("Brief the documented orbital plane-change requirement.");
  }

  if (missionProfile.sourceAnalyses.vehicleReentryEvaluation) {
    objectives.push("Evaluate the completed vehicle reentry profile.");
  }

  if (missionProfile.sourceAnalyses.vehicleComparison) {
    objectives.push("Compare the supplied vehicle evaluation outcomes.");
  }

  if (report?.thermalAnalysis) {
    objectives.push("Review thermal loading and TPS selection outputs.");
  }

  objectives.push("Review the integrated educational mission architecture.");
  return objectives;
}

export function BriefingObjectives({
  missionProfile,
  report,
}: BriefingObjectivesProps) {
  const objectives = buildPresentationObjectives(missionProfile, report);
  const icons = [Orbit, Crosshair, Plane, Shield];

  return (
    <section aria-labelledby="mission-briefing-objectives-title">
      <p className="font-mono text-[0.6rem] tracking-[0.16em] text-accent uppercase">
        Presentation objectives // Explanatory only
      </p>
      <h3
        className="mt-1 text-xl font-semibold"
        id="mission-briefing-objectives-title"
      >
        Mission Objectives
      </h3>
      <ol className="mt-5 grid gap-3 sm:grid-cols-2">
        {objectives.map((objective, index) => {
          const Icon = icons[index % icons.length] ?? Crosshair;

          return (
            <li
              className="flex min-h-24 gap-4 rounded-xl border border-white/10 bg-black/15 p-4"
              key={objective}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-accent/6 font-mono text-xs text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <Icon aria-hidden="true" className="text-accent" size={15} />
                <p className="text-muted-strong mt-2 text-sm leading-6">
                  {objective}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
