import { Container } from "@/components/layout/container";
import { VehicleMediaFrame } from "@/features/vehicles/components/vehicle-media-frame";
import { VehicleProfileHero } from "@/features/vehicles/components/vehicle-profile-hero";
import { ArchitecturePanel } from "@/features/rockets/components/architecture-panel";
import { EngineeringNotesPanel } from "@/features/rockets/components/engineering-notes-panel";
import { PerformancePanel } from "@/features/rockets/components/performance-panel";
import { PropulsionPanel } from "@/features/rockets/components/propulsion-panel";
import { RelatedRockets } from "@/features/rockets/components/related-rockets";
import { RocketImage } from "@/features/rockets/components/rocket-image";
import { RocketMissionApplications } from "@/features/rockets/components/rocket-mission-applications";
import { RocketMissionOverview } from "@/features/rockets/components/rocket-mission-overview";
import { RocketProfileCta } from "@/features/rockets/components/rocket-profile-cta";
import { RocketTechnicalDashboard } from "@/features/rockets/components/rocket-technical-dashboard";
import { RocketVisualPanel } from "@/features/rockets/components/rocket-visual-panel";
import { listRockets } from "@/features/rockets/data";
import {
  formatOrbitType,
  formatRocketMeasurement,
} from "@/features/rockets/utils";
import type { Rocket } from "@/features/vehicles/types";

interface RocketProfileProps {
  rocket: Rocket;
}

const profileNavigation = [
  { href: "#overview", label: "Overview" },
  { href: "#vehicle-image", label: "Vehicle Image" },
  { href: "#technical-dashboard", label: "Dashboard" },
  { href: "#architecture", label: "Architecture" },
  { href: "#propulsion", label: "Propulsion" },
  { href: "#performance", label: "Performance" },
  { href: "#engineering-notes", label: "Engineering Notes" },
  { href: "#mission-applications", label: "Applications" },
  { href: "#registry-vehicles", label: "Registry" },
] as const;

export function RocketProfile({ rocket }: RocketProfileProps) {
  const height = formatRocketMeasurement(rocket.dimensions.height);
  const liftoffThrust = formatRocketMeasurement(
    rocket.performance.liftoffThrust,
  );
  const relatedRockets = listRockets()
    .filter((candidate) => candidate.id !== rocket.id)
    .slice(0, 4);

  return (
    <article className="bg-[#030711]">
      <VehicleProfileHero
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: "/rockets", label: "Rockets" },
          { label: rocket.name },
        ]}
        classification={rocket.performance.supportedOrbits
          .map(formatOrbitType)
          .join(" · ")}
        description={rocket.description}
        media={
          <VehicleMediaFrame aspect="portrait">
            <RocketImage
              fillContainer
              imageClassName="saturate-[0.85]"
              priority
              rocket={rocket}
              sizes="(max-width: 1023px) 90vw, 22rem"
            />
          </VehicleMediaFrame>
        }
        mediaLayout="column"
        name={rocket.name}
        record={[
          { label: "Liftoff thrust", value: liftoffThrust.value },
          { label: "Height", value: height.value },
          { label: "Stages", value: `${rocket.stages.length}` },
        ]}
      />

      <div className="sticky top-[5.5rem] z-30 border-b border-signal/18 bg-[#030711]/92 backdrop-blur-xl">
        <Container>
          <nav
            aria-label="Rocket dossier sections"
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
        <RocketMissionOverview rocket={rocket} />
        <RocketVisualPanel rocket={rocket} />
        <RocketTechnicalDashboard rocket={rocket} />
        <ArchitecturePanel stages={rocket.stages} />
        <PropulsionPanel stages={rocket.stages} />
        <PerformancePanel
          dimensions={rocket.dimensions}
          mass={rocket.mass}
          performance={rocket.performance}
        />
        <EngineeringNotesPanel notes={rocket.engineeringAnalysis} />
        <RocketMissionApplications performance={rocket.performance} />
        <RelatedRockets currentRocket={rocket} rockets={relatedRockets} />
        <RocketProfileCta rocket={rocket} />
      </Container>
    </article>
  );
}
