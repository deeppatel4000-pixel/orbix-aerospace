import { Container } from "@/components/layout/container";
import { VehicleProfileHero } from "@/features/vehicles/components/vehicle-profile-hero";
import { AircraftProfileCta } from "@/features/aircraft/components/aircraft-profile-cta";
import { AircraftImage } from "@/features/aircraft/components/aircraft-image";
import { AircraftVisualPanel } from "@/features/aircraft/components/aircraft-visual-panel";
import { DimensionsPanel } from "@/features/aircraft/components/dimensions-panel";
import { EngineeringNotesPanel } from "@/features/aircraft/components/engineering-notes-panel";
import { HistoricalTimeline } from "@/features/aircraft/components/historical-timeline";
import { MissionApplications } from "@/features/aircraft/components/mission-applications";
import { MissionOverview } from "@/features/aircraft/components/mission-overview";
import { PerformancePanel } from "@/features/aircraft/components/performance-panel";
import { PropulsionPanel } from "@/features/aircraft/components/propulsion-panel";
import { RelatedAircraft } from "@/features/aircraft/components/related-aircraft";
import { TechnicalDashboard } from "@/features/aircraft/components/technical-dashboard";
import { VariantsPanel } from "@/features/aircraft/components/variants-panel";
import { listAircraft } from "@/features/aircraft/data";
import {
  formatAircraftMeasurement,
  formatAircraftRoles,
} from "@/features/aircraft/utils";
import type { Aircraft } from "@/features/vehicles/types";

interface AircraftProfileProps {
  aircraft: Aircraft;
}

const profileNavigation = [
  { href: "#mission-overview", label: "Mission" },
  { href: "#aircraft-image", label: "Image" },
  { href: "#technical-dashboard", label: "Dashboard" },
  { href: "#performance", label: "Performance" },
  { href: "#dimensions", label: "Dimensions" },
  { href: "#powerplant", label: "Powerplant" },
  { href: "#engineering-notes", label: "Engineering Notes" },
  { href: "#variants", label: "Variants" },
  { href: "#historical-timeline", label: "Timeline" },
  { href: "#mission-applications", label: "Applications" },
  { href: "#related-aircraft", label: "Related" },
] as const;

export function AircraftProfile({ aircraft }: AircraftProfileProps) {
  const maxSpeed = formatAircraftMeasurement(aircraft.performance.maxSpeed);
  const range = formatAircraftMeasurement(aircraft.performance.range);
  const serviceCeiling = formatAircraftMeasurement(
    aircraft.performance.serviceCeiling,
  );
  const relatedAircraft = listAircraft().filter(
    (candidate) => candidate.id !== aircraft.id,
  );

  return (
    <article className="bg-[#050908]">
      <VehicleProfileHero
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: "/aircraft", label: "Aircraft" },
          { label: aircraft.name },
        ]}
        classification={formatAircraftRoles(aircraft.roles)}
        description={aircraft.description}
        media={
          <AircraftImage
            aircraft={aircraft}
            className="-z-20"
            fillContainer
            imageClassName="saturate-[0.82]"
            priority
            sizes="100vw"
          />
        }
        mediaLayout="backdrop"
        name={aircraft.name}
        record={[
          { label: "Maximum speed", value: maxSpeed.value },
          { label: "Range", value: range.value },
          { label: "Service ceiling", value: serviceCeiling.value },
        ]}
      />

      <div className="sticky top-[5.5rem] z-30 border-b border-tactical/25 bg-[#050908]/92 backdrop-blur-xl">
        <Container>
          <nav
            aria-label="Aircraft dossier sections"
            className="[scrollbar-width:thin] overflow-x-auto"
          >
            <ul className="flex min-w-max items-center gap-1 py-3">
              {profileNavigation.map((item) => (
                <li key={item.href}>
                  <a className="orbix-profile-nav-link" href={item.href}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </div>

      <Container>
        <MissionOverview aircraft={aircraft} />
        <AircraftVisualPanel aircraft={aircraft} />
        <TechnicalDashboard aircraft={aircraft} />
        <PerformancePanel performance={aircraft.performance} />
        <DimensionsPanel
          dimensions={aircraft.dimensions}
          weights={aircraft.weights}
        />
        <PropulsionPanel propulsion={aircraft.propulsion} />
        <EngineeringNotesPanel notes={aircraft.engineeringAnalysis} />
        <VariantsPanel variants={aircraft.variants} />
        <HistoricalTimeline aircraft={aircraft} />
        <MissionApplications roles={aircraft.roles} />
        <RelatedAircraft aircraft={relatedAircraft} />
        <AircraftProfileCta aircraft={aircraft} />
      </Container>
    </article>
  );
}
