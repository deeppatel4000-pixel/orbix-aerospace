import type { MissionPresetCategory } from "@/features/engineering-lab/types";

export interface BriefingHeaderProps {
  readonly category?: MissionPresetCategory;
  readonly missionName: string;
}

const categoryLabels: Readonly<Record<MissionPresetCategory, string>> = {
  "deep-space-concept": "Deep-space concept",
  "lunar-transfer": "Lunar transfer",
  "orbital-deployment": "Orbital deployment",
  "orbital-logistics": "Orbital logistics",
  "reentry-demonstration": "Reentry demonstration",
};

export function BriefingHeader({ category, missionName }: BriefingHeaderProps) {
  return (
    <header className="border-b border-border-subtle pb-4">
      <p className="orbix-label">
        {category ? categoryLabels[category] : "Custom educational mission"}
      </p>
      <h3 className="orbix-h3 mt-1 text-foreground">{missionName}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">
        Educational mission. Values come from the completed mission-profile
        calculation.
      </p>
    </header>
  );
}
