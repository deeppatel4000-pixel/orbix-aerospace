import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { AircraftImage } from "@/features/aircraft/components/aircraft-image";
import { ProfileSection } from "@/features/aircraft/components/profile-section";
import { formatAircraftRoles } from "@/features/aircraft/utils";
import type { Aircraft } from "@/features/vehicles/types";

interface RelatedAircraftProps {
  aircraft: readonly Aircraft[];
}

export function RelatedAircraft({ aircraft }: RelatedAircraftProps) {
  return (
    <ProfileSection
      description="Continue into other aircraft records available in the same public engineering registry."
      eyebrow="11 // Registry links"
      id="related-aircraft"
      title="Related Aircraft"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {aircraft.map((item) => {
          const titleId = `related-aircraft-${item.id}`;

          return (
            <article
              aria-labelledby={titleId}
              className="orbix-frame overflow-hidden border-tactical/25 bg-[#080d0c]/90"
              key={item.id}
            >
              <div className="relative aspect-[16/10] overflow-hidden border-b border-tactical/20">
                <AircraftImage
                  aircraft={item}
                  fillContainer
                  imageClassName="saturate-[0.86] contrast-[1.04]"
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 35vw"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/78 via-transparent to-transparent"
                />
                <p className="absolute right-4 bottom-4 left-4 font-mono text-[0.58rem] tracking-[0.12em] text-tactical-amber uppercase">
                  {formatAircraftRoles(item.roles)}
                </p>
              </div>
              <div className="p-5">
                <h3
                  className="font-display text-2xl font-semibold"
                  id={titleId}
                >
                  {item.name}
                </h3>
                <p className="mt-2 text-sm text-muted">{item.manufacturer}</p>
                <Link
                  aria-label={`Open ${item.name} engineering dossier`}
                  className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-tactical-amber focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tactical-amber"
                  href={`/aircraft/${item.id}`}
                >
                  Open dossier <ArrowUpRight aria-hidden="true" size={15} />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </ProfileSection>
  );
}
