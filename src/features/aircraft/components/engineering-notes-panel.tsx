import { ChevronDown, FileText } from "lucide-react";

import { ProfileSection } from "@/features/aircraft/components/profile-section";
import { formatEngineeringDomain } from "@/features/aircraft/utils";
import type { EngineeringNote } from "@/features/vehicles/types";

/**
 * A vehicle's engineering observations.
 *
 * The card deliberately shows no editorial state. It used to render each note's
 * `status` as a badge, which meant every profile advertised "PLACEHOLDER" in
 * warning amber — a content-management detail leaking into an end-user
 * aerospace product. `status` still exists on the data and in the formatter,
 * because it remains useful for authoring; it simply is not something a reader
 * needs to see. A note either says something true or it should not ship.
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
          <details
            className="orbix-frame group border-tactical/25 bg-[#080d0c]/90 transition-colors open:border-tactical-amber/35 hover:border-tactical-amber/35"
            key={note.id}
            open={index === 0}
          >
            <summary className="flex min-h-11 cursor-pointer list-none flex-col gap-4 p-5 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-tactical-amber sm:flex-row sm:items-start sm:justify-between sm:p-6 [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-tactical-amber/25 bg-tactical-amber/8 text-tactical-amber">
                  <FileText aria-hidden="true" size={18} strokeWidth={1.7} />
                </span>
                <span>
                  <span className="block font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                    Analysis note 0{index + 1}
                  </span>
                  <span className="font-display mt-1 block text-xl font-semibold">
                    {formatEngineeringDomain(note.topic)}
                  </span>
                </span>
              </span>
              <span className="flex items-center gap-3 self-start">
                <ChevronDown
                  aria-hidden="true"
                  className="text-tactical-amber transition-transform group-open:rotate-180 motion-reduce:transition-none"
                  size={17}
                />
              </span>
            </summary>
            <p className="border-t border-border px-5 pt-5 pb-6 text-sm leading-6 text-muted sm:px-6">
              {note.summary}
            </p>
          </details>
        ))}
      </div>
    </ProfileSection>
  );
}
