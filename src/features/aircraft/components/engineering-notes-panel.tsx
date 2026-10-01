import { formatEngineeringDomain } from "@/features/aircraft/utils";
import { EngineeringNotesList } from "@/features/vehicles/components/engineering-notes-list";
import type { EngineeringNote } from "@/features/vehicles/types";

interface EngineeringNotesPanelProps {
  notes: readonly EngineeringNote[];
}

/** The aircraft's engineering observations, one titled entry per topic. */
export function EngineeringNotesPanel({ notes }: EngineeringNotesPanelProps) {
  return (
    <EngineeringNotesList formatTopic={formatEngineeringDomain} notes={notes} />
  );
}
