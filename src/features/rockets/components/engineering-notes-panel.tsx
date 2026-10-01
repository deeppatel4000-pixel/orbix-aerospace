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
      description="Short notes on the engineering of the launch vehicle, one for each topic in the record."
      formatTopic={formatRocketEngineeringDomain}
      notes={notes}
    />
  );
}
