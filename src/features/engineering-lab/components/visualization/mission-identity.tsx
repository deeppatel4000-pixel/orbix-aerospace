import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import type { MissionPresetCategory } from "@/features/engineering-lab/types";

import { HeadingLevel, LabHeading } from "./lab-heading";

export const MISSION_CATEGORY_LABELS: Readonly<
  Record<MissionPresetCategory, string>
> = {
  "deep-space-concept": "Deep-space concept",
  "lunar-transfer": "Lunar transfer",
  "orbital-deployment": "Orbital deployment",
  "orbital-logistics": "Orbital logistics",
  "reentry-demonstration": "Reentry demonstration",
};

export interface MissionIdentityProps {
  readonly category?: MissionPresetCategory;
  /** Extra rows under the name, such as Mission control's record line. */
  readonly children?: ReactNode;
  readonly className?: string;
  readonly headingId?: string;
  /**
   * A fixed level for the name, for a caller whose own content sits at a
   * deeper context level (Mission control sets level 4 for its views).
   */
  readonly level?: number;
  readonly missionName: string;
}

/**
 * The first row of every mission tool: the category label and the mission
 * name. The tool card above already titles and describes the tool, so this
 * row carries no second title or lead, only which mission is loaded.
 */
export function MissionIdentity({
  category,
  children,
  className,
  headingId,
  level,
  missionName,
}: MissionIdentityProps) {
  const name = (
    <LabHeading className="mt-1" id={headingId}>
      {missionName}
    </LabHeading>
  );

  return (
    <header className={cn("border-b border-border-subtle pb-4", className)}>
      <p className="orbix-label">
        {category
          ? MISSION_CATEGORY_LABELS[category]
          : "Custom educational mission"}
      </p>
      {level === undefined ? (
        name
      ) : (
        <HeadingLevel level={level}>{name}</HeadingLevel>
      )}
      {children}
    </header>
  );
}
