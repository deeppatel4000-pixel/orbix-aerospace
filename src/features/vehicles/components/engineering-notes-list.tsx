import type {
  EngineeringDomain,
  EngineeringNote,
} from "@/features/vehicles/types";

import { VehicleProfileSection } from "./vehicle-profile-section";

interface EngineeringNotesListProps {
  formatTopic: (topic: EngineeringDomain) => string;
  index?: number;
  notes: readonly EngineeringNote[];
}

/**
 * A vehicle's engineering observations (spec 9): every note open, one per
 * topic, each a B612 Mono topic label beside its text, separated by
 * hairline rules. Each note's authoring `status` is deliberately not shown:
 * it is useful while writing, not to a reader.
 */
export function EngineeringNotesList({
  formatTopic,
  index,
  notes,
}: EngineeringNotesListProps) {
  return (
    <VehicleProfileSection
      id="engineering-notes"
      index={index}
      title="Engineering analysis"
    >
      {/* No rule above the first note: the section's own rule is just above. */}
      <div className="[&>article:first-child]:pt-0">
        {notes.map((note) => (
          <article
            className="grid gap-3 border-b border-border-subtle py-6 last:border-b-0 last:pb-0 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6"
            key={note.id}
          >
            <h3 className="orbix-caps pt-1 text-accent">
              {formatTopic(note.topic)}
            </h3>
            <p className="max-w-[68ch] leading-7 text-pretty text-text-secondary">
              {note.summary}
            </p>
          </article>
        ))}
      </div>
    </VehicleProfileSection>
  );
}
