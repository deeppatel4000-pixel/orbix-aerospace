import type {
  EngineeringDomain,
  EngineeringNote,
} from "@/features/vehicles/types";

import { VehicleProfileSection } from "./vehicle-profile-section";

interface EngineeringNotesListProps {
  /** One sentence under the heading, as on the other sections. */
  description?: string;
  formatTopic: (topic: EngineeringDomain) => string;
  notes: readonly EngineeringNote[];
}

/**
 * A vehicle's engineering observations (spec 11): every note open, one per
 * topic, the topic as a sentence-case bold label beside its text, separated
 * by space only. Each note's authoring `status` is deliberately not shown:
 * it is useful while writing, not to a reader.
 */
export function EngineeringNotesList({
  description,
  formatTopic,
  notes,
}: EngineeringNotesListProps) {
  return (
    <VehicleProfileSection
      description={description}
      id="engineering-notes"
      title="Engineering analysis"
    >
      <div className="grid gap-8">
        {notes.map((note) => (
          <article
            className="grid gap-2 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-8"
            key={note.id}
          >
            <h3 className="text-base leading-7 font-semibold text-foreground">
              {formatTopic(note.topic)}
            </h3>
            <p className="max-w-[66ch] leading-7 text-pretty text-foreground">
              {note.summary}
            </p>
          </article>
        ))}
      </div>
    </VehicleProfileSection>
  );
}
