import { Plane, Rocket } from "lucide-react";

import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/features/home/components/section-heading";
import { VehicleCard } from "@/features/home/components/vehicle-card";

const featuredVehicles = [
  {
    code: "AV-01",
    href: "/aircraft",
    icon: Plane,
    name: "F-22 Raptor",
    type: "Aircraft",
  },
  {
    code: "AV-02",
    href: "/aircraft",
    icon: Plane,
    name: "SR-71 Blackbird",
    type: "Aircraft",
  },
  {
    code: "LV-01",
    href: "/rockets",
    icon: Rocket,
    name: "Falcon 9",
    type: "Launch vehicle",
  },
  {
    code: "LV-02",
    href: "/rockets",
    icon: Rocket,
    name: "Saturn V",
    type: "Launch vehicle",
  },
] as const;

export function FeaturedVehicles() {
  return (
    <section
      aria-labelledby="featured-vehicles-title"
      className="orbix-section scroll-mt-24"
      id="featured-vehicles"
    >
      <Container>
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            description="Inspect landmark aircraft and launch vehicles through typed performance, propulsion, dimensional, and engineering data."
            eyebrow="Vehicle registry // Active reference set"
            title="Featured vehicles"
            titleId="featured-vehicles-title"
          />
          <div className="max-w-sm border-l border-border pl-4 font-mono text-[0.65rem] leading-5 tracking-[0.12em] text-muted uppercase">
            <p>Registry status: engineering records active</p>
            <p>Domains: aircraft + launch vehicles</p>
          </div>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {featuredVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.name} {...vehicle} />
          ))}
        </div>
      </Container>
    </section>
  );
}
