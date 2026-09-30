import type { MissionPresetCategory } from "@/features/engineering-lab/types";
import { MissionIdentity } from "../visualization/mission-identity";

export interface BriefingHeaderProps {
  readonly category?: MissionPresetCategory;
  readonly missionName: string;
}

export function BriefingHeader({ category, missionName }: BriefingHeaderProps) {
  return <MissionIdentity category={category} missionName={missionName} />;
}
