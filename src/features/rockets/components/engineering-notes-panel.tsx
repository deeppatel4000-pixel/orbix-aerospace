import { ChevronDown } from "lucide-react";

import { formatRocketEngineeringDomain } from "@/features/rockets/utils";
import { VehicleProfileSection } from "@/features/vehicles/components/vehicle-profile-section";
import type { EngineeringNote } from "@/features/vehicles/types";

/**
 * A vehicle's engineering observations, one disclosure per topic with the
 * first open. Each note's authoring `status` is deliberately not shown: it is
 * useful while writing, not to a reader.
 */

interface EngineeringNotesPanelProps {
  notes: readonly EngineeringNote[];
}

export function EngineeringNotesPanel({ notes }: EngineeringNotesPanelProps) {
  return (
    <VehicleProfileSection
      description="Concise engineering observations based on public aerospace specifications and documented design characteristics."
      id="engineering-notes"
      title="Engineering analysis"
    >
      <div className="border-t border-border-subtle">
        {notes.map((note, index) => (
          <details
            className="group border-b border-border-subtle"
            key={note.id}
            open={index === 0}
          >
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-3 [&::-webkit-details-marker]:hidden">
              <h3 className="orbix-h3 text-foreground">
                {formatRocketEngineeringDomain(note.topic)}
              </h3>
              <ChevronDown
                aria-hidden="true"
                className="shrink-0 text-muted transition-transform duration-150 group-open:rotate-180 motion-reduce:transition-none"
                size={16}
              />
            </summary>
            <div className="orbix-prose pb-6">
              <p>{note.summary}</p>
            </div>
          </details>
        ))}
      </div>
    </VehicleProfileSection>
  );
}
