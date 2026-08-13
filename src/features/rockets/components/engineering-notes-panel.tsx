import { FileText } from "lucide-react";

import { ProfileSection } from "@/features/rockets/components/profile-section";
import { formatRocketEngineeringDomain } from "@/features/rockets/utils";
import type { EngineeringNote } from "@/features/vehicles/types";

/**
 * A launch vehicle's engineering observations.
 *
 * The rockets twin of the aircraft panel, and it must stay in step with it:
 * both once rendered each note's `status` as a badge, so every profile
 * advertised "PLACEHOLDER" in warning amber. `status` still exists on the data
 * and in the formatter, because it remains useful for authoring; it is simply
 * not something a reader needs to see.
 */

interface EngineeringNotesPanelProps {
  notes: readonly EngineeringNote[];
}

export function EngineeringNotesPanel({ notes }: EngineeringNotesPanelProps) {
  return (
    <ProfileSection
      description="Concise engineering observations based on public aerospace specifications and documented design characteristics."
      eyebrow="Engineering analysis"
      mode="editorial"
      id="engineering-notes"
      title="Engineering Notes"
    >
      <div className="grid gap-4">
        {notes.map((note, index) => (
          <article
            className="orbix-frame border-atmosphere/20 bg-surface/70 p-5 sm:p-6"
            key={note.id}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center border border-atmosphere/25 bg-background/45 text-accent">
                  <FileText aria-hidden="true" size={18} strokeWidth={1.7} />
                </span>
                <div>
                  <p className="font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                    Analysis note {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="font-display mt-1 text-xl font-semibold">
                    {formatRocketEngineeringDomain(note.topic)}
                  </h3>
                </div>
              </div>
            </div>
            <p className="mt-5 border-t border-border pt-5 text-sm leading-6 text-muted">
              {note.summary}
            </p>
          </article>
        ))}
      </div>
    </ProfileSection>
  );
}
