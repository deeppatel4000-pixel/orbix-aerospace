import { FileText } from "lucide-react";

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
      eyebrow="05 // Analysis queue"
      id="engineering-notes"
      title="Engineering Notes"
    >
      <div className="grid gap-4">
        {notes.map((note, index) => (
          <article
            className="orbix-frame border-tactical/25 bg-[#080d0c]/90 p-5 transition-colors hover:border-tactical-amber/35 sm:p-6"
            key={note.id}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center border border-tactical-amber/25 bg-tactical-amber/8 text-tactical-amber">
                  <FileText aria-hidden="true" size={18} strokeWidth={1.7} />
                </span>
                <div>
                  <p className="font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                    Analysis note 0{index + 1}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold">
                    {formatEngineeringDomain(note.topic)}
                  </h3>
                </div>
              </div>
              <span className="self-start border border-signal/30 bg-signal/8 px-3 py-1 font-mono text-[0.62rem] tracking-[0.12em] text-signal uppercase">
                {formatEngineeringNoteStatus(note.status)}
              </span>
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
