import { formatEngineeringDomain } from "@/features/aircraft/utils";
import { EngineeringNotesList } from "@/features/vehicles/components/engineering-notes-list";
import type { EngineeringNote } from "@/features/vehicles/types";

interface EngineeringNotesPanelProps {
  index?: number;
  notes: readonly EngineeringNote[];
}

/** The aircraft's engineering observations, one titled entry per topic. */
export function EngineeringNotesPanel({
  index,
  notes,
}: EngineeringNotesPanelProps) {
  return (
    <EngineeringNotesList
      formatTopic={formatEngineeringDomain}
      index={index}
      notes={notes}
    />
  );
}
