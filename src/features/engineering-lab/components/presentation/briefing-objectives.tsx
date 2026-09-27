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

  return (
    <section aria-labelledby="mission-briefing-objectives-title">
      <h4
        className="orbix-h4 text-foreground"
        id="mission-briefing-objectives-title"
      >
        Mission objectives
      </h4>
      <p className="mt-1 text-sm leading-6 text-muted">
        What this briefing reviews, based on the analyses the mission includes.
      </p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-text-secondary">
        {objectives.map((objective) => (
          <li key={objective}>{objective}</li>
        ))}
      </ul>
    </section>
  );
}
