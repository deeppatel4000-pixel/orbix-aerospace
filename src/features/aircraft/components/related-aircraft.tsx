import { AircraftImage } from "@/features/aircraft/components/aircraft-image";
import { ProfileSection } from "@/features/aircraft/components/profile-section";
import {
  formatAircraftMeasurement,
  formatAircraftRoles,
} from "@/features/aircraft/utils";
import { VehicleMediaFrame } from "@/features/vehicles/components/vehicle-media-frame";
import { VehicleRecordCard } from "@/features/vehicles/components/vehicle-record-card";
import type { Aircraft } from "@/features/vehicles/types";

interface RelatedAircraftProps {
  aircraft: readonly Aircraft[];
}

/**
 * Related aircraft, rendered in the Vehicle Discovery language.
 *
 * Previously this duplicated index-card markup by hand — its own frame, its
 * own media aspect, its own overlay and its own link treatment — which is why
 * the end of a profile looked unrelated to `/aircraft`. It now uses the same
 * `VehicleRecordCard` and `VehicleMediaFrame` primitives in their `compact`
 * variant, so continuing from a profile into discovery is visually continuous
 * without ending the page in five full-height index cards.
 */
export function RelatedAircraft({ aircraft }: RelatedAircraftProps) {
  return (
    <ProfileSection
      description="Continue into other aircraft records available in the same public engineering registry."
      eyebrow="Registry links"
      id="related-aircraft"
      mode="media"
      title="Related Aircraft"
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {aircraft.map((item) => (
          <VehicleRecordCard
            classification={formatAircraftRoles(item.roles)}
            description={item.description}
            href={`/aircraft/${item.id}`}
            key={item.id}
            media={
              <VehicleMediaFrame aspect="landscape">
                <AircraftImage
                  aircraft={item}
                  fillContainer
                  imageClassName="saturate-[0.85]"
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 24vw"
                />
              </VehicleMediaFrame>
            }
            name={item.name}
            specs={[
              {
                label: "Maximum speed",
                value: formatAircraftMeasurement(item.performance.maxSpeed)
                  .value,
              },
            ]}
            variant="compact"
          />
        ))}
      </div>
    </ProfileSection>
  );
}
