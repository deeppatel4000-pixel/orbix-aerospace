import { formatRocketEngineeringDomain } from "@/features/rockets/utils";
import { EngineeringNotesList } from "@/features/vehicles/components/engineering-notes-list";
import type { EngineeringNote } from "@/features/vehicles/types";

interface EngineeringNotesPanelProps {
  notes: readonly EngineeringNote[];
}

/** The launch vehicle's engineering observations, one entry per topic. */
export function EngineeringNotesPanel({ notes }: EngineeringNotesPanelProps) {
  return (
    <EngineeringNotesList
      formatTopic={formatRocketEngineeringDomain}
      notes={notes}
    />
  );
}
