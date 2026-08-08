import { ChevronDown, FileText } from "lucide-react";

import { ProfileSection } from "@/features/aircraft/components/profile-section";
import {
  formatEngineeringDomain,
  formatEngineeringNoteStatus,
} from "@/features/aircraft/utils";
import type { EngineeringNote } from "@/features/vehicles/types";

interface EngineeringNotesPanelProps {
  notes: readonly EngineeringNote[];
}

export function EngineeringNotesPanel({ notes }: EngineeringNotesPanelProps) {
  return (
    <ProfileSection
      description="Educational analysis prompts reserved for future sourced engineering content."
      eyebrow="07 // Analysis queue"
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
                <span className="border border-signal/30 bg-signal/8 px-3 py-1 font-mono text-[0.62rem] tracking-[0.12em] text-signal uppercase">
                  {formatEngineeringNoteStatus(note.status)}
                </span>
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
